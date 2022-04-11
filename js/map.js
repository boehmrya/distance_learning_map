var state_id =  {
    '01': 'AL',
    '02': 'AK',
    '04': 'AZ',
    '05': 'AR',
    '06': 'CA',
    '08': 'CO',
    '09': 'CT',
    '10': 'DE',
    '11': 'DC',
    '12': 'FL',
    '13': 'GA',
    '15': 'HI',
    '16': 'ID',
    '17': 'IL',
    '18': 'IN',
    '19': 'IA',
    '20': 'KS',
    '21': 'KY',
    '22': 'LA',
    '23': 'ME',
    '24': 'MD',
    '25': 'MA',
    '26': 'MI',
    '27': 'MN',
    '28': 'MS',
    '29': 'MO',
    '30': 'MT',
    '31': 'NE',
    '32': 'NV',
    '33': 'NH',
    '34': 'NJ',
    '35': 'NM',
    '36': 'NY',
    '37': 'NC',
    '38': 'ND',
    '39': 'OH',
    '40': 'OK',
    '41': 'OR',
    '42': 'PA',
    '44': 'RI',
    '45': 'SC',
    '46': 'SD',
    '47': 'TN',
    '48': 'TX',
    '49': 'UT',
    '50': 'VT',
    '51': 'VA',
    '53': 'WA',
    '54': 'WV',
    '55': 'WI',
    '56': 'WY'
  };


// to handle lookups to detect when small states are clicked
var small_states =  {
    'VT': 'Vermont',
    'NH': 'New Hampshire',
    'MA': 'Massachusetts',
    'RI': 'Rhode Island',
    'CT': 'Connecticut',
    'NJ': 'New Jersey',
    'DE': 'Delaware',
    'MD': 'Maryland',
    'DC': 'District of Columbia'
};



jQuery(function($){


  function drawMap(w) {

    //Width and height of map
    var width = parseInt(d3.select('#state-map').style('width'));
    var mapRatio = .65
    var height = width * mapRatio;
    var viewBox = "0 0 " + width + " " + height;

    // D3 Projection
    var projection = d3.geo.albersUsa()
    				   .translate([width/2, height/2])    // translate to center of screen
    				   .scale([1.4 * width]);          // scale things down so see entire US

    // Define path generator
    var path = d3.geo.path()               // path generator that will convert GeoJSON to SVG paths
    		  	 .projection(projection);  // tell path generator to use albersUsa projection


    //Create SVG element and append map to the SVG
    var svg = d3.select("#state-map")
    			.append("svg")
          .attr("preserveAspectRatio", "xMinYMin meet")
          .attr("viewBox", viewBox)
    			.attr("width", width)
    			.attr("height", height);

    // Load GeoJSON for US States
    //d3.json("/wp-content/themes/explore-beyond/maps/us-states.json", function(json) {
    d3.json("../maps/us-states.json", function(json) {


      // Bind the data to the SVG and create one path per GeoJSON feature
      // This builds the map
      svg.selectAll("path")
        .data(json.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("id", function(d) { return state_id[d.id]; })
        .attr("class", 'state')
        .style("cursor", "pointer")
        .style("stroke", "rgb(255,255,255)")
        .style("stroke-width", "1.5")
        .on('mouseover', function(d, i) {
          d3.select(this).classed('active-hover', true);
        })
        .on('mouseout', function(d, i) {
          d3.select(this).classed('active-hover', false);
        })
        .on('click', function(d, i) {
          // update the select list to the chosen state
          $("#filterFormStateSelect").val(state_id[d.id]).trigger('change');
        });

    });

  }

  function removeMap() {
    $('#state-map svg').remove();
  }


  // trigger map click events on select list change events
  $("#filterFormStateSelect").change(function() {
    $("#filterFormStateSelect option:selected").each(function(){
      var selected = $(this).val();
      var selected_elem = '.map__state-map svg #' + selected;

      // update the map
      d3.selectAll('path.state').classed('active', false); // remove active classes

      d3.select(selected_elem).classed('active', true); // add active class to current element

      // update style of small states
      updateSmallStates(selected);

      console.log(selected);
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({'event': 'distance_learning_map_state_click',
                      'distance_learning_map_state_id': selected });

      // update data in sidebar
      updateData(selected);
    });
  });

  // update information in sidebar card
  // runs when dot is clicked or option in dropdown is selected
  function updateData(state_id) {
    // get location from dict
    var state = data_states_metrics[state_id];

    // fill in cale isps with name and link
    // first, empty out the block
    jQuery("#isp-operator-names").empty();

    // Loading provider names into array to allow alpha sorting of provider images (quickfix - this module is not tied to its own Drupal admin sort preference...)
    var providerNames = [];
    jQuery.each(data_states_metrics[state_id].providers, function(i,v) {
         providerNames.push(this.name);
    });

    providerNames.sort();

    for(var q=0; q < providerNames.length; q++) {
        jQuery.each(data_states_metrics[state_id].providers, function(i,v) {
            if (this.name == providerNames[q]) {
              jQuery("#isp-operator-names").append("<div class=\"map__provider\"><a class=\"map__provider-link\" href=\"" + this.link + "\" target=\"_blank\">" + this.name + "</a></div>");
            }
        });
    }

    var distanceLearningMapCompanyLink = $('.map__provider-link');
    distanceLearningMapCompanyLink.on('click', function() {
      var companyLinkText = $(this).text();
      console.log(companyLinkText)
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({'event': 'distance_learning_map_company_link_click',
                      'distance_learning_map_company_link_name': companyLinkText });
    });
  }
  // end updateData function

  // trigger events when small boxes are clicked
  $('.small-state__box').on('click', function() {
    // clear colors on all existing small boxes
    $('.small-state__box').removeClass('active-state');

    // make the current small state active
    $(this).addClass('active-state');

    // split the id on the box to get the state abbreviation
    var box_id = $(this).attr('id');
    var box_id_parts = box_id.split("-");
    var box_state = box_id_parts[0];

    // set value in the select list and trigger an on change event
    $("#filterFormStateSelect").val(box_state).trigger('change');
  });


  function updateSmallStates(state_abbrev) {
    // clear colors on all existing small boxes
    $('.small-state__box').removeClass('active-state');

    // check if it is a small state
    // if so, find the box and make it active
    if (small_states.hasOwnProperty(state_abbrev)) {
      var state_box_id = '#' + state_abbrev + '-Box';
      $(state_box_id).addClass('active-state');
    }
  }

  // initialize map and data
  var w = window.innerWidth;
  if (w > 767) {
    drawMap(w);
  }
  // convert select list into custom menu
  $('#filterFormStateSelect').select2();
  updateData('US');


});
