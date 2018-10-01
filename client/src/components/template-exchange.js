import React, { Component } from "react";

import Header from "./header";
import Footer from "./footer";
import Exchange from "./exchange";

class TemplateExchange extends Component {
  render() {
    return (
      <div className="container-fluid">
        <Header activeMenuItem={"trade"} />
        <Exchange />
        <Footer />
      </div>
    );
  }
}

export default TemplateExchange;
