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
router.get("/api/cartera/:id", getOne);

// Update
router.put("/api/cartera/:id", edit);

// Delete
router.delete("/api/cartera/:id", del);

// Create
router.post("/api/cartera", create);

// Payment
router.post("/api/cartera/payment", addCash);

router.post("/api/cartera/pay-ticket", payTicket);

router.post("/api/cartera/create-payment", createPayment);

router.get("/api/paypal/execute-payment", executePayment);

export const Cartera = router;
