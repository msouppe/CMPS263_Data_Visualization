// Search "D3 Margin Convention" on Google to understand margins.
// Add comments here in your own words to explain the margins below (.25 point)
/* Defining where the graph will be sketched along with the height, width, xaxis, yaxis, and scale of the bar graph */
var margin = {top: 10, right: 40, bottom: 150, left: 50},
    width = 760 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;
    

// Define SVG. "g" means group SVG elements together.
/* SVG - Scalable Vector Graphics */

// Add comments here in your own words to explain this segment of code (.25 point)
/* Drawing the visuals, in this case the bars for the bar graph */
var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var parseTime = d3.timeParse("%Y%m%d");

/* Setting up the ranges for the x and y scales */
var x = d3.scaleTime().range([0, width]),
    y = d3.scaleLinear().range([height, 0]),
    z = d3.scaleOrdinal(d3.schemeCategory10);

var line = d3.line()
    .curve(d3.curveBasis)
    .x(function(d) { return x(d.date); })
    .y(function(d) { return y(d.epc); });

// Define X and Y AXIS
// Define tick marks on the y-axis as shown on the output with an interval of 5 and $ sign (1 point)
var xAxis = d3.axisBottom(x);
var yAxis = d3.axisLeft(y);

/* Source: Mike Bostock (Multi-Series Line Chart) https://bl.ocks.org/mbostock/3884955 */
d3.csv("data.csv", function (error, data) {
    if (error) throw error;
    
    var countries = data.columns.slice(1).map(function(id) {
        return {
            id: id,
            values: data.map(function(d) {
                return {date: +d.date, epc: +d[id]};
            })
        };
    });
    
    x.domain(d3.extent(data, function(d) { return d.date; }));
    y.domain([ 0, d3.max(countries, function(c) { return d3.max(c.values, function(d) { return d.epc; }); }) ]);
    z.domain(countries.map(function(c) { return c.id; }));
    
    svg.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    svg.append("g")
        .attr("class", "axis axis--y")
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", "0.71em")
//        .attr("fill", "#000")
        .text("");    

    var country = svg.selectAll(".country")
        .data(countries)
        .enter().append("g")
        .attr("class", "city");
    
    country.append("path")
        .attr("class", "line")
        .attr("d", function(d) { return line(d.values); })
        .style("stroke", function(d) { return z(d.id); });

    country.append("text")
        .datum(function(d) { return {id: d.id, value: d.values[d.values.length - 1]}; })
        .attr("transform", function(d) { return "translate(" + x(d.value.date) + "," + y(d.value.epc) + ")"; })
        .attr("x", 3)
        .attr("dy", "0.35em")
        .style("font", "10px sans-serif")
        .text(function(d) { return d.id; });
    
    
});

function type(d, _, columns) {
  d.date = parseTime(d.date);
  for (var i = 1, n = columns.length, c; i < n; ++i) d[c = columns[i]] = +d[c];
  return d;
}