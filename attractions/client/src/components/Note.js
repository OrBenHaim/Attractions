import React from "react";
import classes from '../containers/App.css'

function Note(props) {
  return (
    <div className={classes.note}>
      <h1>{props.title}</h1>
      <p>{props.content}</p>
    </div>
  );
}

export default Note;
