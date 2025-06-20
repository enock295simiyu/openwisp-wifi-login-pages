export const prefix = "/api/v1";
export const confirmApiUrl = `${prefix}/{orgSlug}/account/password/reset/confirm`;
export const loginApiUrl = (orgSlug) => `${prefix}/${orgSlug}/account/token`;
export const passwordChangeApiUrl = `${prefix}/{orgSlug}/account/password/change`;
export const registerApiUrl = `${prefix}/{orgSlug}/account/`;
export const resetApiUrl = `${prefix}/{orgSlug}/account/password/reset/`;
export const validateApiUrl = (orgSlug) =>
  `${prefix}/${orgSlug}/account/token/validate`;
export const paymentStatusUrl = (orgSlug, paymentId) =>
  `${prefix}/${orgSlug}/payment/status/${paymentId}`;
export const paymentUrlWs = (orgSlug, paymentId) =>
  `${prefix}/${orgSlug}/payment/${paymentId}/`;
export const getUserRadiusSessionsUrl = (orgSlug) =>
  `${prefix}/${orgSlug}/account/session`;
export const createMobilePhoneTokenUrl = (orgSlug) =>
  `${prefix}/${orgSlug}/account/phone/token`;
export const mobilePhoneTokenStatusUrl = (orgSlug) =>
  `${prefix}/${orgSlug}/account/phone/token/status`;
export const verifyMobilePhoneTokenUrl = (orgSlug) =>
  `${prefix}/${orgSlug}/account/phone/verify`;
export const mobilePhoneChangeUrl = (orgSlug) =>
  `${prefix}/${orgSlug}/account/phone/change`;
export const plansApiUrl = `${prefix}/{orgSlug}/plan/`;
export const modalContentUrl = (orgSlug) => `${prefix}/${orgSlug}/modal`;
export const mainToastId = "main_toast_id";
export const initiatePaymentUrl = (orgSlug) =>
  `${prefix}/${orgSlug}/payment/initiate`;
export const buyPlanUrl = (orgSlug) =>
  `${prefix}/${orgSlug}/plan/buy`;
export const currentPlanApiUrl = (orgSlug) => `${prefix}/${orgSlug}/plan/current`;
export const verifyPaymentIdUrl = (orgSlug) =>
  `${prefix}/${orgSlug}/payment/validate/`;

export const loginTokenUrl = (orgSlug) =>
  `${prefix}/${orgSlug}/account/login-token/validate/`;
export const redeemVoucherCodeUrl = (orgSlug) =>
  `${prefix}/${orgSlug}/payment/redeem-voucher`;
