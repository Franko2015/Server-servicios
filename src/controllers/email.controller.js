import nodemailer from "nodemailer";
import crypto from "crypto";
import { pool } from "./../db.js";
import { config } from "dotenv";
import bcrypt from "bcrypt";

config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  port: 456,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const tokenStore = new Map();

export const validate = async (req, res) => {
  const { email } = req.body;

  // Check if the email exists in the database
  const emailExists = await isValidEmail(email);
  if (!emailExists) {
    return res.status(404).json({ msg: "Correo no se encuentra" });
  }

  // Generate a unique token and store the email along with the timestamp
  const token = crypto.randomBytes(20).toString("hex");
  const expirationTime = Date.now() + 15 * 60 * 1000; // 15 minutes
  tokenStore.set(token, { email, expirationTime });

  // Configuración del correo electrónico
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Recuperación de Contraseña",
    html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <p style="font-size: 16px; margin-bottom: 20px;">Estimad@,</p>
    
    <p style="font-size: 16px; margin-bottom: 20px;">Confiamos en que este mensaje te encuentre bien. Hemos registrado una solicitud para restablecer la contraseña de tu cuenta. Por favor, sigue el enlace proporcionado a continuación para completar el proceso de recuperación:</p>
    
    <p style="font-size: 16px; margin-bottom: 20px;"><a href="http://localhost:4200/reset/${token}" style="color: #007BFF; text-decoration: none;">Restablecer Contraseña</a></p>
    
    <p style="font-size: 16px; margin-bottom: 20px;">Si no has iniciado esta solicitud, puedes ignorar este correo electrónico con total seguridad.</p>
    
    <p style="font-size: 16px; margin-bottom: 20px;">Agradecemos su comprensión y colaboración.</p>
    
    <p style="font-size: 16px; margin-bottom: 20px;">Atentamente,<br>El Equipo de Solutio</p>
</div>
        `,
  };
  try {
    const [rows] = await pool.query(
      "UPDATE tblUsuario SET token = ? WHERE correo = ?",
      [token, email]
    );

    transporter.sendMail(mailOptions, (error) => {
      if (error) {
        return res.status(500).json({
          msg: "Error al enviar el correo electrónico de recuperación",
        });
      }

      return res.status(200).json({
        msg: "Correo electrónico de recuperación enviado con éxito",
      });
    });
    return rows.affectedRows > 0;
  } catch (error) {
    console.error(`Error al agregar el token: ${error.message}`);
    throw new Error("Error al agregar el token");
  }

  // Envía el correo electrónico
};

export const reset = async (req, res) => {
  const { token, newPassword } = req.body;

  if (!tokenStore.has(token)) {
    return res.status(404).json({ msg: "Token no válido" });
  }

  try {
    // Assuming you have a column named 'password' in tblUsuario
    const passwordHashed = await bcrypt.hash(newPassword, 10);
    const resultado = await pool.query(
      "UPDATE tblUsuario SET contrasena = ? WHERE token = ?",
      [passwordHashed, token]
    );

    // Elimina el token después de su uso (en una aplicación real, podrías almacenarlo de manera más segura)
    tokenStore.delete(token);
    if (resultado) {
      return res.status(200).json({
        msg: "Contraseña actualizada exitosamente",
      });
    }
  } catch (error) {
    console.error("Error updating password:", error);
    return res.status(500).json({ msg: "Error al actualizar la contraseña" });
  }
};

const isValidEmail = async (email) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM tblUsuario WHERE correo = ?",
      [email]
    );
    return rows.length > 0;
  } catch (error) {
    return false;
  }
};

export const addToken = async (token, email) => {
  try {
    const [rows] = await pool.query(
      "UPDATE tblUsuario SET token = ? WHERE correo = ?",
      [token, email]
    );

    return rows.affectedRows > 0;
  } catch (error) {
    console.error(`Error al agregar el token: ${error.message}`);
    throw new Error("Error al agregar el token");
  }
};
