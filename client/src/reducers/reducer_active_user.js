//state argument is not the application level state,
//but only the state this reducer is responsible for
//the null attribution is a ES6 syntax means if state=undefined, set it to null
//as undefined causes an error thrown
export default function(state = null, action) {
  switch (action.type) {
    case "USER_SELECTED":
      return action.payload;
  }
  //if the action does not matter
  return state;
}

// export default function() {
//   return {
//     address: "0x3c511616bA2F6bD8Aa4e1e9Cdc20389dC6B6b107",
//     pk: "0x8f4149e18266e094b93069475de230f6a6f74fb2c9ecf044130aeaf90d400bb5"
//   };
// }
