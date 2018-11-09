import React from "react";

const Trades = props => {
  //console.log("tradeObj", props.exchangeObj);
  let listItems;
  let header = "";
  if (props.exchangeObj.trades) {
    header = (
      <div style={{ fontSize: "small" }}>
        Trades
        <div className="row" style={{ fontSize: "small" }}>
          <div className="col" style={{ display: "inline-block" }}>
            price
          </div>
          <div className="col" style={{ display: "inline-block" }}>
            volume
          </div>
        </div>
      </div>
    );
    const arrData = props.exchangeObj.trades;
    listItems = arrData.map(element => {
      return (
        <div className="row" style={{ fontSize: "small" }}>
          <div className="col" style={{ display: "inline-block" }}>
            {" "}
            {Number(element.dealPrice).toFixed(2)}{" "}
          </div>
          <div className="col" style={{ display: "inline-block" }}>
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
