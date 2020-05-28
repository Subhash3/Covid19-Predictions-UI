var imported = document.createElement('script');
imported.src = '../script/retrieve_data.js';
document.head.appendChild(imported);

var imported = document.createElement('script');
imported.src = "https://cdn.jsdelivr.net/npm/chart.js@2.9.3/dist/Chart.min.js";
document.head.appendChild(imported);

var imported = document.createElement('script');
imported.src = '../script/table.js';
document.head.appendChild(imported);

// displays states when clicked

function view_state(evt, state) {
    document.getElementById("India").style.display = "none";

    var disp_state = state.id+ " districts";
    document.getElementById(disp_state).style.display = "block";

    var backbtn = document.getElementById('backbtn');
    backbtn.style.display = "block";
    backbtn.name = disp_state; // temporarily maintaining which state is selected
}

// plot function

// function plot(state, district) {
//     console.log(state, district);
//     // plotGraph(state, district)
//     plot(state, district)
// }


// back to India map from state

function back(buttonObj) {
    document.getElementById("India").style.display = "block";
    document.getElementById(buttonObj.name).style.display = "none";

    buttonObj.style.display = "none";
    buttonObj.name = "";
}

// tooltip code

var tooltip = document.querySelector('#tooltip');

[].forEach.call(document.querySelectorAll('path'), function(item) {
    item.addEventListener('mouseenter', function() {
        var sel = this, pos = sel.getBoundingClientRect()
        
        tooltip.innerHTML = this.id;

        tooltip.style.display = 'block';
        tooltip.style.top = pos.top + 'px';
        tooltip.style.left = pos.left + 'px';


        // var x = event.screenX;    
        // var y = event.screenY;  

        // tooltip.style.top = y + 'px';
        // tooltip.style.left = x + 'px';

    });
  
    item.addEventListener('mouseleave', function(){
        tooltip.style.display = 'none';
    });
});