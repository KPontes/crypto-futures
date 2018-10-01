import React, { Component } from "react";

import Header from "./header";
import Footer from "./footer";
import ReceiveEther from "./receive-ether";

class TemplateReceiveEther extends Component {
  render() {
    return (
      <div className="container-fluid">
        <Header activeMenuItem={"wallet"} />
        <ReceiveEther />
        <Footer />
      </div>
    );
  }
}

export default TemplateReceiveEther;
