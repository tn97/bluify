const router = require('express').Router();
const querystring = require('querystring');
const request = require('request');
require('dotenv').config();
// const usersController = require('../../controllers/usersController'

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
const generateRandomString = function (length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

const stateKey = 'spotify_auth_state';

router
  .route('/login')
  .get((req, res) => {
    const state = generateRandomString(16);
    // set cookie
    res.cookie(stateKey, state);

    // your application requests authorization
    const scope = 'streaming user-read-birthdate user-read-private user-read-email user-read-playback-state user-modify-playback-state user-library-read';
    // authorize account and send to callback route
    res.redirect('https://accounts.spotify.com/authorize?' + querystring.stringify({response_type: 'code', client_id: process.env.SPOTIFY_CLIENT, scope: scope, redirect_uri: 'http://localhost:3001/api/auth/spotify/callback', state: state}));
  });

// callback route
router
  .route('/spotify/callback')
  .get((req, res) => {
    // your application requests refresh and access tokens after checking the state
    // parameter these are coming from above
    const code = req.query.code || null;
    const state = req.query.state || null;
    const storedState = req.cookies
      ? req.cookies[stateKey]
      : null;

    // if there's no information coming back then send error (CHANGE THIS TO JSON
    // RESPONSE)
    if (state === null || state !== storedState) {
      res.redirect('/#' + querystring.stringify({error: 'state_mismatch'}));
    } else {
      // if it's good, clear cookie
      res.clearCookie(stateKey);

      // create authorization options
      const authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        form: {
          code: code,
          redirect_uri: 'http://localhost:3001/api/auth/spotify/callback',
          grant_type: 'authorization_code'
        },
        headers: {
          'Authorization': 'Basic ' + (new Buffer(process.env.SPOTIFY_CLIENT + ':' + process.env.SPOTIFY_SECRET).toString('base64'))
        },
        json: true
      };

      // send auth options to spotify to set access token
      request.post(authOptions, function (error, response, body) {
        if (!error && response.statusCode === 200) {

          var access_token = body.access_token,
            refresh_token = body.refresh_token;

          var options = {
            url: 'https://api.spotify.com/v1/me',
            headers: {
              'Authorization': 'Bearer ' + access_token
            },
            json: true
          };

          // use the access token to access the Spotify Web API
          request.get(options, function (error, response, body) {
            console.log(body);
          });

          // we can also pass the token to the browser to make requests from there
          // res.redirect('/#' + querystring.stringify({access_token: access_token, refresh_token: refresh_token}));
          res.redirect('http://localhost:3000/#' + querystring.stringify({access_token: access_token, refresh_token: refresh_token}));
        } else {
          res.redirect('/#' + querystring.stringify({error: 'invalid_token'}));
        }
      });
    }
  });

// refresh token route should look like
// http://localhost:3001/api/auth/refresh?refresh_token=12345
router
  .route('/refresh')
  .get((req, res) => {
    // requesting access token from refresh token
    const refresh_token = req.query.refresh_token;
    const authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      headers: {
        'Authorization': 'Basic ' + (new Buffer(process.env.SPOTIFY_CLIENT + ':' + process.env.SPOTIFY_SECRET).toString('base64'))
      },
      form: {
        grant_type: 'refresh_token',
        refresh_token: refresh_token
      },
      json: true
    };

    request.post(authOptions, function (error, response, body) {
      if (!error && response.statusCode === 200) {
        var access_token = body.access_token;
        res.json({'access_token': access_token});
      }
    });
  });

module.exports = router;
