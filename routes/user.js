// Rutas para el controlador de usuarios
const express = require('express');
const { getUsers, createUser, updateUser, deleteUser } = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');
const router = express.Router();

router.get('/', authMiddleware, getUsers);
router.post('/', authMiddleware, createUser);
router.put('/:id', authMiddleware, updateUser);
router.delete('/:id', authMiddleware, deleteUser);

module.exports = router;