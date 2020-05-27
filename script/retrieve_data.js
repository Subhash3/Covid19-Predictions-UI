DATASETS_DIR = '../Datasets/'
LAST_PLOTTED = ""

// const fs = require('fs')

function getCurrentDate() {
    let date_ob = new Date();

    let date = ("0" + date_ob.getDate()).slice(-2);
    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
    let year = date_ob.getFullYear();

    var curdate = year + "-" + month + "-" + date
    return curdate
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

async function readData(state, district, dt) {

    filename = createFileName(state, district, dt)
    // let rawdata = fs.readFileSync(filename);
    // let dataset = JSON.parse(rawdata);

    // fs.readFile('Input.txt', (err, rawdata) => {
    //     if (err) throw err;
    //     let dataset = JSON.parse(rawdata);
    // })
    response = await fetch(DATASETS_DIR + filename)
    jsonData = await response.json()

    return jsonData
}

// readData('Andhra Pradesh', null, getCurrentDate());


async function plot(state, district) {
    // Only state is passed

    if (district == undefined || district == null) {
        console.log(state)

        if (LAST_PLOTTED == state) {
            console.log("Same plotted already")
        }
        else {
            console.log("Plotting....");
            values = await readData(state, district, getCurrentDate())
            prev = values[0]
            next = values[1]
            placeName = state

            window.parent.$('#state-name').html(state)
            // window.parent.$('#state-name').addClass('state')

            drawChart(placeName, prev, next)

            LAST_PLOTTED = state

        }

    }
    else {
        // State and District are passed
        console.log(state)
        console.log(district)

        if (LAST_PLOTTED == district) {
            console.log("Same plotted already")
        }
        else {
            values = await readData(state, district, getCurrentDate())

            prev = values[0]
            next = values[1]
            placeName = state + " => " + district

            window.parent.$('#state-name').html(state)
            window.parent.$('#district-name').html(district)
            drawChart(placeName, prev, next)
            LAST_PLOTTED = district
        }
    }
}



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
        maintainAspectRatio: false,
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
        maintainAspectRatio: false,
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
