// Objetivo: Modelo de Tarea para la base de datos de MongoDB Atlas

import mongoose from 'mongoose';

const tareaSchema = mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
      trim: true,
    },
    descripcion: {
      type: String,
      required: true,
      trim: true,
    },
    estado: {
      type: Boolean,
      default: false,
    },
    fechaEntrega: {
      type: Date,
      required: true,
      default: Date.now(),
    },
    prioridad: {
      type: String,
      required: true,
      enum: ['Alta', 'Media', 'Baja'], // Valores permitidos para el campo prioridad
    },
    proyecto: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Proyecto',
    },
    completado: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario',
    },
  },
  {
    timestamps: true,
  },
);

const Tarea = mongoose.model('Tarea', tareaSchema);
export default Tarea; // Exportamos el modelo para poder usarlo en otros archivos
