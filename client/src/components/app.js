import React, { Component } from "react";
import { BrowserRouter, Route } from "react-router-dom";
// import dotenv from "dotenv";
import TemplateHome from "./templates/template-home";
import TemplateBalance from "./templates/template-balance";
import TemplateCreateWallet from "./templates/template-create-wallet";
import TemplateSendEther from "./templates/template-send-ether";
import TemplateUnlock from "./templates/template-unlock";
import TemplateReceiveEther from "./templates/template-receive-ether";
import TemplateContact from "./templates/template-contact";
import TemplateExchange from "./templates/template-exchange";
import TemplateMyOrders from "./templates/template-myorders";
import TemplateWithdraw from "./templates/template-withdraw";

const Teste = () => <h2>SurveyNew</h2>;

export default class App extends Component {
  render() {
    return (
      <div>
        <BrowserRouter>
          <div>
            <Route exact path="/" component={TemplateHome} />
            <Route exact path="/trade" component={TemplateExchange} />
            <Route exact path="/myorders" component={TemplateMyOrders} />
            <Route exact path="/withdraw" component={TemplateWithdraw} />
            <Route exact path="/balance" component={TemplateBalance} />
            <Route path="/balance/:address" component={TemplateBalance} />
            <Route
              exact
              path="/createwallet"
              component={TemplateCreateWallet}
            />
            <Route path="/sendether" component={TemplateSendEther} />
            <Route path="/unlock" component={TemplateUnlock} />
            <Route path="/receiveether" component={TemplateReceiveEther} />
            <Route path="/contact" component={TemplateContact} />
            <Route path="/teste" component={Teste} />
          </div>
        </BrowserRouter>
      </div>
    );
  }
}
