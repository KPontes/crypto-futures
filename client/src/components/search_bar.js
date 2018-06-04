import React, { Component } from "react";

//Class component have props available everywhere and must be used when you need to keep state
class SearchBar extends Component {
  constructor(props) {
    super(props);

    this.state = { term: "" }; //constructor is the only place where you assgin state directly
    this.onInputChange = this.onInputChange.bind(this);
  }
  // Mandatory render method
  render() {
    return (
      <div className="search-bar">
        <input
          value={this.state.term}
          onChange={event => this.onInputChange(event.target.value)}
        />
      </div>
    );
  }

  onInputChange(term) {
    this.setState({ term });
  }
}

export default SearchBar;
