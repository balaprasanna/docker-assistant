var Docker = require('dockerode');
var express = require('express');
var bodyParser = require('body-parser')


var docker = new Docker();
var app = express();

app.use(bodyParser());

function container_info(data){
	var response;
	console.log("Hit");
	response = {
		"total_containers": data.Containers,
		"running_containers": data.ContainersRunning,
		"host_os": data.OSType
	}
	return response;
}


function containers(data) {
    var list_containers = [];
    var response;

    data.forEach(function(container){
        var info = {
            "name": container.Names[0].replace('/',''),
            "image": container.Image,
            "status": container.State,
            "since": container.Status.replace('Up ','').replace('created','').replace(/Exited \(([^)]+)\) /, ''),
            "exit_code": container.Status.match(/\(([^)]+)\)/g)
        }
        list_containers.push(info);
    });

    response = {
        "number_containers": data.length,
        "containers": list_containers
    }

    return response;
}

function my_container(inspect, stats){
    var response;
    response = {
	"memory_usage": stats.memory_stats.usage,
	"image": inspect.Config.Image.replace(/^.+\//, ''),
	"state": inspect.State 
    }
    return response;
}

app.post('/containers/create', function (req, res){
    var name = req.body.containerName;
    var image = req.body.imageName;
    console.log(name + " " + image);
    res.send(name + " " + image);
    docker.createContainer({'Image': image + ":latest", 'Cmd': [],'Env':["MYSQL_RANDOM_ROOT_PASSWORD=1"]}, function (err, container) {
        console.log(err);
        if (err) return;
        container.attach({stream: true, stdout: true, stderr: true, tty: true}, function(err, stream) {
            if(err) return;
            stream.pipe(process.stdout);
            // container.start({Privileged: true}, function(err, data) {
            //     if(err) return;
            // });
            if (name) {
                container.rename({'name':name}, function(err,data){
                    console.log("Renamed to " + name);
                });
            }
        });
    });
});

app.get('/containers/', function (req, res) {
    docker.info(function(err, data){
	res.send(container_info(data));
    });
});

app.get('/containers/all', function (req, res) {
    docker.listContainers({'all': 1}, function(err, data){
        res.send(containers(data));
    });
});

app.get('/containers/running', function (req, res) {
    docker.listContainers(function(err, data){
        res.send(containers(data));
    });
});

app.get('/containers/:container_name/start', function(req, res){
    var name = req.params.container_name;
    var container = docker.getContainer(name);
    container.start({"stream": 0}, function(err,data){
	if (err){
	    res.send(err.statusCode);
	} else {
            res.send("OK");
        }
    });
});

app.get('/containers/:container_name/stop', function(req, res){
    var name = req.params.container_name;
    var container = docker.getContainer(name);
    container.stop({"stream": 0}, function(err, data){console.log("stopped " + name)});
    res.send("Attempting to stop " + name);
});

app.get('/containers/:container_name', function(req, res){
    var name = req.params.container_name;
    var container = docker.getContainer(name);
    container.inspect({"stream": 0}, function(err,data){
	if (err){
	    res.send(404);
	} else {
            container.stats({"stream": 0}, function(err_stats, data_stats){
                res.send(my_container(data, data_stats));
            });
        }
    });
});

app.listen(10101, function () {
      console.log('Docker-layer listening on port 10101!');
});

