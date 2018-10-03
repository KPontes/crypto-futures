import openSocket from "socket.io-client";

const socket = openSocket("http://localhost:8000");
//const socket = openSocket("http://192.168.0.20:8000");

function subscribeToTrades(cb) {
  socket.on("newtrade", data => {
    cb(null, data);
    //console.log("data", data);
  });

  socket.emit("subscribeToTrades", 5000);
}
export { subscribeToTrades };
