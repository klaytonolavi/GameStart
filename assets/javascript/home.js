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

	$('.modal').modal();

	// API call for IGN News on front page
	$.ajax({
		url: "https://newsapi.org/v1/articles?source=ign&sortBy=top&apiKey=99f15eb49458454290e17af6312b8797",
		method: 'GET',
	}).done(function(result) {
		$("#gamingNews").append("<ul>");
		for (var i = 0; i < 5; i++) {
			var gameHeadline = result.articles[i].title;
			$("#gamingNews").append('<li><a href="' + result.articles[i].url + '" target="_blank">' + gameHeadline + "</a></li>");
		}
		$("#gamingNews").append("</ul>");
	}).fail(function(err) {
		throw err;
	});

});


$("#submitBtn").on("click", function(event) {

	event.preventDefault();
	if ($("#login").val() !== "") {

		// hide sign in div
		$(".container-sign-in").hide();
		// show twitch div
		$(".container-twitch").show();

		currentUser = toTitleCase($("#login").val().trim());

		updateUser();
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
	}
});

$("#addGame").on("click", function(event) {
	event.preventDefault();

	var newGame = $("#gameName").val().trim().toLowerCase();

	var queryURL = "https://api.twitch.tv/kraken/streams/?game=" + newGame + "&limit=10";

	$.ajax({
        url: queryURL,
        method: "GET",
        headers: {"Client-ID": "uo6dggojyb8d6soh92zknwmi5ej1q2"}
      }).done(function(response) {
        
        console.log(response);

        var results = response.streams;
        
        if (results.length > 0) {
        	database.ref("/userList/" + currentUser).push({
				game: newGame
			});
			$("#gameMessage").html(toTitleCase(newGame) + " has been added to your list.");
        }
        else {
        	$("#gameMessage").html(toTitleCase(newGame) + " does not exist.");
        }

    });

	
	$("#gameName").val("");
});

$("#removeGame").on("click", function(event) {
	event.preventDefault();

	var newGame = $("#gameName").val().trim().toLowerCase();
	$("#gameName").val("");

	database.ref("/userList/" + currentUser).once("value").then(function(snapshot) {
		snapshot.forEach(function(snapshotChild) {
			if (snapshotChild.val().game === newGame) {
				$("#gameMessage").html(toTitleCase(newGame) + " has been removed from list.");
				database.ref("/userList/" + currentUser).child(snapshotChild.key).remove();
				return true;
			}
			else {
				$("#gameMessage").html(newGame + " is not on your list.");
			}
		});
	});
});


function toTitleCase(str) {
	return str.replace(/([^\W_]+[^\s-]*) */g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}


function updateUser() {

	database.ref("/userList/" + currentUser).on("value", function(snapshot) {
		deleteDuplicates();
		var buttonArray = [];

		snapshot.forEach(function(snapshotChild) {
			buttonArray.push(snapshotChild.val().game);
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
		$("#buttonList").append('<a class="waves-effect waves-red btn red gameBtn" id="'+arr[i]+'">'+arr[i]+'</a>');
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
				$("#gameMessage").html(toTitleCase(snapshotChild.val().game) + " is already on your list");
				database.ref("/userList/" + currentUser).child(snapshotChild.key).remove();
			}
		});
	});
}


 // submit button to search the twitch API for whatever is inputed into search input box
$("body").on("click", ".gameBtn", function(e) {
      e.preventDefault();
      $(".streamDiv").empty();
      var game = $(this).attr("id");
      var queryURL = "https://api.twitch.tv/kraken/streams/?game=" + game + "&limit=10";
          
          
      $.ajax({
        url: queryURL,
        method: "GET",
        headers: {"Client-ID": "uo6dggojyb8d6soh92zknwmi5ej1q2"}
      }).done(function(response) {
        
        console.log(response);
        console.log(response.streams.length);

        var results = response.streams;
        
          // for loop to search through the 10 results
        for (var i = 0; i < results.length; i++) {

          var streamDiv = $("<div class='streamDiv'>");
          
            // gets the results info for the channel display name and URL
          var streamName = results[i].channel.display_name;
          var streamLink = results[i].channel.url;
          
            // making tags for the streamName and streamLink
          var pName = $("<p>").text("Streamer: " + streamName);                  
          
          // var p = $("<p>").html("<a href="+streamLink+ "target='_blank'>"+streamLink+"</a>");

            // making an img div for the thumbnail to the stream
          var streamImage = $("<div>");
          streamImage.html("<a href="+streamLink+ " target='_blank'>"+"<img style='width: 95%' src="+results[i].preview.medium+"></a>")

          // streamImage.attr("src", results[i].preview.medium);

            // appending the streamDiv for thumbnail, name and link
          streamDiv.append(pName);
          
          streamDiv.append(streamImage);

            // prepending all of the results into the results-display div
          $(".row-results").append(streamDiv);

        }

    });


});