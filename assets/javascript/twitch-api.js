  // empty array for holding the games that we search
var gamesArray = [];

  // submit button to search the twitch API for whatever is inputed into search input box
$("#submit-button").on("click", function(e) {
      e.preventDefault();
      var game = $("#game-search").val().trim();
      console.log(game);
      var queryURL = "https://api.twitch.tv/kraken/streams/?game=" + game + "&limit=10";
          
            // pushing the games search into the empty array and console logging it
          gamesArray.push(game);
          console.log(gamesArray);

      $.ajax({
        url: queryURL,
        method: "GET",
        headers: {"Client-ID": "uo6dggojyb8d6soh92zknwmi5ej1q2"}
      }).done(function(response) {
        
        console.log(response);

        var results = response.streams;
        
          // for loop to search through the 10 results
        for (var i = 0; i < results.length; i++) {

          var streamDiv = $("<div class='streamDiv'>");
          
            // gets the results info for the channel display name and URL
          var streamName = results[i].channel.display_name;
          var streamLink = results[i].channel.url;
          
            // making tags for the streamName and streamLink
          var h5 = $("<h5>").text("Streamer name: " + streamName);                  
          var p = $("<p>").html("Link: " + "<a href="+streamLink+ "target='_blank'>"+streamLink+"</a>");

            // making an img div for the thumbnail to the stream
          var streamImage = $("<img>");

          streamImage.attr("src", results[i].preview.small);

            // appending the streamDiv for thumbnail, name and link
          streamDiv.append(h5);
          streamDiv.append(p);
          streamDiv.append(streamImage);

            // prepending all of the results into the results-display div
          $("#results-display").append(streamDiv);

        }

    });

});
