import React, { Component } from "react";
//import _ from "lodash";
import FileInput from "react-simple-file-input";

import { viewAddressInfo } from "../utils/ethereum";
import { decrypt } from "../utils/cipher";
import SendEtherPanel from "./send-ether-panel";
import Help from "./help";

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
class SendEtherChoice extends Component {
  constructor(props, context) {
    super(props, context);

    this.cancelButtonClicked = this.cancelButtonClicked.bind(this);
    this.resetCancelButtonClicked = this.resetCancelButtonClicked.bind(this);
    this.showProgressBar = this.showProgressBar.bind(this);
    this.updateProgressBar = this.updateProgressBar.bind(this);
    this.handleFileSelected = this.handleFileSelected.bind(this);
    this.handleOptionChange = this.handleOptionChange.bind(this);
    this.onInputChange = this.onInputChange.bind(this);
    this.onPkButtonClick = this.onPkButtonClick.bind(this);

    this.state = {
      cancelButtonClicked: false,
      fileContents: "",
      password: "",
      pk_mnemonic: "",
      btPkMnemonic: "Click to Unlock",
      selectedOption: "",
      keysObj: {}
    };
  }

  componentWillUnmount() {
    this.setState({
      cancelButtonClicked: false,
      fileContents: "",
      password: "",
      pk_mnemonic: "",
      selectedOption: "",
      keysObj: {}
    });
  }

  // Mandatory render method
  render() {
    const helpData = this.showHelpData();
    const showChoices = this.showChoices();
    const getPassword = this.partialGetPassword();
    const getPkOrMnemonic = this.partialGetPkOrMnemonic();
    const unlockWithFile = this.partialUnlockEncryptedFile();
    const unlockWithPk = this.partialUnlockWithPkOrMnemonic();

    // if (!_.isEmpty(this.state.keysObj)) {
    //   const unlockWithEncryptedFile = this.partialUnlockEncryptedFile();
    // }

    return (
      <div className="container mb-5">
        <Help helpData={helpData} />
        {showChoices}
        {getPassword}
        {unlockWithFile}
        {getPkOrMnemonic}
        {unlockWithPk}
        <SendEtherPanel keysObj={this.state.keysObj} />
      </div>
    );
  }

  partialGetPkOrMnemonic() {
    if (
      this.state.selectedOption === "option2" ||
      this.state.selectedOption === "option3"
    ) {
      return (
        <div>
          <label>
            {" "}
            Paste your private key or mnemonic passphrase to unlock your wallet:{" "}
          </label>
          <div className="input-group">
            <input
              placeholder="Type / paste your private key or mnemonic passphrase"
              type="password"
              id="pk_mnemonic"
              className="form-control"
              value={this.state.pk_mnemonic}
              onChange={this.onInputChange}
            />
          </div>
        </div>
      );
    }
  }

  partialGetPassword() {
    if (this.state.selectedOption === "option1") {
      return (
        <div>
          <label> Enter the password to unlock your keys file: </label>
          <div className="input-group">
            <input
              placeholder="Type a minimum eight digits password"
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
  }

  partialUnlockWithPkOrMnemonic() {
    if (
      this.state.pk_mnemonic.length >= 60 &&
      this.state.selectedOption !== "option1"
    ) {
      return (
        <div className="mt-2">
          Unlock your wallet:
          <button
            type="button"
            ref="btn"
            className="btn btn-primary btn-margin"
            onClick={event => this.onPkButtonClick()}
          >
            <span>{this.state.btPkMnemonic}</span>
          </button>
        </div>
      );
    }
  }

  async onPkButtonClick(event) {
    this.refs.btn.setAttribute("disabled", "disabled");
    this.setState({ btPkMnemonic: "Loading ..." });
    var keysObj = {};
    var pos = this.state.pk_mnemonic.indexOf(" ");
    if (pos === -1) {
      keysObj["privateKey"] = this.state.pk_mnemonic;
    } else {
      keysObj["mnemonic"] = this.state.pk_mnemonic;
    }
    try {
      keysObj = await viewAddressInfo(keysObj);
      this.refs.btn.removeAttribute("disabled");
      this.setState({
        keysObj: keysObj
      });
    } catch (e) {
      this.refs.btn.removeAttribute("disabled");
      this.setState({
        keysObj: {}
      });
      alert("Error unlocking wallet: " + e.message);
    }
    this.setState({
      btPkMnemonic: "Click to Unlock",
      pk_mnemonic: ""
    });
  }

  partialUnlockEncryptedFile() {
    if (
      this.state.password.length >= 8 &&
      this.state.selectedOption === "option1"
    ) {
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

              <span>Click to get your Encrypted keys file</span>
            </label>
          </button>
        </div>
      );
    }
  }

  async handleFileSelected(event, file) {
    try {
      var cipher = await event.target.result.toString();
      this.setState({ file: file, fileContents: cipher });

      var plainText = decrypt(cipher, this.state.password);
      var keysObj = JSON.parse(plainText);
      keysObj = await viewAddressInfo(keysObj);
      this.setState({ keysObj: keysObj });
    } catch (e) {
      alert("Error: Invalid keys file - " + e.message);
    }
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

  showHelpData() {
    return (
      <div>
        <p>
          Type in your password and you will be presented with three choices to
          unlock your wallet: (1) select your encrypted keys file (2) type or
          paste your private key, and (3) type or paste your mnemonic recover
          passphrase.
        </p>
        <p>
          Once your wallet has been unlocked, you will be presented with your
          balance in the Send Ether Panel, and there will be available the
          inputs for typing the destination address and amount to be transfered.
        </p>
        <p>
          A Result Panel will provide you a confirmation with the transaction
          id.
        </p>
      </div>
    );
  }

  showChoices() {
    return (
      <form>
        <h5>Select to unlock your Wallet</h5>
        <div className="radio">
          <label className="radio-container">
            <input
              type="radio"
              value="option1"
              checked={this.state.selectedOption === "option1"}
              onChange={this.handleOptionChange}
            />
            With encrypted keys file
            <span className="checkmark" />
          </label>
        </div>
        <div className="radio">
          <label className="radio-container">
            <input
              type="radio"
              value="option2"
              checked={this.state.selectedOption === "option2"}
              onChange={this.handleOptionChange}
            />
            With my private key
            <span className="checkmark" />
          </label>
        </div>
        <div className="radio">
          <label className="radio-container">
            <input
              type="radio"
              value="option3"
              checked={this.state.selectedOption === "option3"}
              onChange={this.handleOptionChange}
            />
            With mnemonic passphrase
            <span className="checkmark" />
          </label>
        </div>
      </form>
    );
  }

  handleOptionChange(changeEvent) {
    this.setState({
      selectedOption: changeEvent.target.value,
      cancelButtonClicked: false,
      fileContents: "",
      password: "",
      pk_mnemonic: "",
      btPkMnemonic: "Click to Unlock",
      keysObj: {}
    });
  }
}
export default SendEtherChoice;
