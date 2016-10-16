var request = require('request');
/*
request('https://docker.jhc.pw/containers/running', function (error, response, body) {
	if (!error && response.statusCode == 200) {
		console.log(body);//.succeed({response: buildSpeechletResponse("there are" + body.number +"containers running.", true)});
		//writeResponse("there are" + body.number +"containers running.");
	}
});
*//*
request('https://docker.jhc.pw/containers/running', function (error, response, body) { //asks for docker data
	if (!error && response.statusCode == 200) {
		var parsedJson = JSON.parse(body); //parses the JSON
		var names = "";
		var i = 0;
		parsedJson.containers.forEach(function(container){
			names += container.name + ", ";
			if(i == parsedJson.containers.length - 2)
			{
				names += "and ";
			}	
			i++
		});
		
		var output = "their names are " + names;
	
		console.log(output);
	}
	else{
		context.succeed({response: buildSpeechletResponse("I cannae do it cap'n", true)});					
	}
});*/

request.post('https://docker.jhc.pw/name', {json:{"containerName": "apple"}}, function(error, response,body){
	if (!error && response.statusCode == 200) {
		
	}
});