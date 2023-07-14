// Objetivo: Middleware para verificar si el usuario esta autenticado o no (checkAuth) | Custom middleware

import jwt from 'jsonwebtoken';
import Usuario from '../models/Usuario.js';

// checkAuth
const checkAuth = async (req, res, next) => {
  let token;

  // Verificar si el token fue enviado en el header de la petición | Bearer <token>
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Extraer el token del header | split(' ') separa el Bearer del token
    token = req.headers.authorization.split(' ')[1];

    try {
      // Verificar si el token es válido
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      // console.log(decoded.id);
      // Buscar el usuario por el id del token decodificado
      req.usuario = await Usuario.findById(decoded.id).select(
        '-password -confirmado -token -createdAt -updatedAt -__v',
      );

      // console.log(req.usuario);
      return next(); // Si el token es válido, continuar con la siguiente función del middleware (perfil)
    } catch (error) {
      // Si el token no es válido, enviar un mensaje de error
      return res.json({ msg: 'Hubo un error. El Token no está vigente' });
    }
  }

  // Si el token no fue enviado en el header de la petición, enviar un mensaje de error
  if (!token) {
    const error = new Error('No fue enviado el Token. Por favor enviarlo!');
    return res.status(401).json({ msg: error.message });
  }

  next(); // Si el token es válido, continuar con la siguiente función del middleware (perfil)
};

export default checkAuth;
