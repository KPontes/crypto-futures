import React, { Component } from "react";

import Header from "./header";
import Footer from "./footer";
import Contact from "./contact";

class TemplateContact extends Component {
  render() {
    return (
      <div className="container-fluid">
        <Header activeMenuItem={"contact"} />
        <Contact />
        <Footer />
      </div>
    );
  }
}

export default TemplateContact;
