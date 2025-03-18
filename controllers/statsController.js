const Mediation = require('../models/Mediation');
const User = require('../models/User');

const getStats = async (req, res) => {
    try {
        // Obtener estadísticas de mediaciones
        const mediacionesProceso = await Mediation.countDocuments({ estado: 'Proceso' });
        const mediacionesResueltas = await Mediation.countDocuments({ estado: 'resuelta' });
        const mediacionesCanceladas = await Mediation.countDocuments({ estado: 'cancelada' });

        // Obtener estadísticas de usuarios
        const totalUsuarios = await User.countDocuments();

        // Obtener el total de mediaciones
        const totalMediaciones = await Mediation.countDocuments();

        // Enviar la respuesta con las estadísticas
        res.json({
            mediacionesProceso,
            mediacionesResueltas,
            mediacionesCanceladas,
            totalUsuarios,
            totalMediaciones,
        });
    } catch (error) {
        console.error('Error al obtener las estadísticas:', error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};

module.exports = { getStats };