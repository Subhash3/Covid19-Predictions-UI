var imported = document.createElement('script');
imported.src = '../script/retrieve_data.js';
document.head.appendChild(imported);

var imported = document.createElement('script');
imported.src = "https://cdn.jsdelivr.net/npm/chart.js@2.9.3/dist/Chart.min.js";
document.head.appendChild(imported);

var imported = document.createElement('script');
imported.src = '../script/table.js';
document.head.appendChild(imported);

// heading variables
var main_heading = document.querySelector('#main_heading');
var side_heading = document.querySelector('#side_heading');


// displays states when clicked
function view_state(evt, state) {
    document.getElementById("India").style.display = "none";

    var disp_state = state.id+ " districts";
    document.getElementById(disp_state).style.display = "block";

    var backbtn = document.getElementById('backbtn');
    backbtn.style.display = "block";
    backbtn.name = disp_state; // temporarily maintaining which state is selected

    main_heading.innerHTML = state.id;
}

// plot function
function plot(state, district) {
    console.log(state, district);
    // plotGraph(state, district)
    plot(state, district)
}


// back to India map from state
function back(buttonObj) {
    document.getElementById("India").style.display = "block";
    document.getElementById(buttonObj.name).style.display = "none";

    buttonObj.style.display = "none";
    buttonObj.name = "";

    main_heading.innerHTML = "India"
}

// tooltips and headings
var tooltip = document.querySelector('#tooltip');

[].forEach.call(document.querySelectorAll('path'), function(item) {
    item.addEventListener('mouseenter', function(event) {
        tooltip.innerHTML = this.id;
        tooltip.style.display = 'block';

        var x = event.pageX;    
        var y = event.pageY;  

        tooltip.style.top = y + 'px';
        tooltip.style.left = x + 'px';

        side_heading.innerHTML = this.id;
    });
  
    item.addEventListener('mouseleave', function(){
        tooltip.style.display = 'none';
        side_heading.innerHTML = '&nbsp;';
    });
});