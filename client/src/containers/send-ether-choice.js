import React, { Component } from "react";
import { connect } from "react-redux";

import SendEtherPanel from "../components/send-ether-panel";
import UnlockWallet from "./unlock-wallet";

//Class component have props available everywhere and must be used when you need to keep state
class SendEtherChoice extends Component {
  render() {
    if (this.props.user) {
      return (
        <div className="container mb-5">
          <UnlockWallet />
          <SendEtherPanel keysObj={this.props.user} />
        </div>
      );
    } else {
      return (
        <div className="container mb-5">
          <UnlockWallet />
        </div>
      );
    }
  }
}

function mapStateToProps(state) {
  //whatever is returned will show up as props inside myorders container
  return {
    user: state.activeUser
  };
}

//promote this from a component to a container with added props activeUser
export default connect(mapStateToProps)(SendEtherChoice);
