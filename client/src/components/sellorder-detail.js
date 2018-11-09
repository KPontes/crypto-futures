import React from "react";
import moment from "moment";
import { Link } from "react-router-dom";

const SellOrderDetail = props => {
  //console.log("tradeObj", props.exchangeObj);
  let listItems;
  let header = "";
  if (props.exchangeObj.sellorders && props.exchangeObj.sellorders.length > 0) {
    header = (
      <div className="text-muted" style={{ fontSize: "small" }}>
        -{" "}
        <div className="row" style={{ fontSize: "small" }}>
          <div
            className="col-md-8 text-danger"
            align="center"
            style={{ display: "inline-block" }}
          >
            date
          </div>
          <div
            className="col-md-4 text-danger"
            align="center"
            style={{ display: "inline-block" }}
          >
            action
          </div>
        </div>
      </div>
    );
    const arrData = props.exchangeObj.sellorders;
    listItems = arrData.map(element => {
      var action = "";
      if (!element.tradeKey) {
        action = (
          <Link
            className="btn-outline-danger cursor-pointer"
            align="center"
            to={{
              pathname: "/cancelorder",
              state: { sellorder: element }
            }}
          >
            cancel
          </Link>
        );
      }
      return (
        <div style={{ fontSize: "small" }}>
          <div className="w-75 text-danger" style={{ display: "inline-block" }}>
            {" "}
            {moment(Date.parse(element.createdAt)).format(
              "YY-MM-DD kk:mm:ss"
            )}{" "}
          </div>
          <div className="w-25 text-danger" style={{ display: "inline-block" }}>
            {" "}
            {action}{" "}
          </div>
        </div>
      );
    });
  } else listItems = <div />;

  return [header, listItems];
};

export default SellOrderDetail;
