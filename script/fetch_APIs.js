const fetch = require('node-fetch')
const fs = require('fs')

const STATE_API_URL = "https://api.covid19india.org/states_daily.json"
const DISTRICT_API_URL = "https://api.covid19india.org/districts_daily.json"
const PREDICTION_API_URL = "http://40.76.33.143/predict/"
const state_codes_file = __dirname + "/../JSON_files/state_codes.json"
const state_districts_info = __dirname + "/../JSON_files/district_wise_population_india.json"

const DATASETS_DIR = __dirname + "/../Datasets/"

raw_states_and_districts = fs.readFileSync(state_districts_info)
district_wise_population = JSON.parse(raw_states_and_districts)

var raw_state_codes = fs.readFileSync(state_codes_file);
var invertedStateCodes = JSON.parse(raw_state_codes);
var STATE_CODES = {}

Object.keys(invertedStateCodes).forEach((code => {
    state = invertedStateCodes[code]
    STATE_CODES[state] = code
}))


DAYS = 7

function getDate(){

    var d = new Date();

    machine_hours = d.getHours()
    utc_hours = d.getUTCHours()

    if (machine_hours == utc_hours) {
        d = new Date(d.getTime() + (5.5 * 60 * 60 * 1000));
    }

    return d
}

function changeDateFormat(date_str) {
    var months = {
        "Jan": '01',
        "Feb": '02',
        "Mar": '03',
        "Apr": '04',
        "May": '05',
        "Jun": '06',
        "Jul": '07',
        "Aug": '08',
        "Sep": '09',
        "Oct": '10',
        "Nov": '11',
        "Dec": '12'
    }
    var sp = date_str.split('-')
    var date = sp[0]
    var month = sp[1]
    var year = sp[2]
    year += 20
    var new_date = year + '-' + months[month] + '-' + date
    return new_date
}

async function prevDistricts(state, district) {
    try {
        response = await fetch(DISTRICT_API_URL)
        jsonData = await response.json()

        districtsData = jsonData["districtsDaily"]
        stateObject = districtsData[state]
        districtObject = stateObject[district]
        required_days = districtObject.slice(Math.max(districtObject.length - (DAYS), 1))
        // required_days = districtObject.slice(Math.max(districtObject.length - (DAYS + 1), 1))
        // required_days.pop()

        prev_dates = []
        prev_active = []
        prev_deaths = []
        required_days.forEach(day_object => {
            prev_dates.push(day_object["date"])
            prev_active.push(day_object["active"])
            prev_deaths.push(day_object["deceased"])
        });
        return [prev_dates, prev_active, prev_deaths]
    } catch (err) {
        console.log("Error: " + err)
    }
}

async function nextDistricts(state, district) {

    PREDICTION_API = PREDICTION_API_URL + '?state=' + state + '&district=' + district

    try {
        response = await fetch(PREDICTION_API)
        jsonData = await response.json()

        predictions = jsonData[0]["predictions"]
        // console.log(predictions);

        next_dates = []
        next_active = []
        next_deaths = []
        predictions.forEach(day_object => {
            next_dates.push(day_object["Date"])
            next_deaths.push(day_object["Deaths"])
            next_active.push(day_object["Infected"])
        })
        // prev = prevDistricts(state, district)
        next = [next_dates, next_active, next_deaths]
        return next
    } catch (err) {
        console.log("Error: " + err)
    }
}

async function prevStates(state) {
    try {
        stateCode = STATE_CODES[state]
        response = await fetch(STATE_API_URL)
        jsonData = await response.json()

        allStates = jsonData["states_daily"]

        cumulative = []
        j = 0
        for (i = 0; i < allStates.length; i++) {
            confirmed = allStates[i]; i += 1
            recovered = allStates[i]; i += 1
            deaths = allStates[i]

            if (j == 0) {
                c = parseInt(confirmed[stateCode])
                r = parseInt(recovered[stateCode])
                d = parseInt(deaths[stateCode])
            } else {
                c = parseInt(confirmed[stateCode]) + cumulative[j - 1]["confirmed"]
                r = parseInt(recovered[stateCode]) + cumulative[j - 1]["recovered"]
                d = parseInt(deaths[stateCode]) + cumulative[j - 1]["deaths"]
            }

            cumulative.push({
                "date": confirmed["date"],
                "confirmed": c,
                "recovered": r,
                "deaths": d,
            })
            j += 1
        }

        requiredDays = cumulative.slice(Math.max(cumulative.length - DAYS, 1))

        prev_dates = []
        prev_deaths = []
        prev_active = []
        for (i = 0; i < DAYS; i++) {
            day_object = requiredDays[i]
            var cdate = changeDateFormat(day_object["date"])
            prev_dates.push(cdate)
            prev_deaths.push(day_object["deaths"])
            prev_active.push(day_object["confirmed"] - day_object["recovered"] - day_object["deaths"])
        }
        return [prev_dates, prev_active, prev_deaths]
    } catch (err) {
        console.log("Error: " + err)
    }
}

async function nextStates(state) {
    PREDICTION_API = PREDICTION_API_URL + '?state=' + state

    try {
        response = await fetch(PREDICTION_API)
        jsonData = await response.json()

        predictions = jsonData[jsonData.length - 1]["overallStatePredictions"]

        next_dates = []
        next_active = []
        next_deaths = []
        predictions.forEach(day_object => {
            next_dates.push(day_object["Date"])
            next_deaths.push(day_object["Deaths"])
            next_active.push(day_object["Infected"])
        })

        next = [next_dates, next_active, next_deaths]
        return next
    } catch (err) {
        console.log("Error: " + err)
    }
}
var getCurrentDate = () => {
    let date_ob = getDate();

    let date = ("0" + date_ob.getDate()).slice(-2);
    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
    let year = date_ob.getFullYear();

    return year + "-" + month + "-" + date
}

var createDirectory = (directory) => {
    fs.mkdir(directory, { recursive: true }, function (err) {
        if (err) {
            if (err.code === "EEXIST") {
                console.log("Dir already exists. Not creating again!")
            } else {
                console.error(err)
                exit(1)
            }
        } else {
            console.log("New directory successfully created.")
        }
    })
}

function createFileName(state, district, date) {
    stateName = state.split(' ').join('-')
    var filename = DATASETS_DIR + stateName

    if (!(district == undefined)) {
        districtNam = district.split(' ').join('-')
        filename = filename + '-' + districtNam
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
    // console.log('reading..', state, district, dt)
    try {

        jsonData = fs.readFileSync(filename)
        jsonData = JSON.parse(jsonData)
        return jsonData
    }
    catch (err) {
        console.log('Error reading file', state, district, dt)
        // console.log(err)
    }
}


function getOldDate(days) {
    var date = getDate();
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

var fetchAllAPIs = async (state, district) => {
    // Only state is passed

    prev = []
    next = []
    if (district == undefined || district == null) {
        // console.log(state)
        prev = await prevStates(state)
        next = await nextStates(state)

    }
    else {
        prev = await prevDistricts(state, district)
        next = await nextDistricts(state, district)
        // values = [prev, next]
    }
    // console.log('fetched today', state, district)
    today_pred = next

    yest_values = await readData(state, district, getOldDate(1))
    if (yest_values != null && yest_values[0] != null && yest_values[1] != null) {
        // console.log('Fetched yesterday')
        yest_pred = yest_values[1]

        dates = yest_pred[0]
        days = dates.length

        for (j = 0; j < 3; j++) {
            today_pred[j] = yest_pred[j].slice(0, days - 6).concat(today_pred[j])
        }

        values = [prev, today_pred]
        filename = createFileName(state, district, getCurrentDate())
        writeJSONtoFile(values, filename)

    }
    else {
        console.log("Error fetching yest...", state, district)
    }
}

saveData = async () => {
    for (state in district_wise_population) {
        await fetchAllAPIs(state)
        allDistrictObjects = district_wise_population[state]["districts"]
        for (i = 0; i < allDistrictObjects.length; i++) {
            districtObject = allDistrictObjects[i]
            districtName = districtObject["districtName"]
            await fetchAllAPIs(state, districtObject["districtName"])
        }
    }
}


saveData()

// console.log(getCurrentDate())
// console.log(getOldDate(2))