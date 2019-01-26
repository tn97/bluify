import axios from 'axios';

export default {
  refreshToken : function (refreshToken) {
    return axios.get('/api/auth/refresh', {
      params: {
        refresh_token: refreshToken
      }
    })
  },

  getSpotifyProfile : function (accessToken) {
    return axios.get('https://api.spotify.com/v1/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    })
  },
  
  getSpotifyPlaylists : function (accessToken) {
    return axios.get(`https://api.spotify.com/v1/me/playlists`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
      params: {
        limit: 50
      }
    })
  },

  getSpotifyDevices : function (accessToken) {
    return axios.get(`https://api.spotify.com/v1/me/player/devices`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    })
  },

  setWebPlayer : function (playerId, accessToken) {
    return axios.put(`https://api.spotify.com/v1/me/player`, {
      "device_ids": [playerId]
    }, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    })
  },

  getPlaylistTracks : function(userId, playlistId, accessToken) {
    return axios.get(`https://api.spotify.com/v1/users/${userId}/playlists/${playlistId}/tracks`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    })
  },

  playTrack: function(spotifyURI, playerId, accessToken) {
    console.log(playerId, spotifyURI);
    return axios.put(`https://api.spotify.com/v1/me/player/play?device_id=${playerId}`, {
      "uris": [spotifyURI]
    }, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    })
  }
}