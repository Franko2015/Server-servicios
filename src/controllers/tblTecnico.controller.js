import { pool } from '../db.js';
import { postLog } from './tblLog.controller.js'

const tabla = "tblTecnico"
const identificador = "rut_usuario"


export const getAll = async (req, res) => {
  try {
    const [resultado] = await pool.query(`SELECT * FROM ${tabla}`);
    res.json(resultado);
    await postLog(`Consulta a ${tabla}`, "Consulta SELECT");
  } catch (error) {
    await postLog(error, "Error en la BD");
  }
};


export const getOne = async (req, res) => {
  const { id } = req.params;

  try {
      const [resultado] = await pool.query(`SELECT * FROM ${tabla} WHERE ${identificador} = ?`, [id]);

      if (resultado.length > 0) {
          res.json(resultado[0]);
          await postLog(`Consulta a ${tabla}`, `Consulta SELECT ONE a la ${identificador} = ${id}`);
      } else {
          res.status(404).json({ message: 'No encontrado' });
      }
  } catch (error) {
    await postLog(error, "Error en la BD");
      res.status(500).json({ message: 'Error al obtener los datos' });
  }
};


export const put = async (req, res) => {
  const { id } = req.params;
  const { habilidad, descripcion_habilidad, puntuacion_habilidad } = req.body;

  try {
      const [resultado] = await pool.query(`UPDATE ${tabla} SET habilidad = ?, descripcion_habilidad = ?, puntuacion_habilidad = ? WHERE ${identificador} = ?`,
      [habilidad, descripcion_habilidad, puntuacion_habilidad, id]);

      if (resultado.affectedRows > 0) {
          res.json({ message: 'Actualizado correctamente' });
          await postLog(`Consulta a ${tabla}`, `Consulta UPDATE a la ${identificador} = ${id}`);
      } else {
          res.status(404).json({ message: 'No encontrado' });
      }
  } catch (error) {
    await postLog(error, "Error en la BD");
      res.status(500).json({ message: 'Error al actualizar los datos' });
  }
};


export const post = async (req, res) => {
  const { rut_usuario, habilidad, descripcion_habilidad, puntuacion_habilidad } = req.body;

  try {
      const [resultado] = await pool.query(`INSERT INTO ${tabla} (rut_usuario, habilidad, descripcion_habilidad, puntuacion_habilidad) VALUES (?, ?, ?, ?)`,
      [rut_usuario, habilidad, descripcion_habilidad, puntuacion_habilidad]);

      if (resultado.affectedRows > 0) {
          const nuevoId = resultado.insertId;
          res.json({ id: nuevoId, message: 'Agregado correctamente' });
          await postLog(`Consulta a ${tabla}`, `Consulta CREATE a la tabla ${tabla} = ${rut_usuario}`);
      } else {
          res.status(500).json({ message: 'Error al agregar el dato' });
      }
  } catch (error) {
    await postLog(error, "Error en la BD");
      res.status(500).json({ message: 'Error al agregar el dato' });
  }
};
