const pool = require('../config/db');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const logoDirectory = path.join(__dirname, '..', '..', 'uploads', 'site-logos');
const logoSlots = {
  symbol: 'header_symbol_logo_url',
  wordmark: 'header_wordmark_logo_url'
};

const SETTING_FIELDS = [
  'hero_title',
  'hero_description',
  'hero_button',
  'products_heading',
  'footer_message',
  'primary_color',
  'secondary_color',
  'background_color'
];

const COLOR_FIELDS = new Set([
  'primary_color',
  'secondary_color',
  'background_color'
]);

async function getPublicSettings(req, res) {
  try {
    const result = await pool.query('SELECT * FROM site_settings WHERE id = TRUE');
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'La configuración del sitio no está inicializada.' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error al obtener la configuración pública del sitio:', err);
    res.status(500).json({ message: 'Error al obtener la configuración del sitio.' });
  }
}

async function getSettings(req, res) {
  try {
    const result = await pool.query('SELECT * FROM site_settings WHERE id = TRUE');
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'La configuración del sitio no está inicializada.' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error al obtener la configuración administrativa del sitio:', err);
    res.status(500).json({ message: 'Error al obtener la configuración del sitio.' });
  }
}

async function updateSettings(req, res) {
  const settings = req.body;
  const invalidField = SETTING_FIELDS.find((field) => {
    const value = settings?.[field];
    if (typeof value !== 'string' || value.trim().length === 0) {
      return true;
    }
    if (COLOR_FIELDS.has(field)) {
      return !/^#[0-9A-Fa-f]{6}$/.test(value);
    }
    return value.length > 300;
  });

  if (invalidField) {
    return res.status(400).json({
      message: COLOR_FIELDS.has(invalidField)
        ? `El color "${invalidField}" debe tener formato hexadecimal, por ejemplo #8B5CF6.`
        : `El campo "${invalidField}" es obligatorio y no puede superar 300 caracteres.`
    });
  }

  try {
    const values = SETTING_FIELDS.map((field) => (
      COLOR_FIELDS.has(field) ? settings[field] : settings[field].trim()
    ));
    const result = await pool.query(
      `UPDATE site_settings
       SET hero_title = $1,
           hero_description = $2,
           hero_button = $3,
           products_heading = $4,
           footer_message = $5,
           primary_color = $6,
           secondary_color = $7,
           background_color = $8
       WHERE id = TRUE
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'La configuración del sitio no está inicializada.' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error al guardar la configuración del sitio:', err);
    res.status(500).json({ message: 'Error al guardar la configuración del sitio.' });
  }
}

async function uploadLogo(req, res) {
  const settingsField = logoSlots[req.params.slot];
  if (!settingsField) {
    return res.status(400).json({ message: 'Tipo de logo no válido.' });
  }
  if (!req.file) {
    return res.status(400).json({ message: 'Selecciona una imagen PNG o WebP de hasta 5 MB.' });
  }

  const isPng = req.file.mimetype === 'image/png'
    && req.file.buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  const isWebp = req.file.mimetype === 'image/webp'
    && req.file.buffer.toString('ascii', 0, 4) === 'RIFF'
    && req.file.buffer.toString('ascii', 8, 12) === 'WEBP';

  if (!isPng && !isWebp) {
    return res.status(400).json({ message: 'El archivo debe ser una imagen PNG o WebP válida.' });
  }

  const extension = isPng ? 'png' : 'webp';
  const filename = `${crypto.randomUUID()}.${extension}`;
  const logoUrl = `/uploads/site-logos/${filename}`;
  const logoPath = path.join(logoDirectory, filename);

  try {
    await fs.promises.mkdir(logoDirectory, { recursive: true });
    await fs.promises.writeFile(logoPath, req.file.buffer, { flag: 'wx' });

    const result = await pool.query(
      `WITH previous AS (
         SELECT ${settingsField} AS replaced_logo_url
         FROM site_settings
         WHERE id = TRUE
       ),
       updated AS (
         UPDATE site_settings SET ${settingsField} = $1
         WHERE id = TRUE
         RETURNING *
       )
       SELECT updated.*, previous.replaced_logo_url
       FROM updated CROSS JOIN previous`,
      [logoUrl]
    );

    if (result.rows.length === 0) {
      await fs.promises.unlink(logoPath);
      return res.status(404).json({ message: 'La configuración del sitio no está inicializada.' });
    }

    const { replaced_logo_url: previousLogoUrl, ...updatedSettings } = result.rows[0];
    if (previousLogoUrl?.startsWith('/uploads/site-logos/')) {
      try {
        await fs.promises.unlink(path.join(logoDirectory, path.basename(previousLogoUrl)));
      } catch (cleanupError) {
        if (cleanupError.code !== 'ENOENT') {
          console.error('Error al limpiar el logo anterior:', cleanupError);
        }
      }
    }
    res.json(updatedSettings);
  } catch (err) {
    try {
      await fs.promises.unlink(logoPath);
    } catch (cleanupError) {
      if (cleanupError.code !== 'ENOENT') {
        console.error('Error al limpiar un archivo de logo después de un fallo:', cleanupError);
      }
    }
    console.error('Error al guardar el logo del sitio:', err);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Error al guardar el logo del sitio.' });
    }
  }
}

module.exports = {
  getPublicSettings,
  getSettings,
  updateSettings,
  uploadLogo
};
