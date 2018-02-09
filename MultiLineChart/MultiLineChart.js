/* Defining where the graph will be sketched along with the height, width, xaxis, yaxis, and scale of the bar graph */
var margin = {top: 10, right: 70, bottom: 150, left: 70},
    width = 700 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

/* Setting up area for multi-line graph */
var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

/*  */
var parseTime = d3.timeParse("%Y");

/* Setting up the ranges for the x and y scales and color scheme for the lines */
var x = d3.scaleTime().range([0, width]),
    y = d3.scaleLinear().range([height, 0]),
    z = d3.scaleOrdinal(d3.schemeCategory10);

/* Creates smooth lines */
var line = d3.line()
    .curve(d3.curveBasis)
    .x(function(d) { return x(d.date); })
    .y(function(d) { return y(d.epc); });

/* Define X and Y AXIS */
var xAxis = d3.axisBottom(x);
var yAxis = d3.axisLeft(y);

/*  Obtaining data from csv file
    Source: 
    Mike Bostock (Multi-Series Line Chart) https://bl.ocks.org/mbostock/3884955 */
d3.csv("data.csv", function (d) {
    /*  Translate the date into a date object 
        Source:
        https://bl.ocks.org/mbostock/4b66c0d9be9a0d56484e
    */
    d.date = parseTime(d.date);
    for (var k in d) if (k !== "date") d[k] = +d[k];
    return d;
}, function (error, data) {
    if (error) throw error;
    
    var countries = data.columns.slice(1).map(function(id) {
        return {
            id: id,
            values: data.map(function(d) {
                /* + operator converts data into int */
                return {
                    date: d.date, epc: +d[id]
                };
            })
        };
    });
    
    /* Creating the domains for x, y, and z */
    /* d3.extent - finds the min and max in an array */
    x.domain(d3.extent(data, function(d) { return d.date; }));

    y.domain([ 0, d3.max(countries, function(c) { return d3.max(c.values, function(d) { return d.epc; }); }) ]);
    
    z.domain(countries.map(function(c) { return c.id; }));
    
    svg.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .append("text")
        .attr("x", 700 - margin.right - margin.top)
        .attr("dy", "0.71em")
        .attr("fill", "#000")
        .text("Year");

    svg.append("g")
        .attr("class", "axis axis--y")
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -100)
        .attr("y", -45)
        .attr("dy", "0.71em")
        .attr("fill", "#000")
        .text("Millions of BTUs per person")

    var country = svg.selectAll(".country")
        .data(countries)
        .enter().append("g")
        .attr("class", "country");
    
    var path = country.append("path")
        .attr("class", "line")
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("stroke-width", 1.5)
        .attr("d", function(d) { return line(d.values); })
        .style("stroke", function(d) { return z(d.id); });
    
    /*  Animation for line paths
        Sources:
        http://bl.ocks.org/duopixel/4063326
        https://stackoverflow.com/questions/13893127/how-to-draw-a-path-smoothly-from-start-point-to-end-point-in-d3-js
        https://jakearchibald.com/2013/animated-line-drawing-svg/
    */
    var totalLength = path.node().getTotalLength();
    console.log("totalLength = " + totalLength);
    
    path
        .attr("stroke-dasharray", totalLength + " " + totalLength)
        .attr("stroke-dashoffset", totalLength)
        .transition()
            .duration(2000)
            .attr("stroke-dashoffset", 0);

    /* Adding country name next to the end of the line */
    country.append("text")
        .datum(function(d) { return {id: d.id, value: d.values[d.values.length - 1]}; })
        .attr("transform", function(d) { return "translate(" + x(d.value.date) + "," + y(d.value.epc) + ")"; })
        .attr("x", 3)
        .attr("dy", "0.35em")
        .style("font", "10px sans-serif")
        .text(function(d) { return d.id; });
    
    
});