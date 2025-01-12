import {connect} from "react-redux";

import {authenticate, logout, setTitle, setUserData} from "../../actions/dispatchers";
import Component from "./login-token";

const mapStateToProps = (state) => {
  const conf = state.organization.configuration;
  return {
    login_token_form: conf.components.login_token_form,
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
