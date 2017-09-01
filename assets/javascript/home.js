// Initialize Firebase
var config = {
	apiKey: "AIzaSyCDXTSh8I15rIl68qh5UcAxVs6buM34ZkU",
	authDomain: "gamestart-75825.firebaseapp.com",
	databaseURL: "https://gamestart-75825.firebaseio.com",
	projectId: "gamestart-75825",
	storageBucket: "",
	messagingSenderId: "675051657577"
};

firebase.initializeApp(config);
var database = firebase.database();
var currentUser;

$(document).ready(function(){
	$("#gamingNews").empty();

	$.ajax({
		url: "https://newsapi.org/v1/articles?source=ign&sortBy=top&apiKey=99f15eb49458454290e17af6312b8797",
		method: 'GET',
	}).done(function(result) {
		console.log(result);
		console.log(result.articles[0].title);
		for (var i = 0; i < 5; i++) {
			var gameHeadline = result.articles[i].title;
			console.log(gameHeadline);
			$("#gamingNews").append('<p><a href="' + result.articles[i].url + '" target="_blank">' + gameHeadline + "</a></p>");
		}
	}).fail(function(err) {
		throw err;
	});


});

$("#submitBtn").on("click", function(event) {

	event.preventDefault();

	// hide sign in div
	$(".container-sign-in").hide();
	// show twitch div
	$(".container-twitch").show();

	currentUser = $("#login").val().trim();
	updateUser();
	console.log(currentUser);
	database.ref("/userList").once("value").then(function(snapshot) {
		if (snapshot.child(currentUser).exists()) {
			$("#welcomeMessage").html("Welcome back, "+currentUser+".");
		}
		else {
			$("#welcomeMessage").html("Hello, "+currentUser+". Welcome to GameStart.");
		}
	});
	$("#topCardHome").css("display", "none");
	$("#topCardSearch").css("display", "block");
	$("#buttonList").css("display", "block");
});

$("#addGame").on("click", function(event) {
	event.preventDefault();

	var newGame = $("#gameName").val().trim();

	database.ref("/userList/" + currentUser).push({
		game: newGame
	});

	$("#gameMessage").html(newGame + " has been added to your list.");
	$("#gameName").val("");
});

$("#removeGame").on("click", function(event) {
	event.preventDefault();

	var newGame = $("#gameName").val().trim();
	$("#gameName").val("");

	database.ref("/userList/" + currentUser).once("value").then(function(snapshot) {
		snapshot.forEach(function(snapshotChild) {
			if (snapshotChild.val().game === newGame) {
				$("#gameMessage").html(newGame + " has been removed from list.");
				database.ref("/userList/" + currentUser).child(snapshotChild.key).remove();
				return true;
			}
			else {
				$("#gameMessage").html(newGame + " is not on your list.");
			}
		});
	});
});

function updateUser() {

	console.log("User updated: " + currentUser);
	database.ref("/userList/" + currentUser).on("value", function(snapshot) {
		deleteDuplicates();
		var buttonArray = [];

		snapshot.forEach(function(snapshotChild) {
			buttonArray.push(snapshotChild.val().game);
			console.log("Game: " + snapshotChild.val().game);
		});

		updateButtons(buttonArray);
				
	});
}

function updateButtons(arr) {

	//Clear the button list to be refilled
	$("#buttonList").empty();

	//Sort the array alphabetically
	arr.sort();
	
	//Refill the button list
	for (var i=0; i<arr.length; i++) {
		console.log("Button added");
		$("#buttonList").append("<button class='gameBtn' id='"+arr[i]+"'>"+arr[i]+"</button>");
	}
}

function deleteDuplicates() {
	database.ref("/userList/" + currentUser).once("value").then(function(snapshot) {
		var testArray = [];
		snapshot.forEach(function(snapshotChild) {
			if (testArray.indexOf(snapshotChild.val().game) < 0) {
				testArray.push(snapshotChild.val().game);
			}
			else {
				$("#gameMessage").html(snapshotChild.val().game + " is already on your list");
				database.ref("/userList/" + currentUser).child(snapshotChild.key).remove();
			}
		});
	});
}

 // submit button to search the twitch API for whatever is inputed into search input box
$("body").on("click", ".gameBtn", function(e) {
      e.preventDefault();
      var game = $(this).attr("id");
      console.log(game);
      var queryURL = "https://api.twitch.tv/kraken/streams/?game=" + game + "&limit=10";
          
          
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
          $(".row-results").append(streamDiv);

        }

    });

});