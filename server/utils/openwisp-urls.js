const owPrefix = "/api/v1/radius/organization/{orgSlug}";
const paths = {
  password_change: "/account/password/change",
  password_reset: "/account/password/reset",
  password_reset_confirm: "/account/password/reset/confirm",
  registration: "/account",
  user_auth_token: "/account/token",
  validate_auth_token: "/account/token/validate",
  user_radius_sessions: "/account/session",
  create_mobile_phone_token: "/account/phone/token",
  mobile_phone_token_status: "/account/phone/token/active",
  verify_mobile_phone_token: "/account/phone/verify",
  mobile_phone_number_change: "/account/phone/change",
  plans: "/plan",
  payment_status: "/payment/{paymentId}",
  initiate_payment: "/payment/initiate",
  payment_ws: "/payment/ws/{paymentId}",
  buy_plan: "/plan/buy",
  current_plan: "/plan/current",
  validate_payment_id: "/payment/validate",
};

const reverse = (name, orgSlug) => {
  const path = paths[name];
  let prefix = owPrefix;
  if (!path) {
    throw new Error(`Reverse for path "${name}" not found.`);
  }
  if (name === "plans" || name === "current_plan") {
    prefix = prefix.replace("/radius/", "/subscriptions/");
  }
  if (name === "initiate_payment" || name === "buy_plan" || name === "payment_status" || name === "validate_payment_id") {
    prefix = prefix.replace("/radius/", "/payments/");
  }
  if (name === "payment_ws") {
    prefix = prefix.replace("/api/v1/radius/", "/payments/");
  }
  return `${prefix.replace("{orgSlug}", orgSlug)}${path}`;
};

export default reverse;
