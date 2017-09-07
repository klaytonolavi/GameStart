
// Initialize Firebase
var config = {
    apiKey: "AIzaSyCDXTSh8I15rIl68qh5UcAxVs6buM34ZkU",
    authDomain: "gamestart-75825.firebaseapp.com",
    databaseURL: "https://gamestart-75825.firebaseio.com",
    projectId: "gamestart-75825",
    storageBucket: "",
    messagingSenderId: "675051657577"
};

// Initialize variables
firebase.initializeApp(config);
var database = firebase.database();
var chatRef = database.ref("/chatData");
var userName;
var iLoggedIn;
$("#signUp").hide();

// Only run code when the page is done loading
$(document).ready(function() {
    
    // Set up the modals
    $('.modal').modal();
    
    //  API call for IGN News on front page
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
    
    // Submit button on signup page
    $("#signUpBtn").on("click", function(event) {
        event.preventDefault();
        currentEmail = $("#signUpEmail").val().trim().toLowerCase();
        currentUser = currentEmail.slice(0, -4);
        currentPass = $("#signUpPass").val().trim();
        checkPass = $("#checkPass").val().trim();
        userName = $("#name").val().trim();
        
        // Make sure both password inputs are the same
        if (currentPass === checkPass) {
            
            // Create a user on firebase with inputted email, password, and username
            firebase.auth().createUserWithEmailAndPassword(currentEmail, currentPass).then(function() {
                
                // Set users display name
                var user = firebase.auth().currentUser;
                user.updateProfile({
                    displayName: userName
                }).catch(function(error) {});
                
                // Clear input fields
                $("#signUpEmail, #signUpPass, #name").val("");
            }).catch(function(error) {
                
                //  Handle Errors here.
                var errorCode = error.code;
                var errorMessage = error.message;
                $(".errorMsg").html(errorMessage);
                $("#signUpEmail, #signUpPass, #name, #checkPass").val("");
            });
        } else {
            
            // Error message if both passwords are not the same
            $(".errorMsg").html("Passwords do not match");
            $("#signUpEmail, #signUpPass, #name, #checkPass").val("");
        }
    });
    
    // Code for the submit button on the sign in page
    $("#signInBtn").on("click", function(event) {
        event.preventDefault();
        currentEmail = $("#signInEmail").val().trim().toLowerCase();
        currentUser = currentEmail.slice(0, -4);
        currentPass = $("#signInPass").val().trim();
        
        // Sign in user with given email and password
        firebase.auth().signInWithEmailAndPassword(currentEmail, currentPass).then(function() {
            var user = firebase.auth().currentUser;
            userName = user.displayName;
            $("#signInEmail, #signInPass").val("");
        }).catch(function(error) {
            
            //  Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            console.log(errorMessage);
            $(".errorMsg").html(errorMessage);
            $("#signInEmail, #signInPass").val("");
        });
    });
    
    // Log out the user when the logout button is clicked
    $("#logOut").on("click", function() {
        firebase.auth().signOut();
    })
    
    // Switch right box from sign in to sign up
    $("#switchToSignUp").on("click", function() {
        $("#signUp").show();
        $("#signIn").hide();
    })
    
    // Switch right box from sign up to sign in
    $("#switchToSignIn").on("click", function() {
        $("#signUp").hide();
        $("#signIn").show();
    })
    
    // Code to be run whenever users logged in state is changed
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            currentUser = user.email.slice(0, -4);
            if (!userName) { userName = user.displayName; } 
            // Make sure user has a username
            updateUser();
            
            // Show and hide necessary sections for when the user is logged in
            $("#logOut").show();
            $("#sign-in").hide();
            $("#gaming-news").hide();
            $("#twitch").show();
            $("#reddit").show();
            $("#topCardHome").css("display", "none");
            $("#topCardSearch").css("display", "block");
            $("#buttonList").css("display", "block");
            $("#chatOpener").show();
            
            // Update welcome message
            $("#welcomeMessage").html("Hello, " + userName + ". Welcome to GameStart.");
        } else {
            
            // Show and hide necessary sections for when the user is logged out
            $("#logOut").hide();
            $("#sign-in").show();
            $("#gaming-news").show();
            $("#twitch").hide();
            $("#reddit").hide();
            $("#topCardHome").css("display", "block");
            $("#topCardSearch").css("display", "none");
            $("#buttonList").css("display", "none");
            $("#chatOpener").hide();
        }
    });
    
    // Adds a game to the user's list when the add button is clicked
    $("#addGame").on("click", function(event) {
        event.preventDefault();
        
        // Make sure blank space is not submitted
        if ($("#gameName").val().trim() != "") {
            var newGame = $("#gameName").val().trim().toLowerCase();
            var queryURL = "https://api.twitch.tv/kraken/streams/?game=" + newGame + "&limit=10";
            
            // Call twitch API to make sure the game exists on twitch
            $.ajax({
                url: queryURL,
                method: "GET",
                headers: { "Client-ID": "uo6dggojyb8d6soh92zknwmi5ej1q2" }
            }).done(function(response) {
                var results = response.streams;
                
                // If the game exists, add it to the list
                if (results.length > 0) {
                    database.ref("/userList/" + currentUser).push({
                        game: newGame
                    });
                    $("#gameMessage").html(toTitleCase(newGame) + " has been added to your list.");
                }
                
                // If the game doesn't exist on twitch, alert user 
                else {
                    $("#gameMessage").html("Nobody is streaming " + toTitleCase(newGame) + " on Twitch right now.");
                }
            });
            
            // Clear game name field
            $("#gameName").val("");
        }
    });
    
    // Removes a game from the user's list when the remove button is clicked
    $("#removeGame").on("click", function(event) {
        event.preventDefault();
        
        // Make sure the field is not empty
        if ($("#gameName").val().trim() != "") {
            var newGame = $("#gameName").val().trim().toLowerCase();
            
            // Call the database to check if the game is on the list
            database.ref("/userList/" + currentUser).once("value").then(function(snapshot) {
                snapshot.forEach(function(snapshotChild) {
                    
                    // If the game is on the list, remove it from the list and alert user
                    if (snapshotChild.val().game === newGame) {
                        $("#gameMessage").html(toTitleCase(newGame) + " has been removed from list.");
                        database.ref("/userList/" + currentUser).child(snapshotChild.key).remove();
                        return true;
                    }
                    
                    // If the game is not on the list, alert the user
                    else {
                        $("#gameMessage").html(newGame + " is not on your list.");
                    }
                });
            });
            
            // Clear the game name field
            $("#gameName").val("");
        }
    });
    
    // This is the code that runs the Chat, from jQuery UI
    $(function() {
        $("#dialog").dialog({
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
        
        // Opens the chatbox when the chat button is clicked
        $("#chatOpener").on("click", function() {
            iLoggedIn = moment().format("X");
            $("#dialog").dialog("open");
        });
    });
    
    // Posts a message to the chat when the post button is clicked
    $("#post").on("click", function() {
        event.preventDefault();
        
        // Prevent user from submitting empty comment to chat
        if ($("#text").val() !== "") {
            var msgUser = userName;
            var msgText = $("#text").val().trim();
            var timeStamp = moment().format("X");
            chatRef.push({ username: msgUser, text: msgText, time: timeStamp });
            $("#text").val("");
        }
    });
    
    // Function to add a data listener
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
            if (iLoggedIn <= msg.time) {
                $("#results").prepend(msgElement);
            }
        });
    }
    
    // Begin listening for data
    startListening();
    
    // Change a string to title case
    function toTitleCase(str) {
        return str.replace(/([^\W_]+[^\s-]*) */g, function(txt) { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });
    }
    
    // Function called to update the database reference for the current user
    function updateUser() {
        
        // Create a reference to the current user's game list
        database.ref("/userList/" + currentUser).on("value", function(snapshot) {
            
            // Delete the game if it is already on the list
            deleteDuplicates();
            
            // Array to hold the game names
            var buttonArray = [];
            
            // Loop through the user's games and push them into the array
            snapshot.forEach(function(snapshotChild) {
                buttonArray.push(snapshotChild.val().game);
            });
            //Update the buttons with the array of games
            updateButtons(buttonArray);
        });
    }
    
    // Function to update the user's button list when games are added or removed
    function updateButtons(arr) {
        
        // Clear the button list to be refilled
        $("#buttonList").empty();
        
        // Sort the array alphabetically
        arr.sort();
        
        // Refill the button list
        for (var i = 0; i < arr.length; i++) {
            $("#buttonList").append('<a class="waves-effect waves-red btn red gameBtn" id="' + arr[i] + '">' + arr[i] + '</a>');
        }
    }
    
    // Function to delete dupliucate games that are added to the user's game list
    function deleteDuplicates() {
        database.ref("/userList/" + currentUser).once("value").then(function(snapshot) {
            var testArray = [];
            snapshot.forEach(function(snapshotChild) {
                if (testArray.indexOf(snapshotChild.val().game) < 0) {
                    testArray.push(snapshotChild.val().game);
                } else {                
                    // Alert user that the game they tried to add is already on the list
                    $("#gameMessage").html(toTitleCase(snapshotChild.val().game) + " is already on your list");
                    database.ref("/userList/" + currentUser).child(snapshotChild.key).remove();
                }
            });
        });
    }
    
    // Submit button to search the twitch/reddit API for whatever is inputed into search input box
    $("body").on("click", ".gameBtn", function(e) {
        e.preventDefault();
        $(".streamDiv").empty();
        var game = $(this).attr("id");
        var queryURL = "https://api.twitch.tv/kraken/streams/?game=" + game + "&limit=10";
        
        // Ajax call for the twitch API
        $.ajax({
            url: queryURL,
            method: "GET",
            headers: { "Client-ID": "uo6dggojyb8d6soh92zknwmi5ej1q2" }
        }).done(function(response) {
            var results = response.streams;
            
            // for loop to search through the 10 results
            for (var i = 0; i < results.length; i++) {

                var streamDiv = $("<div class='streamDiv'>");
                
                // gets the results info for the channel display name and URL
                var streamName = results[i].channel.display_name;
                var streamLink = results[i].channel.url;
                
                // making tags for the streamName and streamLink
                var pName = $("<p>").text("Streamer: " + streamName);
                
                // making an img div for the thumbnail to the stream
                var streamImage = $("<div>");
                streamImage.html("<a href=" + streamLink + " target='_blank'>" + "<img style='width: 95%' src=" + results[i].preview.medium + "></a>")
                
                // appending the streamDiv for thumbnail, name and link
                streamDiv.append(pName);
                streamDiv.append(streamImage);
                
                // prepending all of the results into the results-display div
                $(".twitch-row-results").append(streamDiv);
            }
        });
        
        // Ajax call for the reddit API
        $.ajax({
            method: "GET",
            url: "https://www.reddit.com/r/php/search.json?q=" + game + "&limit=20&sort=hot"
        }).done(function(response) {
            $(".reddit-row-results").empty();
            var res = response.data;
            $(".reddit-row-results").append("<ul>");
            for (var i = 0; i < res.children.length; i++) {

                var li = $("<li>");
                var title = res.children[i].data.title;
                var a = "<a href='https://www.reddit.com" + res.children[i].data.permalink + "' target='_blank'>" + title + "</a>";

                $(".reddit-row-results").append(li);
                li.append(a);
                li.addClass("reddit-results");

            }
            $(".reddit-row-results").append("</ul>");
        });
    });
});