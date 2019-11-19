import React, { Fragment } from "react";
import SpinnerGif from "../../img/spinner.gif";

const Spinner = () => {
  return <Fragment>
      <img 
        src={SpinnerGif}
        style={{ width: '200px', position: 'center', margin: 'auto', display: 'bloack'}}
        alt="Loading..."
    />
  </Fragment>
};

export default Spinner;
