import React from "react";
import PropTypes from "prop-types";

const PlanContainer = ({ data, state, changePlan,toggleBillingForm }) => {
  const { mobile_money_payment_form } = data;
  const { plans, selectedPlan, order_stage } = state;
  const { auto_select_first_plan } = mobile_money_payment_form;


  const handleClick=(currentIndex)=>{
    changePlan(currentIndex);
    toggleBillingForm();

  }
  return (
    <div className="plans-container">
      <h3
        style={{
          textAlign: "center",
          fontSize: "1.8em",
          marginBottom: "15px",
          color: "#27ae60",
        }}
      >
        Choose an Internet Plan
      </h3>
      <div className="plans-grid">
        {plans.map((plan, index) => {
          const currentIndex = String(index);
          const isActive = selectedPlan === currentIndex;

          return (
            <div
              key={currentIndex}
              className={`plan-box ${isActive ? "active" : ""}`}
              onClick={() =>handleClick(currentIndex)}
            >
              <h4 className="plan-name">{plan.plan}</h4>
              <h4 className="plan-name">{plan.pricing}</h4>
              <p className="plan-price">
                {plan.currency} {plan.price}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// PropTypes validation
PlanContainer.propTypes = {
  data: PropTypes.shape({
    mobile_money_payment_form: PropTypes.shape({
      auto_select_first_plan: PropTypes.bool.isRequired,
    }).isRequired,
  }).isRequired,
  state: PropTypes.shape({
    plans: PropTypes.arrayOf(
      PropTypes.shape({
        plan: PropTypes.string.isRequired,
        currency: PropTypes.string.isRequired,
        price: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
          .isRequired,
      })
    ).isRequired,
    selectedPlan: PropTypes.string,
    order_stage: PropTypes.number.isRequired,
  }).isRequired,
  changePlan: PropTypes.func.isRequired,
  resetPlan: PropTypes.func.isRequired, // New function to reset the selected plan
};

export default PlanContainer;
