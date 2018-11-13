import React, { Component } from "react";

import Header from "../header";
import Footer from "../footer";
import UnlockWallet from "../../containers/unlock-wallet";

class TemplateUnlock extends Component {
  render() {
    return (
      <div className="container-fluid">
        <Header activeMenuItem={"futures"} />
        <UnlockWallet />
        <Footer />
      </div>
    );
  }
}

export default TemplateUnlock;
