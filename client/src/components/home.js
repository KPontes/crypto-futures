import React, { Component } from "react";
import BrowserDetection from "react-browser-detection";

import ControlledCarrousel from "./controlled-carrousel";
import TokenInfo from "./tokenInfo";

const browserHandler = {
  //chrome, firefox, ie, edge, safari, opera, blink, googlebot and default
  chrome: () => <div />,
  firefox: () => <div />,
  edge: () => <div />,
  safari: () => <div />,
  default: browser => (
    <div align="right">
      {" "}
      <font color="#873468">
        <small>
          {browser} is not an homologated browser. Please try chrome, firefox,
          safari or edge!!!
        </small>
      </font>
    </div>
  )
};

//Functional component take props as an argument
class Home extends Component {
  render() {
    var slides = [];
    slides[0] = this.firstSlide();
    slides[1] = this.secondSlide();
    slides[2] = this.thirdSlide();
    return (
      <div className="container">
        <div className="row">
          <div className="col-md-9">
            <BrowserDetection>{browserHandler}</BrowserDetection>
            <div className="home-div">
              This is a derivatives platform for Ethereum Futures Trading based
              on Smart Contracts.
              <p>
                Although ETH price always compares to USD, this is a crypto-in /
                crypto-out platform, where you bid and withdraw only ETH.{" "}
              </p>
              <p>
                Designed to be safe and user friendly, yet allowing up to 10x
                leverage. Sign-up for free and give it a shot!!!
              </p>
            </div>
          </div>
          <div className="col-md-3">
            <TokenInfo />
          </div>
        </div>
        <div className="row">
          <div className="col-md-12">
            <div align="center">
              <img src="/images/how-works.jpg" alt="" />
            </div>
            <p />
            <ControlledCarrousel slides={slides} />
          </div>
        </div>
      </div>
    );
  }

  firstSlide() {
    return (
      <div>
        Before Send or Receive ether, you need to Create a Wallet, by providing
        a personal password. This enable SPW to generate an Ethereum public
        address and private key. Print your keys information and save your your
        keys file in a safe storage. You will need your public address to access
        your balance, and to receive funds. Analogously, you will need the
        private key to sign Send Ether transactions.
      </div>
    );
  }
  secondSlide() {
    return (
      <div>
        The View Balance feature enable you to query a balance of the Ether
        amount of your valid ethereum public address.
      </div>
    );
  }
  thirdSlide() {
    return (
      <div>
        In order to Send Ether to other addresses, you will need to unlock your
        wallet through one of the options: (1) type your password and select the
        encrypted keys file (2) type or paste your private key, or (3) type or
        paste your mnemonic recover passphrase.
        <br />
        With the unlocked wallet, you will be able to enter the destination
        address and the amount to be transfered.
        <br />
        A Result Panel will provide a confirmation with the transaction id.
      </div>
    );
  }
}

export default Home;
