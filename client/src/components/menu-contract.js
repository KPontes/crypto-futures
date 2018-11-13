import React, { Component } from "react";
import { Link } from "react-router-dom";

class MenuContract extends Component {
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
          Contract admin
        </button>
        {this.state.showMenu ? (
          <div
            className="menu"
            ref={element => {
              this.dropdownMenu = element;
            }}
          >
            <Link to="/create" id="create" className="nav-link">
              Create
            </Link>
            <Link to="/monitor" id="monitor" className="nav-link">
              start/stop Monitor
            </Link>
            <Link to="/close" id="close" className="nav-link">
              Close
            </Link>
            <Link to="/close" id="close" className="nav-link">
              Withdraw
            </Link>
          </div>
        ) : null}
      </div>
    );
  }
}

export default MenuContract;
