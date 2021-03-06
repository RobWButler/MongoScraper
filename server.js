var express = require('express');
var mongoose = require('mongoose');

// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var axios = require('axios');
var cheerio = require('cheerio');

// Require all models
var db = require('./models');

var PORT = process.env.PORT || 8000;

// Initialize Express
var app = express();

// Configure middleware


// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static('public'));

var exphbs = require('express-handlebars');

app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

// Connect to the Mongo DB
var MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost/MongoDBScraper';

mongoose.connect(MONGODB_URI);


// Routes

// A GET route for scraping the echoJS website
app.get('/', function(req, res) {
  res.render('index');
});

app.get('/scrape', function() {
  // First, we grab the body of the html with axios
  axios.get('https://blogs.scientificamerican.com/laelaps/').then(function(response) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(response.data);

    // Now, we grab every h2 within an article tag, and do the following:
    // eslint-disable-next-line no-unused-vars
    $('.listing-wide__inner').each(function(i, element) {
      // Save an empty result object
      var result = {};

      // Add the text and href of every link, and save them as properties of the result object
      result.title = $(this)
        .children('h2')
        .text();
      result.subhead = $(this)
        .children('p')
        .text();
      result.link = $(this)
        .children('h2').children('a')
        .attr('href');

      // Create a new Article using the `result` object built from scraping
      db.Article.create(result)
        .then(function(dbArticle) {
          // View the added result in the console
          console.log(dbArticle);
        })
        .catch(function(err) {
          // If an error occurred, log it
          console.log(err);
        });
    });

  });
});

// Route for getting all Articles from the db
app.get('/articles', function(req, res) {
  db.Article.find({})
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err){
      res.json(err);
    });
});

// Route for grabbing a specific Article by id, populate it with it's note
app.get('/articles/:id', function(req, res) {
  db.Article.findOne({_id: req.params.id})
    .populate('note')
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err){
      res.json(err);
    });
});

// Route for saving/updating an Article's associated Note
app.post('/articles/:id', function(req, res) {
  db.Note.create(req.body)
    .then(function(dbNote) {
      return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
    })
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});


// Start the server
app.listen(PORT, function() {
  console.log('App running on port ' + PORT + '!');
});
