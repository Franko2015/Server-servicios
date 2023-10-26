import { pool } from '../db.js';
import { postLog } from './tblLog.controller.js'

const tabla = "tblUsuario"
const identificador = "rut_usuario"

//Se obtienen los datos de los usuarios registrados
export const getAll = async (req, res) => {
  try {
    const [resultado] = await pool.query(`SELECT * FROM ${tabla}`);
    res.json(resultado);
    await postLog(`Consulta a ${tabla}`, "Consulta SELECT");
  } catch (error) {
    await postLog(error, "Error en la BD");
  }
};

//Se obtienen los datos del usuario registrado
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

//Se edita el usuario a modo que el rut sea no editable
export const put = async (req, res) => {
  const { id } = req.params;
  const { nombre, apellido_paterno, apellido_materno, correo, usuario, contrasena, estado_cuenta, tipo_cuenta } = req.body;

  try {
      const [resultado] = await pool.query(`UPDATE ${tabla} SET nombre = ?, apellido_paterno = ?, apellido_materno = ?, correo = ?, usuario = ?, contrasena = ?, estado_cuenta = ?, tipo_cuenta = ? WHERE ${identificador} = ${id}`,
      [nombre, apellido_paterno, apellido_materno, correo, usuario, contrasena, estado_cuenta, tipo_cuenta]);

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

//Se crea el usuario ya activo con cuenta de cliente
export const post = async (req, res) => {
  const { rut_usuario, nombre, apellido_paterno, apellido_materno, correo, usuario, contrasena, estado_cuenta, tipo_cuenta } = req.body;

  try {
      const [resultado] = await pool.query(`INSERT INTO ${tabla} (rut_usuario, nombre, apellido_paterno, apellido_materno, correo, usuario, contrasena, estado_cuenta, tipo_cuenta) VALUES (?, ?, ?, ?, ?, ?, ?, 'ACTIVA', 'CLIENTE')`,
      [rut_usuario, nombre, apellido_paterno, apellido_materno, correo, usuario, contrasena, estado_cuenta, tipo_cuenta]);

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
