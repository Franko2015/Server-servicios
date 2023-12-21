import { pool } from "../db.js";
import { postLog } from "./tblLog.controller.js";

const tabla = "tblTecnico";
const identificador = "rut_usuario";

export const getAll = async (req, res) => {
  try {
    const [resultado] = await pool.query(`
    SELECT u.*, t.habilidad, t.descripcion_habilidad, t.puntuacion_habilidad
FROM tblUsuario u
LEFT JOIN tblTecnico t ON u.rut_usuario = t.rut_usuario WHERE u.tipo_cuenta = 'TÉCNICO';
    `);

    res.json(resultado);
    await postLog(
      `Consulta a ${tabla} y tblTecnico`,
      "Consulta SELECT con JOIN"
    );
  } catch (error) {
    await postLog(error, "Error en la BD");
  }
};

export const getOne = async (req, res) => {
  const { id } = req.params;

  try {
    const [resultado] = await pool.query(
      `SELECT * FROM ${tabla} WHERE ${identificador} = ?`,
      [id]
    );

    if (resultado.length > 0) {
      res.json(resultado[0]);
      await postLog(
        `Consulta a ${tabla}`,
        `Consulta SELECT ONE a la ${identificador} = ${id}`
      );
    } else {
      res.status(404).json({ msg: "No encontrado" });
    }
  } catch (error) {
    await postLog(error, "Error en la BD");
    res.status(500).json({ msg: "Error al obtener los datos" });
  }
};

export const addHabilitie = async (req, res) => {
  const { rut_usuario, habilidad, descripcion_habilidad, puntuacion_habilidad } = req.body;

try {
  const [resultado] = await pool.query(
    `INSERT INTO ${tabla} (rut_usuario, habilidad, descripcion_habilidad, puntuacion_habilidad) VALUES (?, ?, ?, ?)`,
    [rut_usuario, habilidad, descripcion_habilidad, puntuacion_habilidad]
  );

  if (resultado.insertId) {
    res.status(200).json({ msg: "Insertado correctamente" });
    await postLog(
      `Consulta a ${tabla}`,
      `Consulta INSERT con ID insertado = ${resultado.insertId}`
    );
  } else {
    res.status(500).json({ msg: "Error al insertar los datos" });
  }
} catch (error) {
  await postLog(error, "Error en la BD");
  res.status(500).json({ msg: "Error al insertar los datos" });
}

};

export const put = async (req, res) => {
  const id = req.params.id
  const { habilidad, descripcion_habilidad, puntuacion_habilidad } = req.body;
  try {
    const [resultado] = await pool.query(
      `UPDATE ${tabla} SET habilidad = ?, descripcion_habilidad = ?, puntuacion_habilidad = ? WHERE ${identificador} = ?`,
      [habilidad, descripcion_habilidad, puntuacion_habilidad, id]
    );

    if (resultado.affectedRows > 0) {
      res.json({ msg: "Actualizado correctamente" });
      await postLog(
        `Consulta a ${tabla}`,
        `Consulta UPDATE a la ${identificador} = ${id}`
      );
    } else {
      res.status(404).json({ msg: "No encontrado" });
    }
  } catch (error) {
    await postLog(error, "Error en la BD");
    res.status(500).json({ msg: "Error al actualizar los datos" });
  }
}

export const post = async (req, res) => {
  const { rut_usuario } = req.body;
  try {
    const [resultado] = await pool.query(
      `UPDATE tblUsuario SET tipo_cuenta = 'TECNICO' WHERE rut_usuario = '${rut_usuario}'`,
      [rut_usuario]
    );

    if (resultado.affectedRows > 0) {
      const nuevoId = resultado.insertId;
      res.json({ id: nuevoId, msg: "Agregado correctamente" });
      await postLog(
        `Consulta a ${tabla}`,
        `Consulta CREATE a la tabla ${tabla} = ${rut_usuario}`
      );
    } else {
      res.status(500).json({ msg: "Error al agregar el dato" });
    }
  } catch (error) {
    await postLog(error, "Error en la BD");
    res.status(500).json({ msg: "Error al agregar el dato" });
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
      res.json({ msg: "Habilidad eliminada correctamente" });
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
