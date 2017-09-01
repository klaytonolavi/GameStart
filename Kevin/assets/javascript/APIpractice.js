// Begin Javascript

$("#submit-button").on("click", function(e) {
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