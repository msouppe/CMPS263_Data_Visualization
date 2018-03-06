/*  Set the demensions and margins of the diagram */
var margin = {top: 20, right: 300, bottom: 20, left: 120},
    width = 10000 - margin.right - margin.left,
    height = 900 - margin.top - margin.bottom,
    padding_left = 200;

var svg = d3.select("#map").append('svg').attr("width", width).attr("height", height);

var path = d3.geoPath();

/* For toggling colors on map */
var counter = 0, tract_counter = 0;
var color = d3.scaleThreshold()
    .domain([1, 10, 50, 200, 500, 1000, 2000, 4000])
    .range(d3.schemeOrRd[9]);

/* Showing map when first loading page */
init();

var state_border_on=false, state_border_off=false, tract_on=false, tract_off=false; 

d3.select("#color_t").on("click", color_toggle);
d3.select("#tract").on("click", tract_toggle);

function init() {
    legend();
    click_tract_off();
}

function color_toggle() {
    console.log(counter);
    svg.selectAll("g").remove();
    if (counter%2 == 0) {
        color.range(d3.schemePuBu[9]);
        tract_counter -= 1;
        tract_toggle();
    } else {
        color.range(d3.schemeOrRd[9]);
        tract_counter -= 1;
        tract_toggle();
    }
    counter += 1;
    return color;
}

function legend() {
    console.log("legend");
    var x = d3.scaleSqrt()
        .domain([0, 4500])
        .rangeRound([440, 950]);

    var g = svg.append("g")
        .attr("class", "key")
        .attr("transform", "translate(-425,40)");

    g.selectAll("rect")
      .data(color.range().map(function(d) {
          d = color.invertExtent(d);
          if (d[0] == null) d[0] = x.domain()[0];
          if (d[1] == null) d[1] = x.domain()[1];
          return d;
        }))
      .enter().append("rect")
        .attr("height", 8)
        .attr("x", function(d) { return x(d[0]); })
        .attr("width", function(d) { return x(d[1]) - x(d[0]); })
        .attr("fill", function(d) { return color(d[0]); });

    g.append("text")
        .attr("class", "caption")
        .attr("x", x.range()[0])
        .attr("y", -6)
        .attr("fill", "#000")
        .attr("text-anchor", "start")
        .attr("font-weight", "bold")
        .text("Population per square mile");

    g.call(d3.axisBottom(x)
        .tickSize(13)
        .tickValues(color.domain()))
      .select(".domain")
        .remove();
}

function click_state(){
    console.log("click_state");
    svg.selectAll("g").remove();
    legend();
    
    d3.json("or-merge-topo.json", function(error, topology) {
        if (error) throw error;

        svg.append("g")
        .selectAll("path")
        .data(topojson.feature(topology, topology.objects.tracts).features)
        .enter().append("path")
          .attr("fill", function(d) { return color(d.properties.density); })
          .attr("stroke-opacity", 0.4)
          .attr("d", path);

        svg.append("path")
          .datum(topojson.feature(topology, topology))
          .attr("fill", "none")
//          .attr("stroke", "#000")
          .attr("stroke-opacity", 0.4)
          .attr("d", path);
    });
}

function click_state_border(){
    console.log("click_state_border");
    svg.selectAll("g").remove();
    legend();

    d3.json("or-merge-topo.json", function(error, topology) {
        if (error) throw error;

        svg.append("g")
        .selectAll("path")
        .data(topojson.feature(topology, topology.objects.tracts).features)
        .enter().append("path")
          .attr("fill", function(d) { return color(d.properties.density); })
          .attr("stroke-opacity", 0.4)
          .attr("d", path);

        svg.append("path")
          .datum(topojson.feature(topology, topology.objects.counties))
          .attr("fill", "none")
          .attr("stroke", "#000")
          .attr("stroke-opacity", 0.4)
          .attr("d", path);
    });
}

/* Census Tract With Out Tract */
function click_tract_off(){
    tract_counter += 1;
    console.log("click_tract_off");
    svg.selectAll("g").remove();
    legend();
    
    d3.json("or-topo.json", function(error, topology) {
        if (error) throw error;

        /* Colors for every county */
        svg.append("g")
        .selectAll("path")
        .data(topojson.feature(topology, topology.objects.tracts).features)
        .enter().append("path")
          .attr("stroke", "none")
//          .attr("stroke-width", ".5")
          .attr("fill", function(d) { return color(d.properties.density); })
          .attr("d", path);

        svg.append("path")
          .datum(topojson.feature(topology, topology.objects.counties))
          .attr("fill", "none")
          .attr("stroke", "black") 
          .attr("stroke-opacity", 1)
          .attr("d", path);
    });
}

/* Census Tract With Tract */
function click_tract_on(){
    tract_counter += 1;
    console.log("click_tract_on");
    svg.selectAll("g").remove();
    legend();
    
    d3.json("or-topo.json", function(error, topology) {
        if (error) throw error;

        /* Color and lines for population density and county */
        svg.append("g")
        .selectAll("path")
        .data(topojson.feature(topology, topology.objects.tracts).features)
        .enter().append("path")
          .attr("stroke", "black")
          .attr("stroke-opacity", 1)
          .attr("fill", function(d) { return color(d.properties.density); })
          .attr("d", path);

        /* Lines around every county */
        svg.append("path")
          .datum(topojson.feature(topology, topology.objects.counties))
          .attr("fill", "none")
          .attr("stroke", "black") 
          .attr("stroke-opacity", 0.9)
          .attr("d", path);
    });
}

function tract_toggle() {
    console.log("tract_toggle");
    if (tract_counter%2 == 0) {
        click_tract_off();
    } else {
        click_tract_on();
    }
}

