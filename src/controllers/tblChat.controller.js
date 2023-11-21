import { pool } from "../db.js";
import { postLog } from "./tblLog.controller.js";

const tabla = "tblChat";

export const getAllChats = async (req, res) => {
  try {
    const [resultado] = await pool.query(`
      SELECT c.rut_cliente, u.tipo_cuenta, u.nombre, u.apellido_paterno, u.apellido_materno, c.mensaje, c.leido, c.fecha_envio
      FROM tblChat c
      JOIN tblUsuario u ON c.rut_cliente = u.rut_usuario;
    `);

    res.status(200).json(resultado);
    await postLog("Consulta a tblChat y tblUsuario", "Consulta SELECT");
  } catch (error) {
    await postLog(error, "Error en la BD");
  }
};

export const getChat = async (req, res) => {
  const { rut_cliente } = req.params;

  try {
    const [resultado] = await pool.query(
      `SELECT * FROM ${tabla} WHERE rut_cliente = ?`,
      [rut_cliente]
    );
    res.status(200).json(resultado);
    await postLog(`Consulta a ${tabla}`, "Consulta SELECT");
  } catch (error) {
    await postLog(error, "Error en la BD");
  }
};

export const postChat = async (req, res) => {
  try {
    const { rut_usuario, rut_cliente, mensaje } = req.body;

    let result = '';

    if (rut_usuario) {
      result = await pool.query(
        `INSERT INTO ${tabla} (rut_usuario, rut_cliente, mensaje) VALUES (?, ?, ?)`,
        [rut_usuario, rut_cliente, mensaje]
      );
    } else {
      result = await pool.query(
        `INSERT INTO ${tabla} (rut_cliente, mensaje) VALUES (?, ?)`,
        [rut_cliente, mensaje]
      );
    }

    res.status(200).json({ success: true, message: "Mensaje insertado correctamente", result });

    // Registra el evento en el log
    await postLog(
      `Nuevo mensaje insertado en ${tabla}`,
      "Inserción en la base de datos"
    );
  } catch (error) {
    await postLog(error, "Error en la BD");
    res
      .status(500)
      .json({ success: false, message: "Error en la base de datos" });
  }
};

export const leido = async (req, res) => {
  const { rut_cliente } = req.params;

  if (!rut_cliente) {
    return res.status(400).json({ msg: "El usuario no existe" });
  }

  const updateQuery = `UPDATE ${tabla} SET leido = true WHERE rut_cliente = ?`;

  try {
    const [resultado] = await pool.query(updateQuery, [rut_cliente]);

    if (resultado.affectedRows > 0) {
      res.json({ msg: "Mensaje leído correctamente" });
      await postLog(
        `Consulta a ${tabla}`,
        `Consulta UPDATE a la ${tabla} = ${rut_cliente}`
      );
    } else {
      res.status(404).json({ msg: "Mensaje no encontrado" });
    }
  } catch (error) {
    console.error("Error en la base de datos:", error);
    await postLog(error, "Error en la BD");
    res.status(500).json({ msg: "Error al actualizar los datos" });
  }
};
