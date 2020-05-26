// body = document.getElementsByTagName("body")
// console.log(body)

DISTRICT_API_URL = "https://api.covid19india.org/districts_daily.json"
STATE_API_URL = "https://api.covid19india.org/states_daily.json"
PREDICTION_API_URL = "http://40.76.33.143/predict/"

var lastplot = ""

DAYS = 7

STATE_CODES = {
    'State Unassigned': 'un', 'Andaman and Nicobar Islands': 'an',
    'Andhra Pradesh': 'ap', 'Arunachal Pradesh': 'ar', 'Assam': 'as',
    'Bihar': 'br', 'Chandigarh': 'ch', 'Chhattisgarh': 'ct', 'Delhi': 'dl',
    'Dadra and Nagar Haveli and Daman and Diu': 'dn', 'Goa': 'ga',
    'Gujarat': 'gj', 'Himachal Pradesh': 'hp', 'Haryana': 'hr',
    'Jharkhand': 'jh', 'Jammu and Kashmir': 'jk', 'Karnataka': 'ka',
    'Kerala': 'kl', 'Ladakh': 'la', 'Lakshadweep': 'ld', 'Maharashtra': 'mh',
    'Meghalaya': 'ml', 'Manipur': 'mn', 'Madhya Pradesh': 'mp', 'Mizoram': 'mz',
    'Nagaland': 'nl', 'Odisha': 'or', 'Punjab': 'pb', 'Puducherry': 'py',
    'Rajasthan': 'rj', 'Sikkim': 'sk', 'Telangana': 'tg', 'Tamil Nadu': 'tn',
    'Tripura': 'tr', 'Uttar Pradesh': 'up', 'Uttarakhand': 'ut', 'West Bengal': 'wb'
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
    PREDICTION_API = new URL(PREDICTION_API_URL)
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
    PREDICTION_API = new URL(PREDICTION_API_URL)
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

var plot = (state, district) => {
    // Only state is passed
    


    if (district == undefined || district == null) {
        console.log(state)

        if (lastplot == state) {
            console.log("Same plotted already")
        }
        else {
            console.log("Plotting....");
            prev = prevStates(state, district)
            next = nextStates(state, district)

            Promise.all([prev, next]).then(values => {
                console.log(values)

                prev = values[0]
                next = values[1]
                placeName = state
                drawChart(placeName, prev, next)

            })
        }

        lastplot = state
    }
    else {
        // State and District are passed
        console.log(state)
        console.log(district)

        if (lastplot == district) {
            console.log("Same plotted already")
        }
        else {
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
        lastplot = district
    }
}

// chart.js


function scaleYaxis(max_elem) {
    var dig = 0
    if (max_elem < 10)
        return 15
    while (max_elem > 9) {
        dig += 1
        max_elem /= 10
    }

    return ((max_elem + 2) * Math.pow(10, dig))
}
function drawChart(placename, prev, next) {
    var i;
    prev_dates = prev[0]
    next_dates = next[0]

    prev_active = prev[1]
    next_active = next[1]

    prev_deaths = prev[2]
    next_deaths = next[2]

    p_len = prev_dates.length

    //Next 3 lines to connect acitve and predicted lines in graph
    p_len -= 1
    next_active.unshift(prev_active[p_len]);
    next_deaths.unshift(prev_deaths[p_len]);

    var max_act = prev_active[p_len]
    var max_dead = prev_deaths[p_len]

    for (i = 0; i < p_len; i++) {
        next_active.unshift(null);
        next_deaths.unshift(null);

        if (prev_active[i] > max_act) {
            max_act = prev_active[i]
        }

        if (prev_deaths[i] > max_dead) {
            max_dead = prev_deaths[i]
        }
    }


    for (i = 0; i < next_dates.length; i++) {
        prev_active.push(null);
        prev_deaths.push(null);

        if (next_active[i] > max_act) {
            max_act = next_active[i]
        }

        if (next_deaths[i] > max_dead) {
            max_act = next_deaths[i]
        }
    }

    dates = prev_dates.concat(next_dates)

    max_act = scaleYaxis(max_act)
    max_dead = scaleYaxis(max_dead)

    activeChart(placename, dates, prev_active, next_active, max_act)
    deathChart(placename, dates, prev_deaths, next_deaths, max_dead)

}



function activeChart(place, dates, prev_active, next_active, yaxis_scale) {
    window.parent.$('#achart').remove();
    window.parent.$('#achart-cont').html('<canvas class="chart" id="achart"></canvas>');
    var canvas = window.parent.document.getElementById("achart");
    var ctx = canvas.getContext('2d');


    var data = {
        labels: dates,
        datasets: [{
            label: "Active",
            fill: false,
            lineTension: 0.2,
            borderColor: "blue",
            borderCapStyle: 'square',
            borderJoinStyle: 'miter',
            pointBackgroundColor: "black",
            pointBorderWidth: 0,
            pointHoverRadius: 8,
            pointHoverBackgroundColor: "black",
            pointHoverBorderWidth: 0,
            pointRadius: 3,
            pointHitRadius: 10,
            data: prev_active,
            spanGaps: true,
        },
        {
            label: "Predicted",
            fill: false,
            lineTension: 0.3,
            borderColor: "orange",
            borderCapStyle: 'square',
            borderJoinStyle: 'miter',
            pointBackgroundColor: "black",
            pointBorderWidth: 0,
            pointHoverRadius: 8,
            pointHoverBackgroundColor: "black",
            pointHoverBorderWidth: 0,
            pointRadius: 3,
            pointHitRadius: 10,
            data: next_active,
            spanGaps: true,
        }

        ]
    };

    var options = {
        title: {
            display: true,
            text: place + ' Active cases Predictions(next 7 days)'
        },
        responsive: true,
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero: true,
                    suggestedMax: yaxis_scale
                }
            }],
            xAxes: [{
                ticks: {
                    autoSkip: false
                }
            }]
        },
        legend: {
            display: true,
            position: 'bottom'
        },
        layout: {
            padding: 30
        }
    };

    var mchart = new Chart(ctx, {
        type: 'line',
        data: data,
        options: options
    });
}

function deathChart(place, dates, prev_deaths, next_deaths, yaxis_scale) {

    window.parent.$('#dchart').remove();
    window.parent.$('#dchart-cont').html('<canvas class="chart" id="dchart"></canvas>');
    var canvas = window.parent.document.getElementById("dchart");
    var ctx = canvas.getContext('2d');

    var data = {
        labels: dates,
        datasets: [{
            label: "Deaths",
            fill: false,
            lineTension: 0.2,
            borderColor: "red",
            borderCapStyle: 'square',
            borderJoinStyle: 'miter',
            pointBackgroundColor: "black",
            pointBorderWidth: 0,
            pointHoverRadius: 8,
            pointHoverBackgroundColor: "black",
            pointHoverBorderWidth: 0,
            pointRadius: 3,
            pointHitRadius: 10,
            data: prev_deaths,
            spanGaps: true,
        }, {
            label: "Predicted",
            fill: false,
            lineTension: 0.3,
            borderColor: 'rgb(97, 27, 45)',
            borderCapStyle: 'square',
            borderJoinStyle: 'miter',
            pointBackgroundColor: "black",
            pointBorderWidth: 0,
            pointHoverRadius: 8,
            pointHoverBackgroundColor: "black",
            pointHoverBorderWidth: 0,
            pointRadius: 3,
            pointHitRadius: 10,
            data: next_deaths,
            spanGaps: true,
        }

        ]
    };

    var options = {
        title: {
            display: true,
            text: place + ' Deceased Predictions(next 7 days)'
        },
        responsive: true,
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero: true,
                    suggestedMax: yaxis_scale
                }
            }],
            xAxes: [{
                ticks: {
                    autoSkip: false
                }
            }]
        },
        legend: {
            display: true,
            position: 'bottom'
        },
        layout: {
            padding: 30
        }
    };

    var mchart = new Chart(ctx, {
        type: 'line',
        data: data,
        options: options
    });
}
