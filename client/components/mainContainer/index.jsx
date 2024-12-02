
import React, {Suspense} from "react";
import "./index.css";
import Login from "../login";
import Loader from "../../utils/loader";
import { BuyInternetPlan, PaymentCodeVerification } from "../organization-wrapper/lazy-import";
import CustomHeader from "../customHeader";
import HowToBuy from "../howToBuy";
import GlassmorphicContainer from "../glassContainer";

export default class MainContainer extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {data, orgSlug} = this.props;
    const {organization, params, cookies, location, navigate} = data;



    return (
      <div
        className="centered-row-container"
      >
        {/* Render Login or any children passed via props */}
        <CustomHeader orgSlug={orgSlug}/>
        <HowToBuy />
        <Suspense fallback={<Loader />}>
        <GlassmorphicContainer>
            <BuyInternetPlan cookies={cookies} navigate={navigate} />
         </GlassmorphicContainer>
        </Suspense>
        <Suspense fallback={<Loader />}>
        <GlassmorphicContainer text="(Enter Mpesa code below for the payment you made eg: SKT8IQN9BQ)">
                <PaymentCodeVerification cookies={cookies} navigate={navigate} />
        </GlassmorphicContainer>
        
        </Suspense>
        <GlassmorphicContainer text="(Enter Username and Password to login)">
         <Login />
         </GlassmorphicContainer>

      </div>
    );
  }
}
