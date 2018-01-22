import React from "react";
import { Route } from "react-router-dom";
import { NavItem } from "react-bootstrap";

export default props =>
  <Route
    path={props.href}
    exact
    children={({ match, history }) =>
      <NavItem style={{color:'#b0b1e1'}}
        onClick={e => history.push(e.currentTarget.getAttribute("href"))}
        {...props}
        active={match ? true : false}
      >
        {props.children}
      </NavItem>}
  />;
