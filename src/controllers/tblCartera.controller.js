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
      res.status(404).json({ msg: "No se encontraron datos" });
    }
  } catch (error) {
    await postLog(error, "Error en la BD");
    res.status(500).json({ msg: "Error al obtener los datos" });
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
      res.status(404).json({ msg: "No se encontró el método de pago" });
    }
  } catch (error) {
    await postLog(error, "Error en la BD");
    res.status(500).json({ msg: "Error al eliminar la tarjeta" });
  }
};

export const create = async (req, res) => {
  const { rut_usuario, monto } = req.body;

  try {
    if (!rut_usuario || !monto) {
      throw new Error("Todos los campos son obligatorios para la creación");
    }

    const [resultado] = await pool.query(
      `INSERT INTO ${tabla} (rut_usuario, monto) VALUES (?, ?)`,
      [rut_usuario, monto]
    );

    if (resultado.affectedRows > 0) {
      await postLog(
        `Consulta a ${tabla}`,
        `Consulta CREATE usuario = ${rut_usuario}`
      );
      createPayment(req, res);
    } else {
      throw new Error("Error al agregar el dato");
    }
  } catch (error) {
    console.error(error);
    await postLog(error, "Error en la BD");
    res
      .status(500)
      .json({ msg: "Error al agregar la tarjeta", error: error.message });
  }
};

export const createPayment = async (req, res) => {
  const { rut_usuario, monto_a_agregar } = req.body;

  try {
    if (!rut_usuario || !monto_a_agregar) {
      throw new Error("Todos los campos son obligatorios para el pago");
    }

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
        return_url: `http://localhost:4000/api/paypal/execute-payment?rut_usuario=${rut_usuario}&amount=${monto_a_agregar}`,
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
      async (error, response) => {
        if (error) {
          throw new Error("Error en la solicitud a PayPal");
        } else {
          const approvalUrl = response.body.links?.find(
            (link) => link.rel === "approve"
          )?.href;

          if (approvalUrl) {
            // Redirige al usuario a la URL de aprobación de PayPal
            res.status(200).json({
              URL: approvalUrl,
              msg: "Entra al enlace enviado para pagar el monto seleccionado",
            });
          } else {
            throw new Error(
              "No se encontró el enlace de aprobación en la respuesta de PayPal"
            );
          }
        }
      }
    );
  } catch (error) {
    console.error(error);
    await postLog(error, "Error en la BD");
    res
      .status(500)
      .json({ msg: "Error al realizar el pago", error: error.message });
  }
};

export const payTicket = async (req, res) => {
  const { rut_usuario, monto, id_ticket } = req.body;

  try {
    if (!rut_usuario || !monto || !id_ticket) {
      throw new Error(
        "Todos los campos son obligatorios para el pago del ticket"
      );
    }

    const pagoRealizado = await addCash(rut_usuario, -monto);

    if (pagoRealizado) {
      await statusTicket(id_ticket);
      res.status(200).json({ msg: "Pago registrado correctamente" });
    } else {
      throw new Error("Usuario no encontrado");
    }
  } catch (error) {
    res.status(500).json({ msg: "Error al procesar el pago del ticket" });
  }
};

export const executePayment = (req, res) => {
  const token = req.query.token;
  const rut_usuario = req.query.rut_usuario;
  const amount = req.query.amount;

  request.post(
    `${PAYPAL_API}/v2/checkout/orders/${token}/capture`,
    {
      auth,
      body: {},
      json: true,
    },
    async (error, response) => {
      try {
        const paymentStatus = response.body.status;

        if (paymentStatus === "COMPLETED") {
          const pagoRealizado = await addCash(rut_usuario, amount);
          if (pagoRealizado) {
            const respuestaHTML = `
              <html>
                <head>
                  <style>
                    body {
                      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                      background-color: #f8f8f8;
                      text-align: center;
                      margin: 20px;
                    }
                    .container {
                      max-width: 400px;
                      margin: 0 auto;
                      background-color: #fff;
                      padding: 20px;
                      border-radius: 8px;
                      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                    }
                    h1 {
                      color: #4CAF50;
                    }
                    p {
                      color: #333;
                    }
                    button {
                      background-color: #4CAF50;
                      color: #fff;
                      padding: 10px 20px;
                      font-size: 16px;
                      border: none;
                      border-radius: 4px;
                      cursor: pointer;
                    }
                  </style>
                </head>
                <body>
                  <div class="container">
                    <h1>Pago realizado con éxito</h1>
                    <p>¡Gracias por su pago!</p>
                    <button onclick="cerrarVentana()">Cerrar</button>
                  </div>
        
                  <script>
                    function cerrarVentana() {
                      window.close();
                    }
                  </script>
                </body>
              </html>
            `;
            res.status(201).send(respuestaHTML);
          }
        }
      } catch (err) {
        res.status(500).send(`
    <html>
      <head>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f8f8f8;
            text-align: center;
            margin: 20px;
          }
          .container {
            max-width: 400px;
            margin: 0 auto;
            background-color: #fff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          }
          h1 {
            color: #ff6347; /* Tomate (color rojo) */
          }
          p {
            color: #333;
          }
          button {
            background-color: #ff6347;
            color: #fff;
            padding: 10px 20px;
            font-size: 16px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Error al procesar la ejecución del pago</h1>
          <p>${err.message}</p>
          <button onclick="cerrarVentana()">Cerrar</button>
        </div>

        <script>
          function cerrarVentana() {
            window.close();
          }
        </script>
      </body>
    </html>
  `);
      }
    }
  );
};

export const addCash = async (rut_usuario, amount) => {
  let connection;

  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Verificar si el usuario existe
    const [userExists] = await connection.query(
      "SELECT COUNT(*) as count FROM tblCartera_cliente WHERE rut_usuario = ?",
      [rut_usuario]
    );

    if (userExists[0].count === 0) {
      // Si el usuario no existe, realizar la inserción
      await connection.query(
        "INSERT INTO tblCartera_cliente (rut_usuario, monto) VALUES (?, ?)",
        [rut_usuario, amount]
      );
    } else {
      // Si el usuario existe, realizar la actualización
      const [resultado] = await connection.query(
        "UPDATE tblCartera_cliente SET monto = monto + ? WHERE rut_usuario = ?",
        [amount, rut_usuario]
      );

      if (resultado.affectedRows > 0) {
        await postLog(
          `Consulta a tblCartera_cliente`,
          `Consulta UPDATE a la tblCartera_cliente = ${rut_usuario}`
        );
      } else {
        await connection.rollback();
        return false;
      }
    }

    await connection.commit();
    return true;
  } catch (error) {
    console.error(error);
    if (connection) {
      await connection.rollback();
    }
    return false;
  } finally {
    if (connection) {
      connection.release();
    }
  }
};
