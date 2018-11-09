import React from "react";
import moment from "moment";
import { Link } from "react-router-dom";

const BuyOrderDetail = props => {
  //console.log("tradeObj", props.exchangeObj);
  let listItems;
  let header = "";
  if (props.exchangeObj.buyorders && props.exchangeObj.buyorders.length > 0) {
    header = (
      <div className="text-muted" style={{ fontSize: "small" }}>
        -{" "}
        <div className="row" style={{ fontSize: "small" }}>
          <div
            className="col-md-8 text-success"
            align="center"
            style={{ display: "inline-block" }}
          >
            date
          </div>
          <div
            className="col-md-4 text-success"
            align="center"
            style={{ display: "inline-block" }}
          >
            action
          </div>
        </div>
      </div>
    );
    const arrData = props.exchangeObj.buyorders;
    listItems = arrData.map(element => {
      var action = "";
      if (!element.tradeKey) {
        action = (
          <Link
            className="btn-outline-success cursor-pointer"
            align="center"
            to={{
              pathname: "/cancelorder",
              state: { buyorder: element }
            }}
          >
            cancel
          </Link>
        );
      }
      return (
        <div className="row" style={{ fontSize: "small" }}>
          <div
            className="col-md-8 text-success"
            align="center"
            style={{ display: "inline-block" }}
          >
            {moment(Date.parse(element.createdAt)).format("YY-MM-DD kk:mm:ss")}{" "}
          </div>
          <div
            className="col-md-4 text-success"
            align="center"
            style={{ display: "inline-block" }}
          >
            {action}{" "}
          </div>
        </div>
      );
    });
  } else listItems = <div />;

  return [header, listItems];
};

export default BuyOrderDetail;
