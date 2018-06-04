import React from "react";
import { Link } from "react-router-dom";

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
          <Link
            to="/createwallet"
            id="createwallet"
            className={
              props.activeMenuItem === "createwallet"
                ? "nav-link active"
                : "nav-link"
            }
          >
            Create Wallet
          </Link>
        </li>
        <li className="nav-item">
          <Link
            to="/balance"
            id="balance"
            className={
              props.activeMenuItem === "balance"
                ? "nav-link active"
                : "nav-link"
            }
          >
            View Balance
          </Link>
        </li>
        <li className="nav-item">
          <Link
            to="/sendether"
            id="sendether"
            className={
              props.activeMenuItem === "sendether"
                ? "nav-link active"
                : "nav-link"
            }
          >
            Send Ether
          </Link>
        </li>
        <li className="nav-item">
          <Link
            to="/receiveether"
            id="receiveether"
            className={
              props.activeMenuItem === "receiveether"
                ? "nav-link active"
                : "nav-link"
            }
          >
            Receive Ether
          </Link>
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
