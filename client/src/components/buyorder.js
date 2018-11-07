import React from "react";

const BuyOrder = props => {
  //console.log("tradeObj", props.exchangeObj);
  let listItems;
  let header = "";
  if (props.exchangeObj.buyorder && props.exchangeObj.buyorder.length > 0) {
    header = (
      <div>
        <div className="w-50 text-success">Buy Order</div>
        <div className="w-50 text-success" style={{ display: "inline-block" }}>
          price
        </div>
        <div className="w-50 text-success" style={{ display: "inline-block" }}>
          volume
        </div>
      </div>
    );
    const arrData = props.exchangeObj.buyorder;
    listItems = arrData.map(element => {
      return (
        <div style={{ fontSize: "small" }}>
          <div
            className="w-50 text-success"
            style={{ display: "inline-block" }}
          >
            {" "}
            {Number(element.dealPrice).toFixed(2)}{" "}
          </div>
          <div
            className="w-50 text-success"
            style={{ display: "inline-block" }}
          >
            {" "}
            {element.contractsAmount}{" "}
          </div>
        </div>
      );
    });
  } else listItems = <div />;

  return [header, listItems];
};

export default BuyOrder;
