import React, { Component } from "react";
import axios from "axios";
import { utils } from "ethers";
import moment from "moment";

//import User from "../models/User";

class SelectOrders extends Component {
  constructor(props) {
    super(props);
    this.onFormSubmit = this.onFormSubmit.bind(this);
    this.handleContractChange = this.handleContractChange.bind(this);

    this.state = {
      btnText: "Submit",
      isButtonDisabled: true,
      contract: {}
    };
  }

  async componentWillMount() {
    // load available contracts into state
    var _this = this;
    axios({
      method: "post",
      baseURL: process.env["REACT_APP_API_URI"],
      url: "/listcontracts",
      data: {}
    })
      .then(function(response) {
        // console.log("response", response.data);
        if (response.data) {
          _this.setState({ contracts: response.data, isButtonDisabled: false });
        }
      })
      .catch(function(error) {
        console.log(error);
      });
  }

  handleContractChange(changeEvent) {
    function selectedContract(element) {
      return element.title === changeEvent.target.value;
    }

    var filtered = this.state.contracts.filter(selectedContract);
    if (filtered.length > 0) {
      this.setState({
        contract: filtered[0]
      });
    }
  }

  async onFormSubmit(event) {
    event.preventDefault();
    const user = this.props.user;
    if (!user) {
      return alert("Please unlock a wallet");
    }
    this.setState({ btnText: "Processing ...", isButtonDisabled: true });

    try {
      var _this = this;
      var data = {
        contractTitle: this.state.contract.title,
        userAddress: user.address.toLowerCase()
      };
      // ****************
      axios({
        method: "post",
        baseURL: process.env["REACT_APP_API_URI"],
        url: "/orderhistory",
        data: data
      })
        .then(function(response) {
          _this.props.sendData(response); //send to parent component
          _this.setState({
            btnText: "Submit",
            isButtonDisabled: false
          });
        })
        .catch(function(error) {
          console.log(error);
          alert("Error: " + error.message);
          _this.setState({
            btnText: "Submit",
            isButtonDisabled: false
          });
        });
      // ****************
    } catch (e) {
      alert("Error: " + e.message);
    }
  }

  render() {
    if (this.props.user) {
      const displayUser = this.displayUser();
      const selectContract = this.selectContract();
      return (
        <form onSubmit={this.onFormSubmit}>
          {selectContract}
          {displayUser}
          <span className="input-group-btn btn-margin">
            <button
              type="submit"
              className="btn btn-primary btn-sm"
              disabled={this.state.isButtonDisabled}
            >
              {this.state.btnText}
            </button>
          </span>
        </form>
      );
    } else {
      return (
        <div className="row">
          <div className="col-sm-12 text-warning">
            <label>==> Please unlock a wallet</label>
          </div>
        </div>
      );
    }
  }

  selectContract() {
    const contractOptions = () => {
      if (this.state.contracts) {
        return this.state.contracts.map(element => {
          return (
            <option type="checkbox" name="contracts" value={element.title}>
              {element.title}
            </option>
          );
        });
      }
    };

    var lista = contractOptions();

    const result = (
      <div className="form-group">
        <small>Select a contract</small>
        <select
          className="form-control"
          id="exampleSelect1"
          onChange={this.handleContractChange}
        >
          <option type="checkbox" name="contracts" value="">
            Select
          </option>
          {lista}
        </select>
        <small>
          size:{" "}
          {this.state.contract.size
            ? utils.formatEther(this.state.contract.size)
            : 0}{" "}
          ETH
        </small>
        {" / "}
        <small>
          end date:{" "}
          {this.state.contract.endDate
            ? moment(
                parseInt(this.state.contract.endDate.toString() + "000")
              ).format("MMMM Do YYYY")
            : 0}{" "}
        </small>
      </div>
    );

    return result;
  }

  displayUser() {
    return (
      <div className="form-group">
        <div className="row">
          <div className="col-sm-12">
            <small>Logged user address:</small>
            <br />
            <small>{this.props.user.address}</small>
          </div>
        </div>
      </div>
    );
  }
}

export default SelectOrders;
