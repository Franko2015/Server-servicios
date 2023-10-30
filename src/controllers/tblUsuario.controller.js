import { pool } from '../db.js';
import { postLog } from './tblLog.controller.js'
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

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
  const { rut } = req.params;

  try {
    const [resultado] = await pool.query(`SELECT * FROM ${tabla} WHERE ${identificador} = ${rut}`);

    if (resultado.length > 0) {
      res.json(resultado[0]);
      await postLog(`Consulta a ${tabla}`, `Consulta SELECT ONE a la ${tabla} = ${rut}`);
    } else if (res.status === 404) {
      res.status(404).json({ msg: 'No encontrado' });
    } else if (res.status === 401){
      res.status(401).json({ msg: 'No autorizado' });
    }
  } catch (error) {
    await postLog(error, "Error en la BD");
    res.status(500).json({ msg: 'El servidor no se encuentra disponible. Intente más tarde.' });
  }
};


//Se edita el usuario a modo que el rut sea no editable
export const edit = async (req, res) => {
  const { rut } = req.params;
  const { nombre, apellido_paterno, apellido_materno, correo, usuario, contrasena, nacionalidad, estado_cuenta, tipo_cuenta } = req.body;

  try {
    const [resultado] = await pool.query(`UPDATE ${tabla} SET nombre = ?, apellido_paterno = ?, apellido_materno = ?, correo = ?, usuario = ?, contrasena = ?, nacionalidad = ?, estado_cuenta = ?, tipo_cuenta = ? WHERE ${identificador} = ${rut}`,
      [nombre, apellido_paterno, apellido_materno, correo, usuario, contrasena, nacionalidad, estado_cuenta, tipo_cuenta]);

    if (resultado.affectedRows > 0) {
      res.json({ msg: 'Actualizado correctamente' });
      await postLog(`Consulta a ${tabla}`, `Consulta UPDATE a la ${identificador} = ${rut}`);
    } else {
      res.status(404).json({ msg: 'No encontrado' });
    }
  } catch (error) {
    await postLog(error, "Error en la BD");
    res.status(500).json({ msg: 'El servidor no se encuentra disponible. Intente más tarde.' });
  }
};

//Se crea el usuario ya activo con cuenta de cliente
export const create = async (req, res) => {
  const { rut_usuario, nombre, apellido_paterno, apellido_materno, correo, usuario, contrasena, nacionalidad, estado_cuenta, tipo_cuenta } = req.body;

  try {
    const [resultado] = await pool.query(`SELECT * FROM ${tabla} WHERE ${identificador} = ? OR usuario = ? OR correo = ?`, [rut_usuario, usuario, correo]);

    if (resultado && resultado.length > 0) {
      if (resultado[0].usuario === usuario) {
        res.status(400).json({ msg: 'Ya existe el usuario' });
      } else if (resultado[0].rut_usuario === rut_usuario) {
        res.status(400).json({ msg: 'Ya existe un usuario con ese RUT' });
      } else if (resultado[0].correo === correo) {
        res.status(400).json({ msg: 'Ya existe un usuario con este correo' });
      }
    } else {
      const passwordHashed = await bcrypt.hash(contrasena, 10);

      await pool.query(`
        INSERT INTO ${tabla}
        (rut_usuario, nombre, apellido_paterno, apellido_materno, correo, usuario, contrasena, nacionalidad, estado_cuenta, tipo_cuenta)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [rut_usuario, nombre, apellido_paterno, apellido_materno, correo, usuario, passwordHashed, nacionalidad, estado_cuenta, tipo_cuenta]
      );

      await postLog(`Create de usuario ${nombre}`, `Usuario ${rut_usuario} creado correctamente`);
      res.status(201).json({ msg: 'Usuario creado correctamente' });
    }
  } catch (error) {
    await postLog(error, "Error en la BD");
    res.status(500).json({ msg: 'El servidor no se encuentra disponible. Intente más tarde.' });
  }
};


//Autenticación de usuario
export const login = async (req, res) => {
  const { usuario, contrasena } = req.body;

  try {
    const [resultado] = await pool.query(`SELECT * FROM ${tabla} WHERE usuario = ?`, [usuario]);

    if (resultado.length > 0) {
      const user = resultado[0];
      const passwordValid = await bcrypt.compare(contrasena, user.contrasena);

      if (passwordValid) {
        const token = jwt.sign({ usuario }, process.env.JWT_SECRET || 'UnAsadito', { expiresIn: '1h' });

        if (token) {
          await postLog('Intento de logueo exitoso', `Ha iniciado sesión ${usuario}`);
          res.status(200).json({ msg: 'Usuario logueado correctamente', token, user: resultado[0] });
        } else {
          res.status(500).json({ msg: 'Error al generar el token' });
        }
      } else {
        await postLog('Intento de logueo erróneo', `Se ha intentado loguear con una contraseña incorrecta ${usuario}`);
        res.status(401).json({ msg: 'Credenciales inválidas' });
      }
    } else {
      res.status(404).json({ msg: 'Usuario no encontrado' });
    }
  } catch (error) {
    await postLog(error, "Error en la BD");
    res.status(500).json({ msg: 'El servidor no se encuentra disponible. Intente más tarde.' });
  }
};

