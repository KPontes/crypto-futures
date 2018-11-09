import React, { Component } from "react";
import _ from "lodash";
import axios from "axios";

import User from "../models/User";

class Withdraw extends Component {
  constructor(props) {
    super(props);
    this.handleBtnClick = this.handleBtnClick.bind(this);
    this.state = {
      isButtonDisabled: false,
      btnWithdraw: "Withdraw"
    };
  }

  render() {
    const partialHeader = this.partialHeader();
    const partialItems = this.partialItems();
    return [partialHeader, partialItems];
  }

  partialHeader() {
    return (
      <div>
        <div className="row" style={{ fontSize: "small" }}>
          <div className="col-md-2" align="center">
            ETH deposited
          </div>
          <div className="col-md-2" align="center">
            Fees
          </div>
          <div className="col-md-2" align="center">
            Deal price
          </div>
          <div className="col-md-2" align="center">
            Exit price
          </div>
          <div className="col-md-2" align="center">
            Margin
          </div>
          <div className="col-md-2" align="center">
            Withdraw value
          </div>
        </div>
      </div>
    );
  }

  partialItems() {
    const trade = this.props.withdrawObj.trade;
    const address = this.props.withdrawObj.address;
    const buyorder = this.props.withdrawObj.buyorder;
    const sellorder = this.props.withdrawObj.sellorder;
    let order;
    let exitValue;
    let type;
    sellorder === undefined
      ? ((order = buyorder),
        (exitValue = trade.buyerExitEtherAmount),
        (type = "Buyer"))
      : ((order = sellorder),
        (exitValue = trade.sellerExitEtherAmount),
        (type = "Seller"));

    return (
      <div>
        <div className="row" style={{ fontSize: "small" }}>
          <div className="col-md-2" align="center">
            {order.depositedEther}
          </div>
          <div className="col-md-2" align="center">
            {order.fees}
          </div>
          <div className="col-md-2" align="center">
            {trade.dealPrice}
          </div>
          <div className="col-md-2" align="center">
            {trade.exitPrice}
          </div>
          <div className="col-md-2" align="center">
            {order.margin}
          </div>
          <div className="col-md-2" align="center">
            {_.round(exitValue, 10)}
          </div>
        </div>
        <hr />
        <div className="row align-bottom" align="right">
          <div
            className="align-bottom col-md-10"
            align="right"
            style={{ fontSize: "small" }}
          >
            {type} destination address:
            <label className="p-3">{address}</label>
          </div>
          <div className="col-md-2 align-center" align="center">
            <button
              type="button"
              id="btnWithdraw"
              className="btn btn-outline-danger cursor-pointer"
              onClick={event => this.handleBtnClick(exitValue)}
              disabled={this.state.isButtonDisabled}
            >
              {this.state.btnWithdraw}
            </button>
          </div>
        </div>
      </div>
    );
  }

  async handleBtnClick(exitValue) {
    try {
      if (exitValue === 0) {
        this.setState({
          btnWithdraw: "Zero Value...",
          isButtonDisabled: true
        });
        return true;
      }
      const withdrawObj = this.props.withdrawObj;
      var users = new User();
      const user = users.getUser(withdrawObj.address);
      this.setState({
        btnWithdraw: "Processing...",
        isButtonDisabled: true
      });
      var data = {
        pk: user.pk,
        contractTitle: withdrawObj.fc.title,
        tradeKey: withdrawObj.trade._id
      };
      var _this = this;
      // ****************
      axios({
        method: "post",
        baseURL: process.env["REACT_APP_API_URI"],
        url: "/processliquidation",
        data: data
      })
        .then(function(response) {
          _this.setState({ btnWithdraw: "Success" });
        })
        .catch(function(error) {
          console.log(error);
          alert("Error: " + error.message);
          _this.setState({ btnWithdraw: "Error" });
        });
    } catch (e) {
      this.setState({ tnWithdraw: "Error" });
      alert("Error: " + e.message);
    }
  }
}

export default Withdraw;
