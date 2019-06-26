articleScraper = () => {
  $.ajax({
    method: 'GET',
    url: '/scrape',
  }).done(location.reload());
  
};

$('#scraperbtn').on('click', function(){
  articleScraper();
});

articleRender = () => {
  $('#articles').empty();
  $.getJSON('/articles', function(data) {
    // For each one
    for (var i = 0; i < 10; i++) {
      // Display the apropos information on the page
      $('#articles').append('<div class=\'article\' data-id=\'' + data[i]._id + '\'' + 'data-toggle=\'modal\'' + 'data-target=\'#noteModal\'>' + '<h4><a href=\'' + data[i].link + '\'>'
      + data[i].title + '</a></h4>' + '<p>' + data[i].subhead + '</p>' + '</div>' + '<br />');
    }
  });
};

articleRender();



// Whenever someone clicks a p tag
$(document).on('click', '.article', function() {
  // Empty the notes from the note section
  $('#myModal').on('shown.bs.modal', function () {
    $('#myInput').trigger('focus');
  });

  $('#notes').empty();
  // Save the id from the p tag
  var thisId = $(this).attr('data-id');
  
  // Now make an ajax call for the Article
  $.ajax({
    method: 'GET',
    url: '/articles/' + thisId
  })
  // With that done, add the note information to the page
    .then(function(data) {
      console.log(data);
      // The title of the article
      $('#notes').append('<h3>' + data.title + '</h3>');
      // An input to enter a new title
      $('#notes').append('<input id=\'titleinput\' name=\'title\' placeholder=\'Author\'>');
      // A textarea to add a new note body
      $('#notes').append('<textarea id=\'bodyinput\' name=\'body\' placeholder=\'Note\'></textarea>');
      // A button to submit a new note, with the id of the article saved to it
      $('#savenote').attr('data-id', data._id);
  
      // If there's a note in the article
      if (data.note) {
        // Place the title of the note in the title input
        $('#titleinput').val(data.note.title);
        // Place the body of the note in the body textarea
        $('#bodyinput').val(data.note.body);
      }
    });
});
  
// When you click the savenote button
$(document).on('click', '#savenote', function() {
  // Grab the id associated with the article from the submit button
  var thisId = $(this).attr('data-id');
  
  // Run a POST request to change the note, using what's entered in the inputs
  $.ajax({
    method: 'POST',
    url: '/articles/' + thisId,
    data: {
      // Value taken from title input
      title: $('#titleinput').val(),
      // Value taken from note textarea
      body: $('#bodyinput').val()
    }
  })
  // With that done
    .then(function(data) {
      // Log the response
      console.log(data);
      // Empty the notes section
      $('#notes').empty();
    });
  
  // Also, remove the values entered in the input and textarea for note entry
  $('#titleinput').val('');
  $('#bodyinput').val('');
  
  $('#noteModal').modal('toggle');

});
  