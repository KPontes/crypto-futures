import React from "react";

const SellOrder = props => {
  //console.log("tradeObj", props.exchangeObj);
  let listItems;
  let header = "";
  if (props.exchangeObj.sellorders && props.exchangeObj.sellorders.length > 0) {
    header = (
      <div className="text-danger" style={{ fontSize: "small" }}>
        Sell Orders
        <div className="row" style={{ fontSize: "small" }}>
          <div className="col text-danger" style={{ display: "inline-block" }}>
            price
          </div>
          <div className="col text-danger" style={{ display: "inline-block" }}>
            volume
          </div>
        </div>
      </div>
    );
    const arrData = props.exchangeObj.sellorders;
    listItems = arrData.map(element => {
      return (
        <div className="row" style={{ fontSize: "small" }}>
          <div className="col text-danger" style={{ display: "inline-block" }}>
            {" "}
            {Number(element.dealPrice).toFixed(2)}{" "}
          </div>
          <div className="col text-danger" style={{ display: "inline-block" }}>
            {" "}
            {element.contractsAmount}{" "}
          </div>
        </div>
      );
    });
  } else listItems = <div />;

  return [header, listItems];
};

export default SellOrder;
