DISTRICT_API_URL = "https://api.covid19india.org/districts_daily.json"
STATE_API_URL = "https://api.covid19india.org/states_daily.json"
PREDICTION_API = "http://40.76.33.143/predict/"

DAYS = 7

STATE_CODES = { 'State Unassigned': 'un', 'Andaman and Nicobar Islands': 'an', 'Andhra Pradesh': 'ap', 'Arunachal Pradesh': 'ar', 'Assam': 'as', 'Bihar': 'br', 'Chandigarh': 'ch', 'Chhattisgarh': 'ct', 'Delhi': 'dl', 'Dadra and Nagar Haveli and Daman and Diu': 'dn', 'Goa': 'ga', 'Gujarat': 'gj', 'Himachal Pradesh': 'hp', 'Haryana': 'hr', 'Jharkhand': 'jh', 'Jammu and Kashmir': 'jk', 'Karnataka': 'ka', 'Kerala': 'kl', 'Ladakh': 'la', 'Lakshadweep': 'ld', 'Maharashtra': 'mh', 'Meghalaya': 'ml', 'Manipur': 'mn', 'Madhya Pradesh': 'mp', 'Mizoram': 'mz', 'Nagaland': 'nl', 'Odisha': 'or', 'Punjab': 'pb', 'Puducherry': 'py', 'Rajasthan': 'rj', 'Sikkim': 'sk', 'Telangana': 'tg', 'Tamil Nadu': 'tn', 'Tripura': 'tr', 'Uttar Pradesh': 'up', 'Uttarakhand': 'ut', 'West Bengal': 'wb' }

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
    response = await fetch(DISTRICT_API_URL)
    jsonData = await response.json()

    districtsData = jsonData["districtsDaily"]
    stateObject = districtsData[state]
    districtObject = stateObject[district]
    required_days = districtObject.slice(Math.max(districtObject.length - DAYS, 1))

    prev_dates = []
    prev_active = []
    prev_deaths = []
    required_days.forEach(day_object => {
        prev_dates.push(day_object["date"])
        prev_active.push(day_object["active"])
        prev_deaths.push(day_object["deceased"])
    });
    return [prev_dates, prev_active, prev_deaths]
}

async function nextDistricts(state, district) {
    PREDICTION_API = new URL(PREDICTION_API)
    PREDICTION_API.searchParams.append("state", state)
    PREDICTION_API.searchParams.append("district", district)

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
}

async function prevStates(state) {
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
}

async function nextStates(state) {
    PREDICTION_API = new URL(PREDICTION_API)
    PREDICTION_API.searchParams.append("state", state)

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
}

var retriveData = (state, district) => {
    // Only state is passed
    if (district == undefined) {
        prev = prevStates(state, district)
        next = nextStates(state, district)

        Promise.all([prev, next]).then(values => {
            console.log(values)

            prev = values[0]
            next = values[1]
            placeName = state
            drawChart(placeName, prev, next)

        })
    } else {
        // State and District are passed
        prev = prevDistricts(state, district)
        next = nextDistricts(state, district)

        Promise.all([prev, next]).then(values => {
            console.log(values)

            prev = values[0]
            next = values[1]
            placeName = state + " => " + district
            drawChart(placeName, prev, next)
        })
    }
}

