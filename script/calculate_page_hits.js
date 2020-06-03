const express = require('express')
const fs = require('fs')
const bodyParser = require('body-parser');

var app = express()

HITS_FILE = './hits.json'

var writeJSONtoFile = (jsonObject, filename) => {
    var jsonContent = JSON.stringify(jsonObject);

    fs.writeFile(filename, jsonContent, 'utf8', function (err) {
        if (err) {
            console.log("An error occured while writing JSON Object to File.");
            return console.log(err);
        }

        console.log("JSON file " + filename + " has been saved.");
    });
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.get('/', function (req, res) {
    fs.readFile(__dirname + '/' + HITS_FILE, "utf8", function (err, data) {
        console.log(data)
        res.writeHead(200, { 'Content-Type': 'json' })
        res.end(data)
    })
})

app.post('/', function (req, res) {
    date = req.body.date
    time = req.body.time

    if (!date || !time) {
        console.log("Invalid Post request!")
        res.writeHead(304, "No valid date and time have been provided!")
    } else {
        fs.readFile(__dirname + '/' + HITS_FILE, "utf8", function (err, data) {
            jsonObject = JSON.parse(data)
            if (date in jsonObject) {
                console.log(date + " is in ", jsonObject)
                jsonObject[date]["timeStamps"].push(time)
                jsonObject[date]["count"] += 1
                writeJSONtoFile(jsonObject, HITS_FILE)
            } else {
                console.log(date + " is not in ", jsonObject)
                jsonObject[date] = { "timeStamps": [], "count": 0 }
                jsonObject[date]["timeStamps"].push(time)
                jsonObject[date]["count"] += 1
                writeJSONtoFile(jsonObject, HITS_FILE)
            }
        })
        res.writeHead(201, "Added new time stamp")
    }
    res.end()
})

var server = app.listen(8081, function () {
    var host = server.address().address
    var port = server.address().port
    console.log("Example app listening at http://<%s>:%s", host, port)
})