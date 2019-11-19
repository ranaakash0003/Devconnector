import { SET_ALERT, REMOVE_ALERT } from "./types";
import uuid from "uuid";

export const setAlert = (msg, alertType) => {
  const id = uuid.v4();
  return {
    type: SET_ALERT,
    payload: { msg, alertType, id },
    // removeAlert: (dispatch) =>
    //   setTimeout(() => dispatch({ type: REMOVE_ALERT, payload: id }), 3000)
  };
};
