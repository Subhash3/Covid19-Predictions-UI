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

// fixed state / district id
var fixed_id = "";

// displays states when double clicked
function view_state(state) {
    document.getElementById("India").style.display = "none";

    var disp_state = state.id+ " districts";
    document.getElementById(disp_state).style.display = "block";

    var backbtn = document.getElementById('backbtn');
    backbtn.style.display = "block";
    backbtn.name = disp_state; // temporarily maintaining which state is selected

    main_heading.innerHTML = state.id;

    if (fixed_id != '') {
        unfix_state();
    }
}

// back to India map from state
function back(buttonObj) {
    document.getElementById("India").style.display = "block";
    document.getElementById(buttonObj.name).style.display = "none";

    buttonObj.style.display = "none";
    buttonObj.name = "";

    main_heading.innerHTML = "India"

    if (fixed_id != '') {
        unfix_state();
    }
}

// unfix state
function unfix_state() {
    var unfix_id = document.getElementById(fixed_id);
    var unfix    = unfix_id.getAttribute('class');
    unfix = unfix.replace(' fixed', '');
    unfix_id.setAttribute('class', unfix);
    fixed_id = '';
}


// seperate click and double click
var timer = 0;
var delay = 200;
var prevent = false;

[].forEach.call(document.querySelectorAll('.india_state'), function(item) {
    item.addEventListener('click', function() {
        timer = setTimeout(function() {
            if (!prevent) {
            //   doClickAction();
            //   already defined in next block of code
            //   this just to make sure double click event
            //   is not confused with 2 single clicks
            }
            prevent = false;
        }, delay);
    })

    item.addEventListener('dblclick', function() {
        clearTimeout(timer);
        prevent = true;
        view_state(this);
    })
});

// tooltips, headings and fixing states/districts
var tooltip = document.querySelector('#tooltip');

[].forEach.call(document.querySelectorAll('path'), function(item) {
    item.addEventListener('click', function() {
        var temp = this.getAttribute('class');
        console.log(temp);

        if (temp == null || temp.indexOf(' fixed') == -1){
            temp += ' fixed';
            this.setAttribute('class', temp);

            if (fixed_id != '') {
                unfix_state();

                // states 
                if (this.parentNode.id == '') {
                    plot(this.id, null);
                }
                else {
                    var state = this.parentNode.id;
                    state     = state.replace(' districts', '');
                    var dist  = this.id;
                    plot(state, dist);
                }
            }
            fixed_id = this.id;
        }        
        else {
            temp = temp.replace(' fixed', '');
            this.setAttribute('class', temp);
            fixed_id = "";
        }
    }); 

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