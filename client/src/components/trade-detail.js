import React, { Component } from "react";
import moment from "moment";
import _ from "lodash";

class TradesDetail extends Component {
  constructor(props) {
    super(props);
    this.handleBtnClick = this.handleBtnClick.bind(this);
    this.state = {
      exchangeObj: this.props.exchangeObj
    };
  }

  render() {
    var partial = <div />;
    if (this.props.exchangeObj.trades) {
      partial = this.partialListItems();
    }
    return partial;
  }

  partialListItems() {
    let listItems;
    let header = "";
    header = (
      <div>
        <div>details</div>
        <div className="row">
          <div className="col" style={{ display: "inline-block" }}>
            date
          </div>
          <div className="col" style={{ display: "inline-block" }}>
            withdraw
          </div>
        </div>
      </div>
    );
    const arrData = this.props.exchangeObj.trades;
    const fc = this.props.exchangeObj.futureContract;
    const address = this.props.exchangeObj.userAddress;
    listItems = arrData.map(element => {
      let value = element.sellerExitEtherAmount;
      if (address === element.buyerAddress) {
        value = _.round(element.buyerExitEtherAmount, 10);
      }
      if (element.liquidate || fc.allowWithdraw) {
        value = (
          <div className="col-sm-12" align="right">
            <button
              type="button"
              ref="btn"
              className="btn btn-outline-secondary btn-sm"
              onClick={event => this.handleBtnClick()}
            >
              {value}
            </button>
          </div>
        );
      }
      return (
        <div className="row" style={{ fontSize: "small" }}>
          <div className="col" style={{ display: "inline-block" }}>
            {" "}
            {moment(Date.parse(element.createdAt)).format(
              "YY-MM-DD kk:mm:ss"
            )}{" "}
          </div>
          <div className="col" style={{ display: "inline-block" }}>
            {" "}
            {value}{" "}
          </div>
        </div>
      );
    });
    return [header, listItems];
  }

  async handleBtnClick(event) {
    try {
      console.log("Cliquei");
      this.setState({ errorMessage: "", btSend: "Loading ..." });

      this.setState({ btSend: "Send Transaction" });
    } catch (e) {
      this.setState({
        btSend: "Send Transaction",
        errorMessage: "Error: " + e.message
      });
    }
  }
}

export default TradesDetail;
