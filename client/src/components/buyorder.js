import React from "react";

const BuyOrder = props => {
  //console.log("tradeObj", props.exchangeObj);
  let listItems;
  let header = "";
  if (props.exchangeObj.buyorder) {
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
        <div>
          <div
            className="w-50 text-success"
            style={{ display: "inline-block" }}
          >
            {" "}
            {element.dealPrice}
          </div>
          <div
            className="w-50 text-success"
            style={{ display: "inline-block" }}
          >
            {" "}
            {element.contractsDealed}{" "}
          </div>
        </div>
      );
    });
  } else listItems = <div>Empty buy list</div>;

  return [header, listItems];
};

export default BuyOrder;
