import { pool } from "../db.js";
import { postLog } from "./tblLog.controller.js";
import { statusTicket } from "./tblTicket.controller.js";

const tabla = "tblcartera_cliente";
const identificador = "rut_usuario";

export const getOne = async (req, res) => {
  const { id } = req.params;

  try {
    const [resultado] = await pool.query(
      `SELECT * FROM ${tabla} WHERE ${identificador} = ?`,
      [id]
    );

    if (resultado.length > 0) {
      res.status(201).json(resultado[0]);
      await postLog(
        `Consulta a ${tabla}`,
        `Consulta SELECT ONE a la ${tabla} = ${identificador}`
      );
    } else {
      res.status(404).json({ msg: "Debe registrar un medio de pago" });
    }
  } catch (error) {
    await postLog(error, "Error en la BD");
    res.status(500).json({ msg: "No tiene datos de la tarjeta ingrasada" });
  }
};

export const edit = async (req, res) => {
  const { n_tarjeta, fecha_caducidad, ccv, nombre_tarjeta, rut_usuario } =
    req.body;

  if (
    !n_tarjeta ||
    !fecha_caducidad ||
    !ccv ||
    !nombre_tarjeta ||
    !rut_usuario
  ) {
    return res
      .status(400)
      .json({ msg: "Todos los campos son obligatorios para la actualización" });
  }

  const updateQuery = `UPDATE ${tabla} SET n_tarjeta = ?, fecha_caducidad = ?, ccv = ?, nombre_tarjeta = ? WHERE ${identificador} = ?`;

  try {
    const [resultado] = await pool.query(updateQuery, [
      n_tarjeta,
      fecha_caducidad,
      ccv,
      nombre_tarjeta,
      rut_usuario,
    ]);

    if (resultado.affectedRows > 0) {
      res.json({ msg: "Tarjeta actualizada correctamente" });
      await postLog(
        `Consulta a ${tabla}`,
        `Consulta UPDATE a la ${tabla} = ${rut_usuario}`
      );
    } else {
      res.status(404).json({ msg: "Tarjeta no encontrada" });
    }
  } catch (error) {
    console.error("Error en la base de datos:", error);
    await postLog(error, "Error en la BD");
    res.status(500).json({ msg: "Error al actualizar los datos" });
  }
};

export const del = async (req, res) => {
  const { id } = req.params;

  try {
    const [resultado] = await pool.query(
      `DELETE FROM ${tabla} WHERE ${identificador} = ?`,
      [id]
    );

    if (resultado.affectedRows > 0) {
      res.json({ msg: "Método de pago eliminado correctamente" });
      await postLog(
        `Consulta a ${tabla}`,
        `Consulta DELETE a la ${identificador} = ${id}`
      );
    } else {
      res.status(404).json({ msg: "No encontrado" });
    }
  } catch (error) {
    await postLog(error, "Error en la BD");
    res.status(500).json({ msg: "Error al eliminar la tarjeta" });
  }
};

export const create = async (req, res) => {
  const { n_tarjeta, rut_usuario, fecha_caducidad, ccv, nombre_tarjeta } =
    req.body;

  try {
    const [resultado] = await pool.query(
      `INSERT INTO ${tabla} (n_tarjeta, rut_usuario, fecha_caducidad, ccv, nombre_tarjeta) VALUES (?, ?, ?, ?, ?)`,
      [n_tarjeta, rut_usuario, fecha_caducidad, ccv, nombre_tarjeta]
    );

    if (resultado.affectedRows > 0) {
      await postLog(
        `Consulta a ${tabla}`,
        `Consulta CREATE usuario = ${rut_usuario}`
      );
      return res.json({ msg: "Método de pago agregado correctamente" });
    } else {
      throw new Error("Error al agregar el dato");
    }
  } catch (error) {
    await postLog(error, "Error en la BD");
    return res.status(500).json({ msg: "Error al agregar la tarjeta" });
  }
};

export const addCash = async (req, res) => {
  const { rut_usuario, id_detalle, monto_actual } = req.body;

  if (!rut_usuario || !id_detalle || !monto_actual) {
    return res
      .status(400)
      .json({ msg: "Todos los campos son obligatorios para realizar el pago" });
  }

  const updateQuery = `UPDATE ${tabla} SET monto = ? WHERE rut_usuario = ?`;

  const [resultado] = await pool.query(updateQuery, [
    monto_actual,
    rut_usuario,
  ]);

  if (resultado.affectedRows > 0) {
    res.status(200).json({ msg: "Pago realizado correctamente" });
    await statusTicket(id_detalle);
    await postLog(
      `Consulta a ${tabla}`,
      `Consulta UPDATE a la ${tabla} = ${rut_usuario}`
    );
  } else {
    res.status(404).json({ msg: "Tarjeta no encontrada" });
  }
};
