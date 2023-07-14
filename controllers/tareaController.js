// Objetivo: Controladores para las tareas del proyecto (CRUD)
import Proyecto from '../models/Proyecto.js'; // Importamos el modelo de Proyecto
import Tarea from '../models/Tarea.js';

// Agregar una tarea al proyecto (POST) /api/tareas
const agregarTarea = async (req, res) => {
  try {
    // Extraer el proyecto (req.body)
    const { proyecto } = req.body;

    // Validar | Si el proyecto existe en la BD
    const existeProyecto = await Proyecto.findById(proyecto);

    // Validar | Si el proyecto no existe
    if (!existeProyecto) {
      const error = new Error('Proyecto No Encontrado');
      error.statusCode = 404;
      throw error;
    }

    // Validar | Si el usuario autenticado no es el creador del proyecto
    if (existeProyecto.creador.toString() !== req.usuario.id.toString()) {
      const error = new Error(
        'No tienes los permisos necesarios para añadir tareas a este proyecto',
      );
      throw error;
    }

    // console.log(existeProyecto);
    try {
      // Guardar la tarea en la base de datos con el modelo Tarea (req.body) y el id del proyecto
      const tareaAlmacenada = await Tarea.create(req.body);
      // Almacenar el ID en el proyecto
      existeProyecto.tareas.push(tareaAlmacenada._id);
      await existeProyecto.save();

      res.json(tareaAlmacenada);
    } catch (error) {
      console.log(error);
    }
  } catch (error) {
    res.status(error.statusCode || 500).json({ msg: error.message });
  }
};

// Obtener las tareas del proyecto (GET) /api/tareas/:id (id del proyecto)
const obtenerTarea = async (req, res) => {
  try {
    // Extraer el id de la tarea (req.params)
    const { id } = req.params;

    // Validar | Si la tarea existe en la BD (findById) y si el proyecto existe en la BD (populate)
    const tarea = await Tarea.findById(id).populate('proyecto');

    // Validar | Si la tarea no existe
    if (!tarea) {
      const error = new Error('Tarea No Encontrada');
      error.statusCode = 404;
      throw error;
    }

    // Validar | Si el usuario autenticado no es el creador del proyecto
    if (tarea.proyecto.creador.toString() !== req.usuario.id.toString()) {
      const error = new Error(
        'No tienes los permisos necesarios para ver esta tarea',
      );
      error.statusCode = 401;
      throw error;
    }

    // Enviar la tarea al cliente
    res.json(tarea);
  } catch (error) {
    res.status(error.statusCode || 500).json({ msg: error.message });
  }
};

// Actualizar una tarea del proyecto (PUT) /api/tareas/:id (id de la tarea) (id del proyecto)
const actualizarTarea = async (req, res) => {
  try {
    // Extraer el id de la tarea (req.params)
    const { id } = req.params;

    // Validar | Si la tarea existe en la BD (findById) y si el proyecto existe en la BD (populate)
    const tarea = await Tarea.findById(id).populate('proyecto');

    // Validar | Si la tarea no existe
    if (!tarea) {
      const error = new Error('Tarea No Encontrada');
      error.statusCode = 404;
      throw error;
    }

    // Validar | Si el usuario autenticado no es el creador del proyecto
    if (tarea.proyecto.creador.toString() !== req.usuario.id.toString()) {
      const error = new Error(
        'No tienes los permisos necesarios para actualizar esta tarea',
      );
      error.statusCode = 401;
      throw error;
    }

    // Actualizar |  Asignarle los nuevos valores a la tarea (req.body) o mantener los valores anteriores
    tarea.nombre = req.body.nombre || tarea.nombre;
    tarea.descripcion = req.body.descripcion || tarea.descripcion;
    tarea.prioridad = req.body.prioridad || tarea.prioridad;
    tarea.fechaEntrega = req.body.fechaEntrega || tarea.fechaEntrega;

    try {
      // Guardar la tarea en la base de datos con el modelo Tarea (req.body) y el id del proyecto
      const tareaAlmacenada = await tarea.save();
      res.json(tareaAlmacenada);
    } catch (error) {
      console.log(error);
    }
  } catch (error) {
    res.status(error.statusCode || 500).json({ msg: error.message });
  }
};

// Eliminar una tarea del proyecto (DELETE) /api/tareas/:id (id de la tarea) (id del proyecto)
const eliminarTarea = async (req, res) => {
  try {
    // Extraer el id de la tarea (req.params)
    const { id } = req.params;

    // Validar | Si la tarea existe en la BD (findById) y si el proyecto existe en la BD (populate)
    const tarea = await Tarea.findById(id).populate('proyecto');

    // Validar | Si la tarea no existe
    if (!tarea) {
      const error = new Error('Tarea No Encontrada');
      error.statusCode = 404;
      throw error;
    }

    // Validar | Si el usuario autenticado no es el creador del proyecto
    if (tarea.proyecto.creador.toString() !== req.usuario.id.toString()) {
      const error = new Error(
        'No tienes los permisos necesarios para eliminar esta tarea',
      );
      error.statusCode = 401;
      throw error;
    }

    try {
      // Eliminar la tarea de la base de datos (deleteOne) y eliminar la tarea del proyecto
      const proyecto = await Proyecto.findById(tarea.proyecto);
      proyecto.tareas.pull(tarea._id); // Eliminar la tarea del proyecto

      await Promise.allSettled([
        await proyecto.save(),
        await tarea.deleteOne(),
      ]);

      res.json({ msg: 'Tarea Eliminada' });
    } catch (error) {
      console.log(error);
    }
  } catch (error) {
    res.status(error.statusCode || 500).json({ msg: error.message });
  }
};

//
const cambiarEstado = async (req, res) => {
  try {
    // Extraer el id de la tarea (req.params)
    const { id } = req.params;

    // Validar | Si la tarea existe en la BD (findById) y si el proyecto existe en la BD (populate)
    const tarea = await Tarea.findById(id).populate('proyecto');

    // Validar | Si la tarea no existe
    if (!tarea) {
      const error = new Error('Tarea No Encontrada');
      error.statusCode = 404;
      throw error;
    }

    // Validar | Si el usuario no es el creador o el colaborador del proyecto
    if (
      tarea.proyecto.creador.toString() !== req.usuario.id.toString() &&
      tarea.proyecto.colaboradores.toString() !== req.usuario.id.toString()
    ) {
      const error = new Error(
        'No tienes los permisos necesarios para cambiar el estado de esta tarea',
      );
      error.statusCode = 401;
      throw error;
    }

    // Cambiar el estado de la tarea (true o false)
    tarea.estado = !tarea.estado;
    tarea.completado = req.usuario._id;
    await tarea.save();

    const tareaAlmacenada = await Tarea.findById(id)
      .populate('proyecto')
      .populate('completado');

    res.json(tareaAlmacenada);
  } catch (error) {
    res.status(error.statusCode || 500).json({ msg: error.message });
  }
};

export {
  agregarTarea,
  obtenerTarea,
  actualizarTarea,
  eliminarTarea,
  cambiarEstado,
};
