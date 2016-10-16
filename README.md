#Docker Assistant

@jameshclrk, @meetmumbojumbo, @TCroasdale, @TeknoVenus

![Just Docker](http://i.imgur.com/coLD9Dm.jpg)

## Inspiration
Ever thought your laptop was too far away while you're sitting in bed while you're meant to be looking after your Docker containers? Fear no more! You can manage your containers from the safety of your bed.

## What it does
This app allows you to create, start and stop containers while also allowing you to check the status of the containers, how many are running and if the Docker Hub is up.

## How we built it
We used an AWS Lambda to facilitate the communication between the Alexa device and the Docker API that we developed. The Lambda converts the data received from the Docker API to nice messages to play back to the user. There is a conversational element of the app is accomplished by using the session variables in the Alexa Skills Kit.

The Docker API was built upon the official Docker Remote API (and Node bindings) with some changes to combine some results and to reduce network overhead by removing unneeded variables. The API runs on a server and the communication was done over https (with a Let's Encrypt certificate). 

## Challenges we ran into
We attempted to create an infrastructure to allow you to log in to the Alexa Skills app to select the server you wanted to administrate. Due to the complexity and time restraints, we could not complete this. This means the server details have to be hardcoded in to the Lambda.

We had issues when creating and starting the containers as Alexa would time out. We worked around this by splitting the creating and starting of the containers in to two steps that can be stringed together with a conversational like command. ("create a ... container called ... " then "start it")

## Accomplishments that we're proud of
The whole thing! It's three of the team members first Hackathon and the fourth's second, so it was a great learning experience to complete a working app. We're most proud of the contextual awareness when starting a container.

## What we learned
Many of the tools/APIs we used were new to us. We used AWS Lambdas, Alexa Skills Kit and the Docker Remote API for the first time. The project provided a great refresher to JavaScript and Node JS which we only had limited experience with.

## What's next for Docker Assistant
We hope to add the ability to log in to the app via the Alexa Skills app to select the server you will be administrating. A long term goal would be to add the ability to administrate swarms/clusters.
