import React, { Component } from "react";

import Header from "./header";
import Footer from "./footer";
import SendEtherChoice from "./send-ether-choice";

class TemplateSendEther extends Component {
  render() {
    return (
      <div className="container-fluid">
        <Header activeMenuItem={"wallet"} />
        <SendEtherChoice />
        <Footer />
      </div>
    );
  }
}

export default TemplateSendEther;
