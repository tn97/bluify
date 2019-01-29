import React, {Component} from 'react';
import API from '../utils/API';

class GetPlaylist extends Component {
  getSpotifyPlaylists = () => {
    API
    .getSpotifyPlaylists(this.state.access_token)
    .then(res => {
      this.setState({playlistData: res.data})
    })
    .catch(err => console.log(err));
  }

  render() {
    return (
      <div>
        <div className="row">
         <img className='playlistImage' src={playlist.images[0].url} alt='playlist cover'/>
         <p>
           ${playlist.name}
         </p>
         <h4>
           Playlist tracks: ${playlist.tracks.total}
         </h4>
        </div>
       

      </div>
    )
  }
}

