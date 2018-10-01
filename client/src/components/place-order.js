import React, { Component } from "react";
import axios from "axios";
import { utils } from "ethers";
import moment from "moment";

class PlaceOrder extends Component {
  constructor(props) {
    super(props);
    this.handleOptionChange = this.handleOptionChange.bind(this);
    this.onInputChange = this.onInputChange.bind(this);
    this.onFormSubmit = this.onFormSubmit.bind(this);
    this.handleContractChange = this.handleContractChange.bind(this);
    this.state = {
      selectedOption: null,
      btnText: "Submit",
      contract: {}
    };
  }

  async componentWillMount() {
    var _this = this;
    axios({
      method: "post",
      baseURL: process.env["REACT_APP_API_URI"],
      url: "/listcontracts",
      data: {}
    })
      .then(function(response) {
        // console.log("response", response.data);
        _this.setState({ contracts: response.data });
      })
      .catch(function(error) {
        console.log(error);
      });
  }

  onInputChange(event) {
    this.setState({
      [event.target.id]: event.target.value.trim()
    });
  }

  handleOptionChange(changeEvent) {
    this.setState({
      selectedOption: changeEvent.target.value
    });
  }

  handleContractChange(changeEvent) {
    function selectedContract(element) {
      console.log(element.title);
      console.log(changeEvent.target.value);
      return element.title === changeEvent.target.value;
    }

    var filtered = this.state.contracts.filter(selectedContract);
    if (filtered.length > 0) {
      this.setState({
        contract: filtered[0]
      });
    }
    console.log("state", this.state);
  }

  async onFormSubmit(event) {
    event.preventDefault();

    if (!this.state.selectedOption) {
      return alert("Select an order type");
    }

    this.refs.btn.setAttribute("disabled", "disabled");
    this.setState({ btnText: "Processing ..." });

    // try {
    //   const result = await axios.post("/api/register", formFields);
    //   console.log('formresult', result);
    // } catch (e) {
    //   alert("Error: " + e.message);
    // }
    this.refs.btn.removeAttribute("disabled");
    this.setState({
      btnText: "Submit"
    });
  }

  render() {
    const selectOrder = this.selectOrder();
    const inputPrice = this.inputPrice();
    const selectContract = this.selectContract();

    return (
      <form onSubmit={this.onFormSubmit}>
        {selectContract}
        {selectOrder}
        {inputPrice}
        <span className="input-group-btn btn-margin">
          <button ref="btn" type="submit" className="btn btn-primary btn-sm">
            {this.state.btnText}
          </button>
        </span>
      </form>
    );
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

  selectOrder() {
    return (
      <div>
        <label>Place an order</label>
        <div className="radio radio-danger">
          <label className="radio-inline" style={{ padding: "5px" }}>
            <input
              type="radio"
              className="radio-inline"
              name="radios"
              value="buy"
              checked={this.state.selectedOption === "buy"}
              onChange={this.handleOptionChange}
            />
            <small style={{ padding: "2px" }}> Buy Order</small>
          </label>

          <label className="radio-inline" style={{ padding: "5px" }}>
            <input
              type="radio"
              className="radio-inline"
              name="radios"
              value="sell"
              checked={this.state.selectedOption === "sell"}
              onChange={this.handleOptionChange}
            />
            <small style={{ padding: "2px" }}> Sell Order</small>
          </label>
        </div>
      </div>
    );
  }

  inputPrice() {
    return (
      <div className="form-group">
        <div className="row">
          <div className="col-sm-6">
            <small>Number of contracts</small>
            <input
              type="text"
              className="form-control"
              id="contractsAmount"
              placeholder="# of contracts"
              value={this.state.contractsAmount}
              onChange={this.onInputChange}
            />
          </div>
          <div className="col-sm-6">
            <small>Price</small>
            <input
              type="text"
              className="form-control"
              id="price"
              placeholder="price (in USD)"
              value={this.state.price}
              onChange={this.onInputChange}
            />
          </div>
        </div>
        <div className="col-sm-12">
          <small>Logged user address</small>
          <input
            type="text"
            className="form-control"
            id="walletaddress"
            placeholder="wallet address"
            value={this.state.walletaddress}
            onChange={this.onInputChange}
          />
        </div>
      </div>
    );
  }
}

export default PlaceOrder;
