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
var chatRef = database.ref("/chatData");
var currentUser;
$("#chatOpener").hide();

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




$("#submitBtn").on("click", function(event) {

	event.preventDefault();
	if ($("#login").val() !== "") {

		// hide sign in div
		$("#sign-in").hide();
		// hide gaming news div
		$("#gaming-news").hide();
		// show twitch div
		$("#twitch").show();
		// show reddit div
		$("#reddit").show();

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
		$("#topCardHome").hide();
		$("#topCardSearch").show();
		$("#buttonList").show();
		$("#chatOpener").show();
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


// -----
// This is the code that runs the Chat, from jQuery UI

$(function() {
	$( "#dialog" ).dialog({
		autoOpen: false,
		show: {
		effect: "clip",
		duration: 1000
	},
		width: 650,
		height: 750,
		hide: {
		effect: "clip",
		duration: 1000
	},
		create: function(event, ui) { 
			var widget = $(this).dialog("widget");
			$(".ui-dialog-titlebar-close span", widget).removeClass("ui-icon-closethick").addClass("ui-icon-minusthick");
		}

	});
 
	$("#chatOpener").on("click", function() {
		$("#dialog").dialog("open");
	});
});



$("#post").on("click", function() {
	if ($("#text").val() !== "") {
		var msgUser = currentUser;
		var msgText = $("#text").val().trim();
		chatRef.push({username:msgUser, text:msgText});
		$("#text").val("");
	}
});

/** Function to add a data listener **/
var startListening = function() {
	chatRef.on('child_added', function(snapshot) {
	var msg = snapshot.val();
	  
	var msgUsernameElement = document.createElement("b");
	msgUsernameElement.textContent = msg.username;
		
	var msgTextElement = document.createElement("p");
	msgTextElement.textContent = msg.text;
  
	var msgElement = document.createElement("div");
	msgElement.appendChild(msgUsernameElement);
	msgElement.appendChild(msgTextElement);

	msgElement.className = "msg";
	$("#results").prepend(msgElement);
	});
}

// Begin listening for data
startListening();

// End Chat Code
// -----



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
			  $(".twitch-row-results").append(streamDiv);

			}

		});

		$.ajax({
			method: "GET",
			url: "https://www.reddit.com/r/php/search.json?q=" + game + "&limit=5&sort=hot"
		}).done(function(response) {
			$(".reddit-row-results").empty();
			var res = response.data;
			console.log(res);
			$(".reddit-row-results").append("<ul>");
			for (var i = 0; i < res.children.length; i++){
				
				var li = $("<li>");
				var title = res.children[i].data.title;
				var a = "<a href='https://www.reddit.com" + res.children[i].data.permalink + "' target='_blank'>" + title + "</a>";
				
				$(".reddit-row-results").append(li);
				li.append(a);
				li.addClass("reddit-results");
				
			}
			$(".reddit-row-results").append("</ul>");
			console.log(res);
		   
		});



	});

});