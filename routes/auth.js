const express = require('express');
const router = express.Router();
const { login, getUser, updatePassword, updateStatus } = require('../controllers/authcontroller'); // Import updateStatus
const authMiddleware = require('../middlewares/authMiddleware');

// Endpoint para iniciar sesión
router.post('/login', login);

// Endpoint para obtener información del usuario
router.get('/user', authMiddleware, getUser);

// Endpoint para actualizar la contraseña
router.put('/update-password', authMiddleware, updatePassword);

// Endpoint para actualizar el estado del usuario
router.put('/update-status', authMiddleware, updateStatus);

module.exports = router;