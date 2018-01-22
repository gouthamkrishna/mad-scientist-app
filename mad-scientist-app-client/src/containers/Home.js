import React, { Component } from "react";
import "./Home.css";
import { invokeApig } from "../libs/awsLib";
import { Table, Button, PageHeader, Modal } from "react-bootstrap"
import LoaderButton from "../components/LoaderButton";

export default class Home extends Component {
  constructor(props) {
    super(props);

    this.state = {
      modalItem: [],
      open: false,
      isLoading: true,
      favs: [],
      coins: [],
      listFavs: []
    };
  }

  async componentWillMount() {
    if (!this.props.isAuthenticated) {
      this.fetchLander("https://api.coinmarketcap.com/v1/ticker/");
      return;
    }

    try {
      const results = await this.favs();
      this.setState({ favs: results });
      this.fetchLoggedIn("https://api.coinmarketcap.com/v1/ticker/");
    } catch (e) {
      alert(e);
    }

  }

  fetchLander (url) {
    var home = this;

    if(url) {
      fetch(url).then(function (response){
        return response.json();
      }).then(function (result) {
        home.setState({ coins: result});
      });
    }

  }

  fetchLoggedIn (url) {
    var home = this;

    if (url) {
      fetch(url).then(function (response){
        return response.json();
      }).then(function (result) {
        home.setState({ coins: result }, function() {
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
            listFavs: mArray,
            isLoading: false
          })
        });
      });
    }
  }

  favs() {
    return invokeApig({ path: "/coinlist" });

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
    mArray = mArray.filter(item => item !== coin)
    this.setState({ listFavs: mArray });
  }

  showModal = modalItem => () => {
    var mArray = Object.values(modalItem);
    this.setState({ modalItem: mArray, open: true })
  }
  closeModal = () => this.setState({ open: false })

  renderFavList(favs) {
    return favs.map(
      (coin,i) =>
      <tr>
        <td>{coin.rank}</td>
        <td>{coin.name}</td>
        <td>{coin.symbol}</td>
        <td>{coin.price_usd}</td>
        <td>{coin.price_btc}</td>
        <td>{coin.percent_change_24h+"%"}</td>
        <td>
          <center>
            <Button onClick={this.showModal(coin)}
              color='blue'>View</Button>
          </center>
        </td>
        <td>
          <center>
            <Button onClick={this.handleRemoveFav.bind(this, coin)}
              color='green'>Remove Fav</Button>
          </center>
        </td>
      </tr>
    );
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
          <tr>
            <td>{coin.rank}</td>
            <td>{coin.name}</td>
            <td>{coin.symbol}</td>
            <td>{coin.price_usd}</td>
            <td>{coin.price_btc}</td>
            <td>{coin.percent_change_24h+"%"}</td>
            <td hidden={!this.props.isAuthenticated}>
             <center>
              <Button disabled={isDisabled}
                onClick={this.handleAddFav.bind(this, coin)}
                color='green'>Add Fav</Button>
            </center>
            </td>
          </tr>
        );
    });
  }

  renderFavs() {
    return (
      <div className="favs">
        <PageHeader size='huge'>Your favourite coins</PageHeader>
        {this.state.isLoading ?
          <center>
            <LoaderButton
        	    block
        	    bsSize="large"
        	    disabled={this.state.isLoading}
        	    isLoading={this.state.isLoading}
        	    text="Loading"
        	    loadingText="Loading your favs..."
        	  />
          </center>
        : <Table responsive>
            <thead>
              <tr>
                <th>Rank</th>
                <th>Name</th>
                <th>Symbol</th>
                <th>Price USD</th>
                <th>Price BTC</th>
                <th>Change in 24h</th>
                <th>View Details</th>
                <th>Remove Favourites</th>
              </tr>
            </thead>
                <tbody>
            {this.props.isFavList && this.renderFavList(this.state.listFavs)}
            </tbody>
          </Table>
        }
        {this.renderModal()}
      </div>
    );
  }

  renderLander() {
    return (
      <div className="coins">
        <PageHeader size='huge'>List of all coins</PageHeader>
          <Table responsive>
            <thead>
              <tr>
                <th>Rank</th>
                <th>Name</th>
                <th>Symbol</th>
                <th>Price USD</th>
                <th>Price BTC</th>
                <th>Change in 24h</th>
                <th hidden={!this.props.isAuthenticated}>Add to Favourites</th>
              </tr>
            </thead>
                <tbody>
                  {!this.props.isFavList && this.renderCoinList(this.state.coins)}
                </tbody>
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

  renderModal() {
    var mArray = this.state.modalItem;
    return (
      <Modal size={'small'} show={this.state.open} onHide={this.closeModal}>
        <Modal.Header>
          <Modal.Title>{mArray[1]}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="modalbody">
          <Table responsive>
            <tbody  style={{border: 'hidden'}}>
              <tr>
                <td>Rank</td>
                <td>:</td>
                <td >{mArray[3]}</td>
                <td>Symbol</td>
                <td>:</td>
                <td>{mArray[2]}</td>
              </tr>
              <tr>
                <td>Name</td>
                <td>:</td>
                <td >{mArray[1]}</td>
                <td>Price USD</td>
                <td>:</td>
                <td>{mArray[4]}</td>
              </tr>
              <tr>
                <td>Price BTC</td>
                <td>:</td>
                <td >{mArray[5]}</td>
                <td>24h Volume</td>
                <td>:</td>
                <td>{mArray[6]}</td>
              </tr>
              <tr>
                <td>Market Cap</td>
                <td>:</td>
                <td >{mArray[7]}</td>
                <td>Available Supply</td>
                <td>:</td>
                <td>{mArray[8]}</td>
              </tr>
              <tr>
                <td>Total Supply</td>
                <td>:</td>
                <td >{mArray[9]}</td>
                <td>Max Supply</td>
                <td>:</td>
                <td>{mArray[10]}</td>
              </tr>
              <tr>
                <td>Change 1H</td>
                <td>:</td>
                <td >{mArray[11]+"%"}</td>
                <td>Chande 1D</td>
                <td>:</td>
                <td>{mArray[12]+"%"}</td>
              </tr>
              <tr>
                <td>Change 1W</td>
                <td>:</td>
                <td >{mArray[13]+"%"}</td>
                <td>Last Updated</td>
                <td>:</td>
                <td>{new Date(mArray[14]*1000).toString().substring(0,24)}</td>
              </tr>
            </tbody>
          </Table>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={this.closeModal}>
            Done
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}
