const pool = require('../config/db');

// Obtener todos los departamentos activos con su costo de envío
async function getDepartments(req, res) {
  try {
    const result = await pool.query(
      'SELECT id, name, shipping_cost FROM departments WHERE is_active = TRUE ORDER BY name ASC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener departamentos:', err);
    res.status(500).json({ message: 'Error al obtener departamentos.' });
  }
}

// Obtener municipios activos de un departamento específico
async function getMunicipalitiesByDepartment(req, res) {
  try {
    const { departmentId } = req.params;
    const result = await pool.query(
      'SELECT id, name FROM municipalities WHERE department_id = $1 AND is_active = TRUE ORDER BY name ASC',
      [departmentId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener municipios:', err);
    res.status(500).json({ message: 'Error al obtener municipios.' });
  }
}

module.exports = {
  getDepartments,
  getMunicipalitiesByDepartment
};