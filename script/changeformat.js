const fetch = require('node-fetch')
const fs = require('fs')

DAYS = 2
const STATE_API_URL = "https://api.covid19india.org/states_daily.json"
const DISTRICT_API_URL = "https://api.covid19india.org/districts_daily.json"
const PREDICTION_API_URL = "http://40.76.33.143/predict/"
const state_codes_file = __dirname + "/../JSON_files/state_codes.json"
const state_districts_info = __dirname + "/../JSON_files/district_wise_population_india.json"

// const DATASETS_DIR = "Datasets/"
const DATASETS_DIR = "../Datasets/"
const DATASETS_DIR_NEW = "../Datasets2/"

raw_states_and_districts = fs.readFileSync(state_districts_info)
district_wise_population = JSON.parse(raw_states_and_districts)

var raw_state_codes = fs.readFileSync(state_codes_file);
var invertedStateCodes = JSON.parse(raw_state_codes);
var STATE_CODES = {}

Object.keys(invertedStateCodes).forEach((code => {
    state = invertedStateCodes[code]
    STATE_CODES[state] = code
}))



function getCurrentDate() {
    let date_ob = new Date();

    let date = ("0" + date_ob.getDate()).slice(-2);
    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
    let year = date_ob.getFullYear();

    var curdate = year + "-" + month + "-" + date
    return curdate
}

function getOldDate(days) {
    var date = new Date();
    var date_ob = new Date(date.getTime() - (days * 24 * 60 * 60 * 1000));
    // var day =last.getDate();
    // var month=last.getMonth()+1;
    // var year=last.getFullYear();
    let day = ("0" + date_ob.getDate()).slice(-2);
    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
    let year = date_ob.getFullYear();
    var olddate = year + "-" + month + "-" + day
    return olddate
}

function createFileName(state, district, date) {
    stateName = state.split(' ').join('-')
    var filename = DATASETS_DIR + stateName

    if (!(district == undefined)) {
        districtName = district.split(' ').join('-')
        filename = filename + '-' + districtName
    }

    filename = filename + '-' + date + '.json'

    return filename
}

function createFileName2(state, district, date) {
    stateName = state.split(' ').join('-')
    var filename = DATASETS_DIR_NEW + stateName

    if (!(district == undefined)) {
        districtName = district.split(' ').join('-')
        filename = filename + '-' + districtName
    }

    filename = filename + '-' + date + '.json'

    return filename
}

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

async function readData(state, district, dt) {
    filename = createFileName(state, district, dt)
    try {

        jsonData = fs.readFileSync(filename)
        jsonData = JSON.parse(jsonData)
        return jsonData
    }
    catch (err) {
        console.log('Error reading file', err)
    }
}

async function collectData(state, districtName) {
    console.log('reading..', state, districtName)
    todayvalues = await readData(state, districtName, getCurrentDate())

    if (todayvalues == null || todayvalues[0] == null || todayvalues[1] == null) {
        console.log("Error :", state, districtName)
    }
    else {
        predictions = todayvalues[1]
        var i = 0
        for (i = 0; i < DAYS; i++) {
            date = getOldDate(i + 1)
            oldvalues = await readData(state, districtName, date)
            oldpred = oldvalues[1]
            // console.log(date)
            // console.log(oldpred)
            predictions[0].unshift(date)
            for (j = 1; j < 3; j++) {
                predictions[j].unshift(oldpred[j][0])
            }
        }
        todayvalues[1] = predictions

        filename = createFileName2(state, districtName, getCurrentDate())
        writeJSONtoFile(todayvalues, filename)
    }
}


// collectData("Telangana", "Hyderabad")
// collectData("Andhra Pradesh", "Guntur")
// collectData("Andhra Pradesh", "Kurnool")

changeFormat = async () => {
    for (state in district_wise_population) {
        await collectData(state)
        allDistrictObjects = district_wise_population[state]["districts"]
        for (i = 0; i < allDistrictObjects.length; i++) {
            districtObject = allDistrictObjects[i]
            districtName = districtObject["districtName"]
            await collectData(state, districtObject["districtName"])
        }
    }
}


changeFormat()