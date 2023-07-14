import express from 'express';
import dotenv from 'dotenv'; // Libreria para configurar variables de entorno
import cors from 'cors'; // Libreria Para que el cliente pueda hacer peticiones a la API
import connectDB from './config/db.js';
import usuarioRoutes from './routes/usuarioRoutes.js';
import proyectoRoutes from './routes/proyectoRoutes.js';
import tareaRoutes from './routes/tareaRoutes.js';

// Inicializar express
const app = express();
app.use(express.json()); // Habilitar express.json() para leer datos del cliente

// Configurar variables de entorno con dotenv
dotenv.config();

// Conectar a la base de datos con mongoose (config/db.js)
connectDB();

// Habilitar CORS para que el cliente pueda hacer peticiones a la API
const whitelist = [process.env.FRONTEND_URL]; // Lista de dominios permitidos
const corsOptions = {
  origin: (origin, callback) => {
    // Comprobar si la petición viene de un servidor que esta en la lista blanca(whitelist)
    const existe = whitelist.some(dominio => dominio === origin);
    if (existe) {
      callback(null, true); // Permitir la petición
    } else {
      callback(new Error('No permitido por CORS')); // Denegar la petición
    }
  },
};
app.use(cors(corsOptions)); // Habilitar CORS

// Routing de la app (routes/usuarioRoutes.js y routes/proyectoRoutes.js)
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/proyectos', proyectoRoutes);
app.use('/api/tareas', tareaRoutes);

// Puerto de la app
const PORT = process.env.PORT || 4000;

// Iniciar la app
const servidor = app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});

// /* Configurar Socket.io (backend/index.js) *//
import { Server } from 'socket.io';

const io = new Server(servidor, {
  pingTimeout: 60000,
  cors: {
    origin: [process.env.FRONTEND_URL],
  },
});

// Iniciar el servidor de Socket.io
io.on('connection', socket => {
  // console.log('Nueva conexión a socket.io', socket.id);

  // Definir los eventos de Socket.io
  socket.on('abrir proyecto', proyecto => {
    socket.join(proyecto); // Unir al usuario a la sala del proyecto
  });

  //
  socket.on('agregar-tarea', tarea => {
    const proyecto = tarea.proyecto;
    socket.to(proyecto).emit('tarea agregada', tarea);
  });

  // eliminar tarea de la lista de tareas
  socket.on('eliminar-tarea', tarea => {
    const proyecto = tarea.proyecto;
    socket.to(proyecto).emit('tarea eliminada', tarea);
  });

  //
  socket.on('editar-tarea', tarea => {
    const proyecto = tarea.proyecto._id;
    socket.to(proyecto).emit('tarea editada', tarea);
  });

  //
  socket.on('cambiar-estado-tarea', tarea => {
    const proyecto = tarea.proyecto._id;
    socket.to(proyecto).emit('estado tarea cambiado', tarea);
  });
});
