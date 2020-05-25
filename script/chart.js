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
    next_active.unshift(prev_active[p_len-1]);
    next_deaths.unshift(prev_deaths[p_len-1]);
    p_len -= 1
    console.log(next_active)
    for (i = 0; i < p_len; i++) {
        next_active.unshift(null);
        next_deaths.unshift(null);
    }
    console.log(next_active)


    for (i = 0; i < next_dates.length; i++) {
        prev_active.push(null);
        prev_deaths.push(null);
    }

    dates = prev_dates.concat(next_dates)

    activeChart(placename, dates, prev_active, next_active)
    deathChart(placename, dates, prev_deaths, next_deaths)

}



function activeChart(place, dates, prev_active, next_active) {

    var canvas = document.getElementById("achart");
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
                    beginAtZero: true
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

function deathChart(place, dates, prev_deaths, next_deaths) {

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
                    beginAtZero: true
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