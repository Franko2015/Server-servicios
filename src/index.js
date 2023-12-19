import express from "express";
const app = express();
import morgan from "morgan";
import cors from "cors";

import { Asignacion } from "./routes/tblAsigna_ticket.routes.js";
import { Cartera } from "./routes/tblCartera.routes.js";
import { Usuario } from "./routes/tblUsuario.routes.js";
import { Tecnico } from "./routes/tblTecnico.routes.js";
import { Log } from "./routes/tblLog.routes.js";
import { Ticket } from "./routes/tblTicket.routes.js";
import { Chat } from "./routes/tblChat.routes.js";
import { Email } from "./routes/email.routes.js";



app.use(cors());
app.use(express.json());

app.use(Asignacion);
app.use(Cartera);
app.use(Usuario);
app.use(Tecnico);
app.use(Log);
app.use(Ticket);
app.use(Chat);
app.use(Email);

// settings
app.set("port", process.env.PORT || 4000);
app.set("json spaces", 2);

//middlewares
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// starting the server
app.listen(4000, () => {
  console.log(`Servidor en puerto ${app.get("port")}`);
});
