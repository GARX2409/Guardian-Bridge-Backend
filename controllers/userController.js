const User = require('../models/User');

// Obtener todos los usuarios
const getUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password'); // Excluye la contraseña
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};

// Crear un nuevo usuario
const createUser = async (req, res) => {
    const { username, password, role, sede, grado } = req.body;

    try {
        const user = new User({ username, password, role, sede, grado });
        await user.save();
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};

// Actualizar un usuario
const updateUser = async (req, res) => {
    const { id } = req.params;
    const { username, password, role, sede, grado } = req.body;

    try {
        const user = await User.findByIdAndUpdate(
            id,
            { username, password, role, sede, grado },
            { new: true }
        );
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};

// Eliminar un usuario
const deleteUser = async (req, res) => {
    const { id } = req.params;

    try {
        await User.findByIdAndDelete(id);
        res.json({ message: 'Usuario eliminado' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};

module.exports = { getUsers, createUser, updateUser, deleteUser };