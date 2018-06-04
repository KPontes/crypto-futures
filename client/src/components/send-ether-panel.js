import React, { Component } from "react";
import validator from "validator";

import { sendEther } from "../utils/ethereum";
import SendEtherResult from "./send-ether-result";

//Class component have props available everywhere and must be used when you need to keep state
class SendEtherPanel extends Component {
  constructor(props) {
    super(props);

    this.handleSendClick = this.handleSendClick.bind(this);
    this.onInputChange = this.onInputChange.bind(this);

    this.state = {
      keysObj: {},
      inputToAddress: "",
      inputEtherValue: "",
      transaction: {},
      errorMessage: "",
      btSend: "Send Transaction"
    };
  }

  componentWillUnmount() {
    this.setState({
      keysObj: {},
      inputToAddress: "",
      inputEtherValue: "",
      transaction: {},
      errorMessage: ""
    });
  }

  renderPanelPartial() {
    return (
      <div className="presentation-div">
        <strong>UNLOCKED WALLET - Send Ether Panel </strong> <br />
        <div className="card-table input-margin">
          <div className="row">
            <div className="col-md-2">
              <label> From Address: </label>
              <p>Balance:</p>
            </div>
            <div className="col-md-10">
              <label> {this.props.keysObj.address} </label>
              <p>{this.props.keysObj.balance}</p>
            </div>
          </div>
          <div className="row">
            <div className="col-md-2">
              <label> Destination Address: </label>
            </div>
            <div className="col-md-10 form-group">
              <input
                placeholder="Type the destination address"
                type="text"
                id="inputToAddress"
                className="form-control"
                value={this.state.inputToAddress}
                onChange={this.onInputChange}
              />
            </div>
          </div>
          <div className="row">
            <div className="col-md-2 mt-1">
              <label> Value (in ETHER): </label>
            </div>
            <div className="col-md-10 form-group">
              <input
                placeholder="Type the value to be sent"
                type="text"
                id="inputEtherValue"
                className="form-control"
                value={this.state.inputEtherValue}
                onChange={this.onInputChange}
              />
            </div>
          </div>
        </div>
        <div align="right" className="mr-5">
          <button
            type="button"
            ref="btn"
            className="btn btn-primary btn-margin"
            onClick={event => this.handleSendClick()}
          >
            {this.state.btSend}
          </button>
          <p className="btn-margin">
            {" "}
            <font color="#873468">{this.state.errorMessage}</font>{" "}
          </p>
        </div>
      </div>
    );
  }

  render() {
    if (this.props.keysObj.address) {
      const partial = this.renderPanelPartial();
      return (
        <div>
          {partial}
          <SendEtherResult
            transaction={this.state.transaction}
            address={this.props.keysObj.address}
          />
        </div>
      );
    } else {
      return null;
    }
  }

  async handleSendClick(event) {
    try {
      if (!validator.isDecimal(this.state.inputEtherValue)) {
        throw new Error("Invalid ether number");
      }
      if (this.state.inputToAddress.length !== 42) {
        throw new Error("Invalid ether address");
      }
      this.refs.btn.setAttribute("disabled", "disabled");
      this.setState({ errorMessage: "", btSend: "Loading ..." });
      const transaction = await sendEther(
        this.props.keysObj.privateKey,
        this.state.inputToAddress,
        this.state.inputEtherValue
      );
      this.setState({ transaction, btSend: "Send Transaction" });
    } catch (e) {
      this.setState({
        btSend: "Send Transaction",
        errorMessage: "Error: " + e.message,
        inputToAddress: "",
        inputEtherValue: ""
      });
      this.refs.btn.removeAttribute("disabled");
      //alert(e.name + ": " + e.message);
    }
  }

  onInputChange(event) {
    this.setState({
      [event.target.id]: event.target.value
    });
  }
}
export default SendEtherPanel;
