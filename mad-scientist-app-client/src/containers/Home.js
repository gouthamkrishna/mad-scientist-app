import React, { Component } from "react";
import { PageHeader, ListGroup, ListGroupItem } from "react-bootstrap";
import "./Home.css";
import { invokeApig } from "../libs/awsLib";
import { Table, Button } from 'semantic-ui-react';

export default class Home extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: true,
      favs: [],
      coins: []
    };
  }

  async componentDidMount() {
    if (!this.props.isAuthenticated) {
      return;
    }

    try {
      const results = await this.favs();
      this.fetchFirst("https://api.coinmarketcap.com/v1/ticker/");
      this.setState({ favs: results });
    } catch (e) {
      alert(e);
    }

    this.setState({ isLoading: false });
  }

  fetchFirst (url) {
    var home = this;
    if (url) {
      fetch(url).then(function (response){
        return response.json();
      }).then(function (result) {
        home.setState({ coins: result});
      });
    }
  }

  favs() {
    return invokeApig({ path: "/coinlist" });
  }

  renderFavList(favs) {
    return [{}].concat(favs).map(
      (currency, i) =>
        i !== 0
          ? <ListGroupItem
               key={currency.coinId}
               href={`/coinlist/${currency.coinId}`}
               onClick={this.handleCoinClick}
               header={currency.currency.trim().split("\n")[0]}
               >
            {"Created: " + new Date(currency.createdAt).toLocaleString()}
            </ListGroupItem>
          : <ListGroupItem
               key="global"
               >
              <h4>
              <b>{"\uFF0B"}</b> Global data
              </h4>
            </ListGroupItem>
     );
  }

  handleCoinClick = event => {
    event.preventDefault();
    this.props.history.push(event.currentTarget.getAttribute("href"));
  }

  renderCoinList(coins) {
    return coins.map(
      (coin,i) =>
          <Table.Row>
            <Table.Cell>
               {coin.rank}
            </Table.Cell>
            <Table.Cell>
               {coin.name}
            </Table.Cell>
            <Table.Cell>
               {coin.symbol}
            </Table.Cell>
            <Table.Cell>
               {coin.price_usd}
            </Table.Cell>
            <Table.Cell>
               {coin.price_btc}
            </Table.Cell>
            <Table.Cell>
               {coin.percent_change_24h}
            </Table.Cell>
            <Table.Cell>
              <Button color='blue'>Blue</Button>
            </Table.Cell>
          </Table.Row>
    );
  }

  renderFavs() {
    return (
      <div className="favs">
        <PageHeader>Your favourite coins</PageHeader>
        <ListGroup>
          {!this.state.isLoading && this.props.isFavList && this.renderFavList(this.state.favs)}
        </ListGroup>
      </div>
    );
  }

  renderLander() {
    return (
      <div className="coins">
        <PageHeader>List of all coins</PageHeader>
          <Table inverted>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Rank</Table.HeaderCell>
                <Table.HeaderCell>Name</Table.HeaderCell>
                <Table.HeaderCell>Symbol</Table.HeaderCell>
                <Table.HeaderCell>Price USD</Table.HeaderCell>
                <Table.HeaderCell>Price BTC</Table.HeaderCell>
                <Table.HeaderCell>% Change in 24h</Table.HeaderCell>
                <Table.HeaderCell>Add to Favourites</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
                <Table.Body>
                  {!this.props.isFavList && this.renderCoinList(this.state.coins)}
                </Table.Body>
          </Table>
      </div>
    );
  }

  render() {
    return (
      <div className="Home">
        {this.props.isAuthenticated ? (this.props.isFavList ? this.renderFavs()
          : this.renderLander()) : this.renderLander()}
      </div>
    );
  }
}
