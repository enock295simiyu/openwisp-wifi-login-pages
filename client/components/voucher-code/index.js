import {connect} from "react-redux";

import {authenticate, logout, setTitle, setUserData} from "../../actions/dispatchers";
import Component from "./voucher-code";

const mapStateToProps = (state) => {
  const conf = state.organization.configuration;
  const loginForm = conf.components.login_form;
  loginForm.input_fields.phone_number =
    conf.components.registration_form.input_fields.phone_number;
  const paymentVerifyForm = conf.components.payment_verify_form;
  return {
    voucher_code_form: loginForm,
    settings: conf.settings,
    orgSlug: conf.slug,
    orgName: conf.name,
    userData: conf.userData,
    language: state.language,
  };
};
const mapDispatchToProps = (dispatch) => ({
  logout: logout(dispatch),
  setUserData: setUserData(dispatch),
  setTitle: setTitle(dispatch),
  authenticate: authenticate(dispatch),
});
export default connect(mapStateToProps, mapDispatchToProps)(Component);
