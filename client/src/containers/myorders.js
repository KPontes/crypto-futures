import React, { Component } from "react";
import { connect } from "react-redux";

import Trades from "../components/trade";
import TradesDetail from "../components/trade-detail";
import BuyOrder from "../components/buyorder";
import BuyOrderDetail from "../components/buyorder-detail";
import SellOrder from "../components/sellorder";
import SellOrderDetail from "../components/sellorder-detail";
import SelectOrders from "../components/select-orders";

class MyOrders extends Component {
  constructor(props) {
    super(props);
    this.getData = this.getData.bind(this);
    this.state = {
      exchangeObj: {}
    };
  }

  getData(val) {
    //receive data from child component
    this.setState({
      exchangeObj: val.data
    });
  }

  render() {
    return (
      <div className="container bg-inverse text-white">
        <div className="row">
          <div className="col-md-3" align="left">
            <SelectOrders sendData={this.getData} user={this.props.user} />
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

function mapStateToProps(state) {
  //whatever is returned will show up as props inside myorders container
  return {
    user: state.activeUser
  };
}

//promote myOrders from a component to a container with added props activeUser
export default connect(mapStateToProps)(MyOrders);
