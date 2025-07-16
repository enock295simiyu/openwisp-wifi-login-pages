/* eslint-disable camelcase */
import "./index.css";

import PropTypes from "prop-types";
import React from "react";
import {Cookies} from "react-cookie";
import {t} from "ttag";
import "react-toastify/dist/ReactToastify.css";
import {Link} from "react-router-dom";
import ReactLoading from "react-loading";
import LoadingContext from "../../utils/loading-context";

import handleChange from "../../utils/handle-change";
import Contact from "../contact-box";
import {successRedirectUrl} from "../../constants";
import handleLogout from "../../utils/handle-logout";


export default class SuccessRedirect extends React.Component {
  phoneTokenSentKey = "owPhoneTokenSent";

  constructor(props) {
    super(props);
    this.state = {};
    this.handleRedirect = this.handleRedirect.bind(this);

  }

  handleRedirect = () => {

  };

  async componentDidMount() {
    const {
      orgName,
      setTitle,
      userData,
      setUserData,
      orgSlug,
    } = this.props;
    setTitle(t`SUCCESS_REDIRECT_TITL`, orgName);
    // setTimeout(() => {
    //   window.location.href=successRedirectUrl(orgSlug);
    // }, 90000);

    // setUserData(
    //   {...userData,
    //   redirect:true
    //
    //   }
    // )
  }

  logout = () => {
    const {logout, cookies, orgSlug, setUserData, userData, navigate} =
      this.props;
    const redirectToStatus = (statusUrl = `/${orgSlug}/status`) =>
      navigate(statusUrl);
    handleLogout(
      logout,
      cookies,
      orgSlug,
      setUserData,
      userData,
      false,
      redirectToStatus,
    );
  };


  handleChange(event) {
    handleChange(event, this);
  }

  redirectToStatus = () => {
    const {orgSlug, navigate, userData, setUserData} =
      this.props;
    setUserData({
      ...userData,
      mustLogin: false,
      redirect: false,
    });

    const redirectToStatus = (statusUrl = `/${orgSlug}/status`) =>
      navigate(statusUrl);
    redirectToStatus();
  };

  render() {
    const {orgSlug, userData} = this.props;

    if (!userData.redirect === false) {
      window.location.assign(successRedirectUrl(orgSlug));
    }

    return (
      <>
        <div className="container content" id="registration">

          <div className="inner">
            <div className="main-column">


              <div className="row full">
                <ReactLoading type="cylon" color="black" height="50%" width="20%"
                              className="processing-payment-loader" />
                <h2>Redirecting to the internet .....</h2>
                <p>Wifi login was successfully. Redirecting you to <Link to="https://www.google.com"
                                                                         className="link">https://www.google.com</Link>
                </p>


              </div>
              <div className="row payment-status-row-4 cancel">
                <p>If you dont want to be redirected you can cancel and go back to the status page</p>
                <button
                  type="button"
                  className="button full"
                  onClick={this.redirectToStatus}
                >
                  Cancel Operation and view your account
                </button>
              </div>
            </div>

            <Contact />
          </div>
        </div>

      </>
    );
  }
}
SuccessRedirect.contextType = LoadingContext;
SuccessRedirect.propTypes = {
  settings: PropTypes.shape({
    mobile_phone_verification: PropTypes.bool,
  }).isRequired,
  orgSlug: PropTypes.string.isRequired,
  orgName: PropTypes.string.isRequired,
  cookies: PropTypes.instanceOf(Cookies).isRequired,
  authenticate: PropTypes.func.isRequired,
  logout: PropTypes.func.isRequired,
  userData: PropTypes.object.isRequired,
  setUserData: PropTypes.func.isRequired,
  setTitle: PropTypes.func.isRequired,
  language: PropTypes.string.isRequired,
  navigate: PropTypes.func.isRequired,
};
