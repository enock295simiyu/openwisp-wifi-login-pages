/* eslint-disable react/require-default-props */
import {Cookies} from "react-cookie";
import PropTypes from "prop-types";
import React from "react";
import {Link} from "react-router-dom";
import {toast} from "react-toastify";
import {t} from "ttag";
import LoadingContext from "../../utils/loading-context";
import Contact from "../contact-box";
import validateToken from "../../utils/validate-token";
import handleLogout from "../../utils/handle-logout";

export default class PaymentStatus extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isTokenValid: null,
    };
    this.paymentProceedHandler = this.paymentProceedHandler.bind(this);
  }

  async componentDidMount() {
    const {cookies, orgSlug, setUserData, logout, params, settings, language} =
      this.props;
    const {status} = params;

    let {userData} = this.props;
    const {setLoading} = this.context;

    setLoading(true);
    const isTokenValid = await validateToken(
      cookies,
      orgSlug,
      setUserData,
      userData,
      logout,
      language,
    );
    setLoading(false);
    this.setState({isTokenValid});
    if (isTokenValid === false) {
      return;
    }

    ({userData} = this.props);
    const {method, is_verified: isVerified} = userData;

    // flag user to repeat login in order to restart session with new radius group
    if (status === "success" && settings.payment_methods.includes(method) && isVerified === true) {
      setUserData({
        ...userData,
        mustLogin: !settings.payment_requires_internet,
        mustLogout: settings.payment_requires_internet,
        repeatLogin: settings.payment_requires_internet,
      });


    } else if (
      status === "draft" &&
      settings.payment_methods.includes(method) &&
      isVerified === false
    ) {
      setUserData({
        ...userData,
        mustLogin: settings.payment_requires_internet ? true : undefined,
      });
    }
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

  render() {
    const {orgSlug, params, isAuthenticated, mustLogin, userData, settings, navigate, authenticate} = this.props;
    const {status} = params;
    const {method, is_verified: isVerified, payment_url} = userData;
    const redirectToStatus = () => navigate(`/${orgSlug}/status`, {replace: true});
    const acceptedValues = ["success", "failed", "draft"];
    // const acceptedValues = ["success", "failed", "draft"];
    const {isTokenValid} = this.state;
    // not registered with bank card flow
    if (
      (method && !settings.payment_methods.includes(method)) ||
      !acceptedValues.includes(status)
    ) {
      redirectToStatus();
    }

    if (isAuthenticated === undefined && status === "success" && userData && userData.plan_changed === true) {
      authenticate(true);
    }

    // likely somebody opening this page by mistake
    if (
      (isAuthenticated === false && status !== "draft") ||
      // (!["failed", "draft"].includes(status) && !payment_url && isVerified === true) ||
      (status === "success" && isVerified === false) ||
      isTokenValid === false ||
      status === "success" && mustLogin === true
    ) {
      // document.location.replace(`/${orgSlug}/status`);
      // return null;
      redirectToStatus();
    }
    if (
      isAuthenticated === false ||
      (status === "failed" && isVerified === true) ||
      (status === "success" && isVerified === false)
    ) {

      redirectToStatus();
    }
    // draft case
    if (isAuthenticated === true && userData.is_verified === true && !userData.payment_url) {

      redirectToStatus();
    }
    if (status === "draft") {
      return this.renderDraft();
    }


    // success case
    if (isTokenValid === true && status === "success" && isVerified === true) {
      toast.success(t`PAY_SUCCESS`);
      return redirectToStatus();
    }

    return this.renderFailed();
  }

  paymentProceedHandler() {
    const {authenticate, setUserData, orgSlug, userData, settings} = this.props;
    const {method, is_verified: isVerified, payment_id} = userData;

    // Payment gateway may require internet access.
    // Since, captive portal login is handled by the Status component,
    // the user is navigated to the "/status" for captive portal login
    // which then redirects the user to the payment gateway.


    if (settings.payment_requires_internet) {
      setUserData({
        ...userData,
        proceedToPayment: true,
      });
    }
    authenticate(true);
  }


  renderDraft() {
    const {orgSlug, page = {}, settings, userData} = this.props;
    const {method, is_verified: isVerified, payment_url} = userData;
    const {timeout = 5, max_attempts: maxAttempts = 3} = page;
    let payProceedUrl = payment_url;

    if (!payProceedUrl) {
      if (method && method === "mpesa") {
        payProceedUrl = `/${orgSlug}/buy-plan`;
      } else {
        payProceedUrl = settings.payment_requires_internet
          ? `/${orgSlug}/status`
          : `/${orgSlug}/payment/process`;

      }
    }

    return (
      <div className="container content">
        <div className="inner">
          <div className="main-column single">
            <div className="inner">
              <h2 className="row">{t`PAY_REQ`}</h2>
              {method === "mpesa" ? <div
                className="row"
                dangerouslySetInnerHTML={{
                  __html: t`MPESA_PAY_WARN${timeout}${maxAttempts}`,
                }}
              /> : <div
                className="row"
                dangerouslySetInnerHTML={{
                  __html: t`PAY_WARN${timeout}${maxAttempts}`,
                }}
              />}


              <div className="row">
                <Link
                  className="button full"
                  to={payProceedUrl}
                  onClick={this.paymentProceedHandler}
                >
                  {t`PAY_PROC_BTN`}
                </Link>
              </div>

              <div className="row cancel">
                <button
                  type="button"
                  className="button full"
                  onClick={this.logout}
                >
                  {t`PAY_GIVE_UP_BTN`}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  renderFailed() {
    const {orgSlug} = this.props;
    // failed payment case
    return (
      <div className="container content">
        <div className="inner">
          <div className="main-column">
            <div className="inner">
              <h2 className="row payment-status-row-1">{t`PAY_FAIL`}</h2>
              <div className="row payment-status-row-2">{t`PAY_SUB_H`}</div>
              <div className="row payment-status-row-3">
                <Link className="button full" to={`/${orgSlug}/payment/draft`}>
                  {t`PAY_TRY_AGAIN_BTN`}
                </Link>
              </div>

              <div className="row payment-status-row-4">
                <p>{t`PAY_GIVE_UP_TXT`}</p>
                <button
                  type="button"
                  className="button full"
                  onClick={this.logout}
                >
                  {t`PAY_GIVE_UP_BTN`}
                </button>
              </div>
            </div>
          </div>

          <Contact />
        </div>
      </div>
    );
  }
}
PaymentStatus.contextType = LoadingContext;
PaymentStatus.propTypes = {
  language: PropTypes.string,
  orgSlug: PropTypes.string,
  userData: PropTypes.object.isRequired,
  setUserData: PropTypes.func.isRequired,
  isAuthenticated: PropTypes.bool,
  authenticate: PropTypes.func.isRequired,
  page: PropTypes.object,
  logout: PropTypes.func.isRequired,
  cookies: PropTypes.instanceOf(Cookies).isRequired,
  settings: PropTypes.shape({
    payment_requires_internet: PropTypes.bool,
    payment_methods: PropTypes.array,
  }).isRequired,
  params: PropTypes.shape({
    status: PropTypes.string,
  }).isRequired,
  navigate: PropTypes.func.isRequired,
};
