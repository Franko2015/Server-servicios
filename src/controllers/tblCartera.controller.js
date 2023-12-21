import { pool } from "../db.js";
import { postLog } from "./tblLog.controller.js";
import { statusTicket } from "./tblTicket.controller.js";
import { config } from "dotenv";
config();

const CLIENT = process.env.S_CLIENT;
const SECRET = process.env.S_SECRET;
const PAYPAL_API = process.env.S_PAYPAL_API;
const auth = { user: CLIENT, pass: SECRET };
import request from "request";

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
  const id = req.params.id;
  const { monto } = req.body;

  if (!monto || !id) {
    return res
      .status(400)
      .json({ msg: "Todos los campos son obligatorios para la actualización" });
  }

  const updateQuery = `UPDATE ${tabla} SET monto = ? WHERE ${identificador} = ?`;

  try {
    const [resultado] = await pool.query(updateQuery, [monto, id]);

    if (resultado.affectedRows > 0) {
      res.json({ msg: "Tarjeta actualizada correctamente" });
      await postLog(
        `Consulta a ${tabla}`,
        `Consulta UPDATE a la ${tabla} = ${id}`
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
  const { rut_usuario, monto } = req.body;

  try {
    const [resultado] = await pool.query(
      `INSERT INTO ${tabla} (rut_usuario, monto) VALUES (?, ?)`,
      [rut_usuario, monto]
    );

    if (resultado.affectedRows > 0) {
      await postLog(
        `Consulta a ${tabla}`,
        `Consulta CREATE usuario = ${rut_usuario}`
      );
      createPayment(req, res)
      return res.json({ msg: "Saldo agregado correctamente" });
    } else {
      throw new Error("Error al agregar el dato");
    }
  } catch (error) {
    console.error(error); // Log the actual error
    await postLog(error, "Error en la BD");
    return res.status(500).json({ msg: "Error al agregar la tarjeta" });
  }
};

export const createPayment = (req, res) => {
  const { rut_usuario, monto_a_agregar } = req.body;
  const body = {
    intent: "CAPTURE",
    purchase_units: [
      {
        amount: {
          currency_code: "USD",
          value: monto_a_agregar,
        },
      },
    ],
    application_context: {
      brand_name: `Solutio`,
      landing_page: "NO_PREFERENCE",
      user_action: "PAY_NOW",
      return_url: `http://localhost:4000/api/cartera/execute-payment?rut_usuario=${rut_usuario}`,
      cancel_url: `http://localhost:4200/account/profile`,
    },
  };

  request.post(
    `${PAYPAL_API}/v2/checkout/orders`,
    {
      auth,
      body,
      json: true,
    },
    (error, response) => {
      if (error) {
        res.status(500).json({ msg: "Error en la solicitud a PayPal" });
      } else {
        const approvalUrl = response.body.links?.find(
          (link) => link.rel === "approve"
        )?.href;

        if (approvalUrl) {
          // Redirige al usuario a la URL de aprobación de PayPal
          res.status(200).json({ URL: approvalUrl });
        } else {
          res.status(500).json({
            msg: "No se encontró el enlace de aprobación en la respuesta de PayPal",
          });
        }
      }
    }
  );
};

export const addCash = async (req, res) => {
  const { rut_usuario, monto_a_agregar, id_ticket } = req.body;
  console.log(id_ticket);
  try {
    const [resultado] = await pool.query(
      `UPDATE ${tabla} SET monto = monto - ? WHERE rut_usuario = ?`,
      [monto_a_agregar, rut_usuario]
    );

    if (resultado.affectedRows > 0) {
      await postLog(
        `Consulta a ${tabla}`,
        `Consulta UPDATE a la ${tabla} = ${rut_usuario}`
      );

      // Instead of calling addCash recursively, call createPayment
      const pagoRealizado = await createPayment(req, res);

      if (pagoRealizado) {
        await statusTicket(id_ticket); // Use id_ticket here
        console.log(
          `Pago del ticket ${id_ticket} registrado para el usuario con rut ${rut_usuario}. Monto: ${monto_a_agregar}`
        );
        return res
          .status(200)
          .json({ msg: "Pago del ticket y recarga registrados correctamente" });
      } else {
        return res
          .status(500)
          .json({ msg: "Error al procesar el pago del ticket" });
      }
    } else {
      return res.status(404).json({ msg: "Usuario no encontrado" });
    }
  } catch (error) {
    console.error(error);
    // Handle the error appropriately
    return res.status(500).json({ msg: "Error al procesar la recarga" });
  }
};



export const payTicket = async (req, res) => {
  const { rut_usuario, monto, ticket } = req.body;
  try {
    const pagoRealizado = await addCash(this.req, this.res);

    if (pagoRealizado) {
      await statusTicket(ticket);
      console.log(
        `Pago del ticket ${ticket} registrado para el usuario con rut ${rut_usuario}. Monto: ${monto}`
      );
      res.status(200).json({ msg: "Pago registrado correctamente" });
    } else {
      res.status(404).json({ msg: "Usuario no encontrado" });
    }
  } catch (error) {
    console.error("Error al procesar el pago del ticket:", error);
    res.status(500).json({ msg: "Error al procesar el pago del ticket" });
  }
};

export const executePayment = (req, res) => {
  const token = req.query.token;
  const rut_usuario = req.query.rut_usuario;

  request.post(
    `${PAYPAL_API}/v2/checkout/orders/${token}/capture`,
    {
      auth,
      body: {
        statusCode: {},
      },
      json: true,
    },
    async (error, response) => {
      try {
        res.json({ dat: response.statusCode });

        if (response.statusCode) {
          res.status(response.statusCode).json({ data: response.statusCode });
        }
      } catch (err) {
        console.error("Error al procesar la ejecución del pago:", err);
        res
          .status(500)
          .json({ msg: "Error al procesar la ejecución del pago" });
      }
    }
  );
};
