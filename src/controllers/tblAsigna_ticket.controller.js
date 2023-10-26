import { pool } from '../db.js';
import { postLog } from './tblLog.controller.js';

const tabla = "tblAsigna_ticket";
const identificador = "id";


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
      const [resultado] = await pool.query(`SELECT * FROM ${tabla} WHERE ${identificador} = ${id}`);

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
  const { id_ticket, rut_tecnico } = req.body;

  try {
      const [resultado] = await pool.query(`UPDATE ${tabla} SET id_ticket = ?, rut_tecnico = ? WHERE ${identificador} = ${id}`,
      [id_ticket, rut_tecnico]);

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


export const del = async (req, res) => {
  const { id } = req.params;

  try {
      const [resultado] = await pool.query(`DELETE FROM ${tabla} WHERE ${identificador} = ${id}`);

      if (resultado.affectedRows > 0) {
          res.json({ message: 'Eliminado correctamente' });
          await postLog(`Consulta a ${tabla}`, `Consulta DELETE a la ${identificador} = ${id}`);
      } else {
          res.status(404).json({ message: 'No encontrado' });
      }
  } catch (error) {
    await postLog(error, "Error en la BD");
      res.status(500).json({ message: 'Error al eliminar el dato' });
  }
};


export const post = async (req, res) => {
  const { id_ticket, rut_tecnico } = req.body;

  try {
      const [resultado] = await pool.query(`INSERT INTO ${tabla} (id_ticket, rut_tecnico) VALUES (?, ?)`, [id_ticket, rut_tecnico]);

      if (resultado.affectedRows > 0) {
          const nuevoId = resultado.insertId;
          res.json({ id: nuevoId, message: 'Agregado correctamente' });
          await postLog(`Consulta a ${tabla}`, `Consulta CREATE usuario = ${usuario}`);
      } else {
          res.status(500).json({ message: 'Error al agregar el dato' });
      }
  } catch (error) {
    await postLog(error, "Error en la BD");
      res.status(500).json({ message: 'Error al agregar el dato' });
  }
};
