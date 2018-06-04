import React, { Component } from "react";
import { Link } from "react-router-dom";
import ethers from "ethers";

//Class component have props available everywhere and must be used when you need to keep state
class SendEtherResult extends Component {
  render() {
    if (this.props.transaction.hash) {
      var toAddress = "/balance/" + this.props.address;
      return (
        <div className="presentation-div">
          <strong>Transaction Results from the Blockchain</strong> <br />
          <div className="card-table input-margin">
            <div className="row">
              <div className="col-md-2">
                <label> transaction Id: </label>
              </div>
              <div className="col-md-10">
                <label> {this.props.transaction.hash} </label>
              </div>
            </div>
            <div className="row">
              <div className="col-md-2">
                <label> to Address: </label>
              </div>
              <div className="col-md-10 form-group">
                <label> {this.props.transaction.to} </label>
              </div>
            </div>
            <div className="row">
              <div className="col-md-2">
                <label for="toAddress"> Value: </label>
              </div>
              <div className="col-md-10 form-group">
                <label>
                  {ethers.utils.formatEther(this.props.transaction.value)}{" "}
                </label>
              </div>
            </div>
          </div>
          <div align="right" className="mr-5">
            <span>
              {" "}
              Your transaction was broadcasted to network. Wait some minutes and{" "}
            </span>
            <Link to={toAddress} id="balance">
              check New Balance
            </Link>
            <p>
              <a
                href={`https://etherscan.io/tx/${this.props.transaction.hash}`}
                target="_blank"
              >
                Click for Transaction monitoring
              </a>
            </p>
          </div>
        </div>
      );
    } else {
      return null;
    }
  }
}

export default SendEtherResult;
