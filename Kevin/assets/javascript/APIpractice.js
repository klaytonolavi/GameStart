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
        for (var i = 0; i < 5; i++) {
            var gameHeadline = result.articles[i].title;
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
    // hide gaming news div
    $(".container-gaming-news").hide();
    // show twitch div
    $(".container-twitch").show();
    // show reddit div
    $(".container-reddit").show();

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
});

$("#submitBtn").on("click", function(event) {
        e.preventDefault();
        var searchInput = $("#search-input").val().trim();

        $.ajax({
            method: "GET",
            url: "https://www.reddit.com/r/php/search.json?q=" + searchInput + "&limit=5"
        }).done(function(response) {
            var res = response.data;
            console.log(res);
            for (var i = 0; i < res.children.length; i++){
                
                var div = $("<div>");
                var a = $("<a>");
                a.text("Click Here");
                a.attr("href", "https://www.reddit.com" + res.children[i].data.permalink);

                var title = res.children[i].data.title;
                
                $("#stuff").append(div);
                div.append("<span>"+title+"</span>");
                div.append(a);
                div.addClass("results");
                
            }
            console.log(res);
           
        });
    });
