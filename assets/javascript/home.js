$(document).ready(function(){
	// the "href" attribute of .modal-trigger must specify the modal ID that wants to be triggered

	$('.modal').modal();

	$("#submit").on("click", function() {
		$("#topCardHome").css("display", "none");
		$("#topCardSearch").css("display", "none");
	});

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
