import React from "react";
import { Route } from "react-router";

import App from "./components/app";
import ViewBalance from "./components/view-balance";
import Home from "./components/home";

export default (
  <Route path="/" component={App}>
    <Route exact path="/" component={Home} />
    <Route path="/balance" component={ViewBalance} />
  </Route>
);
