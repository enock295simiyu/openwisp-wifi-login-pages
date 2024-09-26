/* eslint-disable camelcase */
import "./index.css";

import axios from "axios";
import PropTypes from "prop-types";
import qs from "qs";
import React, {Suspense} from "react";
import {Cookies} from "react-cookie";
import {Link, Route, Routes} from "react-router-dom";
import {toast} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {gettext, t} from "ttag";
import "react-phone-input-2/lib/style.css";
import ReactLoading from "react-loading";
import LoadingContext from "../../utils/loading-context";
import {buyPlanUrl, currentPlanApiUrl, plansApiUrl} from "../../constants";
import getErrorText from "../../utils/get-error-text";
import logError from "../../utils/log-error";
import handleChange from "../../utils/handle-change";
import submitOnEnter from "../../utils/submit-on-enter";
import Contact from "../contact-box";
import getError from "../../utils/get-error";
import getLanguageHeaders from "../../utils/get-language-headers";
import {getPaymentStatus} from "../../utils/get-payment-status";
import Modal from "../modal";

const PhoneInput = React.lazy(() =>
  import(/* webpackChunkName: 'PhoneInput' */ "react-phone-input-2"),
);

class MobileMoneyPaymentProcess extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      phone_number: "",
      email: "",
      first_name: "",
      last_name: "",
      location: "",
      order: "",
      errors: {},
      payment_id: "",
      payment_status: null,
      activeTab: 1,
      passedSteps: [1],
      modifiedSteps: [1],
      plans: [],
      plansFetched: false,
      selectedPlan: {},
      modalActive: false,
      tax_number: "",
      street: "",
      city: "",
      zipcode: "",
      country: "",
      countrySelected: {},
    };
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.changePlan = this.changePlan.bind(this);
  }

  async componentDidMount() {
    const {setLoading} = this.context;
    const {cookies, orgSlug, setUserData, logout, setTitle, orgName, language, settings} =
      this.props;
    setLoading(true);

    const {userData} = this.props;


    setLoading(false);
    const plansUrl = plansApiUrl.replace("{orgSlug}", orgSlug);

    setTitle("Buy internet plans", orgName);

    const {phone_number} = userData;

    if (settings.subscriptions) {
      setLoading(true);
      axios({
        method: "get",
        headers: {
          "content-type": "application/x-www-form-urlencoded",
          "accept-language": getLanguageHeaders(language),
        },
        url: plansUrl,
      })
        .then((response) => {
          this.setState({plans: response.data, plansFetched: true, phone_number});

          setLoading(false);
        })
        .catch((error) => {
          toast.error(t`ERR_OCCUR`);
          logError(error, "Error while fetching plans");
        });
    }
    this.getCurrentUserPlan();
    this.autoSelectFirstPlan();
  }

  async getCurrentUserPlan() {
    const {setLoading} = this.context;
    const {cookies, orgSlug, setUserData, logout, setTitle, orgName, language, settings, userData} =
      this.props;
    const currentPlanUrl = currentPlanApiUrl(orgSlug);
    setLoading(true);
    axios({
      method: "get",
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        "accept-language": getLanguageHeaders(language),
        Authorization: `Bearer ${userData.auth_token}`,
      },
      url: currentPlanUrl,
    })
      .then((response) => {

        setUserData({
          ...userData,
          userplan: response.data,
        });
        if (response.data.active_order) {
          this.setState({
            payment_id: response.data.active_order.payment_id,
          });
          if (response.data.active_order.payment_status === "waiting") {
            this.intervalId = setInterval(this.getPaymentStatus, 6000);
          }


        }

        setLoading(false);
      })
      .catch((error) => {
        toast.error(t`ERR_OCCUR`);
        logError(error, "Error while getting current user plan");
      });
  }

  async componentDidUpdate(prevProps) {
    const {plans} = this.state;
    const {settings, loading} = this.props;
    const {setLoading} = this.context;
    if (
      settings.subscriptions &&
      plans.length === 0 &&
      loading === false &&
      prevProps.loading === true
    ) {
      setLoading(true);
    }

  }

  toggleModal = () => {
    const {modalActive} = this.state;
    this.setState({modalActive: !modalActive});
  };

  componentWillUnmount = () => {
    clearInterval(this.intervalId);
    window.removeEventListener("resize", this.updateScreenWidth);
  };

  getPaymentStatus = async () => {
    const {userData, orgSlug, setUserData, navigate} = this.props;
    const {setLoading} = this.context;
    const {payment_id, payment_status} = this.state;
    const {userplan} = userData;

    if (!payment_id) {
      return;
    }
    if (payment_status && payment_status === "success") {
      return;
    }


    const paymentStatus = await getPaymentStatus(orgSlug, payment_id, userData.auth_token);

    this.setState({
      "payment_status": paymentStatus,
    });
    switch (paymentStatus) {
      case "waiting":
        return;
      case "success":
        await this.getCurrentUserPlan();
        setUserData({
          ...userData,
          is_verified: true,
          payment_url: null,
          repeatLogin: true,
          mustLogin: true,
          mustLogout: true,
        });
        toast.success("Payment was successfully");
        this.setState({payment_id: null});
        clearInterval(this.intervalId);
        return navigate(`/${orgSlug}/payment/${paymentStatus}`);
      case "failed":
        setUserData({...userData, payment_url: null});
        this.setState({payment_id: null});
        toast.info("The payment failed");
        clearInterval(this.intervalId);
        return navigate(`/${orgSlug}/payment/${paymentStatus}`);
      default:
        // Request failed
        toast.error(t`ERR_OCCUR`);
        setUserData({...userData, payment_url: null});
        this.setState({payment_id: null});
        clearInterval(this.intervalId);
        return navigate(`/${orgSlug}/payment/failed`);
    }
    // navigate(redirectUrl);
  };

  getPlan = (plan, index) => {
    /* disable ttag */
    const planTitle = gettext(plan.plan);
    const planDesc = gettext(plan.plan_description);
    /* enable ttag */
    const pricingText = Number(plan.price)
      ? `${plan.price} ${plan.currency} ${plan.pricing}`
      : "";
    return (
      <label htmlFor={`radio${index}`}>
        <span className="title">{planTitle}</span>
        <span className="desc">{planDesc}</span>
        {pricingText && <span className="price">{pricingText}</span>}
      </label>
    );
  };

  changePlan = (event) => {

    this.setState({selectedPlan: event.target.value});
  };

  getPlanSelection = () => {
    const {mobile_money_payment_form} = this.props;
    const {plans, selectedPlan} = this.state;
    const {auto_select_first_plan} = mobile_money_payment_form;
    let index = 0;
    return (
      <div className={`plans ${auto_select_first_plan ? "hidden" : ""}`}>
        <p className="intro">{t`PLAN_SETTING_TXT`}.</p>
        {plans.map((plan) => {
          const currentIndex = String(index);
          let planClass = "plan";
          if (selectedPlan === currentIndex) {
            planClass += " active";
          } else if (selectedPlan !== null && selectedPlan !== currentIndex) {
            planClass += " inactive";
          }
          index += 1;
          return (
            <div key={currentIndex} className={planClass}>
              <input
                id={`radio${currentIndex}`}
                type="radio"
                value={currentIndex}
                name="plan_selection"
                onChange={this.changePlan}
                onFocus={this.changePlan}
                tabIndex={currentIndex}
              />
              {this.getPlan(plan, currentIndex)}
            </div>
          );
        })}
      </div>
    );
  };

  autoSelectFirstPlan = () => {
    const {mobile_money_payment_form} = this.props;
    if (mobile_money_payment_form.auto_select_first_plan) {
      this.changePlan({target: {value: 0}});
    }
  };

  isPlanIdentityVerifier = () => {
    // If a payment is required, the plan is valid for identity verification
    const {selectedPlan, plans} = this.state;

    return (
      selectedPlan !== null && plans[selectedPlan].requires_payment === true
    );
  };

  doesPlanRequireInvoice = () => {
    const {settings} = this.props;
    const {selectedPlan, plans} = this.state;
    return (
      settings.subscriptions &&
      selectedPlan !== null &&
      plans[selectedPlan].requires_invoice === true
    );
  };

  getForm = () => {
    const {mobile_money_payment_form, settings, orgSlug} = this.props;
    const {additional_info_text, input_fields, links} = mobile_money_payment_form;
    const {
      success,
      errors,
      selectedPlan,
      plans,
      tax_number,
      street,
      city,
      zipcode,
      countrySelected,
      hidePassword,
    } = this.state;

    const {userData} = this.props;

    const {phone_number} = userData;

    return (
      <>
        <div className="container content" id="registration">
          <div className="inner">
            <form
              className={`main-column ${success ? "success" : ""}`}
              onSubmit={this.handleSubmit}
              id="registration-form"
            >
              <div className="inner">
                <div className="fieldset">
                  {getError(errors)}
                  {plans.length > 0 && this.getPlanSelection()}
                  {(plans.length === 0 ||
                    (plans.length > 0 && selectedPlan !== null)) && (
                    <>
                      {
                        settings.mobile_phone_verification &&
                        input_fields.phone_number && (
                          <div className="row phone-number">
                            <label htmlFor="phone-number">{t`PHONE_LBL`}</label>
                            {getError(errors, "phone_number")}
                            <Suspense
                              fallback={
                                <input
                                  type="tel"
                                  className="input"
                                  name="phone_number"
                                  value={phone_number}
                                  onChange={(value) =>
                                    this.handleChange({
                                      target: {
                                        name: "phone_number",
                                        value: `+${value}`,
                                      },
                                    })
                                  }
                                  onKeyDown={(event) => {
                                    submitOnEnter(
                                      event,
                                      this,
                                      "registration-form",
                                    );
                                  }}
                                  placeholder={t`PHONE_PHOLD`}
                                />
                              }
                            >
                              <PhoneInput
                                name="phone_number"
                                country={input_fields.phone_number.country}
                                onlyCountries={
                                  input_fields.phone_number.only_countries || []
                                }
                                preferredCountries={
                                  input_fields.phone_number
                                    .preferred_countries || []
                                }
                                excludeCountries={
                                  input_fields.phone_number.exclude_countries ||
                                  []
                                }
                                value={phone_number}
                                onChange={(value) =>
                                  this.handleChange({
                                    target: {
                                      name: "phone_number",
                                      value: `+${value}`,
                                    },
                                  })
                                }
                                onKeyDown={(event) => {
                                  submitOnEnter(
                                    event,
                                    this,
                                    "registration-form",
                                  );
                                }}
                                placeholder={t`PHONE_PHOLD`}
                                enableSearch={Boolean(
                                  input_fields.phone_number.enable_search,
                                )}
                                inputProps={{
                                  name: "phone_number",
                                  id: "phone-number",
                                  className: `form-control input ${
                                    errors.phone_number ? "error" : ""
                                  }`,
                                  required: true,
                                  autoComplete: "tel",
                                }}
                              />
                            </Suspense>
                          </div>
                        )}

                    </>
                  )}
                </div>

                {(plans.length === 0 ||
                    (plans.length > 0 && selectedPlan !== null)) &&
                  additional_info_text && (
                    <div className="row add-info">
                      <h5>Buy internet plans</h5>
                    </div>
                  )}

                <div className="row register">
                  {(plans.length === 0 ||
                    (plans.length > 0 && selectedPlan !== null)) && (
                    <input
                      type="submit"
                      className="button full"
                      value="Buy Plan"
                    />
                  )}
                </div>

                {links && (
                  <div className="row links">
                    {links.forget_password && (
                      <p>
                        <Link
                          to={`/${orgSlug}/password/reset`}
                          className="link"
                        >
                          {t`FORGOT_PASSWORD`}
                        </Link>
                      </p>
                    )}
                    {links.login && (
                      <p>
                        <Link to={`/${orgSlug}/login`} className="link">
                          {t`LINKS_LOGIN_TXT`}
                        </Link>
                      </p>
                    )}
                  </div>
                )}
              </div>
            </form>

            <Contact />
          </div>
        </div>
        <Routes>
          <Route
            path=":name"
            element={<Modal prevPath={`/${orgSlug}/registration`} />}
          />
        </Routes>
      </>
    );
  };


  handleSubmit(event) {
    event.preventDefault();
    const {setLoading} = this.context;
    const {orgSlug, setUserData, userData, language, navigate} = this.props;
    const {method} = userData;
    const {phone_number, errors, plans, selectedPlan} = this.state;
    const url = buyPlanUrl(orgSlug);


    const data = {
      "phone_number": phone_number,
      "method": method,
    };

    if (method === "" || method === undefined || method === null) {
      data.method = "mpesa";
    }

    let plan_pricing;
    if (selectedPlan !== null) {
      plan_pricing = plans[selectedPlan];
      data.plan_pricing = plan_pricing.id;
      data.requires_payment = plan_pricing.requires_payment;
    }


    this.setState({errors: {...errors, phone_number: ""}});
    setLoading(true);
    return axios({
      method: "post",
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        "accept-language": getLanguageHeaders(language),
        Authorization: `Bearer ${userData.auth_token}`,
      },
      url,
      data: qs.stringify(data),
    })
      .then(async (response) => {
        this.setState({
          errors: {},
        });

        // setUserData({...userData,phone_number,status: response.status,payment_id:response.data.payment.id,payment_status:response.data.payment.status});
        setUserData({...userData, phone_number, payment_id: response.data.payment.id});
        this.setState({
          payment_id: response.data.payment.id,
          payment_status: response.data.payment.status,
        });
        this.intervalId = setInterval(this.getPaymentStatus, 6000);
        setLoading(false);
        this.toggleTab(3);
        toast.info(response.data.payment.message);

        // navigate(`/${orgSlug}/mobile-phone-verification`);
      })
      .catch((error) => {
        const {data} = error.response;
        const errorText = getErrorText(error);
        if (errorText) {
          logError(error, errorText);
          toast.error(errorText);
        }
        setLoading(false);
        this.setState({
          errors: {
            ...errors,
            ...(data.phone_number ? {phone_number: data.phone_number} : null),
            ...(errorText ? {nonField: errorText} : {nonField: ""}),
          },
        });
      });
  }

  handleChange(event) {
    handleChange(event, this);
  }

  toggleTab(tab) {
    const {activeTab, passedSteps} = this.state;

    if (activeTab !== tab) {
      const modifiedSteps = [...passedSteps, tab];

      if (tab >= 1 && tab <= 4) {
        this.setState({activeTab: tab, passedSteps: modifiedSteps});


      }
    }
  }

  renderWaitingPayment() {
    return (
      <>
        <div className="container content" id="registration">

          <div className="inner payment-content">
            <div className="row full">
              <ReactLoading type="cylon" color="black" height="20%" width="20%"
                            className="processing-payment-loader" />
              <h4>Processing Payment .....</h4>
              <p>Your mpesa payment is being processed. You should get an stk push on your phone number. Please enter
                your mpesa pin and click confirm</p>


              <div className="row cancel">
                <Link className="button full" to="/">
                  {t`CANCEL`}
                </Link>
              </div>
            </div>

            <Contact />
          </div>
        </div>

      </>
    );
  }

  handBuyPlanAgain() {
    const {navigate, orgSlug} = this.props;
    this.setState({payment_status: null});
    navigate(`/${orgSlug}/payment/mobile-money/process`);

  }

  renderCheckPaymentStatus() {
    const {orgSlug} = this.props;
    return (
      <>
        <div className="container content" id="registration">

          <div className="inner payment-content">
            <div className="row full">
              <ReactLoading type="cylon" color="black" height="20%" width="20%"
                            className="processing-payment-loader" />
              <h4>Verifying Payment .....</h4>
              <p>Your mpesa payment is being verified. Your payment is being confirmed. Please wait....</p>

              <div className="row register">
                <button
                  onClick={this.handBuyPlanAgain}

                  className="button full"
                >Payment Again
                </button>
              </div>
              <div className="row cancel">
                <Link className="button full" to="/">
                  {t`CANCEL`}
                </Link>
              </div>
            </div>

            <Contact />
          </div>
        </div>

      </>
    );
  }


  renderWaitingForPayment() {
    const {userData, orgSlug} = this.props;
    const {phone_number, order} = userData;
    const {userplan} = userData;


    return (

      <div className="text-center py-5">

        <div className="mb-4">
          <lord-icon src="https://cdn.lordicon.com/lupuorrc.json" trigger="loop"
                     colors="primary:#25a0e2,secondary:#00bd9d"
                     style={{width: "120px", height: "120px"}} />
        </div>
        <h5>You payment is being processed</h5>
        <p className="text-muted">You will receive an notification on {phone_number} to pay your internet
          plan. You will automatically have internet access once payment is successful.</p>

        <h3 className="fw-semibold">Order
          ID: {(userplan && userplan.active_order ? userplan.active_order.id : "N/A")}<a
            className="text-decoration-underline" /></h3>
        <div className="row cancel">
          <Link className="button full" to="/">
            {t`CANCEL`}
          </Link>
        </div>
      </div>

    );
  }


  render() {

    const {orgSlug, isAuthenticated, userData, settings, navigate} = this.props;

    const {plansFetched, modalActive, errors, payment_status} = this.state;
    const redirectToStatus = () => navigate(`/${orgSlug}/status`);
    const {auth_token} = userData;

    if (settings.subscriptions && !plansFetched) {
      return null;
    }


    if (payment_status === "pending") {
      return this.renderWaitingPayment();
    }

    if (payment_status === "waiting") {
      return this.renderCheckPaymentStatus();
    }



    // likely somebody opening this page by mistake
    if (isAuthenticated === false) {
      redirectToStatus();
    }

    if (!auth_token) {
      redirectToStatus();
    }

    return (

      <>
        {this.getForm()}</>
    );
  }
}

export default MobileMoneyPaymentProcess;
MobileMoneyPaymentProcess.contextType = LoadingContext;
MobileMoneyPaymentProcess.propTypes = {
  mobile_money_payment_form: PropTypes.shape({
    input_fields: PropTypes.shape({
      phone_number: PropTypes.shape({
        country: PropTypes.string,
        only_countries: PropTypes.array,
        preferred_countries: PropTypes.array,
        exclude_countries: PropTypes.array,
        enable_search: PropTypes.bool,
      }),
      first_name: PropTypes.shape({
        setting: PropTypes.string.isRequired,
      }),
      last_name: PropTypes.shape({
        setting: PropTypes.string.isRequired,
      }),
      location: PropTypes.shape({
        setting: PropTypes.string.isRequired,
        pattern: PropTypes.string.isRequired,
      }),
      birth_date: PropTypes.shape({
        setting: PropTypes.string.isRequired,
      }),
      country: PropTypes.shape({
        pattern: PropTypes.string,
      }),
      zipcode: PropTypes.shape({}),
      city: PropTypes.shape({}),
      street: PropTypes.shape({}),
      tax_number: PropTypes.shape({
        pattern: PropTypes.string.isRequired,
      }).isRequired,
    }).isRequired,
    buttons: PropTypes.shape({
      change_phone_number: PropTypes.bool,
      cancel: PropTypes.bool,
    }).isRequired,
    additional_info_text: PropTypes.bool,
    links: PropTypes.object,
    auto_select_first_plan: PropTypes.bool,
  }).isRequired,
  settings: PropTypes.shape({
    mobile_phone_verification: PropTypes.bool,
  }).isRequired,
  orgSlug: PropTypes.string.isRequired,
  orgName: PropTypes.string.isRequired,
  cookies: PropTypes.instanceOf(Cookies).isRequired,
  isAuthenticated: PropTypes.bool.isRequired,
  logout: PropTypes.func.isRequired,
  userData: PropTypes.object.isRequired,
  setUserData: PropTypes.func.isRequired,
  setTitle: PropTypes.func.isRequired,
  language: PropTypes.string.isRequired,
  navigate: PropTypes.func.isRequired,
};
