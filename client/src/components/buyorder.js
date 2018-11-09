import React from "react";

const BuyOrder = props => {
  //console.log("tradeObj", props.exchangeObj);
  let listItems;
  let header = "";
  if (props.exchangeObj.buyorders && props.exchangeObj.buyorders.length > 0) {
    header = (
      <div className="text-success" style={{ fontSize: "small" }}>
        Buy Orders
        <div className="row" style={{ fontSize: "small" }}>
          <div className="col text-success" style={{ display: "inline-block" }}>
            price
          </div>
          <div className="col text-success" style={{ display: "inline-block" }}>
            volume
          </div>
        </div>
      </div>
    );
    const arrData = props.exchangeObj.buyorders;
    listItems = arrData.map(element => {
      return (
        <div className="row" style={{ fontSize: "small" }}>
          <div className="col text-success" style={{ display: "inline-block" }}>
            {" "}
            {Number(element.dealPrice).toFixed(2)}{" "}
          </div>
          <div className="col text-success" style={{ display: "inline-block" }}>
            {element.contractsAmount}{" "}
          </div>
        </div>
      );
    });
  } else listItems = <div />;

  return [header, listItems];
};

export default BuyOrder;
