import React, { useState, useEffect, Suspense } from "react";
import PropTypes from "prop-types";
import PhoneInput from "react-phone-input-2"; // Ensure this package is installed
import "react-phone-input-2/lib/style.css"; // Import PhoneInput styles
import getError from "../../utils/get-error";

// Styles
const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px",
    backgroundColor: "#f9f9f9",
    // minHeight: "100vh",
  },
  formContainer: {
    backgroundColor: "#fff",
    borderRadius: "8px",
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
    padding: "20px",
    transition: "width 0.3s ease-in-out",
  },
  heading: {
    fontSize: "24px",
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: "20px",
  },
  planName: {
    fontSize: "20px",
    fontWeight: "600",
    color: "#27ae60",
    textAlign: "center",
    marginBottom: "10px",
  },
  planPricing: {
    fontSize: "18px",
    color: "#555",
    textAlign: "center",
    marginBottom: "20px",
  },
  row: {
    marginBottom: "15px",
    display: "flex",
    flexDirection: "column",
  },
  label: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#444",
    marginBottom: "5px",
  },
  phoneInputContainer: {
    width: "100%",
  },
  phoneInput: {
    width: "100%",
    border: "1px solid #ccc",
    borderRadius: "4px",
    padding: "10px",
    fontSize: "16px",
  },
  submitButton: {
    backgroundColor: "#27ae60",
    color: "#fff",
    fontSize: "16px",
    padding: "10px 15px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    textAlign: "center",
    transition: "background-color 0.3s ease",
  },
  submitButtonHover: {
    backgroundColor: "#1e8e50",
  },
  error: {
    color: "#e74c3c",
    fontSize: "12px",
    marginTop: "5px",
  },
};


const BillingForm = ({
  data: {
    mobile_money_payment_form: { input_fields },
    userData: { phone_number },
  },
  state: { plans, selectedPlan, order_stage, errors, voucher_code },
  handleChange,
  onSubmit,
  resetPlan,
}) => {
  // State for tracking screen width
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Dynamic width based on screen size
  const widthStyle = windowWidth <= 480 ? "100%" : windowWidth <= 768 ? "60%" : "40%";

  // Get the currently selected plan
  const currentPlan = plans[selectedPlan] || {};

  // const getError = (field) => errors[field] && <span style={styles.error}>{errors[field]}</span>;

  return (
    <div style={styles.container}>
      <div style={{ ...styles.formContainer, width: widthStyle }}>
        <h3 style={styles.heading}>Complete Order</h3>
        <h4 style={styles.planName}>{currentPlan.plan}</h4>
        <h4 style={styles.planPricing}>
          {currentPlan.currency}: {currentPlan.price}
        </h4>

        <div style={styles.row}>
          <label htmlFor="phone-number" style={styles.label}>
            Phone Number
          </label>
          {getError("phone_number")}
          <Suspense fallback={<input type="tel" placeholder="Loading input..." />}>
          <PhoneInput
              name="phone_number"
              country="ke"
              onlyCountries={
               ["ke"]
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
                handleChange({
                  target: {
                    name: "phone_number",
                    value: `+${value}`,
                  },
                })
              }
              onKeyDown={(event) => {
                onSubmit(
                  event,
                  this,
                  "registration-form",
                );
              }}
              placeholder="Enter Phone Number"
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

        <div style={styles.row}>
          <button style={styles.submitButton} onClick={onSubmit}>
            Buy Plan
          </button>
        </div>
      </div>
    </div>
  );
};

BillingForm.propTypes = {
  data: PropTypes.shape({
    mobile_money_payment_form: PropTypes.shape({
      input_fields: PropTypes.object.isRequired,
    }).isRequired,
    userData: PropTypes.shape({
      phone_number: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  state: PropTypes.shape({
    plans: PropTypes.array.isRequired,
    selectedPlan: PropTypes.number,
    order_stage: PropTypes.number.isRequired,
    errors: PropTypes.object,
    voucher_code: PropTypes.string,
  }).isRequired,
  handleChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  resetPlan: PropTypes.func.isRequired, // New function to reset the selected plan
};

export default BillingForm;
