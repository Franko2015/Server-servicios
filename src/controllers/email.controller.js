import nodemailer from 'nodemailer';
import crypto from 'crypto';


const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: "solutiotechoficial@gmail.com", // Use environment variables
    pass: "SolutioTechOficial2023", // Use environment variables
  },
});

const tokenStore = new Map();

export const validate = async (req, res) => {
    const { email } = req.body;
    // Validar el formato del correo electrónico
    if (!isValidEmail(email)) {
      return res.status(400).json({ msg: 'Formato de correo electrónico no válido' });
    }
  
    // Generar un token con un tiempo de expiración (por ejemplo, 1 hora)
    const token = crypto.randomBytes(20).toString('hex');
    const tokenExpiration = Date.now() + 3600000; // 1 hora
    tokenStore.set(token, { email, expiration: tokenExpiration });
  
    // Configuración del correo electrónico
    const mailOptions = {
      from: "solutiotechoficial@gmail.com",
      to: email,
      subject: 'Recuperación de Contraseña',
      text: `Haz clic en el siguiente enlace para restablecer tu contraseña: http://localhost:4000/reset/${token}`,
    };
  
    // Enviar el correo electrónico
    try {
      await transporter.sendMail(mailOptions);
      return res.status(200).json({ msg: 'Correo electrónico de recuperación de contraseña enviado exitosamente' });
    } catch (error) {
      console.error('Error al enviar el correo electrónico de recuperación:', error);
      return res.status(500).json({ msg: 'Error al enviar el correo electrónico de recuperación' });
    }
  };
  
  export const reset = (req, res) => {
    const { token } = req.params;
  
    // Verificar si el token es válido
    if (!tokenStore.has(token)) {
      return res.status(404).json({ msg: 'Token no válido' });
    }
  
    // Verificar la expiración del token
    const tokenData = tokenStore.get(token);
    if (Date.now() > tokenData.expiration) {
      tokenStore.delete(token);
      return res.status(400).json({ msg: 'El token ha caducado' });
    }
  
    // Eliminar el token después de su uso (en un entorno de producción, guárdelo de manera segura)
    tokenStore.delete(token);
  
    return res.status(200).json({ msg: 'Token válido, puedes restablecer la contraseña' });
  };
  
  function isValidEmail(email) {
    // Validar el formato del correo electrónico (una comprobación simple con fines ilustrativos)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  