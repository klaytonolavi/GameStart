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
	// the "href" attribute of .modal-trigger must specify the modal ID that wants to be triggered

	$('.modal').modal();

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

$("#submitBtn").on("click", function(event) {

	event.preventDefault();

	currentUser = toTitleCase($("#login").val().trim());
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

function toTitleCase(str) {
	return str.replace(/([^\W_]+[^\s-]*) */g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

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
		$("#buttonList").append("<button id='"+arr[i]+"'>"+arr[i]+"</button>");
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
});