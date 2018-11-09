import React, { Component } from "react";
import Trades from "./trade";
import TradesDetail from "./trade-detail";
import BuyOrder from "./buyorder";
import BuyOrderDetail from "./buyorder-detail";
import SellOrder from "./sellorder";
import SellOrderDetail from "./sellorder-detail";
import SelectOrders from "./select-orders";

class MyOrders extends Component {
  constructor(props) {
    super(props);
    this.getData = this.getData.bind(this);
    this.state = {
      exchangeObj: {}
    };
  }

  getData(val) {
    this.setState({
      exchangeObj: val.data
    });
  }

  render() {
    return (
      <div className="container bg-inverse text-white">
        <div className="row">
          <div className="col-md-3" align="left">
            <SelectOrders sendData={this.getData} />
          </div>
          <div className="col-md-9">
            <div className="row">
              <div className="col-md-3" align="center">
                <BuyOrder exchangeObj={this.state.exchangeObj} />
                <SellOrder exchangeObj={this.state.exchangeObj} />
              </div>
              <div className="col-md-3" align="center">
                <BuyOrderDetail exchangeObj={this.state.exchangeObj} />
                <SellOrderDetail exchangeObj={this.state.exchangeObj} />
              </div>
              <div className="col-md-2" align="center">
                <Trades exchangeObj={this.state.exchangeObj} />
              </div>
              <div className="col-md-4" align="center">
                <TradesDetail exchangeObj={this.state.exchangeObj} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default MyOrders;

//Mockup data
// var trade = [];
// trade[0] = {
//   dealPrice: 200,
//   etherAmount: 2
// };
// trade[1] = {
//   dealPrice: 300,
//   etherAmount: 3
// };
// this.state = {
//   //tradeObj: "Init"
//   tradeObj: {
//     trades: trade
//   }
// };
