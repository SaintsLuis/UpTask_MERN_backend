// Objetivo: Definir las rutas para los proyectos

import express from 'express';
import {
  obtenerProyectos,
  nuevoProyecto,
  obtenerProyecto,
  editarProyecto,
  eliminarProyecto,
  buscarColaborador,
  agregarColaborador,
  eliminarColaborador,
} from '../controllers/proyectoController.js'; // Importar los controladores
import checkAuth from '../middleware/checkAuth.js'; // Middleware para proteger las rutas

// Inicializar express.Router()
const router = express.Router();

// Rutas para los proyectos /api/proyectos
router
  .route('/')
  .get(checkAuth, obtenerProyectos)
  .post(checkAuth, nuevoProyecto);

router // Rutas para un proyecto específico /api/proyectos/:id (Dinamico)
  .route('/:id')
  .get(checkAuth, obtenerProyecto)
  .put(checkAuth, editarProyecto)
  .delete(checkAuth, eliminarProyecto);

router.post('/colaboradores', checkAuth, buscarColaborador);
router.post('/colaboradores/:id', checkAuth, agregarColaborador);
router.post('/eliminar-colaborador/:id', checkAuth, eliminarColaborador);

export default router;
