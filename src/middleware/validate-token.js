import jwt from "jsonwebtoken";

function validateToken(req, res, next) {
  const headerToken = req.headers["authorization"];
  if (!headerToken || !headerToken.startsWith("Bearer ")) {
    const errorMessage = "No autorizado - Token no proporcionado";
    return sendErrorPage(res, errorMessage);
  } else {
    const token = headerToken.split(" ")[1];
    jwt.verify(token, process.env.JWT_SECRET || "UnAsadito", (err, decoded) => {
      if (err) {
        res.status(401).json({ msg: "No autorizado - Token inválido" });
      } else {
        req.decoded = decoded;
        next();
      }
    });
  }
}

export default validateToken;

function sendErrorPage(res, message) {
  const errorHTML = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Error de Autorización</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background-color: #f4f4f4;
                display: flex;
                align-items: center;
                justify-content: center;
                height: 100vh;
                margin: 0;
            }
            .container {
                text-align: center;
                background-color: #fff;
                padding: 30px;
                border-radius: 8px;
                box-shadow: 0 0 20px rgba(0, 0, 0, 0.2);
            }
            h1 {
                color: #ff6347; /* Tomate (color rojo) */
            }
            p {
                color: #333;
                margin-bottom: 20px;
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
            <h1>${message}</h1>
            <p>Por favor, inicie sesión para obtener la información.</p>
        </div>
    </body>
    </html>
`;
  res.status(401).send(errorHTML);
}
