import React from "react";


class RegistrationForm extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        success: false,
        errors: {},
        selectedPlan: null,
        plans: [],
        phone_number: '',
        showBillingForm: false, // State to manage modal visibility
      };
    }
  
    // Toggle BillingForm dialog
    toggleBillingForm = () => {
      this.setState(prevState => ({
        showBillingForm: !prevState.showBillingForm,
      }));
    };
  
    // Reset the selected plan
    resetPlan = () => {
      this.setState({
        selectedPlan: null,
        showBillingForm: false, // Close the BillingForm dialog
      });
    };
  
    render() {
      const { mobile_money_payment_form, settings, orgSlug, isAuthenticated } = this.props;
      const { additional_info_text, input_fields, links } = mobile_money_payment_form;
      const { success, errors, selectedPlan, plans, showBillingForm } = this.state;
  
      return (
        <>
          <div className="container content" id="registration">
            <form
              className={`main-column ${success ? "success" : ""}`}
              onSubmit={this.handleSubmit}
              id="registration-form"
              style={{
                width: "100%",
                backgroundColor: "transparent",
              }}
            >
              <div className="fieldset">
                {getError(errors)} {/* Display any form errors */}
  
                {/* Display PlanContainer */}
                {plans.length > 0 && (
                  <PlanContainer
                    data={this.props}
                    state={this.state}
                    changePlan={this.changePlan}
                    toggleBillingForm={this.toggleBillingForm} // Pass toggleBillingForm to PlanContainer
                  />
                )}
  
                {/* Display the BillingForm dialog if a plan is selected */}
                {selectedPlan && (
                  <button type="button" onClick={this.toggleBillingForm}>
                    Add Billing Information
                  </button>
                )}
              </div>
  
              {(plans.length === 0 || (plans.length > 0 && selectedPlan !== null)) && additional_info_text && (
                <div className="row add-info">
                  <h5>{additional_info_text}</h5>
                </div>
              )}
  
              {links && !isAuthenticated && (
                <div className="row links">
                  {links.forget_password && (
                    <p>
                      <Link to={`/${orgSlug}/password/reset`} className="link">
                        {t`FORGOT_PASSWORD`}
                      </Link>
                    </p>
                  )}
                </div>
              )}
            </form>
          </div>
  
          {/* Modal for BillingForm */}
          {showBillingForm && (
            <div className="modal-overlay">
              <div className="modal-content">
                <BillingForm
                  data={this.props}
                  state={this.state}
                  handleChange={this.handleChange}
                  resetPlan={this.resetPlan} // Pass resetPlan to allow canceling
                />
                <button className="close-modal" onClick={this.toggleBillingForm}>
                  Close
                </button>
              </div>
            </div>
          )}
  
          <Routes>
            <Route
              path=":name"
              element={<Modal prevPath={`/${orgSlug}/registration`} />}
            />
          </Routes>
        </>
      );
    }
  }
  