import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { createStore, applyMiddleware } from "redux";

import reducers from "./reducers";
import App from "./components/app";

//first argument is reducers
const store = createStore(
  () => {
    reducers;
  },
  {},
  applyMiddleware()
);
//hooking up App component with the react-redux Provider.
//So whenever a state changes at the redux store, all child components will be rerendered

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.querySelector("#root")
);
