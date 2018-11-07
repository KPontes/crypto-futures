import React from "react";
import moment from "moment";

const SellOrderDetail = props => {
  //console.log("tradeObj", props.exchangeObj);
  let listItems;
  let header = "";
  if (props.exchangeObj.sellorder && props.exchangeObj.sellorder.length > 0) {
    header = (
      <div>
        <div className="w-100 text-danger">detail </div>
        <div className="w-75 text-danger" style={{ display: "inline-block" }}>
          date
        </div>
        <div className="w-25 text-danger" style={{ display: "inline-block" }}>
          action
        </div>
      </div>
    );
    const arrData = props.exchangeObj.sellorder;
    listItems = arrData.map(element => {
      var action = "";
      if (!element.tradeKey) {
        action = "cancel";
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
