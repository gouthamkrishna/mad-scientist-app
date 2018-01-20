import React, { Component } from "react";
import "./App.css";
import Routes from "./Routes";
import { Link, withRouter } from "react-router-dom";
import { Nav, Navbar, NavItem } from "react-bootstrap";
import RouteNavItem from "./components/RouteNavItem";
import { authUser, signOutUser } from "./libs/awsLib";

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isAuthenticated: false,
      isAuthenticating: true,
      isFavList: false
    };
  }

  userHasAuthenticated = authenticated => {
    this.setState({ isAuthenticated: authenticated });
    this.setState({ isFavList: authenticated });
  }

  handleLogout = event => {
    signOutUser();
    this.userHasAuthenticated(false);
    this.props.history.push("/login");
  }

  handleFavSwitch = event => {
    this.setState({ isFavList: !this.state.isFavList });
  }

  async componentDidMount() {
    try {
      if (await authUser()) {
        this.userHasAuthenticated(true);
      }
    }
    catch(e) {
      alert(e);
    }

    this.setState({ isAuthenticating: false });
  }

  render() {
    const childProps = {
      isAuthenticated: this.state.isAuthenticated,
      userHasAuthenticated: this.userHasAuthenticated,
      isFavList: this.state.isFavList
    };

    return (
      !this.state.isAuthenticating &&
      <div className="App container">
        <Navbar fluid collapseOnSelect>
          <Navbar.Header>
            <Navbar.Brand>
              <Link to="/">Mad Scientist</Link>
            </Navbar.Brand>
            <Navbar.Toggle />
          </Navbar.Header>
          <Navbar.Collapse>
            <Nav pullRight>
              {this.state.isAuthenticated
                ? [
            		    <NavItem onClick={this.handleFavSwitch} disabled={!this.state.isFavList}>
            		      All Coins
            		    </NavItem>,
            		    <NavItem onClick={this.handleFavSwitch} disabled={this.state.isFavList}>
            		      Favorites
            		    </NavItem>,
            		    <NavItem onClick={this.handleLogout}>
            		      Logout
            		    </NavItem>
		              ]
                : [
                    <RouteNavItem key={1} href="/signup">
                      Signup
                    </RouteNavItem>,
                    <RouteNavItem key={2} href="/login">
                      Login
                    </RouteNavItem>
                  ]}
            </Nav>
          </Navbar.Collapse>
        </Navbar>
        <Routes childProps={childProps} />
      </div>
    );
  }
}

export default withRouter(App);
