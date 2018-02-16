// Define Margin
var margin = {left: 80, right: 80, top: 50, bottom: 50 }, 
    width = 960 - margin.left -margin.right,
    height = 500 - margin.top - margin.bottom;

// Define Color
var colors = d3.scale.category20();

// Define SVG
var svg = d3.select("body")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

/*  Define scales
    Source: http://bl.ocks.org/weiglemc/6185069
        value accessor - returns the value to encode for a given data object.
        scale - maps value to a visual display encoding, such as a pixel position.
        map function - maps from data value to display value
        axis - sets up axis
*/
var xValue = function(d) { return d.gdp;}, // data -> value
    xScale = d3.scale.linear().range([0, width]), // value -> display
    xMap = function(d) { return xScale(xValue(d));}, // data -> display
    xAxis = d3.svg.axis().scale(xScale).orient("bottom");

var yValue = function(d) { return d.ecc;}, // data -> value
    yScale = d3.scale.linear().range([height, 0]), // value -> display
    yMap = function(d) { return yScale(yValue(d));}, // data -> display
    yAxis = d3.svg.axis().scale(yScale).orient("left");
    
/*  Define Tooltip here
    Source: http://bl.ocks.org/weiglemc/6185069
*/
var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

// Define Axis
var xAxis = d3.svg.axis().scale(xScale).orient("bottom").tickPadding(2);
var yAxis = d3.svg.axis().scale(yScale).orient("left").tickPadding(2);

/*  Get Data
*/
d3.csv("scatterdata.csv", function(error, data) {
    if (error) throw error;
    
    /*  Change string (from CSV) into number format
        Source: http://bl.ocks.org/weiglemc/6185069
    */
    data.forEach(function(d) {
        d.gdp = +d.gdp;
        d.population = +d.population;
        d.ecc = +d.ecc;
        d.ec = +d.ec;
        console.log(d);
    });
    
    /*  Define domain for xScale and yScale 
        Source: http://bl.ocks.org/weiglemc/6185069
            Don't want dots overlapping axis, so add in buffer to data domain
    */
    xScale.domain([d3.min(data, xValue)-1, d3.max(data, xValue)+1]);
    yScale.domain([d3.min(data, yValue)-1, d3.max(data, yValue)+1]);

    //Draw Scatterplot
    svg.selectAll(".dot")
        .data(data)
        .enter().append("circle")
        .attr("class", "dot")
        .attr("r", function(d) { return Math.sqrt(d.ec)/.2; })
        .attr("cx", xMap)
        .attr("cy", yMap)
        .style("fill", function (d) { return colors(d.country); })
        
        /*  Add .on("mouseover", .....
            Add Tooltip.html with transition and style 
            Source: http://bl.ocks.org/weiglemc/6185069
        */      
        .on("mouseover", function(d) {
          tooltip.transition()
               .duration(200)
               .style("opacity", .9);
          tooltip.html(
                d.country + "<br/> Population: " + d.population + " Million <br/> GDP: $" + d.gdp + "Trillion <br/> EPC: " + d.ecc + " Million BTUs <br/> Total: " + d.ec + " Trillion BTUs")
                .style("left", (d3.event.pageX + 5) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
        })
    
        /* Add .on("mouseout", .... */
        .on("mouseout", function(d) {
          tooltip.transition()
               .duration(500)
               .style("opacity", 0);
        });
    
    
    // Scale Changes as we Zoom
    // Call the function d3.behavior.zoom to Add zoom

    // Draw Country Names
    svg.selectAll(".text")
        .data(data)
        .enter().append("text")
        .attr("class","text")
        .style("text-anchor", "start")
        .attr("x", function(d) {return xScale(d.gdp);})
        .attr("y", 100) //function(d) {return yScale(d.epc);}
        .style("fill", "black")
        .text(function (d) {return d.name; });

    // X-Axis
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .append("text")
        .attr("class", "label")
        .attr("y", 50)
        .attr("x", width/2)
        .style("text-anchor", "middle")
        .attr("font-size", "12px")
        .text("GDP (in Trillion US Dollars) in 2010");
    
    // Y-Axis
    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("class", "label")
        .attr("transform", "rotate(-90)")
        .attr("y", -50)
        .attr("x", -50)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .attr("font-size", "12px")
        .text("Energy Consumption per Capita (in Million BTUs per person)");
    
    // Draw legend colored rectangles
    svg.append("rect")
        .attr("x", width-250)
        .attr("y", height-190)
        .attr("width", 220)
        .attr("height", 180)
        .attr("fill", "lightgrey")
        .style("stroke-size", "1px");

    svg.append("circle")
        .attr("r", 5)
        .attr("cx", width-100)
        .attr("cy", height-175)
        .style("fill", "white");
    
    svg.append("circle")
        .attr("r", 15.8)
        .attr("cx", width-100)
        .attr("cy", height-150)
        .style("fill", "white");

    svg.append("circle")
        .attr("r", 50)
        .attr("cx", width-100)
        .attr("cy", height-80)
        .style("fill", "white");

    svg.append("text")
        .attr("class", "label")
        .attr("x", width -150)
        .attr("y", height-172)
        .style("text-anchor", "end")
        .text(" 1 Trillion BTUs");

    svg.append("text")
        .attr("class", "label")
        .attr("x", width -150)
        .attr("y", height-147)
        .style("text-anchor", "end")
        .text(" 10 Trillion BTUs");

    svg.append("text")
        .attr("class", "label")
        .attr("x", width -150)
        .attr("y", height-77)
        .style("text-anchor", "end")
        .text(" 100 Trillion BTUs");
    
     svg.append("text")
        .attr("class", "label")
        .attr("x", width -150)
        .attr("y", height-15)
        .style("text-anchor", "middle")
        .style("fill", "Green") 
        .attr("font-size", "16px")
        .text("Total Energy Consumption");     

    
}); // d3.csv