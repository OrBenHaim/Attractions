import React, { Component } from 'react';
import appClass from './App.css'
import Note from '../components/Note'

class App extends Component {
  constructor(props) {
    super(props);
    this.x = null
    this.position = {}
  }

  state = {
    location: false
  };

  componentDidMount() {
    this.getLocation();
  }


  getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(this.showPosition, this.showError);
    } else {
      this.x = "Geolocation is not supported by this browser.";
    }
  }

  showPosition = (position) => {
    this.position.latitude = position.coords.latitude
    this.position.longitude = position.coords.longitude
    this.x = (<div>
      Latitude {position.coords.latitude}
      <br />
      Longitude {position.coords.longitude}
    </div>);
  }
  showError(error) {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        this.x = "User denied the request for Geolocation."
        break;
      case error.POSITION_UNAVAILABLE:
        this.x = "Location information is unavailable."
        break;
      case error.TIMEOUT:
        this.x = "The request to get user location timed out."
        break;
      case error.UNKNOWN_ERROR:
        this.x = "An unknown error occurred."
        break;
      default:
        this.x = null
    }
  }


  render() {
    console.log('[App.js] render');
    return (
      <div className={appClass.App}>
        <button onClick={() => this.setState({ location: true })} className={appClass["cybr-btn"]}>
          Get location<span aria-hidden>_</span>
          <span aria-hidden className={appClass["cybr-btn__glitch"]}>Get location</span>
          <span aria-hidden className={appClass["cybr-btn__tag"]}></span>
        </button>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        {this.state.location ? (

          <button className={appClass["cybr-btn"]}>
            <form method="GET" action="https://attractions-with-location.herokuapp.com/api"><button className={appClass["cybr-btn"]} type="submit">Get nearby attraction</button><span aria-hidden>_</span>
              <input type="hidden" name="latitude" value={this.position.latitude} />
              <input type="hidden" name="longitude" value={this.position.longitude} />
              <span aria-hidden className={appClass["cybr-btn__glitch"]}></span>
              <span aria-hidden className={appClass["cybr-btn__tag"]}></span></form>
          </button>) : null}

        {this.state.location ? (
          <div>
            <Note content={this.x}></Note>
          </div>) : null}
      </div>
    );

  }
}
export default App;
