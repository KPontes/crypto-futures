import React, { Component } from "react";
import axios from "axios";
import { utils } from "ethers";
import moment from "moment";
import validator from "validator";

class PlaceOrder extends Component {
  constructor(props) {
    super(props);
    this.handleOptionChange = this.handleOptionChange.bind(this);
    this.onInputChange = this.onInputChange.bind(this);
    this.onFormSubmit = this.onFormSubmit.bind(this);
    this.handleContractChange = this.handleContractChange.bind(this);
    var users = [
      {
        address: "0x5fEDb99AAe7F1880A7a97b0cbe070231a6678f07",
        pk: "0x54ebbbba420fa577d9a7be4e831d3ea540bcd9e455d83ade27956b52f28f1f52"
      },
      {
        address: "0x3c511616bA2F6bD8Aa4e1e9Cdc20389dC6B6b107",
        pk: "0x8f4149e18266e094b93069475de230f6a6f74fb2c9ecf044130aeaf90d400bb5"
      },
      {
        address: "0x5fe2ef48cb0c519b495a68d99d3705cafb0757ff",
        pk: "0xfbc8e1cb44f9505d93a6ae6215beed81a7be1eb9c6ce6e46fd520d747d9c84cb"
      },
      {
        address: "0x85Be6c1f4DE7a2D1de9564086394700ccb7d0852",
        pk: "0xfbc8e1cb44f9505d93a6ae6215beed81a7be1eb9c6ce6e46fd520d747d9c84cb"
      }
    ];

    this.state = {
      users,
      selectedOption: null,
      btnText: "Submit",
      thash: "",
      margin: "1",
      isButtonDisabled: true,
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
        if (response.data) {
          _this.setState({ contracts: response.data, isButtonDisabled: false });
        }
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
    const user = this.state.users.find(
      item => item.address === this.state.walletAddress
    );

    if (
      !validator.isDecimal(this.state.contractsAmount) ||
      !validator.isDecimal(this.state.price)
    ) {
      return alert("Invalid price or contracts volume");
    }
    if (!user) {
      return alert("Invalid address");
    }
    if (!this.state.selectedOption) {
      return alert("Select an order type");
    }

    this.setState({ btnText: "Processing ...", isButtonDisabled: true });

    try {
      const etherAmount =
        Number(this.state.contractsAmount) *
        Number(utils.formatEther(this.state.contract.size));
      var _this = this;
      var url = "";
      var data = {
        pk: user.pk,
        contractTitle: this.state.contract.title,
        contractsAmount: this.state.contractsAmount,
        dealPrice: this.state.price,
        depositedEther: etherAmount.toString()
      };
      if (this.state.selectedOption === "buy") {
        url = "/newbuyorder";
        data.buyerAddress = user.address;
      } else {
        url = "/newsellorder";
        data.sellerAddress = user.address;
      }
      // ****************
      axios({
        method: "post",
        baseURL: process.env["REACT_APP_API_URI"],
        url: url,
        data: data
      })
        .then(function(response) {
          if (response.status === 200) {
            _this.setState({ thash: response.data.transactionHash });
          }
          _this.setState({
            btnText: "Submit",
            isButtonDisabled: false,
            price: "",
            contractsAmount: "",
            selectedOption: ""
          });
        })
        .catch(function(error) {
          console.log(error);
          alert("Error: " + error.message);
          _this.setState({
            btnText: "Submit",
            isButtonDisabled: false,
            price: "",
            margin: "",
            contractsAmount: "",
            selectedOption: ""
          });
        });
      // ****************
    } catch (e) {
      alert("Error: " + e.message);
    }
  }

  render() {
    const selectOrder = this.selectOrder();
    const inputPrice = this.inputPrice();
    const selectContract = this.selectContract();

    const etherscan = () => {
      if (this.state.thash) {
        return (
          <a
            href={`${process.env.REACT_APP_ETHERSCAN}${this.state.thash}`}
            target="_blank"
          >
            {" "}
            Transaction hash{" "}
          </a>
        );
      }
    };
    var etherscanLink = etherscan();

    return (
      <form onSubmit={this.onFormSubmit}>
        {selectContract}
        {selectOrder}
        {inputPrice}
        <span className="input-group-btn btn-margin">
          <button
            type="submit"
            className="btn btn-primary btn-sm"
            disabled={this.state.isButtonDisabled}
          >
            {this.state.btnText}
          </button>
        </span>
        <div align="center">{etherscanLink}</div>
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
          <div className="col-sm-4">
            <small># of contracts</small>
            <input
              type="text"
              className="form-control input-sm"
              id="contractsAmount"
              placeholder="volume"
              value={this.state.contractsAmount}
              onChange={this.onInputChange}
            />
          </div>
          <div className="col-sm-4">
            <small>Price</small>
            <input
              type="text"
              className="form-control input-sm"
              id="price"
              placeholder="in USD"
              value={this.state.price}
              onChange={this.onInputChange}
            />
          </div>
          <div className="col-sm-4">
            <small>Margin</small>
            <input
              type="text"
              className="form-control input-sm"
              id="margin"
              placeholder="up to 5x"
              value={this.state.margin}
              onChange={this.onInputChange}
            />
          </div>
        </div>
        <div className="col-sm-12">
          <small>Logged user address</small>
          <input
            type="text"
            className="form-control"
            id="walletAddress"
            placeholder="wallet address"
            value={this.state.walletAddress}
            onChange={this.onInputChange}
          />
        </div>
      </div>
    );
  }
}

export default PlaceOrder;
