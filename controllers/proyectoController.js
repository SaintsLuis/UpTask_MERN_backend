// Objetivo: Controlador de proyectos (CRUD)

import Proyecto from '../models/Proyecto.js';
import Usuario from '../models/Usuario.js';

// Obtener todos los proyectos (GET) /api/proyectos
const obtenerProyectos = async (req, res) => {
  // Buscar todos los proyectos en la base de datos (find) y enviarlos al cliente (res.json) | El usuario autenticado debe ser el creador o un colaborador | No enviar las tareas
  const proyectos = await Proyecto.find({
    $or: [
      { colaboradores: { $in: req.usuario } },
      { creador: { $in: req.usuario } },
    ],
  }).select('-tareas');

  res.json(proyectos); // Enviar los proyectos al cliente
};

// Crear un nuevo proyecto (POST) /api/proyectos
const nuevoProyecto = async (req, res) => {
  // Validar el proyecto
  const proyecto = new Proyecto(req.body); // Crear un nuevo proyecto con los datos del body
  proyecto.creador = req.usuario.id; // Asignar el creador del proyecto (usuario autenticado)

  try {
    // Guardar el proyecto en la base de datos
    const proyectoAlmacenado = await proyecto.save();
    res.json(proyectoAlmacenado);
  } catch (error) {
    console.log(error);
  }
};

// Obtener un proyecto por su id (GET) /api/proyectos/:id (Dinamico)
const obtenerProyecto = async (req, res) => {
  try {
    const { id } = req.params; // Obtener el id del proyecto de los parámetros de la ruta (req.params)

    const proyecto = await Proyecto.findById(id)

      .populate({
        path: 'tareas',
        populate: { path: 'completado', select: 'nombre' },
      })
      .populate('colaboradores', 'nombre email'); // Buscar el proyecto por su id (findById), sus tareas (populate), y sus colaboradores (populate)

    // Validar | Si el proyecto no existe
    if (!proyecto) {
      const error = new Error('Proyecto No Encontrado');
      error.statusCode = 404;
      throw error;
    }

    // Validar | Si el usuario autenticado no es el creador del proyecto o un colaborador del proyecto | No enviar las tareas
    if (
      proyecto.creador.toString() !== req.usuario.id.toString() &&
      !proyecto.colaboradores.some(
        colaborador => colaborador._id.toString() === req.usuario.id.toString(),
      )
    ) {
      const error = new Error('Acción No Válida - No Autorizado');
      throw error;
    }

    // Enviar el proyecto al cliente
    res.json(proyecto);
  } catch (error) {
    res.status(error.statusCode || 500).json({ msg: error.message });
  }
};

// Editar un proyecto por su id (PUT) /api/proyectos/:id (Dinamico)
const editarProyecto = async (req, res) => {
  try {
    const { id } = req.params; // Obtener el id del proyecto de los parámetros de la ruta (req.params)

    const proyecto = await Proyecto.findById(id); // Buscar el proyecto por su id

    // Validar | Si el proyecto no existe
    if (!proyecto) {
      const error = new Error('Proyecto No Encontrado');
      error.statusCode = 404;
      throw error;
    }

    // Validar | Si el usuario autenticado no es el creador del proyecto
    if (proyecto.creador.toString() !== req.usuario.id.toString()) {
      const error = new Error('Acción No Válida - No Autorizado');
      throw error;
    }

    // Editar el proyecto
    // Lo que tiene en el body, se le asigna... | de lo contrario se deja lo que ya tenía
    proyecto.nombre = req.body.nombre || proyecto.nombre;
    proyecto.descripcion = req.body.descripcion || proyecto.descripcion;
    proyecto.fechaEntrega = req.body.fechaEntrega || proyecto.fechaEntrega;
    proyecto.cliente = req.body.cliente || proyecto.cliente;

    const proyectoAlmacenado = await proyecto.save(); // Guardar el proyecto editado
    res.json(proyectoAlmacenado); // Enviar el proyecto editado al cliente
  } catch (error) {
    res.status(error.statusCode || 500).json({ msg: error.message });
  }
};

// Eliminar un proyecto por su id (DELETE) /api/proyectos/:id (Dinamico)
const eliminarProyecto = async (req, res) => {
  try {
    const { id } = req.params; // Obtener el id del proyecto de los parámetros de la ruta (req.params)

    const proyecto = await Proyecto.findById(id); // Buscar el proyecto por su id

    // Validar | Si el proyecto no existe
    if (!proyecto) {
      const error = new Error('Proyecto No Encontrado');
      error.statusCode = 404;
      throw error;
    }

    // Validar | Si el usuario autenticado no es el creador del proyecto
    if (proyecto.creador.toString() !== req.usuario.id.toString()) {
      const error = new Error('Acción No Válida - No Autorizado');
      throw error;
    }

    try {
      await proyecto.deleteOne(); // Eliminar el proyecto de la base de datos
      res.status(200).json({ msg: 'Proyecto eliminado exitosamente' });
    } catch (error) {
      console.log(error);
    }
  } catch (error) {
    res.status(error.statusCode || 500).json({ msg: error.message });
  }
};

// Buscar colaborador por email
const buscarColaborador = async (req, res) => {
  const { email } = req.body;

  // Validar | Si el email no existe
  const usuario = await Usuario.findOne({ email }).select(
    '-confirmado -createdAt -updatedAt -__v -password -passwordResetToken -passwordResetExpires -emailToken -emailTokenExpires -token -emailTokenCreated -ema',
  );

  if (!usuario) {
    const error = new Error('Usuario no encontrado');
    return res.status(404).json({ msg: error.message });
  }

  res.json(usuario);
};

// Agregar colaborador a un proyecto
const agregarColaborador = async (req, res) => {
  const proyecto = await Proyecto.findById(req.params.id);

  if (!proyecto) {
    const error = new Error('Proyecto no encontrado');
    return res.status(404).json({ msg: error.message });
  }

  if (proyecto.creador.toString() !== req.usuario.id.toString()) {
    const error = new Error('Acción No Válida - No Autorizado');
    return res.status(401).json({ msg: error.message });
  }

  const { email } = req.body;
  const usuario = await Usuario.findOne({ email }).select(
    '-confirmado -createdAt -updatedAt -__v -password -passwordResetToken -passwordResetExpires -emailToken -emailTokenExpires -token -emailTokenCreated -ema',
  );

  if (!usuario) {
    const error = new Error('Usuario no encontrado');
    return res.status(404).json({ msg: error.message });
  }

  // Validar \ El colaborar no es el admin del proyecto
  if (proyecto.creador.toString() === usuario._id.toString()) {
    const error = new Error('El usuario ya es administrador del proyecto');
    return res.status(400).json({ msg: error.message });
  }

  // Revisar que no este ya agregado al proyecto
  if (proyecto.colaboradores.includes(usuario._id)) {
    const error = new Error('El usuario ya es colaborador del proyecto');
    return res.status(400).json({ msg: error.message });
  }

  // Si todo esta bien, agregar el colaborador al proyecto
  proyecto.colaboradores.push(usuario._id);
  await proyecto.save();
  res.json({ msg: 'Colaborador agregado exitosamente' });
};

// Eliminar colaborador de un proyecto
const eliminarColaborador = async (req, res) => {
  const proyecto = await Proyecto.findById(req.params.id);

  if (!proyecto) {
    const error = new Error('Proyecto no encontrado');
    return res.status(404).json({ msg: error.message });
  }

  // Validar | Si el usuario autenticado no es el creador del proyecto (Solo el admin puede eliminar colaboradores)
  if (proyecto.creador.toString() !== req.usuario.id.toString()) {
    const error = new Error('Acción No Válida - No Autorizado');
    return res.status(401).json({ msg: error.message });
  }

  // Si esta bien, eliminar el colaborador del proyecto
  proyecto.colaboradores.pull(req.body.id);
  // console.log(proyecto);
  await proyecto.save();
};

export {
  obtenerProyectos,
  nuevoProyecto,
  obtenerProyecto,
  editarProyecto,
  eliminarProyecto,
  buscarColaborador,
  agregarColaborador,
  eliminarColaborador,
};
