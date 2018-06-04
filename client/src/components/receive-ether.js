import React, { Component } from "react";
//import _ from "lodash";
import FileInput from "react-simple-file-input";

import { viewAddressInfo } from "../utils/ethereum";
import { decrypt } from "../utils/cipher";

var allowedFileTypes = ["text/plain"]; //, "image/jpeg", "image/gif"];

function fileIsIncorrectFiletype(file) {
  console.log("type", file);
  if (allowedFileTypes.indexOf(file.type) === -1) {
    return true;
  } else {
    return false;
  }
}

//Class component have props available everywhere and must be used when you need to keep state
class ReceiveEther extends Component {
  constructor(props, context) {
    super(props, context);

    this.cancelButtonClicked = this.cancelButtonClicked.bind(this);
    this.resetCancelButtonClicked = this.resetCancelButtonClicked.bind(this);
    this.showProgressBar = this.showProgressBar.bind(this);
    this.updateProgressBar = this.updateProgressBar.bind(this);
    this.handleFileSelected = this.handleFileSelected.bind(this);
    this.onInputChange = this.onInputChange.bind(this);

    this.state = {
      cancelButtonClicked: false,
      fileContents: "",
      password: "",
      btnMessage: "Load address from Encrypted keys file",
      keysObj: {}
    };
  }

  componentWillUnmount() {
    this.setState({
      cancelButtonClicked: false,
      fileContents: "",
      password: "",
      keysObj: {}
    });
  }

  render() {
    const getPassword = this.partialGetPassword();
    const unlockWithFile = this.partialUnlockEncryptedFile();
    const explanations = this.showExplanations();
    var address = "";
    if (this.state.keysObj.address) {
      address = "Your Address: " + this.state.keysObj.address;
    }

    return (
      <div className="container">
        {explanations}
        {getPassword}
        {unlockWithFile}
        <p>
          <font color="#873468">{address}</font>
        </p>
      </div>
    );
  }

  showExplanations() {
    return (
      <div>
        <p>RECEIVE ETHER</p>
        <p>
          Provide ONLY your Address (
          <font color="#873468"> never the private key nor the mnemonic</font> )
          to the other part that will transfer some Ether amount for you.
        </p>
        <p>You may check your ethereum public address by:</p>
        <ol>
          <li>
            Verifying the SPW-plaintext file, that you saved on the Create
            Wallet operation.
          </li>
          <li>
            Verifying the page that you printed on the Create Wallet operation.
          </li>
          <li>
            Or type your password on the input below and open the SPW-encrypted
            file, also saved during the Create Wallet operation.
          </li>
        </ol>
        <p />
      </div>
    );
  }

  partialGetPassword() {
    return (
      <div>
        <label> Enter the password to unlock your keys file: </label>
        <div className="input-group">
          <input
            placeholder="Type your eight digits password"
            type="password"
            id="password"
            className="form-control"
            value={this.state.password}
            onChange={this.onInputChange}
          />
        </div>
      </div>
    );
  }

  partialUnlockEncryptedFile() {
    if (this.state.password.length >= 8) {
      return (
        <div className="mt-2">
          Unlock your wallet:
          <button type="button" className="btn btn-primary btn-margin">
            <label>
              <FileInput
                readAs="text"
                style={{ display: "none" }}
                onLoadStart={this.showProgressBar}
                onLoad={this.handleFileSelected}
                onProgress={this.updateProgressBar}
                cancelIf={fileIsIncorrectFiletype}
                abortIf={this.cancelButtonClicked}
                onCancel={this.showInvalidFileTypeMessage}
                onAbort={this.resetCancelButtonClicked}
              />

              <span>{this.state.btnMessage}</span>
            </label>
          </button>
        </div>
      );
    }
  }

  async handleFileSelected(event, file) {
    try {
      this.setState({ btnMessage: "Loading ..." });
      var cipher = await event.target.result.toString();
      this.setState({ file: file, fileContents: cipher });

      var plainText = decrypt(cipher, this.state.password);
      var keysObj = JSON.parse(plainText);
      keysObj = await viewAddressInfo(keysObj);
      this.setState({ keysObj: keysObj });
    } catch (e) {
      alert("Error: Invalid keys file - " + e.message);
    }
    this.setState({ btnMessage: "Load address from Encrypted keys file" });
  }

  onInputChange(event) {
    this.setState({
      [event.target.id]: event.target.value.trim()
    });
  }

  cancelButtonClicked() {
    return this.state.cancelButtonClicked;
  }

  resetCancelButtonClicked() {
    this.setState({ cancelButtonClicked: false });
  }

  showInvalidFileTypeMessage(file) {
    window.alert("Tried to upload invalid filetype " + file.type);
  }

  showProgressBar() {
    this.setState({ progressBarVisible: true });
  }

  updateProgressBar(event) {
    this.setState({
      progressPercent: event.loaded / event.total * 100
    });
  }
}

export default ReceiveEther;
