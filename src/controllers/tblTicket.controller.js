import { pool } from "../db.js";
import { postLog } from "./tblLog.controller.js";

const tabla = "tblTicket";
const identificador = "id_ticket";

export const getAll = async (req, res) => {
  try {
    const [resultado] = await pool.query(`SELECT * FROM ${tabla} ORDER BY ${identificador} DESC`);
    res.status(201).json(resultado);
    await postLog(`Consulta a ${tabla}`, "Consulta SELECT");
  } catch (error) {
    await postLog(error, "Error en la BD");
    res.status(500).json({ msg: "Error al obtener los datos" });
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
      res.status(201).json(resultado[0]);
      await postLog(
        `Consulta a ${tabla}`,
        `Consulta SELECT ONE a la ${identificador} = ${id}`
      );
    } else {
      res.status(404).json({ msg: "No hay tickets realizados" });
    }
  } catch (error) {
    await postLog(error, "Error en la BD");
    res.status(500).json({ msg: "Error al obtener los datos" });
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
      res.status(201).json({ msg: "Eliminado correctamente" });
      await postLog(
        `Consulta a ${tabla}`,
        `Consulta DELETE a la ${identificador} = ${id}`
      );
    } else {
      res.status(404).json({ msg: "No encontrado" });
    }
  } catch (error) {
    await postLog(error, "Error en la BD");
    res.status(500).json({ msg: "Error al eliminar el dato" });
  }
};

export const put = async (req, res) => {
  const { id } = req.params;
  const { rut_usuario, descripcion, valor_trabajo, pagado } = req.body;

  try {
    const [resultado] = await pool.query(
      `UPDATE ${tabla} SET rut_usuario = ?, descripcion = ?, valor_trabajo = ?, pagado = ? WHERE ${identificador} = ?`,
      [rut_usuario, descripcion, valor_trabajo, pagado, id]
    );

    if (resultado.affectedRows > 0) {
      res.status(201).json({ msg: "Actualizado correctamente" });
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
};

export const post = async (req, res) => {
  const tickets = req.body;

  if (!Array.isArray(tickets) || tickets.length === 0) {
    return res
      .status(400)
      .json({ msg: "La solicitud debe contener un array de tickets" });
  }

  try {
    let values = []; // Array para almacenar los valores de los registros
    for (const ticket of tickets) {
      const { rut_usuario, descripcion, valor_trabajo, pagado } = ticket;

      // Verificar si el rut_usuario existe en la tabla tblUsuario
      const [usuarioResult] = await pool.query(
        "SELECT COUNT(*) as count FROM tblUsuario WHERE rut_usuario = ?",
        [rut_usuario]
      );

      if (usuarioResult[0].count === 0) {
        // El rut_usuario no existe en la tabla tblUsuario
        res
          .status(404)
          .json(
            `El rut_usuario ${rut_usuario} no existe en la tabla tblUsuario`
          );
        return;
      }

      // Continuar con la inserción del ticket
      const id_ticket = await obtenerNuevoIdTicket(); // Obtener un nuevo id_ticket

      values.push([id_ticket, rut_usuario, descripcion, valor_trabajo, pagado]);
    }

    const query = `INSERT INTO ${tabla} (id_ticket, rut_usuario, descripcion, valor_trabajo, pagado) VALUES ?`;
    const [resultado] = await pool.query(query, [values]);

    if (resultado.affectedRows > 0) {
      res.status(200).json({ msg: 'Tickets agregados correctamente' });
    } else {
      res.status(500).json({ message: 'Error al agregar los tickets' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error al agregar los tickets' });
  }
};

// Función para obtener un nuevo id_ticket
const obtenerNuevoIdTicket = async () => {
  const [maxIdResult] = await pool.query(`SELECT MAX(id_ticket) as maxId FROM ${tabla}`);
  const ultimoIdTicket = maxIdResult[0].maxId || 0;
  return ultimoIdTicket + 1;
};


export const getTickets = async (req, res) => {
  const { rut_usuario } = req.params;

  try {
    const [resultado] = await pool.query(
      `SELECT t.*, at.rut_tecnico,
      t.fecha_creacion,
      u.nombre as nombre_tecnico, 
      u.apellido_paterno as apellido_paterno_tecnico, 
      u.apellido_materno as apellido_materno_tecnico,
      u.correo as correo_tecnico, 
      u.usuario as usuario_tecnico, 
      u.nacionalidad as nacionalidad_tecnico, 
      u.estado_cuenta as estado_cuenta_tecnico,
      u.tipo_cuenta as tipo_cuenta_tecnico, 
      tt.habilidad, tt.descripcion_habilidad, tt.puntuacion_habilidad
       FROM tblTicket t
       LEFT JOIN tblAsigna_ticket at ON t.id_detalle = at.id_detalle
       LEFT JOIN tblUsuario u ON at.rut_tecnico = u.rut_usuario
       LEFT JOIN tblTecnico tt ON u.rut_usuario = tt.rut_usuario
       WHERE t.rut_usuario = ?`,
      [rut_usuario]
    );

    if (resultado.length > 0) {
      res.status(201).json(resultado);
      await postLog(
        `Consulta a tblTicket, tblAsigna_ticket, tblUsuario y tblTecnico`,
        `Consulta SELECT con JOIN a las tablas tblTicket, tblAsigna_ticket, tblUsuario y tblTecnico con rut_usuario = ${rut_usuario} ORDER BY t.id_detalle DESC;`
      );
    } else {
      res.status(404).json({ msg: "No encontrado" });
    }
  } catch (error) {
    await postLog(error, "Error en la BD");
    res.status(500).json({ msg: "Error al obtener los datos" });
  }
};

export async function statusTicket(id_detalle) {
  try {
    const [resultado] = await pool.query(
      `UPDATE tblTicket SET pagado = ? WHERE id_detalle = ?`,
      ['Si', id_detalle]
    );

    if (resultado.affectedRows > 0) {
      await postLog(
        `Consulta a tblTicket`,
        `Consulta UPDATE a la id_detalle = ${id_detalle}`
      );
    } else {
      console.error("No se ha encontrado la tarjeta");
    }
  } catch (error) {
    console.error("Error en la BD:", error);
    await postLog(error, "Error en la BD");
  }
}
