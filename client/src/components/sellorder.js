import React from "react";

const SellOrder = props => {
  //console.log("tradeObj", props.exchangeObj);
  let listItems;
  let header = "";
  if (props.exchangeObj.sellorder) {
    header = (
      <div>
        <div className="w-50 text-danger">Sell Order</div>
        <div className="w-50 text-danger" style={{ display: "inline-block" }}>
          price
        </div>
        <div className="w-50 text-danger" style={{ display: "inline-block" }}>
          volume
        </div>
      </div>
    );
    const arrData = props.exchangeObj.sellorder;
    listItems = arrData.map(element => {
      return (
        <div>
          <div className="w-50 text-danger" style={{ display: "inline-block" }}>
            {" "}
            {element.dealPrice}{" "}
          </div>
          <div className="w-50 text-danger" style={{ display: "inline-block" }}>
            {" "}
            {element.contractsDealed}{" "}
          </div>
        </div>
      );
    });
  } else listItems = <div>Empty sell list</div>;

  return [header, listItems];
};

export default SellOrder;
