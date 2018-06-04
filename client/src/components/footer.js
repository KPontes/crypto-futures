import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <div>
      <br />
      <div className="card text-left">
        <div className="card-footer text-muted">
          <div className="card-table input-margin">
            <div className="row">
              <div className="col-md-6">
                Simple Pay Wallet is a friendly client-side interface to
                interact with the Ethereum Blockchain Network.
                <p>Free, Open Source - 2018 MIT license</p>
              </div>
              <div className="col-md-1" />
              <div className="col-md-5">
                <Link to="/sendether">
                  <img src="/images/donatepq.png" alt="" />
                </Link>{" "}
                SPW depends on the conciousness of users to keep providing a
                free service. Please support us by donating Ethereum or Bitcoin
                to the following addresses:
                <p />ETH:{" "}
                <font color="#000077">
                  0x60d48586D99F16661f09AE9cA6AbaC3d636b26e2{" "}
                </font>
                <br />BTC:{" "}
                <font color="#000077">
                  {" "}
                  1P7k5oc5UdKW2661iHgnQJs1xTP9V6oqcx{" "}
                </font>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
