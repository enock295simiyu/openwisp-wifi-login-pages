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
    setTimeout(() => {
      window.location.replace(successRedirectUrl(orgSlug));
    }, 3000);
  }

  handleChange(event) {
    handleChange(event, this);
  }

  render() {
    const {orgSlug} = this.props;

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
  userData: PropTypes.object.isRequired,
  setUserData: PropTypes.func.isRequired,
  setTitle: PropTypes.func.isRequired,
  language: PropTypes.string.isRequired,
  navigate: PropTypes.func.isRequired,
};
