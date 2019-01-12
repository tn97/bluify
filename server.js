const express = require('express');
const session = require('express-session');
const morgan = require('morgan');
const cors = require('cors');
require('dotenv').config();

// Import routes
const routes = require('./routes');

// Set up the express server
const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.urlencoded({extended: true}));
app.use(express.json());
// app.use(cors());
// app.use(morgan('dev')); // for logging

//We need to use sessions to keep track of our user's login status
// app.use(session({secret: 'keyboard cat', resave: true, saveUninitialized: true}));

//serve up static assets (for heroku)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/build'));
} // add routes, both API and route to client/build
app.use('/', routes);

// Start the API server
app.listen(PORT, () => {
  console.log(`API Server now listening on PORT ${PORT}~`);
});