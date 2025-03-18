const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ message: 'Acceso no autorizado' });
    }

    try {
        const decoded = jwt.verify(token, 'puente123'); // Usa tu clave secreta
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Token inválido' });
    }
};

module.exports = authMiddleware;

