import React, { Component } from "react";
import { Link } from "react-router-dom";

class MenuFutures extends Component {
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
          Futures
        </button>
        {this.state.showMenu ? (
          <div
            className="menu"
            ref={element => {
              this.dropdownMenu = element;
            }}
          >
            <Link to="/trade" id="trade" className="nav-link">
              Trading
            </Link>
            <Link to="/history" id="history" className="nav-link">
              My Orders
            </Link>
            <Link to="/withdraw" id="Withdraw" className="nav-link">
              Withdraw
            </Link>
            <Link to="/withdraw" id="Withdraw" className="nav-link">
              Open Contracts
            </Link>
          </div>
        ) : null}
      </div>
    );
  }
}

export default MenuFutures;
