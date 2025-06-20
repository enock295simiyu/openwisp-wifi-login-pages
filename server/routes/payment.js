import {Router} from "express";
import payments from "../controllers/payments-controller";
import errorHandler from "../utils/error-handler";
import initiatePayment from "../controllers/initiate-payment-controller";
import paymentWsController from "../controllers/payment-ws-controller";
import ValidatePaymentId from "../controllers/validate-payment-code-controller";
import RedeemVoucher from "../controllers/redeem-voucher";

const router = Router({mergeParams: true});

router.get("/status/:paymentId", errorHandler(payments));
router.post("/initiate", errorHandler(initiatePayment));
router.get("/ws/:paymentId", errorHandler(paymentWsController));
router.post("/validate", errorHandler(ValidatePaymentId));
router.post("/redeem-voucher", errorHandler(RedeemVoucher));


export default router;
