import React, { Component } from "react";

import Header from "./header";
import Footer from "./footer";
import MyOrders from "./myorders";

class TemplateMyOrders extends Component {
  render() {
    return (
      <div className="container-fluid">
        <Header activeMenuItem={"futures"} />
        <MyOrders />
        <Footer />
      </div>
    );
  }
}

export default TemplateMyOrders;
