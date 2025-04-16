import React, {useState} from "react";
import "./styles.css";
// import Header from "./Header";
import FAQ from "./FAQ";
import Header from "./Header";

const FaqSection = ({faqQuestions}) => {
  const [faqs, setFaqs] = useState(faqQuestions);
  const toggleFAQ = index => {
    setFaqs(
      faqs.map((faq, i) => {
        if (i === index) {
          faq.open = !faq.open;
        } else {
          faq.open = false;
        }

        return faq;
      }),
    );
  };
  return (
    <div className="App">
      <Header />
      <div className="faqs">
        {faqs.map((faq, index) => (
          <FAQ faq={faq} index={index} key={index} toggleFAQ={toggleFAQ} />
        ))}
      </div>
    </div>
  );
};

export default FaqSection;
