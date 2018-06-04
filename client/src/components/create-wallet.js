import React, { Component } from "react";
import Download from "@axetroy/react-download";
import moment from "moment";

import { createWallet } from "../utils/ethereum";
import { encryptObj, decrypt } from "../utils/cipher";
import Help from "./help";

//Class component have props available everywhere and must be used when you need to keep state
class CreateWallet extends Component {
  constructor(props) {
    super(props);
    //constructor is the only place where you assgin state directly
    this.state = {
      address: "",
      password: "",
      privateKey: "",
      mnemonic: "",
      displayResult: false,
      btnText: "Create"
    };
    this.onInputChange = this.onInputChange.bind(this);
    this.onFormSubmit = this.onFormSubmit.bind(this);
  }

  componentWillUnmount() {
    this.setState({
      address: "",
      password: "",
      privateKey: "",
      mnemonic: "",
      displayResult: false,
      btnText: "Create"
    });
  }

  renderPartial(cipherText, keyObj) {
    var fileExtension = moment().format("YYYYMMDDHHmmss") + ".txt";
    return (
      <div className="card text-left">
        <div className="card-header">
          <strong>
            <p>
              The Results Table provide the information that enables you to
              access your funds, send and receive ETHER within this wallet.
              Simple Pay Wallet can not recover this information in case of
              loss.
            </p>
            Take the three actions below:
          </strong>
          <p />
          <ol>
            <li>
              Click the "Save Encrypted" button to save your results table as an
              encrypted file on your local machine
            </li>
            <li>
              Click the "Save Plain Text" button to save your results table as a
              plain text file on your local machine
            </li>
            <li>Print this page and store the printed document safely</li>
          </ol>
        </div>
        <div className="card-body" align="center">
          <table>
            <thead>
              <tr>
                <th>
                  <b>Results Table:</b>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="table-info">
                <td className="col-sd-4">Your public address:</td>
                <td className="col-sd-8">{this.state.address}</td>
              </tr>
              <tr className="table-info">
                <td className="col-sd-4">Your private Key:</td>
                <td className="col-sd-8">{this.state.privateKey}</td>
              </tr>
              <tr className="table-info">
                <td className="col-sd-4">Your recovery passphrase:</td>
                <td className="col-sd-8">{this.state.mnemonic}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="card-footer text-muted">
          <table>
            <tbody>
              <tr>
                <td>
                  <Download
                    file={"SPW-encrypted-" + fileExtension}
                    content={cipherText}
                  >
                    <button type="button" className="btn btn-danger">
                      Save Encrypted results table to local file
                    </button>
                  </Download>
                </td>
                <td />
                <td>
                  <Download
                    file={"SPW-plaintext-" + fileExtension}
                    content={JSON.stringify(keyObj)}
                  >
                    <button type="button" className="btn btn-danger">
                      Save Plain Text results table to local file
                    </button>
                  </Download>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  render() {
    const helpData = this.showHelpData();

    var partial = <div />;
    if (this.state.displayResult) {
      //stringfy json object for further saving on file
      var keyObj = {
        address: this.state.address,
        privateKey: this.state.privateKey,
        mnemonic: this.state.mnemonic
      };
      try {
        const cipherText = encryptObj(keyObj, this.state.password);
        const plainObj = JSON.parse(decrypt(cipherText, this.state.password));

        //display query results and save button
        partial = this.renderPartial(cipherText, plainObj);
      } catch (e) {
        alert("Error: Invalid crypto operation - " + e.message);
      }
    }

    return (
      <div className="container">
        <Help helpData={helpData} />
        <form onSubmit={this.onFormSubmit}>
          <label> Enter a password: </label>
          <div className="input-group">
            <input
              placeholder="Type your eight digits password"
              type="password"
              className="form-control"
              value={this.state.password}
              onChange={event => this.onInputChange(event.target.value)}
            />
            <span className="input-group-btn btn-margin">
              <button
                ref="btn"
                type="submit"
                className="btn btn-primary btn-lg"
              >
                {this.state.btnText}
              </button>
            </span>
          </div>
        </form>
        <p>
          <font color="#873468">
            Make sure you remember your password, you will need it to access
            your funds. We do not save it, so we can not recover it for you.
          </font>
        </p>
        <hr />
        {partial}
      </div>
    );
  }

  onInputChange(password) {
    this.setState({
      password: password.trim(),
      address: "",
      privateKey: "",
      displayResult: false,
      mnemonic: ""
    });
  }

  async onFormSubmit(event) {
    event.preventDefault();

    if (this.state.password.length < 8) {
      return alert("Password must have at least 8 digits");
    }

    this.refs.btn.setAttribute("disabled", "disabled");
    this.setState({ btnText: "Processing ..." });
    try {
      const wallet = await createWallet();
      this.setState({
        address: wallet.address,
        mnemonic: wallet.mnemonic,
        privateKey: wallet.privateKey,
        displayResult: true
      });
    } catch (e) {
      alert("Error: " + e.message);
    }
    this.refs.btn.removeAttribute("disabled");
    this.setState({
      btnText: "Create"
    });
  }

  showHelpData() {
    return (
      <div>
        <p>
          Type in your password, and the Create Wallet will generate (1) an
          ethereum address, (2) the private key to sign transactions from this
          address, and (3) a mnemonic recover passphrase.
        </p>
        <p>
          This three pieces of information provides the access to your ethereum
          funds. Think of an address as a bank account and the private key as
          your access credentials to moviment the funds on that account. The
          mnemonic is a way to recover address and private key in case of loss.
        </p>
        <p>
          Once the wallet has beem created, you will be presented with a button
          for saving this information locally on your computer as an encrypted
          file, and another button to save as a plain text file. Save those
          files in a safe storage, make backup, and also print the result
          screen. The only way to access your encrypted file is with the
          password typed to generate the wallet. Make sure you never edit your
          encrypted file, avoiding to corrupt it.
        </p>
        <p>
          SPW does not hold your keys, so we can not recover keys or reset
          password. Note that SPW can not access your account nor reverse
          transactions.
        </p>
      </div>
    );
  }
}

export default CreateWallet;
