import { pool } from '../db.js';
import { postLog } from './tblLog.controller.js';

const tabla = "tblAsigna_ticket";
const identificador = "id";


export const getAll = async (req, res) => {
  try {
    const query = `
      SELECT 
        t.*, 
        a.rut_tecnico, 
        u.nombre as nombre_tecnico,
        u.apellido_paterno as apellido_paterno_tecnico,
        u.apellido_materno as apellido_materno_tecnico
      FROM tblTicket t
      LEFT JOIN tblAsigna_ticket a ON t.id_detalle = a.id_detalle
      LEFT JOIN tblUsuario u ON a.rut_tecnico = u.rut_usuario
    `;
    const [resultado] = await pool.query(query);
    res.json(resultado);
    await postLog(`Consulta a ${tabla}`, "Consulta SELECT");
  } catch (error) {
    await postLog(error, "Error en la BD");
    res.status(500).json({ msg: 'Error al obtener los datos' });
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
          res.status(404).json({ msg: 'No encontrado' });
      }
  } catch (error) {
    await postLog(error, "Error en la BD");
      res.status(500).json({ msg: 'Error al obtener los datos' });
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
          res.status(404).json({ msg: 'No encontrado' });
      }
  } catch (error) {
    await postLog(error, "Error en la BD");
      res.status(500).json({ msg: 'Error al actualizar los datos' });
  }
};

export const del = async (req, res) => {
  const { id } = req.params;

  try {
      const [resultado] = await pool.query(`DELETE FROM ${tabla} WHERE ${identificador} = ${id}`);

      if (resultado.affectedRows > 0) {
          res.json({ msg: 'Eliminado correctamente' });
          await postLog(`Consulta a ${tabla}`, `Consulta DELETE a la ${identificador} = ${id}`);
      } else {
          res.status(404).json({ msg: 'No encontrado' });
      }
  } catch (error) {
    await postLog(error, "Error en la BD");
      res.status(500).json({ msg: 'Error al eliminar el dato' });
  }
};

export const post = async (req, res) => {
  const { id_detalle, rut_tecnico } = req.body;
  console.log({ id_detalle, rut_tecnico });

  try {
    // Verificar si el ticket ya está asignado a un técnico
    const [verificacion] = await pool.query(`SELECT * FROM ${tabla} WHERE id_detalle = ?`, [id_detalle]);

    if (verificacion.length > 0) {
      res.status(400).json({ msg: 'El ticket ya está asignado a un técnico' });
      return;
    }

    // Si el ticket no está asignado, proceder con la inserción
    const [resultado] = await pool.query(`INSERT INTO ${tabla} (id_detalle, rut_tecnico) VALUES (?, ?)`, [id_detalle, rut_tecnico]);

    if (resultado.affectedRows > 0) {
      const nuevoId = resultado.insertId;
      res.json({ id: nuevoId, msg: 'Agregado correctamente' });
      await postLog(`Consulta a ${tabla}`, `Consulta CREATE usuario = ${usuario}`);
    } else {
      res.status(500).json({ msg: 'Error al agregar el dato' });
    }
  } catch (error) {
    await postLog(error, "Error en la BD");
    res.status(500).json({ msg: 'Error al agregar el dato' });
  }
};

