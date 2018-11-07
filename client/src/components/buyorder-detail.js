import React from "react";
import moment from "moment";

const BuyOrderDetail = props => {
  //console.log("tradeObj", props.exchangeObj);
  let listItems;
  let header = "";
  if (props.exchangeObj.buyorder && props.exchangeObj.buyorder.length > 0) {
    header = (
      <div>
        <div className="w-100 text-success">detail </div>
        <div className="w-75 text-success" style={{ display: "inline-block" }}>
          date
        </div>
        <div className="w-25 text-success" style={{ display: "inline-block" }}>
          action
        </div>
      </div>
    );
    const arrData = props.exchangeObj.buyorder;
    listItems = arrData.map(element => {
      var action = "";
      if (!element.tradeKey) {
        action = "cancel";
      }
      return (
        <div style={{ fontSize: "small" }}>
          <div
            className="w-75 text-success"
            style={{ display: "inline-block" }}
          >
            {" "}
            {moment(Date.parse(element.createdAt)).format(
              "YY-MM-DD kk:mm:ss"
            )}{" "}
          </div>
          <div
            className="w-25 text-success"
            style={{ display: "inline-block" }}
          >
            {" "}
            {action}{" "}
          </div>
        </div>
      );
    });
  } else listItems = <div />;

  return [header, listItems];
};

export default BuyOrderDetail;
