// Objetivo: enviar un correo electrónico al usuario que se registra en la aplicación para que confirme su cuenta. Para ello, utilizaremos el paquete nodemailer y mailtrap para simular el envío de correos electrónicos.

import nodemailer from 'nodemailer'; // Importar paquete nodemailer

export const emailRegistro = async datos => {
  // Extraer datos del objeto
  const { email, nombre, token } = datos;

  // Configurar el transporter de mailtrap para enviar correos electrónicos
  const transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // Configurar el email que se enviará al usuario que se registra - Informacion del email
  const info = await transport.sendMail({
    from: '"UpTask 👻 - Administrador de Proyectos" <cuentas@uptask.com>',
    to: `${email}`,
    subject: 'UpTask - Confirma tu Cuenta',
    html: `
      <html>
        <head>
          <style>
            .boton {
              background-color: #00838f;
              border: none;
              color: white;
              padding: 10px 20px;
              text-align: center;
              text-decoration: none;
              display: inline-block;
              font-size: 16px;
              margin: 4px 2px;
              cursor: pointer;
            }
          </style>
        </head>
        <body>
          <h2>Hola ${nombre}, Bienvenido a UpTask</h2>
          <p>Para confirmar tu cuenta, haz click en el siguiente enlace:</p>
          <a class="boton" href="${process.env.FRONTEND_URL}/confirmar/${token}">Confirmar Cuenta</a>
          <br />
          <br />
          <p>Si no has creado esta cuenta, ignora este correo electrónico.</p>
        </body>
      </html>
    `,
  });
};

export const emailOlvidePassword = async datos => {
  // Extraer datos del objeto
  const { email, nombre, token } = datos;

  // Configurar el transporter de mailtrap para enviar correos electrónicos
  const transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // Configurar el email que se enviará al usuario que se registra - Informacion del email
  const info = await transport.sendMail({
    from: '"UpTask 👻 - Administrador de Proyectos" <cuentas@uptask.com>',
    to: `${email}`,
    subject: 'UpTask - Reestablecer Password',
    html: `
      <html>
        <head>
          <style>
            .boton {
              background-color: #00838f;
              border: none;
              color: white;
              padding: 10px 20px;
              text-align: center;
              text-decoration: none;
              display: inline-block;
              font-size: 16px;
              margin: 4px 2px;
              cursor: pointer;
            }
          </style>
        </head>
        <body>
          <h2>Hola ${nombre}, has solicitado reestablecer tu password</h2>
          <p>Haz click en el siguiente enlace para generar un nuevo password: </p>
          <a class="boton" href="${process.env.FRONTEND_URL}/olvide-password/${token}">Reestablecer Password</a>
          <br />
          <br />
          <p>Si tu no solicitaste este email, ignora este correo electrónico.</p>
        </body>
      </html>
    `,
  });
};
