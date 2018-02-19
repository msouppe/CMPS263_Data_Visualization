// Define Margin
var margin = {left: 80, right: 80, top: 50, bottom: 50 }, 
    width = 960 - margin.left -margin.right,
    height = 500 - margin.top - margin.bottom;

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
    xAxis = d3.svg.axis().scale(xScale).orient("bottom").tickSize(-height);

var yValue = function(d) { return d.ecc;}, // data -> value
    yScale = d3.scale.linear().range([height, 0]), // value -> display
    yMap = function(d) { return yScale(yValue(d));}, // data -> display
    yAxis = d3.svg.axis().scale(yScale).orient("left").tickSize(-width);

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
        //console.log(d);
    });

    var xMax = d3.max(data, function(d) { return d.gdp; }) * 1.05,
        xMin = d3.min(data, function(d) { return d.gdp; }),
        xMin = xMin > 0 ? 0 : xMin,
        yMax = d3.max(data, function(d) { return d.ecc; }) * 1.05,
        yMin = d3.min(data, function(d) { return d.ecc; }),
        yMin = yMin > 0 ? 0 : yMin;

    /* Define Domain */
    xScale.domain([xMin, xMax]);
    yScale.domain([yMin, yMax]);

    /* Define Color */
    var colors = d3.scale.category20();
    
    /* Define tool tip */
    var tip = d3.tip()
        .attr("class", "d3-tip")
        .offset([-10, 0])
        .html(function(d) {
            return d.country + "<br/> Population: " + d.population + " million <br/> GDP: $" + d.gdp + " trillion <br/> EPC: " + d.ecc + " million BTUs <br/> Total: " + d.ec + " trillion BTUs" ;
        });
    
    /* Define zoom scale and behavior */
    var zoomBeh = d3.behavior.zoom()
        .x(xScale)
        .y(yScale)
        .scaleExtent([0, 500])
        .on("zoom", zoom);
    
    
    var svg = d3.select("#scatter")
        .append("svg")
            .attr("width", 960)
            .attr("height", 500)
        .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
            .call(zoomBeh);

    svg.call(tip);

    svg.append("rect")
        .attr("width", width)
        .attr("height", height);

    svg.append("g")
            .classed("x axis", true)
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis)
        .append("text")
            .classed("label", true)
            .attr("x", width/2 + 100)
            .attr("y", 50)
            .style("text-anchor", "end")
            .text("GDP (in Trillions of US Dollars) in 2010");
    
    svg.append("g")
            .classed("y axis", true)
            .call(yAxis)
        .append("text")
            .classed("label", true)
            .attr("transform", "rotate(-90)")
            .attr("x", -50)
            .attr("y", -50)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("Energy Consumptionper Capita (in MillionBTUs per Person ");

    var objects = svg.append("svg")
        .classed("objects", true)
        .attr("width", width)
        .attr("height", height);
    
    objects.append("svg:line")
        .classed("axisLine hAxisLine", true)
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", width)
        .attr("y2", 0)
        .attr("transform", "translate(0," + height + ")");

    objects.append("svg:line")
        .classed("axisLine vAxisLine", true)
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", 0)
        .attr("y2", height);

    objects.selectAll(".dot")
            .data(data)
        .enter().append("circle")
            .classed("dot", true)
            .attr("r", function (d) { return Math.sqrt(d.ec)/.4; })
            .attr("transform", transform)
            .style("fill", function(d) { return colors(d.country); })
            .on("mouseover", tip.show)
            .on("mouseout", tip.hide);
    
    /* Legend */
    svg.append("circle")
        .attr("r", 5)
        .attr("cx", width-100)
        .attr("cy", height-175)
        .style("fill", "green");
    
    svg.append("circle")
        .attr("r", 15.8)
        .attr("cx", width-100)
        .attr("cy", height-150)
        .style("fill", "green");

    svg.append("circle")
        .attr("r", 48)
        .attr("cx", width-100)
        .attr("cy", height-80)
        .style("fill", "green");

    svg.append("text")
        .attr("class", "label")
        .attr("x", width -150)
        .attr("y", height-172)
        .style("text-anchor", "end")
        .text(" 1 Trillion BTUs");

    svg.append("text")
        .attr("class", "label")
        .attr("x", width-150)
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

    /* Click button fuction to reset the axis */
    d3.select("input").on("click", change);
    
    function change() {
        xMax = d3.max(data, function(d) { return d.gdp; });
        xMin = d3.min(data, function(d) { return d.gdp; });

        zoomBeh.x(xScale.domain([xMin, xMax])).y(yScale.domain([yMin, yMax]));

        var svg = d3.select("#scatter").transition();
        svg.select(".x.axis").duration(750).call(xAxis).select(".label").text("GDP (in Trillions of US Dollars) in 2010");

        objects.selectAll(".dot").transition().duration(1000).attr("transform", transform);
    }

    function zoom() {
        svg.select(".x.axis").call(xAxis);
        svg.select(".y.axis").call(yAxis);

        svg.selectAll(".dot")
            .attr("transform", transform);
    }

    function transform(d) {
        return "translate(" + xScale(d.gdp) + "," + yScale(d.ecc) + ")";
    }
    

}); // d3.csv    