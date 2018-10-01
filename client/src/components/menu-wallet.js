import React, { Component } from "react";
import { Link } from "react-router-dom";

class MenuWallet extends Component {
  constructor(props) {
    super();

    this.state = {
      showMenu: false,
      btnFormat: props.btnFormat
    };

    this.showMenu = this.showMenu.bind(this);
    this.closeMenu = this.closeMenu.bind(this);
  }

  showMenu(event) {
    event.preventDefault();
    this.setState({ showMenu: true, btnFormat: "btn btn-secondary" }, () => {
      document.addEventListener("click", this.closeMenu);
    });
  }

  closeMenu(event) {
    if (this.dropdownMenu && !this.dropdownMenu.contains(event.target)) {
      this.setState({ showMenu: false }, () => {
        document.removeEventListener("click", this.closeMenu);
      });
    }
  }

  render() {
    return (
      <div>
        <button
          onClick={this.showMenu}
          id="show"
          className={this.state.btnFormat}
        >
          {" "}
          Wallet
        </button>
        {this.state.showMenu ? (
          <div
            className="menu"
            ref={element => {
              this.dropdownMenu = element;
            }}
          >
            <Link to="/createwallet" id="createwallet" className="nav-link">
              Create
            </Link>
            <Link to="/balance" id="balance" className="nav-link">
              Balance
            </Link>
            <Link to="/sendether" id="sendether" className="nav-link">
              Withdraw
            </Link>
            <Link to="/receiveether" id="receiveether" className="nav-link">
              Deposit
            </Link>
          </div>
        ) : null}
      </div>
    );
  }
}

export default MenuWallet;
