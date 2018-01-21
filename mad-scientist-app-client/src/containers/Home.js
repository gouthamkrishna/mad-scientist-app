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
      coins: [],
      listFavs: []
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
        home.setState({ coins: result},function() {
          var mArray = home.state.listFavs;
          var mFav = home.state.favs;
          var mCoin = home.state.coins;
          for (var fav of mFav) {
            for (var coin of mCoin) {
              if (fav.currency === coin.id) {
                coin.coinId = fav.coinId;
                mArray.push(coin);
              }
            }
          }
          home.setState({
            listFavs: mArray
          })
        });
      });
    }

  }

  favs() {
    return invokeApig({ path: "/coinlist" });
  }

  renderFavList(favs) {
    return favs.map(
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
             <center>
              <Button onClick={this.handleRemoveFav.bind(this, coin)}
                color='green'>Remove Fav</Button>
            </center>
            </Table.Cell>
          </Table.Row>
    );
  }

  handleAddFav(coin) {
    invokeApig ({
      path: "/coinlist",
      method: "POST",
      body: {
        currency: coin.id
      }
    })
    var mArray = this.state.listFavs;
    mArray.push(coin);
    this.setState({ listFavs: mArray });
  }

  handleRemoveFav(coin) {
    invokeApig ({
      path: "/coinlist/"+coin.coinId,
      method: "DELETE"
    });
    var mArray = this.state.listFavs;
    mArray = mArray.filter(item => item != coin)
    this.setState({ listFavs: mArray });
  }

  renderCoinList(coins) {
    var mArray = this.state.listFavs;
    var isDisabled = false;
    return coins.map(
      (coin,i) =>{
      for (var item of mArray) {
        if (item.id === coin.id) {
          isDisabled = true;
          break;
        } else {
          isDisabled = false;
        }
      }
      return (
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
             <center>
              <Button disabled={isDisabled}
                onClick={this.handleAddFav.bind(this, coin)}
                color='green'>Add Fav</Button>
            </center>
            </Table.Cell>
          </Table.Row>
        );
    });
  }

  renderFavs() {
    return (
      <div className="favs">
        <PageHeader>Your favourite coins</PageHeader>
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
          {!this.state.isLoading && this.props.isFavList && this.renderFavList(this.state.listFavs)}
          </Table.Body>
    </Table>
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
