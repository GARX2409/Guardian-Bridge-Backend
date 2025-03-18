const express = require('express');
const router = express.Router();
const { login, getUser, updatePassword } = require('../controllers/authcontroller');
const authMiddleware = require('../middlewares/authMiddleware');

// Endpoint para iniciar sesión
router.post('/login', login);

// Endpoint para obtener información del usuario
router.get('/user', authMiddleware, getUser);

// Endpoint para actualizar la contraseña
router.put('/update-password', authMiddleware, updatePassword);

module.exports = router;