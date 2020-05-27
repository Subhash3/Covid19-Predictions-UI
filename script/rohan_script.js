var imported = document.createElement('script');
imported.src = '../script/retrieve_data.js';
document.head.appendChild(imported);

var imported = document.createElement('script');
imported.src = "https://cdn.jsdelivr.net/npm/chart.js@2.9.3/dist/Chart.min.js";
document.head.appendChild(imported);

var imported = document.createElement('script');
imported.src = '../script/table.js';
document.head.appendChild(imported);

function plot(state, district) {
    console.log(state, district);
    // plotGraph(state, district)
    plot(state, district)
}
