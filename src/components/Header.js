import React from "react";
import { Navbar } from "react-bootstrap";
import LogoutBtn from "./Auth/LogoutBtn";

const Header = ({ logoutHandler }) => (
  <Navbar className="justify-content-between">
    <Navbar.Brand>React Hasura-GraphQL Toddo App</Navbar.Brand>
    <Navbar.Collapse className="justify-content-end">
      <LogoutBtn logoutHandler={logoutHandler} />
    </Navbar.Collapse>
  </Navbar>
);

export default Header;
