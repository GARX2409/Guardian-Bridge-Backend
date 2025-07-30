const User = require('../models/User');
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
    const { username, password } = req.body;

    try {
        // Busca el usuario en la base de datos
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: 'Usuario no encontrado' });
        }

        // Compara la contraseña en texto plano (sin bcrypt)
        if (password !== user.password) {
            return res.status(400).json({ message: 'Contraseña incorrecta' });
        }

        // Genera el token JWT
        const token = jwt.sign({ id: user._id, role: user.role }, 'puente123', { expiresIn: '1h' });

        // Devuelve los datos necesarios
        res.json({ token, role: user.role, userId: user._id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};

const getUser = async (req, res) => {
    try {
        const userId = req.user.id; // Obtén el ID del usuario desde el token
        const user = await User.findById(userId).select('-password'); // Excluye la contraseña
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        res.json(user);
    } catch (error) {
        console.error('Error al obtener el usuario:', error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};

const updatePassword = async (req, res) => {
    const { password } = req.body;
    const userId = req.user.id; // Obtén el ID del usuario desde el token

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Actualiza la contraseña (sin bcrypt por ahora)
        user.password = password;
        await user.save();

        res.json({ message: 'Contraseña actualizada correctamente' });
    } catch (error) {
        console.error('Error al actualizar la contraseña:', error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};

const updateStatus = async (req, res) => {
    const { isOnline } = req.body;
    const userId = req.user.id;

    try {
        const user = await User.findByIdAndUpdate(userId, { isOnline, lastSeen: Date.now() }, { new: true });
        res.status(200).json({ message: 'Estado de conexión actualizado', user });
    } catch (error) {
        console.error('Error al actualizar el estado de conexión:', error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};

module.exports = { login, getUser, updatePassword, updateStatus };
