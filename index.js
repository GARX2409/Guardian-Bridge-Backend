const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const mediationRoutes = require('./routes/mediation');
const statsRoutes = require('./routes/stats');
const notificationRoutes = require('./routes/notification');
const http = require('http');
const socketIo = require('socket.io');
const User = require('./models/User');

const app = express();
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// Configuración mejorada de Socket.io
const io = socketIo(server, {
    cors: {
        origin: 'ttps://guardian-bridge.vercel.app',
        methods: ['GET', 'POST'],
        credentials: true
    },
    connectionStateRecovery: {
        maxDisconnectionDuration: 60000,
        skipMiddlewares: true
    }
});

// Mapa para rastrear conexiones de usuario
const userConnections = new Map();

connectDB();

app.use(express.json());
app.use(cors({
    origin: 'ttps://guardian-bridge.vercel.app',
    credentials: true
}));

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/mediations', mediationRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/notification', notificationRoutes);

// Configuración de Socket.io
io.on('connection', (socket) => {
    console.log('Nueva conexión:', socket.id);

    // Autenticación del socket
    socket.on('authenticate', async (token) => {
        try {
            // Verificar token y obtener usuario
            const user = await User.findOne({ _id: token.userId });
            if (!user) throw new Error('Usuario no encontrado');

            // Registrar conexión
            userConnections.set(user._id.toString(), socket.id);
            socket.userId = user._id.toString();

            // Actualizar estado en BD
            await User.findByIdAndUpdate(user._id, {
                isOnline: true,
                lastSeen: new Date(),
                socketId: socket.id
            });

            // Unir a sala personal
            socket.join(`user_${user._id}`);

            // Notificar cambio de estado
            io.emit('userStatusChanged', {
                userId: user._id,
                isOnline: true
            });

            console.log(`Usuario ${user._id} autenticado`);
        } catch (error) {
            console.error('Error de autenticación:', error.message);
            socket.disconnect();
        }
    });

    // Manejar desconexión
    socket.on('disconnect', async () => {
        const userId = socket.userId;
        if (userId) {
            try {
                // Verificar si hay otras conexiones activas
                const sockets = await io.in(`user_${userId}`).fetchSockets();
                if (sockets.length === 0) {
                    await User.findByIdAndUpdate(userId, {
                        isOnline: false,
                        lastSeen: new Date()
                    });
                    io.emit('userStatusChanged', {
                        userId,
                        isOnline: false
                    });
                    userConnections.delete(userId);
                    console.log(`Usuario ${userId} desconectado`);
                }
            } catch (error) {
                console.error('Error al manejar desconexión:', error);
            }
        }
    });

    // Middleware para inyectar io en las rutas
    app.set('io', io);
});

server.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});