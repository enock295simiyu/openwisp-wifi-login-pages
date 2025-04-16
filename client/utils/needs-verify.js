/*
 * returns true if the user should initiate
 * account verification with the specified method
 */
const needsVerify = (method, user, settings) => {

  const {userplan} = user;

  if (user.is_active === false || user.is_verified === true) {
    return false;
  }


  if (method === "mobile_phone") {

    return (
      user.method === "mobile_phone" &&
      user.is_verified === false &&
      settings.mobile_phone_verification
    );
  }

  if (method === "bank_card") {
    return Boolean(
      user.method === "bank_card" &&
        user.is_verified === false &&
        user.payment_url &&
        settings.subscriptions,
      userplan.active === true &&
      userplan.is_expired === false,
    );
  }

  let response = Boolean(
    !user.is_verified &&
    settings.subscriptions &&
    userplan.active === false ||
    userplan.is_expired === true,
    );
  return response;

};
export default needsVerify;
