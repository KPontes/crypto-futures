import React from "react";

const Trades = props => {
  //console.log("tradeObj", props.exchangeObj);
  let listItems;
  let header = "";
  if (props.exchangeObj.trades) {
    header = (
      <div>
        <div>Trade</div>
        <div className="w-50" style={{ display: "inline-block" }}>
          price
        </div>
        <div className="w-50" style={{ display: "inline-block" }}>
          volume
        </div>
      </div>
    );
    const arrData = props.exchangeObj.trades;
    listItems = arrData.map(element => {
      return (
        <div>
          <div className="w-50" style={{ display: "inline-block" }}>
            {" "}
            {element.dealPrice}{" "}
          </div>
          <div className="w-50" style={{ display: "inline-block" }}>
            {" "}
            {element.contractsAmount}{" "}
          </div>
        </div>
      );
    });
  } else listItems = <div>Empty trade list</div>;

  return [header, listItems];
};

export default Trades;
