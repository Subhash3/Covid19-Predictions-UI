DATASETS_DIR = '../Datasets/'
LAST_PLOTTED = ""

// const fs = require('fs')

function getDate() {

    var d = new Date();

    machine_hours = d.getHours()
    utc_hours = d.getUTCHours()

    if (machine_hours == utc_hours) {
        d = new Date(d.getTime() + (5.5 * 60 * 60 * 1000));
    }

    return d
}

function getCurrentDate() {
    let date_ob = getDate();

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
    response = await fetch(DATASETS_DIR + filename)
    var jsonData = []
    if (response.status >= 200 && response.status <= 299) {
        jsonData = await response.json();
        // console.log(jsonResponse);
    } else {
        // Handle errors
        jsonData = null
        console.log(response.status, response.statusText);
    }

    return jsonData
}

// readData('Andhra Pradesh', null, getCurrentDate());



async function plot(state, district) {

    // if some state fixed, womt plot
    if (fixed_id != "") {
        return false;
    }

    // Only state is passed
    if (district == undefined || district == null) {
        var placeName = state

        if (LAST_PLOTTED == state) {
            console.log("Same plotted already")
        }
        else {
            console.log("Plotting....", state);
            values = await readData(state, district, getCurrentDate())
            // console.log(values)
            $('#state-name').html(state)
            $('#district-name').html('')
            if (values == null || values[0] == null || values[1] == null) {
                $('#achart-cont').css('filter', 'opacity(1%)');
                $('#dchart-cont').css('filter', 'opacity(1%)');
                $('#atableP').css('filter', 'opacity(1%)');
                $('#dtableP').css('filter', 'opacity(1%)');
                $('#dchart-cont').html('<h2>Data not Available</h2>');
                $('#achart-cont').html('<h2>Data not Available</h2>');
                $('#atitle').html(placeName)
                $('#dtitle').html(placeName)

                console.log('Plot failed')
            }
            else {
                prev = values[0]
                next = values[1]

                $('#achart-cont').css('filter', 'opacity(100%)');
                $('#dchart-cont').css('filter', 'opacity(100%)');
                $('#atableP').css('filter', 'opacity(100%)');
                $('#dtableP').css('filter', 'opacity(100%)');
                drawChart(placeName, prev, next)
            }
            LAST_PLOTTED = state
        }

    }
    else {
        // State and District are passed

        var placeName = state + '=>' + district
        if (LAST_PLOTTED == district) {
            console.log("Same plotted already")
        }
        else {
            console.log('Plotting....')
            console.log(state, district)
            values = await readData(state, district, getCurrentDate())
            $('#state-name').html(state)
            $('#district-name').html(district)
            // console.log(values)
            if (values == null || values[0] == null || values[1] == null) {
                $('#atableP').css('filter', 'opacity(1%)');
                $('#dtableP').css('filter', 'opacity(1%)');
                $('#achart-cont').html('<h2>Data not Available</h2>');
                $('#dchart-cont').html('<h2>Data not Available</h2>');
                $('#atitle').html(placeName)
                $('#dtitle').html(placeName)
            }
            else {
                prev = values[0]
                next = values[1]
                $('#atableP').css('filter', 'opacity(100%)');
                $('#dtableP').css('filter', 'opacity(100%)');

                drawChart(placeName, prev, next)
            }
            LAST_PLOTTED = state
        }
    }
}

function clearHeading() {
    $('#state-name').remove()
    $('#district-name').remove()
}
function clearGraph() {

    $('#achart').remove();
    $('#dchart').remove();
    $('#dchart-cont').html('<canvas class="chart" id="dchart"></canvas>');
    $('#achart-cont').html('<canvas class="chart" id="achart"></canvas>');
}

function scaleYaxis(max_elem) {
    var dig = 0
    if (max_elem < 10)
        return 15
    while (max_elem > 9) {
        dig += 1
        max_elem /= 10
    }
    if (dig < 3) {

        return ((max_elem + 2) * Math.pow(10, dig))
    }
    else {
        return ((max_elem + 1) * Math.pow(10, dig))
    }

}
function max_element(arr1, arr2)
{
    max = 0

    for ( i = 0; i < arr1.length; i++ )
    {
        if ( arr1[i] > max)
            max = arr1[i] 
    }

    for ( i = 0; i < arr2.length; i++ )
    {
        if ( arr2[i] > max)
            max = arr2[i] 
    }

    return max
}


function drawChart(placename, prev, next) {
    prev_dates = prev[0]
    next_dates = next[0]

    prev_active = prev[1]
    next_active = next[1]

    prev_deaths = prev[2]
    next_deaths = next[2]

    clearTable('#atableH', '#atableP', '#atitle')
    clearTable('#dtableH', '#dtableP', '#dtitle')
    createTable(['Date', 'Active', 'Deceased', placename], '#atableH', '#atitle')
    createTable(['Date', 'Forecasted Active', 'Forecasted Deceased',], '#dtableH', '#dtitle')
    fillTable([prev_dates, prev_active, prev_deaths], '#atableP')
    fillTable([next_dates, next_active, next_deaths], '#dtableP')
    p_len = prev_dates.length

    for (i = 0; i < p_len; i++) {
        if (prev_dates[i] == next_dates[0]) {
            break;
        }
        next_active.unshift(null);
        next_deaths.unshift(null);
    }
    dates = prev_dates.slice(0, i)
    dates = dates.concat(next_dates)

    for (; i < dates.length; i++) {
        prev_active.push(null);
        prev_deaths.push(null);
    }
    max_act = scaleYaxis(max_element(prev_active, next_active))
    max_dead = scaleYaxis(max_element(prev_deaths, next_deaths))

    clearGraph()
    activeChart(placename, dates, prev_active, next_active, max_act)
    deathChart(placename, dates, prev_deaths, next_deaths, max_dead)
}

// function getStepSize(yaxis_scale) {
//     if ( yaxis_scale < 19 )
//     {
//         return 2
//     }
//     else if ( yaxis_scale < 31 )
//     {
//         return 4
//     }
//     else if ( yaxis_scale < 51 )
//    
//         return 5
//     }
//     else if (yaxis_scale < 101) {
//         return 10
//     }
//     else if (yaxis_scale < 501) {
//         return 50
//     }
//     else if (yaxis_scale < 1001) {
//         return 100
//     }
//     else if (yaxis_scale < 5001) {
//         return 500
//     }
//     else if (yaxis_scale < 10001) {
//         return 2000
//     }
//     else if (yaxis_scale < 500001){
//         return 5000
//     }
//     else{
//         return 10000
//     }
// }

function activeChart(place, dates, prev_active, next_active, yaxis_scale) {

    var canvas = document.getElementById("achart");
    var ctx = canvas.getContext('2d');

    // var step_size = getStepSize(yaxis_scale)
    // console.log(yaxis_scale, step_size)
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
            label: "Forecast",
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
            text: place + ' Active cases Forecast(next 7 days)'
        },
        maintainAspectRatio: false,
        responsive: true,
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero: true,
                    suggestedMax: yaxis_scale,
                    // stepSize: step_size
                    maxTicksLimit: 9
                }
            }],
            xAxes: [{
                ticks: {
                    // autoSkip: false
                }
            }]
        },
        legend: {
            display: true,
            position: 'bottom'
        },
        layout: {
            padding: 30
        },
        tooltips: {

            mode: 'x',
            intersect : false
        }
    };

    var mchart = new Chart(ctx, {
        type: 'line',
        data: data,
        options: options
    });
}

function deathChart(place, dates, prev_deaths, next_deaths, yaxis_scale) {



    var canvas = document.getElementById("dchart");
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
            label: "Forecast",
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
            text: place + ' Deceased Forecast(next 7 days)'
        },
        maintainAspectRatio: false,
        responsive: true,
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero: true,
                    suggestedMax: yaxis_scale,
                    maxTicksLimit: 9
                }
            }],
            xAxes: [{
                ticks: {
                    // autoSkip: false
                }
            }]
        },
        legend: {
            display: true,
            position: 'bottom'
        },
        layout: {
            padding: 30
        },
        tooltips: {

            mode: 'x',
            intersect : false
        }
    };

    var mchart = new Chart(ctx, {
        type: 'line',
        data: data,
        options: options
    });
}


