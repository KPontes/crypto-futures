import { combineReducers } from "redux";
import ActiveUser from "./reducer_active_user";

const rootReducer = combineReducers({
  activeUser: ActiveUser
});

export default rootReducer;
