// Objetivo: Controlador de usuarios (CRUD)

import Usuario from '../models/Usuario.js';
import { nanoid } from 'nanoid'; // Librería para generar tokens|ids únicos
import generarJWT from '../helpers/generarJWT.js'; // Función para generar un JWT(JsonWebToken)
import { emailRegistro, emailOlvidePassword } from '../helpers/email.js'; // Función para enviar un email

// Registrar un usuario  | POST /api/usuarios
const registrar = async (req, res) => {
  // Evitar registros duplicados
  const { email } = req.body;
  const existeUsuario = await Usuario.findOne({ email }); // Buscar usuario por email

  // Si el usuario ya existe, enviar un mensaje de error
  if (existeUsuario) {
    const error = new Error('Usuario ya registrado');
    return res.status(400).json({ msg: error.message });
  }

  // Si el usuario no existe, crearlo
  try {
    const usuario = new Usuario(req.body); // Crear nuevo usuario
    usuario.token = nanoid(); // Generar un token para el usuario
    await usuario.save(); // Guardar usuario en la base de datos

    // Enviar email de confirmación
    emailRegistro({
      email: usuario.email,
      nombre: usuario.nombre,
      token: usuario.token,
    });

    // Enviar respuesta al cliente con el usuario almacenado
    res.json({
      msg: 'Usuario Creado Correctamente, Revisa tu Email para Confirmar tu Cuenta.',
    });
  } catch (error) {
    console.log(error);
  }
};

// Autenticar un usuario | POST /api/usuarios/login
const autenticar = async (req, res) => {
  // Extraer el email y password del request
  const { email, password } = req.body;

  // Comprobar si el usuario existe
  const usuario = await Usuario.findOne({ email }); // Buscar usuario por email
  if (!usuario) {
    const error = new Error(
      'El Usuario No Existe, Registrate para Poder Iniciar Sesión',
    );
    return res.status(400).json({ msg: error.message });
  }

  // Comprobar si el usuario esta confirmado
  if (!usuario.confirmado) {
    const error = new Error('Confirma tu cuenta para poder iniciar sesión');
    return res.status(400).json({ msg: error.message });
  }

  // Comprobar si el password es correcto
  const passwordCorrecto = await usuario.comprobarPassword(password);
  if (!passwordCorrecto) {
    const error = new Error('Password Incorrecto');
    return res.status(400).json({ msg: error.message });
  }

  // Si el password es correcto, generar un JWT(JsonWebToken) y enviar el token al cliente junto con el usuario
  res.json({
    _id: usuario.id,
    nombre: usuario.nombre,
    email: usuario.email,
    token: generarJWT(usuario.id),
  });
};

// Confirmar un usuario | GET /api/usuarios/confirmar-cuenta/:token
const confirmar = async (req, res) => {
  const { token } = req.params; // Extraer el token de los parametros(Url)
  const usuarioConfirmar = await Usuario.findOne({ token }); // Buscar usuario por token

  // Si el usuario no existe / token es invalido, enviar un mensaje de error
  if (!usuarioConfirmar) {
    const error = new Error('Token no valido');
    return res.status(400).json({ msg: error.message });
  }

  try {
    // Si el usuario existe, confirmar su cuenta
    usuarioConfirmar.confirmado = true;
    usuarioConfirmar.token = ''; // Eliminar el token

    await usuarioConfirmar.save();
    res.json({ msg: 'Usuario Confirmado Correctamente' });
  } catch (error) {
    console.log(error);
  }
};

// Olvide Password | POST /api/usuarios/olvide-password
const olvidePassword = async (req, res) => {
  const { email } = req.body; // Extraer el email del request(body)
  // Comprobar si el usuario existe
  const usuario = await Usuario.findOne({ email }); // Buscar usuario por email
  if (!usuario) {
    const error = new Error('El Usuario No Existe');
    return res.status(400).json({ msg: error.message });
  }

  try {
    // Si el usuario existe, generar un nuevo token y enviar un email
    usuario.token = nanoid(); // Generar el token, con nanoid
    await usuario.save();

    // Enviar email
    emailOlvidePassword({
      email: usuario.email,
      nombre: usuario.nombre,
      token: usuario.token,
    });

    res.json({ msg: 'Se envio un email para reestablecer el password' });
  } catch (error) {
    console.log(error);
  }
};

// Comprobar Token | GET /api/usuarios/olvide-password/:token
const comprobarToken = async (req, res) => {
  const { token } = req.params; // Extraer el token de los parametros(Url)

  const tokenValido = await Usuario.findOne({ token }); // Buscar usuario por token

  // Comprobar si el usuario existe / token es valido
  if (tokenValido) {
    res.json({ msg: 'Token valido' });
  } else {
    const error = new Error(
      'El token no es válido o ha expirado. Intenta nuevamente.',
    );
    return res.status(400).json({ msg: error.message });
  }

  console.log(tokenValido);
};

// Nuevo Password | POST /api/usuarios/olvide-password/:token
const nuevoPassword = async (req, res) => {
  const { token } = req.params; // Extraer el token de los parametros(Url)
  const { password } = req.body; // Extraer el password del request(body)

  const usuario = await Usuario.findOne({ token }); // Buscar usuario por token

  // Comprobar si el usuario existe / token es valido
  if (usuario) {
    usuario.password = password; // Asignar el nuevo password
    usuario.token = ''; // Eliminar el token

    try {
      // Guardar el nuevo password
      await usuario.save();
      res.json({ msg: 'Password actualizado correctamente' });
    } catch (error) {
      console.log(error);
    }
  } else {
    const error = new Error('Token no valido');
    return res.status(400).json({ msg: error.message });
  }
};

const perfil = async (req, res) => {
  const { usuario } = req;

  res.json(usuario);
};

export {
  registrar,
  autenticar,
  confirmar,
  olvidePassword,
  comprobarToken,
  nuevoPassword,
  perfil,
};
