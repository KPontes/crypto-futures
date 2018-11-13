import React, { Component } from "react";

import Header from "../header";
import Footer from "../footer";
import Home from "../home";

class TemplateHome extends Component {
  render() {
    return (
      <div className="container-fluid">
        <Header activeMenuItem={"home"} />
        <Home />
        <Footer />
      </div>
    );
  }
}

export default TemplateHome;
