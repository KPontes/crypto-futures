import React, { Component } from "react";
import { Link } from "react-router-dom";
import { connect } from "react-redux";

import MenuWallet from "./menu-wallet";
import MenuFutures from "./menu-futures";
import MenuContract from "./menu-contract";

class Header extends Component {
  render() {
    var importantMessage = "";
    if (process.env.NODE_ENV !== "production") {
      importantMessage =
        "*** This wallet is currently using the Rinkeby Test Network. Do not make real Ether operation. ***";
    }
    let partialAdmin = <div />;
    let manager = process.env["REACT_APP_MANAGER"] || "";
    let user;
    if (this.props.user) {
      user = this.props.user;
      user = user.address.toString().toLowerCase();
      manager = manager.toString().toLowerCase();
    }

    if (user && manager === user) {
      partialAdmin = (
        <li className="nav-item">
          <MenuContract
            btnFormat={
              this.props.activeMenuItem === "contract"
                ? "btn btn-primary"
                : "btn btn-link"
            }
          />
        </li>
      );
    }

    return (
      <div style={{ margin: "10px" }}>
        <ul className="nav nav-pills nav-fill">
          <li className="nav-item">
            <img src="/images/SPW-logo.png" height="42" width="70" alt="" />
          </li>
          <li className="nav-item">
            <Link
              to="/"
              id="home"
              className={
                this.props.activeMenuItem === "home"
                  ? "nav-link active"
                  : "nav-link"
              }
            >
              Home
            </Link>
          </li>
          <li className="nav-item">
            <MenuWallet
              btnFormat={
                this.props.activeMenuItem === "wallet"
                  ? "btn btn-primary"
                  : "btn btn-link"
              }
            />
          </li>
          <li className="nav-item">
            <MenuFutures
              btnFormat={
                this.props.activeMenuItem === "futures"
                  ? "btn btn-primary"
                  : "btn btn-link"
              }
            />
          </li>
          {partialAdmin}
          <li className="nav-item">
            <Link
              to="/contact"
              id="contact"
              className={
                this.props.activeMenuItem === "contact"
                  ? "nav-link active"
                  : "nav-link"
              }
            >
              Contact
            </Link>
          </li>
        </ul>
        <div className="prd-maintenance-div">
          <font color="red">{importantMessage}</font>
        </div>
        <hr style={{ border: "1px solid black" }} />
      </div>
    );
  }
}

function mapStateToProps(state) {
  //whatever is returned will show up as props inside this container
  return {
    user: state.activeUser
  };
}

//promote this from a component to a container with added props activeUser
export default connect(mapStateToProps)(Header);

//export default Header;
