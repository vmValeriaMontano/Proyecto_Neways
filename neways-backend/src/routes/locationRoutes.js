const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');

// Rutas públicas (No requieren autenticación obligatoria para que la UI de Checkout cargue rápido)
router.get('/departments', locationController.getDepartments);
router.get('/departments/:departmentId/municipalities', locationController.getMunicipalitiesByDepartment);

module.exports = router;