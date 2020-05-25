var imported = document.createElement('script');
imported.src = '../script/retrieve_data.js';
document.head.appendChild(imported);

function plotGraph(state, district) {
    console.log("Main Plotter");
    retriveData(state, district)
}