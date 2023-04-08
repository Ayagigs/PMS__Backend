import express from "express";
import {
  sendTokensToEmployee,
  transactionHistory,
  walletBalance,
} from "../controllers/transactionController.js";
import { protect } from "../middleware/protect.js";
import {
  sendTokensToEmployees,
  walletBalances,
} from "../controllers/walletControllers.js";

const router = express.Router();

router.get("/transaction-history/:walletAddress", protect, transactionHistory);
router.get("/wallet-balance/:walletAddress", protect, walletBalance);
router.get("/wallet-balances/:address", protect, walletBalances);
router.post("/sendtoken", protect, sendTokensToEmployee);
router.post("/sendtokens", protect, sendTokensToEmployees);

export default router;
