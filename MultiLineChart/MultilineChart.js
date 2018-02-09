/* Defining where the graph will be sketched along with the height, width, xaxis, yaxis, and scale of the bar graph */
var margin = {top: 10, right: 40, bottom: 150, left: 50},
    width = 760 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

/* Drawing the visuals, in this case the bars for the bar graph */
var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

/* Not sure why I need this yet */
var parseTime = d3.timeParse("%Y%m%d");
var years;

var x = d3.scaleBand().range([0, width]);
var y = d3.scaleLinear().range([height, 0]);
var z = d3.scaleOrdinal(d3.schemeCategory10);

var line = d3.line()
    .curve(d3.curveBasis)
    .x(function(d) { return x(d.Country); })
    .y(function(d) { return y(d.EPC); });

/* Create the scales for theh x and y axis */
var xScale = d3.scaleTime().range([0, width]);
var yScale = d3.scaleLinear().range([height, 0]);


var xAxis = d3.axisBottom(xScale);
var yAxis = d3.axisLeft(yScale);

// data.csv contains the country name(country) and its year(2000-2001)
/* Obtains data from csv file with an error option if file doesn't load properly */
d3.csv("EPC_2000_2010.csv", function(error, data) {
    if (error) throw error;
    
    /* Gather's data for every year from every country */
    var dta = data.columns.slice(1).map(function(id) {
        return {
            id: +id,
            values: data.map(function(d) {
                return {Country: d.Country, EPC: +d[id]};
            })
        };
    });
    
    
    console.log("dta")
    console.log(dta);
    
    years = data.columns.slice(1);
    console.log("data.columns.slice(1)");
    console.log(years);

    /* X-axis years */
    xScale.domain(d3.extent(years));
    console.log("xScale.domain()");
    console.log(d3.extent(years));
    
    /* Y-axis EPC values for every year for every country */
    yScale.domain([ 0, d3.max(dta, function(c) { return d3.max(c.values, function(d) { return d.EPC; }); }) ]);
    
    /* Country names */
    z.domain(data.map(function(d) { return d.Country; }));
    console.log(data.map(function(d) { return d.Country; }));    
    
    svg.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .append("text")
    
    svg.append("g")
        .attr("class", "axis axis--y")
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -43)
        .attr("dy", "0.71em")
        .attr("fill", "#000")
        .text("Million BTUs Per Person");
    
});