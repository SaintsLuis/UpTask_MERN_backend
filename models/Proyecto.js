// Objetivo: Modelo de Proyecto (Proyecto) | Schema

import mongoose from 'mongoose';

// Definir el Schema de Proyecto
const proyectoSchema = mongoose.Schema(
  {
    nombre: {
      type: String,
      trim: true,
      required: [true, 'El nombre del proyecto es obligatorio'],
    },
    descripcion: {
      type: String,
      trim: true,
      required: true,
    },
    fechaEntrega: {
      type: Date,
      default: Date.now(),
    },
    cliente: {
      type: String,
      trim: true,
      required: true,
    },
    creador: {
      type: mongoose.Schema.Types.ObjectId, // Referencia al id del usuario
      ref: 'Usuario', // Referencia al modelo Usuario
    },
    tareas: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tarea',
      },
    ],
    colaboradores: [
      // Array de colaboradores (usuarios)
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
      },
    ],
  },
  {
    timestamps: true, // Crea los campos createdAt y updatedAt
  },
);

// Exportar el modelo Proyecto | 1er parámetro: Nombre del modelo | 2do parámetro: Schema
const Proyecto = mongoose.model('Proyecto', proyectoSchema);
export default Proyecto;
