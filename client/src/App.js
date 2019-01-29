import React, { Component } from 'react';
import API from './utils/API';
import './App.css'

// for scoping
let player;

class App extends Component {
  state = {
    showPlaylist: false
  }

  componentDidMount() {
    const params = this.getHashParams();
    // if there's an access token, initialize the player
    (Object.keys(params).length) ? this.initializePlayer(params.access_token) : console.log("not loaded");
    (Object.keys(params).length) ? this.getSpotifyProfile(params.access_token) : console.log("not loaded");
    this.setState(params);
  }


  initializePlayer = (token) => {
    const that = this;
    window.onSpotifyWebPlaybackSDKReady = () => {
      player = new window.Spotify.Player({
        name: 'Bluify Web-Player',
        getOAuthToken: cb => {
          cb(token);
        }
      });

      // Error handling
      player.addListener('initialization_error', ({ message }) => {
        console.error(message);
      });
      player.addListener('authentication_error', ({ message }) => {
        console.error(message);
      });
      player.addListener('account_error', ({ message }) => {
        console.error(message);
      });
      player.addListener('playback_error', ({ message }) => {
        console.error(message);
      });

      // Playback status updates
      player.addListener('player_state_changed', state => {
        console.log(state);
      });

      // Ready
      player.addListener('ready', ({ device_id }) => {
        console.log('Ready with Device ID', device_id);
        that.getSpotifyDevices(token)
      });

      // Not Ready
      player.addListener('not_ready', ({ device_id }) => {
        console.log('Device ID has gone offline', device_id);
      });

      // Connect to the player!
      player.connect();
    };
  }

  // get spotify devices
  getSpotifyDevices = (access_token) => {
    API.getSpotifyDevices(access_token)
      .then(res => {
        console.log(res.data);
        const webPlayer = res.data.devices.find(player => {
          return player.name === "Bluify Web-Player"
        })
        console.log(webPlayer)
        API.setWebPlayer(webPlayer.id, access_token)
          .then(res => {
            console.log(res.data);
            this.setState({
              activePlayer: webPlayer
            })
          })
          .catch(err => console.log(err))
      })
      .catch(err => console.log(err))
  }

  // get params out of url
  getHashParams = () => {
    const hashParams = {};
    let e,
      r = /([^&;=]+)=?([^&;]*)/g,
      q = window
        .location
        .hash
        .substring(1);

    while (e = r.exec(q)) {
      hashParams[e[1]] = decodeURIComponent(e[2]);
    }
    // remove hash stuff
    window
      .history
      .pushState("", document.title, window.location.pathname + window.location.search);

    return hashParams;
  }

  // get refresh token
  getRefreshToken = () => {
    API
      .refreshToken(this.state.refresh_token)
      .then(res => {
        this.setState({ access_token: res.data.access_token })
      })
      .catch(err => {
        console.log(err);
      })
  }

  // get user profile
  getSpotifyProfile = (access_token) => {
    API
      .getSpotifyProfile(access_token)
      .then(res => {
        this.setState({ userInfo: res.data });
      })
      .catch(err => console.log(err));
  }

  // get user playlists
  getSpotifyPlaylists = () => {
    API
      .getSpotifyPlaylists(this.state.access_token)
      .then(res => {
        this.setState({
          playlistData: res.data,
          showPlaylist: false
        })
      })
      .catch(err => console.log(err));
  }

  // get playlist tracks
  getPlaylistTracks = (playlistId) => {
    API.getPlaylistTracks(this.state.userInfo.id, playlistId, this.state.access_token)
      .then(res => {
        this.setState({
          activePlaylist: res.data,
          showPlaylist: true
        })
      })
      .catch(err => {
        console.log(err);
      });
  }

  playTrack = (songURI) => {
    console.log(songURI);
    API
      .playTrack(songURI, this.state.activePlayer.id, this.state.access_token)
      .then(res => {
        console.log(res.data);
      })
      .catch(err => { console.log(err) });
  }

  pauseTrack = () => {
    console.log("access token: " + this.state.access_token)
    API
      .pauseTrack(this.state.access_token, this.state.activePlayer.id)
      .then(res => {
        console.log(res.data);
      })
      .catch(err => { console.log(err) });
  }

  // stopped after inserting pauseTrack into app.js and API.js. Issue- Cannot read state from browser in order to get access_token to pause music's play state.

  render() {
    return (
      <div>
        <div className="row justify-content-center align-items-center">
          <div className="col-12 text-align-center">
            {!this.state.access_token
              ? (
                <div className="disclaimerBox rounded">
                  <a
                    className="center btn btn-lg loginBtn"
                    href="http://localhost:3001/api/auth/login">Log Into Spotify!
                    </a>
                  <h3 className="center textColor">Disclaimer:</h3>
                  <p className="center textColor">This requires for you to own your own Spotify Premium account</p>
                </div>
              )
              : (
                <div>
                  <button className="btn btn-lg btn-danger" onClick={this.getRefreshToken}>
                    Get Refresh Token
                    </button>
                  <button className="btn btn-lg btn-success" onClick={this.getSpotifyProfile}>
                    Get User Info
                    </button>
                  <button className="btn btn-lg btn-info" onClick={this.getSpotifyPlaylists}>
                    Get Playlists
                    </button>
                  <button className="btn btn-lg btn-warning" onClick={this.pauseTrack}>
                    Pause
                    </button>
                </div>
              )}
          </div>
        </div>
        <div className="masterContainer">
          <div className="contentContainer">
            {this.state.userInfo
              ? (
                <h2 className="textColor welcome">Welcome {this.state.userInfo.display_name}!</h2>
              )
              : ""}
          </div>

          {(this.state.playlistData && !this.state.showPlaylist)
            ? (this.state.playlistData.items.map(playlist => {
              return (
                <div className="col-12" key={playlist.id}>
                  <a onClick={() => this.getPlaylistTracks(playlist.id)} className="dataTag">{playlist.name}</a>
                </div>
              )
            }))
            : (this.state.activePlaylist ? (
              <div className="list-group">
                {this.state.activePlaylist.items.map(songData => {
                  return (
                    <a className="dataTag" onClick={() => this.playTrack(songData.track.uri)}>{songData.track.name} by {songData.track.artists[0].name}</a>
                  )
                })}
              </div>
            ) : "")}
        </div>
      </div>
    );
  }
}

export default App;
