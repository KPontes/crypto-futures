import React, { Component } from "react";
import { subscribeToTrades } from "./clientwebsocket";
import Trades from "./trade";
import BuyOrder from "./buyorder";
import SellOrder from "./sellorder";
import PlaceOrder from "./place-order";

class Exchange extends Component {
  constructor(props) {
    super(props);

    this.state = {
      exchangeObj: "no timestamp yet"
    };
    subscribeToTrades((err, data) =>
      this.setState({
        exchangeObj: data
      })
    );
  }

  render() {
    return (
      <div className="container bg-inverse text-white">
        <div className="row">
          <div className="col-sm-4" align="left">
            <PlaceOrder />
          </div>
          <div className="col-sm-8">
            <div className="row">
              <div className="col-sm-4" align="center">
                <BuyOrder exchangeObj={this.state.exchangeObj} />
              </div>
              <div className="col-sm-4" align="center">
                <SellOrder exchangeObj={this.state.exchangeObj} />
              </div>
              <div className="col-sm-4" align="center">
                <Trades exchangeObj={this.state.exchangeObj} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Exchange;

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
