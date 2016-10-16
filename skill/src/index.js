var request = require('request');
var base_url = EDIT_ME

String.prototype.replaceAll = function(search, replacement) { //A function that lets us easily replace charatcers in strings.
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

exports.handler = function( event, context ){	

	var sessionAttributes = {}; //variables stored from the last command.
	if(event.session.attributes)
		sessionAttributes = event.session.attributes;
	
	var myContainer = ""; //Slot storage
	var myImage = "";
	var myResourceType = "";
	
	if (event.request.type === "LaunchRequest") { //If Docker is launcher without intent.
        context.succeed({response: buildSpeechletResponse("Hey I'm docker assistant, how can I help?", false)});
    }else if(event.request.type === "SessionEndedRequest"){ //If docker is exited by saying "quit"
		var out = "Grab that napkin, you just got served";
		context.succeed({response: buildSpeechletResponse(out, true)});
	}else{ //If a command is given
		var IntentName = event.request.intent.name;
		if(IntentName === "StatusIntent"){ //If the status of the containers is asked for.	
		
			request(base_url + '/containers', function (error, response, body) { //outputs the number of containers
				if (!error && response.statusCode == 200) {
					var parsedJson = JSON.parse(body); //parses the JSON
					var output = "there are " + parsedJson.running_containers +" containers running, out of a total of " + parsedJson.total_containers + ".";
					
					context.succeed({response: buildSpeechletResponse(output, false)}); //tell alexa to say the repsonse, and carry on.
				}
				else{
					context.succeed({response: buildSpeechletResponse("I cannae dew et cap'n", false)});//If the request fails (server is down).				
				}
			})		

		}else if(IntentName === "ListIntent"){ //Lists the running docker containers
			request(base_url + '/containers/running', function (error, response, body) { //asks for docker data
				if (!error && response.statusCode == 200) {
					var parsedJson = JSON.parse(body); //parses the JSON
					var names = "";
					var i = 0;
					parsedJson.containers.forEach(function(container){ //Iterates through and formats it to plain english.
						names += container.name.replaceAll("_", " ") + ", ";
						if(i == parsedJson.containers.length - 2)
						{
							names += "and ";
						}	
						i++
					});
					
					var output = "the running containers are: " + names;
				
					context.succeed({response: buildSpeechletResponse(output, false)});
				}
				else{
					context.succeed({response: buildSpeechletResponse("I cannae dew et cap'n", false)});//if the request fails (server is down)				
				}
			})	
		}else if(IntentName === "EnquireIntent"){ //gives information about a container.
			myContainer = event.request.intent.slots.containerName.value;
			myResourceType = event.request.intent.slots.resourceType.value; //Getting given slot values.
			
			if(myContainer === "rick"){ //duh
				context.succeed({response: buildSpeechletResponse("<audio src='rick_roll_audio_edit_me'/>", false)});
			}else{
				request(base_url + '/containers/' + myContainer, function(error, response,body){
					if (!error && response.statusCode == 200) {
						var parsedJson = JSON.parse(body);
						var memUse = formatBytes(parsedJson.memory_usage, 1);
						var image = parsedJson.image;
						if(image.startsWith("sha256")){ //If a image is a checksum instead.
							image = "something with a name too long for me";
						}
						var state = parsedJson.state;
						var startDate = new Date(state.StartedAt).toISOString().substring(0,10); //formatting date and times
						var startTime = new Date(state.StartedAt).toTimeString().substring(0,5);
						
						var stopDate = new Date(state.FinishedAt).toISOString().substring(0,10);
						var stopTime = new Date(state.FinishedAt).toTimeString().substring(0,5);
						
						
						var output = "";
					
						
						if(myResourceType){ //for when specific details are requested.
							switch(myResourceType){
								case "memory use": case "memory usage": //memory usage is specified
									output = myContainer + " is using " + memUse + " of memory.";
									break;
								case "image name": case "image": //image name is specified
									output = myContainer + " is running " + image;
									break;
								case "stop date": case "stop time": //asked when it is stopped
									if(parsedJson.state.Status === "created"){ //If it is a new container
										output = myContainer + " is brand new!";
									}else if(parsedJson.state.Running){ //else
										output = myContainer + " is still running.";
									}
									else{
										output = myContainer + " stopped at <say-as interpret-as='date'>" + stopDate + "</say-as> at <say-as interpret-as='time'>" + stopTime + "</say-as>";
									}
									break;
								case "start date": case "start time": //asked when it is started.
									if(parsedJson.state.Status === "created"){ //If it is a new container
										output = myContainer + " is running for the first time!";
									}if(parsedJson.state.Running){ //if it is running
										output = myContainer + " started at <say-as interpret-as='date'>" + startDate + "</say-as> at <say-as interpret-as='time'>" + startTime + "</say-as>";
									}
									else{ //if it is not new or running
										output = myContainer + " is not running.";
									}
									break;
							}
						}else{	//When the general details are wanted.
							if(parsedJson.state.Running){
								output = myContainer + " is using " + memUse + " of memory. it is running " + image ;																		
								if(parsedJson.state.Status === "created"){ //if the container has jsut been created
									output += " and is brand new!";
								}else{ //if it is old
									output += ". and has been running since <say-as interpret-as='date'>" + startDate + "</say-as> at <say-as interpret-as='time'>" + startTime + "</say-as>";
								}
							}else{
								output = myContainer + " is not currently running. ";
								if(parsedJson.state.Status === "created"){//if the container has jsut been created
									output += " and has never been run.";
								}else{ //if it is old
									output +=" It was last on at <say-as interpret-as='date'>" + stopDate + "</say-as> at <say-as interpret-as='time'>" + stopTime + "</say-as>";
								}
							}
						}
						sessionAttributes = {"talkingAbout": myContainer};
						
						context.succeed({sessionAttributes: sessionAttributes, response: buildSpeechletResponse(output, false)});
					}else if(response.statusCode == 404){
						context.succeed({response: buildSpeechletResponse("that container doesn't exist", false)});
					}
					else{
						context.succeed({response: buildSpeechletResponse("I cannae dew et cap'n", true)});					
					}
				});
				
			}
		}else if(IntentName === "CreateIntent"){ //for container creation
			myContainer = event.request.intent.slots.containerName.value;
			myImage = event.request.intent.slots.imageName.value;
			request.post(base_url + '/containers/create', {json:{"containerName": myContainer, "imageName": myImage}}, function(error, response,body){
				if (!error && response.statusCode == 200) {
					var out = "created a container called " + myContainer + " running " + myImage;
					sessionAttributes = {"talkingAbout": myContainer};
					context.succeed({sessionAttributes: sessionAttributes, response: buildSpeechletResponse(out, false)});
				}else{
					context.succeed({response: buildSpeechletResponse("I cannae dew et cap'n", false)});					
				}
			});
		}else if(IntentName === "DockerStatusIntent"){ //To get the status of the docker service
			request('/dockertwitter.php', function(error, response,body){
				if (!error && response.statusCode == 200) {
					var parsedJson = JSON.parse(body);
					
					var out = "Docker is currently: " +  parsedJson.currentStatus + ". <p> the last update was on " + parsedJson.date + ". it read.</p> <p>" + parsedJson.text + "</p>";
					context.succeed({response: buildSpeechletResponse(out, false)});
				}
			});
		}else if(IntentName === "StartIntent"){ //To start a stopped container
			myContainer = event.request.intent.slots.containerName.value;

			if(sessionAttributes.talkingAbout){
				myContainer = sessionAttributes.talkingAbout;
			}
			if(!myContainer){
				sessionAttributes.talkingAbout = null
				context.succeed({sessionAttributes: sessionAttributes, response: buildSpeechletResponse("Start what?", false)});
			}
			else{
				
				sessionAttributes.talkingAbout = null
				request(base_url + '/containers/' + myContainer + '/start', function(error, response,body){
					
					if (!error){
						switch(response.statusCode){
							case 200: case 204:
								out = myContainer + " has started.";
								break;
							case 304:
								out = myContainer + " is already started";
								break;
							case 404:
								out = myContainer + " does not exist";
								break;
							case 500:
								out = "server error";
						}
						context.succeed({sessionAttributes: sessionAttributes, response: buildSpeechletResponse(out, false)});
					}
				});
			}
		}else if(IntentName === "StopIntent"){ //To stop a started container
			myContainer = event.request.intent.slots.containerName.value;
			if(sessionAttributes.talkingAbout){
				myContainer = sessionAttributes.talkingAbout;
			}
			if(!myContainer){
				sessionAttributes.talkingAbout = null
				context.succeed({sessionAttributes: sessionAttributes, response: buildSpeechletResponse("Stop what?", false)});
			}else{
				sessionAttributes.talkingAbout = null;
				request(base_url + '/containers/' + myContainer + '/stop', function(error, response,body){
					var out = "";
					if (!error){
						switch(response.statusCode){
							case 200: case 204:
								out = "attempting to stop "+ myContainer;
								break;
							case 304:
								out = myContainer + " is already stopped";
								break;
							case 404:
								out = myContainer + " does not exist";
								break;
							case 500:
								out = "server error";
						}
						context.succeed({sessionAttributes: sessionAttributes, response: buildSpeechletResponse(out, false)});
					}
				});
			}
		}else if(IntentName === "HelpIntent"){ //If help is asked for
			var out = "try asking about the server status";
			context.succeed({response: buildSpeechletResponse(out, false)});
		}else if(IntentName === "QuitIntent"){ //If the session is closed
			var out = "Grab that napkin, you just got served";
			context.succeed({response: buildSpeechletResponse(out, true)});
		}		
	}
};



function buildSpeechletResponse(say, shouldEndSession) {
    return {
        outputSpeech: {
            type: "SSML",
            ssml: "<speak>" + say + "</speak>"
        },
        reprompt: {
            outputSpeech: {
                type: "SSML",
                ssml: "<speak>Please try again.</speak>"
            }
        },
        shouldEndSession: shouldEndSession
    };
}

function formatBytes(bytes, decimals) {
   if(bytes == 0) return '0 Byte';
   var k = 1000; // or 1024 for binary
   var dm = decimals + 1 || 3;
   var sizes = ['Bites', 'Kilo Bites', 'Mega Bites', 'Giga Bites', 'Terra Bites', 'Peta Bites', 'Exo Bites', 'Zeta Bites', 'Yotta Bites'];
   var i = Math.floor(Math.log(bytes) / Math.log(k));
   return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

