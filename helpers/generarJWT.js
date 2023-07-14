// Objetivo: Generar un JWT(JsonWebToken) para el usuario

import jwt from 'jsonwebtoken'; // Librería para generar JWT(JsonWebToken)

const generarJWT = id => {
  // Generar un JWT con el id del usuario
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

export default generarJWT;
