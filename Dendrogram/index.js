/* Mariette Souppe */

/*  Set the demensions and margins of the diagram */
var margin = {top: 20, right: 120, bottom: 20, left: 120},
    width = 960 - margin.right - margin.left,
    height = 800 - margin.top - margin.bottom;

var i = 0,
    duration = 750,
    root;

/* Declares a tree layout and assigns the size .tree (v4) .layout.tree (v3) */
var treemap = d3.tree()
    .size([height, width]);

/*  Append svg object to body of the page
    Append group element to svg
    Moves group element to top left margin
*/
var svg = d3.select("body").append("svg")
    .attr("width", width + margin.right + margin.left)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


/* Get data from json file */
d3.json("data.json", function(error, subject) {
    if (error) throw error;
    
    console.log(subject);

    /* Assigns the parent, child, height, and depth .hierarchy (v4) */
    root = d3.hierarchy(subject, function(d) { return d.children; });
    console.log(root);

    root.x0 = height / 2;
    console.log("root's x-coordinate on svg: " + root.x0);

    root.y0 = 0;
    console.log("root's y-coordinate on svg: " + root.y0);

    /* Collapse function if a node in tree has a child and all of it's children */
    function collapse(d) {
        if (d.children) {
            d._children = d.children;
            d._children.forEach(collapse);
            d.children = null;
        }
    }

    /* Collapse through each node that has a child starting from the root */
    root.children.forEach(collapse);
    
    /* Function that will update the tree */
    update(root);
    
}); // d3.json - close bracket


/**********************************************************************/
function update(source) {

    /* Assigns the x and y position for the nodes */
    var treeData = treemap(root);

    /* Compute the new tree layout */
    var nodes = treeData.descendants(),
        links = treeData.descendants().slice(1);

    /* Normalize for fixed-depth */
    nodes.forEach(function(d){ d.y = d.depth * 180});
    
    /********** Node manipulation  - creating the nodes and visual ********/
    
    /* Update the nodes */
    var node = svg.selectAll('g.node')
      .data(nodes, function(d) {return d.id || (d.id = ++i); });
    
    /* Enter any new nodes at the parent's previous position */
    var nodeEnter = node.enter().append('g')
        .attr('class', 'node')
        .attr("transform", function(d) {
            return "translate(" + source.y0 + "," + source.x0 + ")";
        })
        .on('click', click);
    
    /* Add circle for the nodes */
    nodeEnter.append('circle')
        .attr('class', 'node')
        .attr('r', 5)
        .style("fill", function(d) {
            return d._children ? "lightsteelblue" : "#fff";
        });

    /* Add labels for the nodes */
    nodeEnter.append('text')
        .attr("dy", ".35em")
        .attr("x", function(d) {
            return d.children || d._children ? -13 : 13;
        })
        .attr("text-anchor", function(d) {
            return d.children || d._children ? "end" : "start";
        })
        .text(function(d) { return d.data.name; });

    /* Updating the nodes with text */
    var nodeUpdate = nodeEnter.merge(node);
    console.log("nodeUpdate: " + nodeUpdate);
    
    /* Transition to the proper position for the node */
    nodeUpdate.transition()
        .duration(duration)
        .attr("transform", function(d) { 
            return "translate(" + d.y + "," + d.x + ")";
        });
    
    /* Remove any exiting nodes */
    var nodeExit = node.exit().transition()
        .duration(duration)
        .attr("transform", function(d) {
            return "translate(" + source.y + "," + source.x + ")";
        })
        .remove();
    
    /* On exit reduce the node circles size to 0 */
    nodeExit.select('circle')
        .attr('r', 1e-6);
        
    /* On exit reduce the opacity of text labels */
    nodeExit.select('text')
        .style('fill-opacity', 1e-6);
    
    /**** Drawing paths for hte links from one node to another w/ amination ****/
    
    /* Update the links */
    var link = svg.selectAll('path.link')
        .data(links, function(d) { 
            return d.id; 
        });
    
    /* Enter any new links at the parent's previous position */
    var linkEnter = link.enter().insert('path', "g")
        .attr("class", "link")
        .attr('d', function(d){
        var o = {x: source.x0, y: source.y0}
            return diagonal(o, o)
        });
    
    /* Update links */
    var linkUpdate = linkEnter.merge(link);
    
    /* Transition back to the parent element position */
    linkUpdate.transition()
        .duration(duration)
        .attr('d', function(d){ return diagonal(d, d.parent) });

    /* Remove any exiting links */
    var linkExit = link.exit().transition()
        .duration(duration)
        .attr('d', function(d) {
        var o = {x: source.x, y: source.y}
            return diagonal(o, o)
        })
        .remove();
    
    /* Store the old positions for transition */
    nodes.forEach(function(d){
        d.x0 = d.x;
        d.y0 = d.y;
    });

} // fcn: update  - close bracket 


/**********************************************************************/
/* Creates a curved (diagonal) path from parent to the child nodes */
function diagonal(s, d) {
    console.log("s.x: " + s.x + " \td.x: " + d.x);
    console.log("s.y: " + s.x + " \td.y: " + d.x);
    path = `M ${s.y} ${s.x}
            C ${(s.y + d.y) / 2} ${s.x},
              ${(s.y + d.y) / 2} ${d.x},
              ${d.y} ${d.x}`
    // console.log("path: " + path);
    
    return path
} // fcn: diagonal  - close bracket 


/**********************************************************************/
/* Toggle children on click */
function click(d) {
    if (d.children) {
        d._children = d.children;
        d.children = null;
    } else {
        d.children = d._children;
        d._children = null;
    }
    update(d);
} // fcn: click  - close bracket 