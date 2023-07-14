// Objetivo: Modelo de la colección(Database) Usuario en MongoDB

import mongoose from 'mongoose';
import bcrypt from 'bcrypt'; // Librería para encriptar contraseñas

// Schema: define la estructura de los documentos que se van a guardar en la colección(Database)
const usuarioSchema = mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    token: {
      type: String,
    },
    confirmado: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // Crea los campos createdAt y updatedAt
  },
);
usuarioSchema.pre('save' /* Antes de guardar */, async function (next) {
  // Si el password no ha sido modificado, ejecutar la siguiente función
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(5); // Generar un salt(de 5 rondas) para encriptar la contraseña
  this.password = await bcrypt.hash(this.password, salt); // Encriptar la contraseña
});

// Método para comprobar la contraseña ingresada con la contraseña almacenada en la base de datos
usuarioSchema.methods.comprobarPassword = async function (passwordFormulario) {
  return await bcrypt.compare(passwordFormulario, this.password);
};

// Exportar el modelo Usuario | 1er parámetro: Nombre del modelo | 2do parámetro: Schema
const Usuario = mongoose.model('Usuario', usuarioSchema);
export default Usuario;
