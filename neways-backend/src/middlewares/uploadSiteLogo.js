const multer = require('multer');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 }
});

function uploadSiteLogo(req, res, next) {
  upload.single('logo')(req, res, (err) => {
    if (!err) {
      return next();
    }
    if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'El logo no puede superar los 5 MB.' });
    }
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: 'No se pudo procesar el archivo del logo.' });
    }
    console.error('Error al recibir el archivo del logo:', err);
    return res.status(500).json({ message: 'Error al procesar el archivo del logo.' });
  });
}

module.exports = uploadSiteLogo;
