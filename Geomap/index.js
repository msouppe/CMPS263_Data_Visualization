/*  Set the demensions and margins of the diagram */
var margin = {top: 20, right: 300, bottom: 20, left: 120},
    width = 10000 - margin.right - margin.left,
    height = 900 - margin.top - margin.bottom,
    padding_left = 200;

var svg = d3.select("#map").append('svg').attr("width", width).attr("height", height);

var path = d3.geoPath();

var color = d3.scaleThreshold()
    .domain([1, 10, 50, 200, 500, 1000, 2000, 4000])
    .range(d3.schemeOrRd[9]);

var x = d3.scaleSqrt()
    .domain([0, 4500])
    .rangeRound([440, 950]);

/* Legend */
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


d3.select("#state").on("click", click_state);

d3.select("#state_b").on("click", click_state_border);

d3.select("#census").on("click", click_census);

d3.select("#census_b").on("click", click_census_border);

function click_state(){
    console.log("click_state");
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
          .attr("stroke-opacity", 1)
          .attr("d", path);
    });
}

function click_state_border(){
    console.log("click_state");
    svg.attr("fill", "white");
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
          .attr("stroke-opacity", 1)
          .attr("d", path);
    });
}

function click_census(){
    console.log("click_census");
    svg.attr("fill", "white");
    d3.json("or-topo.json", function(error, topology) {
        if (error) throw error;

        /* Colors for every county */
        svg.append("g")
        .selectAll("path")
        .data(topojson.feature(topology, topology.objects.tracts).features)
        .enter().append("path")
          .attr("stroke", "none")
          .attr("stroke-width", "1")
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

function click_census_border(){
    console.log("click_census");
    svg.attr("fill", "white");
    d3.json("or-topo.json", function(error, topology) {
        if (error) throw error;

        /* Color and lines for population density and county */
        svg.append("g")
        .selectAll("path")
        .data(topojson.feature(topology, topology.objects.tracts).features)
        .enter().append("path")
          .attr("stroke", "black")
          .attr("stroke-opacity", 0.5)
          .attr("fill", function(d) { return color(d.properties.density); })
          .attr("d", path);

        /* Lines around every county */
        svg.append("path")
          .datum(topojson.feature(topology, topology.objects.counties))
          .attr("fill", "none")
          .attr("stroke", "black") 
          .attr("stroke-opacity", 0.3)
          .attr("d", path);
    });
}

