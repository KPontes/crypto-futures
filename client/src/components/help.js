import React, { Component } from "react";

class Help extends Component {
  constructor(props) {
    super(props);
    //constructor is the only place where you assgin state directly
    this.state = {
      showHelp: false
    };
    this.handleHelp = this.handleHelp.bind(this);
  }

  render() {
    var partialShowHelp = this.partialShowHelp();
    return (
      <div>
        <img
          src="/images/help-icon.png"
          className="cursor-pointer"
          alt=""
          onClick={this.handleHelp}
        />
        {partialShowHelp}
      </div>
    );
  }

  partialShowHelp() {
    if (this.state.showHelp) {
      return (
        <div class="card-help w-90">
          <h5 class="card-title">Help Card</h5>
          <div class="card-body">
            <p class="card-text">{this.props.helpData}</p>
          </div>
        </div>
      );
    } else return null;
  }

  handleHelp() {
    var change = this.state.showHelp ? false : true;
    this.setState({
      showHelp: change
    });
  }
}

export default Help;
