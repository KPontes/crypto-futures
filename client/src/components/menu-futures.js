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
            <Link to="/unlock" id="trade" className="nav-link">
              Unlock wallet
            </Link>
            <Link to="/trade" id="trade" className="nav-link">
              Trading
            </Link>
            <Link to="/myorders" id="myorders" className="nav-link">
              My Orders
            </Link>
          </div>
        ) : null}
      </div>
    );
  }
}

export default MenuFutures;
