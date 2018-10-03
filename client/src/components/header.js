import React from "react";
import { Link } from "react-router-dom";
import MenuWallet from "./menu-wallet";
import MenuFutures from "./menu-futures";

const Header = props => {
  var importantMessage = "";
  if (process.env.NODE_ENV !== "production") {
    importantMessage =
      "*** This wallet is currently using the Rinkeby Test Network. Do not make real Ether operation. ***";
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
              props.activeMenuItem === "home" ? "nav-link active" : "nav-link"
            }
          >
            Home
          </Link>
        </li>
        <li className="nav-item">
          <MenuWallet
            btnFormat={
              props.activeMenuItem === "wallet"
                ? "btn btn-primary"
                : "btn btn-link"
            }
          />
        </li>
        <li className="nav-item">
          <MenuFutures
            btnFormat={
              props.activeMenuItem === "futures"
                ? "btn btn-primary"
                : "btn btn-link"
            }
          />
        </li>
        <li className="nav-item">
          <Link
            to="/contact"
            id="contact"
            className={
              props.activeMenuItem === "contact"
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
};

export default Header;
