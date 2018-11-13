import React, { Component } from "react";
import { Link } from "react-router-dom";
import moment from "moment";
import _ from "lodash";

class TradesDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isButtonDisabled: false,
      btnWithdraw: "Withdraw"
    };
  }

  render() {
    var partial = <div />;
    if (this.props.exchangeObj.transactions) {
      partial = this.partialListItems();
    }
    return partial;
  }

  partialHeader() {
    return (
      <div className="text-muted" style={{ fontSize: "small" }}>
        -
        <div className="row" style={{ fontSize: "small" }}>
          <div
            className="col-md-6 text-white"
            align="center"
            style={{ display: "inline-block" }}
          >
            date
          </div>
          <div
            className="col-md-6 text-white"
            align="center"
            style={{ display: "inline-block" }}
          >
            withdraw
          </div>
        </div>
      </div>
    );
  }

  partialListItems() {
    const header = this.partialHeader();
    var transactions; //at this point is undefined
    if (this.props.exchangeObj.transactions && !transactions) {
      transactions = this.props.exchangeObj.transactions;
      var trades = this.props.exchangeObj.trades;
      var buyOrders = this.props.exchangeObj.buyorders;
      var sellOrders = this.props.exchangeObj.sellorders;
      var fc = this.props.exchangeObj.futureContract;
      var address = this.props.exchangeObj.userAddress;
    } else {
      return header;
    }

    var listItems = [];
    var transaction;
    for (let element of trades) {
      transaction = transactions.find(tr => tr.tradeKey === element._id);
      if (!transaction) {
        break;
      }
      const withdrawValue = this.calcWithdrawValue(
        element,
        transaction,
        address,
        buyOrders,
        sellOrders,
        fc
      );
      console.log("withdrawValue", withdrawValue);
      listItems.push(
        <div className="row" style={{ fontSize: "small" }}>
          <div
            className="col-md-6"
            align="center"
            style={{ display: "inline-block" }}
          >
            {" "}
            {moment(Date.parse(element.createdAt)).format(
              "YY-MM-DD kk:mm"
            )}{" "}
          </div>
          <div
            className="col-md-6"
            align="center"
            style={{ display: "inline-block" }}
          >
            {withdrawValue}
          </div>
        </div>
      );
    }

    return [header, listItems];
  }

  calcWithdrawValue(element, transaction, address, buyOrders, sellOrders, fc) {
    let withdrawValue = <div> 0 </div>;
    let buyorder;
    let sellorder;
    var withdrawed = false;
    if (
      address.toString().toLowerCase() ===
      element.buyerAddress.toString().toLowerCase()
    ) {
      withdrawValue = <div>{_.round(element.buyerExitEtherAmount, 10)}</div>;
      buyorder = buyOrders.find(bo => bo._id === transaction.buyOrderKey);
      element.buyerWithdraw === 0
        ? (withdrawed = false)
        : ((withdrawed = true),
          (withdrawValue = (
            <div className="btn-outline-warning">
              {_.round(element.buyerWithdraw, 10)}
            </div>
          )));
    }
    if (
      address.toString().toLowerCase() ===
      element.sellerAddress.toString().toLowerCase()
    ) {
      withdrawValue = <div>{_.round(element.sellerExitEtherAmount, 10)}</div>;
      sellorder = sellOrders.find(so => so._id === transaction.sellOrderKey);
      element.sellerWithdraw === 0
        ? (withdrawed = false)
        : ((withdrawed = true),
          (withdrawValue = (
            <div className="btn-outline-warning">
              {_.round(element.sellerWithdraw, 10)}
            </div>
          )));
    }

    if ((element.liquidate || fc.allowWithdraw) && !withdrawed) {
      withdrawValue = (
        <Link
          className="btn-outline-secondary cursor-pointer"
          align="center"
          to={{
            pathname: "/withdraw",
            state: { trade: element, address, buyorder, sellorder, fc }
          }}
        >
          {withdrawValue}
        </Link>
      );
    }
    return withdrawValue;
  }
}
export default TradesDetail;
