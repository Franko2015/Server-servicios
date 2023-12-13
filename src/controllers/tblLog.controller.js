import { pool } from '../db.js';
const tabla = "tblLog";

export async function postLog (error, tipo){
  const fechaActual = new Date();
  const anio = fechaActual.getFullYear();
  const mes = ("0" + (fechaActual.getMonth() + 1)).slice(-2);
  const dia = ("0" + fechaActual.getDate()).slice(-2);
  const horas = ("0" + fechaActual.getHours()).slice(-2);
  const minutos = ("0" + fechaActual.getMinutes()).slice(-2);
  const segundos = ("0" + fechaActual.getSeconds()).slice(-2);

  const fechaFormateada = `${anio}-${mes}-${dia} ${horas}:${minutos}:${segundos}`;

  const [reporte] = await pool.query(
    "INSERT INTO tblLog (descripcion, fecha, tipo_log) VALUES (?, ?, ?)",
    [error.toString(), fechaFormateada, tipo]
  );
};

export const getAllLog = async (req, res) => {
  try {
    const [resultado] = await pool.query(`SELECT * FROM ${tabla} ORDER BY id_log DESC`);
    res.json(resultado);
    await postLog(`Consulta a ${tabla}`, "Consulta SELECT");
  } catch (error) {
    await postLog(error, "Error en la BD");
  }
};
