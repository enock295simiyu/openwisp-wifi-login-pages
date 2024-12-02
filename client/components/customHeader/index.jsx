import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";

const CustomHeader = ({ orgSlug }) => {
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
    
    <div style={{ display: "flex", justifyContent: "center", padding: "20px" }}>
      <div
        style={{
          backgroundColor: "transparent", // Semi-transparent dark background
          backdropFilter: "blur(8px)", // Enhanced glassmorphism effect
          WebkitBackdropFilter: "blur(8px)", // Safari support
          border: "1px solid rgba(255, 255, 255, 0.3)", // Subtle border
          borderRadius: "16px", // Rounded corners
          padding: "20px", // Increased padding for better content spacing
          width: widthStyle, // Dynamic width
          boxShadow: "0px 8px 20px rgba(0, 0, 0, 0.3)", // Stronger shadow for elevation
          color: "white", // White text for contrast
          transition: "width 0.3s ease-in-out", // Smooth width transition
          fontFamily: "Arial, sans-serif", // Clean font style
        }}
      >
        <h2
          style={{
            textAlign: "center",
            fontSize: "1.8em",
            marginBottom: "15px",
            color: "#27ae60", // Highlighted heading color
          }}
        >
          
        
          {orgSlug}
        </h2>
      </div>
      </div>
    
  );
};

// Prop validation using prop-types
CustomHeader.propTypes = {
  orgSlug: PropTypes.string.isRequired, // orgSlug must be a string and is required
};

export default CustomHeader;
