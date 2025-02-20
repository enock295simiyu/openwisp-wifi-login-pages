import {Router} from "express";
import obtainToken from "../controllers/obtain-token-controller";
import passwordChange from "../controllers/password-change-controller";
import passwordResetConfirm from "../controllers/password-reset-confirm-controller";
import passwordReset from "../controllers/password-reset-controller";
import registration from "../controllers/registration-controller";
import getUserRadiusSessions from "../controllers/user-radius-sessions-controller";
import validateToken from "../controllers/validate-token-controller";
import {
  createMobilePhoneToken,
  mobilePhoneTokenStatus,
  verifyMobilePhoneToken,
} from "../controllers/mobile-phone-token-controller";
import mobilePhoneNumberChange from "../controllers/mobile-phone-number-change-controller";
import errorHandler from "../utils/error-handler";
import validateLoginToken from "../controllers/login-token-controller";

const router = Router({mergeParams: true});

router.post("/token", errorHandler(obtainToken));
router.post("/token/validate", errorHandler(validateToken));
router.post("/login-token/validate", errorHandler(validateLoginToken));
router.post("/password/change", errorHandler(passwordChange));
router.post("/password/reset/confirm/", errorHandler(passwordResetConfirm));
router.post("/password/reset", errorHandler(passwordReset));
router.post("/", errorHandler(registration));
router.get("/session/", errorHandler(getUserRadiusSessions));
router.post("/phone/token", errorHandler(createMobilePhoneToken));
router.get("/phone/token/status", errorHandler(mobilePhoneTokenStatus));
router.post("/phone/verify", errorHandler(verifyMobilePhoneToken));
router.post("/phone/change", errorHandler(mobilePhoneNumberChange));

export default router;
