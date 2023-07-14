// Objetivo: Rutas para las tareas del proyecto
import express from 'express';
import {
  agregarTarea,
  obtenerTarea,
  actualizarTarea,
  eliminarTarea,
  cambiarEstado,
} from '../controllers/tareaController.js'; // Importamos los controladores de las tareas
import checkAuth from '../middleware/checkAuth.js'; // Importamos el middleware para validar el token

const router = express.Router();

// Rutas para las tareas del proyecto (CRUD) - /api/tareas
router.post('/', checkAuth, agregarTarea);
router
  .route('/:id')
  .get(checkAuth, obtenerTarea)
  .put(checkAuth, actualizarTarea)
  .delete(checkAuth, eliminarTarea);

router.post('/estado/:id', checkAuth, cambiarEstado);

export default router;
