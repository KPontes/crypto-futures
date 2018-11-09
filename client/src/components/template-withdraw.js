import React, { Component } from "react";

import Header from "./header";
import Footer from "./footer";
import Withdraw from "./withdraw";

class TemplateWithdraw extends Component {
  render() {
    const withdrawObj = {
      trade: this.props.location.state.trade,
      address: this.props.location.state.address,
      buyorder: this.props.location.state.buyorder,
      sellorder: this.props.location.state.sellorder,
      fc: this.props.location.state.fc
    };
    return (
      <div className="container-fluid">
        <Header activeMenuItem={"futures"} />
        <Withdraw withdrawObj={withdrawObj} />
        <Footer />
      </div>
    );
  }
}

export default TemplateWithdraw;
