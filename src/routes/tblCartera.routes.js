import { Router } from "express";
import {
  getOne,
  edit,
  del,
  create,
  addCash,
  createPayment,
  executePayment,
  payTicket,
} from "../controllers/tblCartera.controller.js";
import validateToken from "../middleware/validate-token.js";

const router = Router();

// Get One
router.get("/api/cartera/:id", validateToken, getOne);

// Update
router.put("/api/cartera/:id", validateToken, edit);

// Delete
router.delete("/api/cartera/:id", validateToken, del);

// Create
router.post("/api/cartera", validateToken, create);

// Payment
router.post("/api/cartera/payment", validateToken, addCash);

router.post("/api/cartera/pay-ticket", payTicket);

router.post("/api/cartera/create-payment", createPayment);

router.get("/api/cartera/execute-payment", executePayment);

export const Cartera = router;
