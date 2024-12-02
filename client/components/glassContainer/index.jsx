import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";

const GlassmorphicContainer = ({ children, text }) => {
  // Initialize the state to track the window width
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Use effect to add and remove the resize event listener
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);

    // Clean up the event listener on unmount
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Set width based on the screen size
  const widthStyle =
    windowWidth <= 480
      ? "100%" // Full width on small screens (mobile)
      : windowWidth <= 768
      ? "60%" // Wider on medium screens (tablets)
      : "40%"; // Compact width on larger screens (desktop)

  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "10px" }}>
        
      <div
        style={{
         background:"transparent",
          WebkitBackdropFilter: "blur(8px)", // Safari support
          border: "1px solid rgba(255, 255, 255, 0.3)", // Subtle border
          borderRadius: "16px", // Rounded corners
          padding: "10px", // Increased padding for better content spacing
          width: widthStyle, // Dynamic width
          boxShadow: "0px 8px 20px rgba(0, 0, 0, 0.3)", // Stronger shadow for elevation
          transition: "width 0.3s ease-in-out", // Smooth width transition
          fontFamily: "Arial, sans-serif", // Clean font style
        }}
      >
        {
            text&&(
                <h2
                style={{
                  textAlign: "center",
                  fontSize: "1em",
                  color: "#27ae60", // Highlighted heading color
                }}
              >{text}</h2>
            )
        }
       
        {children}
      </div>
    </div>
  );
};

GlassmorphicContainer.propTypes = {
  children: PropTypes.node.isRequired,
};

export default GlassmorphicContainer;
