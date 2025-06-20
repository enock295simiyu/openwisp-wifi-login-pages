/* eslint-disable camelcase */
import "./index.css";

import axios from "axios";
import PropTypes from "prop-types";
import qs from "qs";
import React, {Suspense} from "react";
import {Cookies} from "react-cookie";
import {toast} from "react-toastify";
import {t} from "ttag";
import "react-toastify/dist/ReactToastify.css";
import {Link} from "react-router-dom";
import LoadingContext from "../../utils/loading-context";

import {mobilePhoneTokenStatusUrl, redeemVoucherCodeUrl} from "../../constants";
import getErrorText from "../../utils/get-error-text";
import logError from "../../utils/log-error";
import handleChange from "../../utils/handle-change";
import Contact from "../contact-box";

import getError from "../../utils/get-error";
import getLanguageHeaders from "../../utils/get-language-headers";
import {sessionStorage} from "../../utils/storage";
import getText from "../../utils/get-text";

const PhoneInput = React.lazy(() =>
  import(/* webpackChunkName: 'PhoneInput' */ "react-phone-input-2"),
);

export default class VoucherCode extends React.Component {
  phoneTokenSentKey = "owPhoneTokenSent";

  constructor(props) {
    super(props);
    this.state = {
      voucher: "",
      phone_number: "",
      errors: {},
      success: false,
      show_username_field: false,
      show_voucher_field: true,
    };
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.resendPhoneToken = this.resendPhoneToken.bind(this);
  }

  async componentDidMount() {
    const {
      orgName,
      setTitle,
    } = this.props;
    setTitle(t`PAYMENT_VERIFY_TITL`, orgName);
  }

  handleChange(event) {
    handleChange(event, this);
  }

  handleSubmit(event) {
    const {setLoading} = this.context;
    setLoading(true);
    event.preventDefault();
    const {orgSlug, navigate, userData, language} = this.props;
    const {voucher, phone_number, errors} = this.state;
    this.setState({errors: {...errors, code: ""}});
    const url = redeemVoucherCodeUrl(orgSlug);

    const {auth_token} = userData;

    const requestHeaders = {
      "content-type": "application/x-www-form-urlencoded",
      "accept-language": getLanguageHeaders(language),
      Authorization: `Bearer ${auth_token}`,
    };


    if (userData.auth_token === undefined) {
      delete requestHeaders.Authorization;
    }


    return axios({
      method: "post",
      withCredentials: true,
      headers: requestHeaders,
      url,
      data: qs.stringify({
        voucher,
        phone_number,
      }),

    })
      .then((response) => {
        this.setState({
          errors: {},
        });
        setLoading(false);
        toast.success("Voucher Code Redeemed successfully");
        if (
          !userData.auth_token || !userData.radius_user_token
        ) {
          this.handleLoginUserAfterOrderSuccess(response.data.username, response.data.key);
        }
        navigate(`/${orgSlug}/status`);
      })
      .catch((error) => {
        const {data} = error.response;
        const errorText = getErrorText(error, "Please Fix the errors below");
        logError(error, errorText);
        toast.error(errorText);
        setLoading(false);
        this.setState({
          errors: {
            ...errors,
            ...(data.code ? {code: data.code} : null),
            ...(errorText ? {nonField: errorText} : {nonField: ""}),
            ...(data.account ? {phone_number: data.account} : null),
            ...(data.voucher ? {voucher: data.voucher} : null),
            ...(data.code === "anonymous_user" ? {username: "This is required"} : null),
          },
          ...(data.code === "anonymous_user" ? {show_username_field: true} : null),
        });
        console.log(this.state);
      });
  }


  getUsernameField = (input_fields) => {
    const {settings} = this.props;
    let usePhoneNumberField;
    if (typeof input_fields.username.auto_switch_phone_input !== "undefined") {
      usePhoneNumberField = Boolean(
        input_fields.username.auto_switch_phone_input,
      );
    } else {
      usePhoneNumberField = settings.mobile_phone_verification;
    }

    if (usePhoneNumberField) {
      return this.getPhoneNumberField(input_fields);
    }
    return this.getTextField(input_fields);
  };

  getTextField = (input_fields) => {
    const {username, errors} = this.state;
    const {language} = this.props;
    const usernameLabel =
      input_fields.username.type === "email" ? t`EMAIL` : t`USERNAME_LOG_LBL`;
    const label = input_fields.username.label
      ? getText(input_fields.username.label, language)
      : usernameLabel;
    const placeholder = input_fields.username.placeholder
      ? getText(input_fields.username.placeholder, language)
      : t`USERNAME_LOG_PHOLD`;
    const patternDesc = input_fields.username.pattern_description
      ? getText(input_fields.username.pattern_description, language)
      : t`USERNAME_LOG_TITL`;
    return (
      <div className="row username">
        <label htmlFor="username">{label}</label>
        {getError(errors, "username")}
        <input
          className={`input ${errors.username ? "error" : ""}`}
          type={input_fields.username.type}
          id="username"
          name="username"
          value={username}
          onChange={this.handleChange}
          required
          placeholder={placeholder}
          pattern={input_fields.username.pattern}
          autoComplete="username"
          title={patternDesc}
        />
      </div>
    );
  };

  getPhoneNumberField = (input_fields) => {
    const {username, errors} = this.state;
    return (
      <div className="row phone-number">
        <label htmlFor="phone-number">{t`PHONE_LBL`}</label>
        {getError(errors, "username")}
        <Suspense
          fallback={
            <input
              type="tel"
              name="username"
              className="form-control input"
              value={username}
              id="username"
              onChange={(value) =>
                this.handleChange({
                  target: {name: "username", value: `+${value}`},
                })
              }
              placeholder={t`PHONE_PHOLD`}
            />
          }
        >
          <PhoneInput
            name="username"
            country={input_fields.phone_number.country}
            onlyCountries={input_fields.phone_number.only_countries || []}
            preferredCountries={
              input_fields.phone_number.preferred_countries || []
            }
            excludeCountries={input_fields.phone_number.exclude_countries || []}
            value={username}
            onChange={(value) =>
              this.handleChange({
                target: {name: "username", value: `+${value}`},
              })
            }
            placeholder={t`PHONE_PHOLD`}
            enableSearch={Boolean(input_fields.phone_number.enable_search)}
            inputProps={{
              name: "username",
              id: "username",
              className: `form-control input ${errors.username ? "error" : ""}`,
              required: true,
              autoComplete: "tel",
            }}
          />
        </Suspense>
      </div>
    );
  };


  handleLoginUserAfterOrderSuccess(username, auth_token) {
    const {cookies, orgSlug, setUserData, userData, authenticate} =
      this.props;

    cookies.set(`${orgSlug}_auth_token`, auth_token, {path: "/"});
    cookies.set(`${orgSlug}_username`, username, {path: "/"});
    setUserData({
      ...userData,
      username,
      auth_token,
      is_verified: false,
      method: "mpesa",
      is_active: true,

    });
    authenticate(true);

  }

  hasPhoneTokenBeenSent() {
    return sessionStorage.getItem(this.phoneTokenSentKey) !== null;
  }

  async activePhoneToken() {
    const {orgSlug, language, userData} = this.props;
    const url = mobilePhoneTokenStatusUrl(orgSlug);
    return axios({
      method: "get",
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        "accept-language": getLanguageHeaders(language),
        Authorization: `Bearer ${userData.auth_token}`,
      },
      url,
    })
      .then((data) => data.active)
      .catch((error) => {
        if (
          error.response &&
          error.response.status === 404 &&
          error.response.data &&
          error.response.data.response_code !== "INVALID_ORGANIZATION"
        ) {
          // This is kept for backward compatibility with older versions of OpenWISP RADIUS
          // that does not have API endpoint for checking phone token status.
          return false;
        }
        const errorText = getErrorText(error);
        logError(error, errorText);
        toast.error(errorText);
        return errorText;
      });
  }

  async resendPhoneToken() {
    const {setLoading} = this.context;
    setLoading(true);
    await this.createPhoneToken(true);
    // reset error messages
    this.setState({
      errors: {},
    });
    setLoading(false);
  }

  render() {
    const {voucher, errors, success, phone_number, show_username_field, show_voucher_field} =
      this.state;

    const {
      orgSlug,
      voucher_code_form,
      userData,
    } = this.props;
    const {input_fields, links} = voucher_code_form;

    if (!phone_number && userData.phone_number) {
      this.setState({phone_number: userData.phone_number});
    }

    return (
      <div className="container content" id="mobile-phone-verification">

        <div className="inner">
          <div className="main-column">
            <h2 className="title">Redeem Voucher Code</h2>
            <span className="desc">You can extend you current account with a voucher code issued to you. Enter the voucher code below.</span>
            <div className="innerhh">
              <form
                className={`${success ? "success" : ""}`}
                onSubmit={this.handleSubmit}
              >
                {getError(errors)}
                {show_username_field === true && this.getUsernameField(input_fields)}


                <div className="row fieldset voucher">

                  <div className="row">
                    {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                    <label htmlFor="voucher">Voucher Code</label>
                    {getError(errors, "voucher")}
                    <input
                      className={`input ${
                        errors.voucher || errors.nonField ? "error" : ""
                      }`}
                      type="text"
                      id="voucher"
                      required
                      name="voucher"
                      value={voucher}
                      onChange={this.handleChange}
                      placeholder={"Enter Voucher Code"}
                      title={t`MOBILE_CODE_TITL`}
                    />
                  </div>

                  <button type="submit" className="button full">
                    {t`MOBILE_PHONE_VERIFY`}
                  </button>
                </div>
              </form>

              <div className="row fieldset change">
                <p className="label">{t`PHONE_CHANGE_LBL`} Buy new plan</p>
                <a
                  href={`/${orgSlug}/buy-plan`}
                  className="button full"
                >Buy Plan</a>
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
          </div>
          <Contact />
        </div>
      </div>
    );
  }
}
VoucherCode.contextType = LoadingContext;
VoucherCode.propTypes = {
  settings: PropTypes.shape({
    mobile_phone_verification: PropTypes.bool,
  }).isRequired,
  orgSlug: PropTypes.string.isRequired,
  orgName: PropTypes.string.isRequired,
  cookies: PropTypes.instanceOf(Cookies).isRequired,
  authenticate: PropTypes.func.isRequired,
  voucher_code_form: PropTypes.shape({
    links: PropTypes.object,
    input_fields: PropTypes.shape({
      username: PropTypes.shape({
        type: PropTypes.string.isRequired,
        pattern: PropTypes.string,
        label: PropTypes.object,
        placeholder: PropTypes.object,
      }).isRequired,
      voucher: PropTypes.shape({}),
      phone_number: PropTypes.shape({
        country: PropTypes.string,
        only_countries: PropTypes.array,
        preferred_countries: PropTypes.array,
        exclude_countries: PropTypes.array,
        enable_search: PropTypes.bool,
      }),
    }).isRequired,
  }).isRequired,
  userData: PropTypes.object.isRequired,
  setUserData: PropTypes.func.isRequired,
  setTitle: PropTypes.func.isRequired,
  language: PropTypes.string.isRequired,
  navigate: PropTypes.func.isRequired,
};
