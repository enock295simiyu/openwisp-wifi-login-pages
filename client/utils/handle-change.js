export const normalizePhone = (phone) => {
  let currentV = phone.startsWith("+") ? `${phone}` : `+${phone}`;
  if (!phone) return "";


  // Match country code (3 digits), then check if number starts with 0
  currentV = currentV.replace(/(\+\d{1,3})0/, "$1");
  return currentV.replace("+", "");
};
const handleChange = (event, instance) => {
  const {name} = event.target;
  if (name === "email") {
    const emailValue = event.target.value;
    const username = emailValue.substring(0, emailValue.indexOf("@"));
    instance.setState({
      email: emailValue,
      username,
    });
  } else if (name === "phone_number") {
    const phoneNumberValue = event.target.value;
    const phoneNumber = normalizePhone(phoneNumberValue);
    instance.setState({
      phone_number: phoneNumber,
    });
  } else {
    instance.setState({
      [event.target.name]: event.target.value,
    });
  }
  // clean errors
  const {errors} = instance.state;
  if (errors[event.target.name]) {
    delete errors[event.target.name];
  }
  if (errors.nonField) {
    delete errors.nonField;
  }
};

export default handleChange;
