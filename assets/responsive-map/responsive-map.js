
var map = makeMap($("#top").width());

d3.select("#top").call(map);

$(window).resize(function(){
    map.width($("#top").width());
});

function makeMap(w) {

  var opacity = 0.5,
      width = w || 1200,
      height = width * 0.625,
      scalemap = width * 1.33375,
      pathMapData = "/assets/responsive-map/states_np.json",
      duration = 400;

  function map(selection) {

    selection.each(function() {

      var projection = d3.geo.albersUsa()
            .scale(scalemap)
            .translate([width / 2, height / 2]);

      var path = d3.geo.path().projection(projection);

      var svg = d3.select(this).append("svg")
          .attr("width", width)
          .attr("height", height);

      svg.append("rect")
          .attr("id", "mbackground")
          .attr("width", width)
          .attr("height", height);

      var g = svg.append("g");

      d3.json(pathMapData, function(error, us) {
        if (error) return console.error(error);

        g.append("g")
          .attr("id", "states")
          .selectAll("path")
          .data(topojson.feature(us, us.objects.states).features)
          .enter()
          .append("path")
          .attr("d", path)
          .style("opacity", opacity)
          .on("mouseover", function(d) {
            d3.select(this).style("opacity", "1");
          })
          .on("mouseout", function(d) {
            d3.select(this).transition().duration(duration).style("opacity", opacity);
          })
          .attr("id", function(d) { return d.properties.state; });

        g.append("path")
            .datum(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; }))
            .attr("id", "state-borders")
            .attr("d", path);
      });

      updateMap = function(width) {
        height = width * 0.625;
        scalemap = width * 1.33375;

        projection
          .scale(scalemap)
          .translate([width / 2, height / 2]);

        d3.select("#state-borders")
          .style("stroke-width", "0px")
          .transition()
          .duration(duration)
          .attr("d", path)
          .style("stroke-width", null);

        d3.select("#states").selectAll("path")
          .transition()
          .duration(duration)
          .attr("d", path);

        svg
          .transition()
          .duration(duration)
          .attr({
            "width": width,
            "height": height
          });

        svg.select("#mbackground")
          .attr({
            "width": width,
            "height": height
          });
      };
    });

  }

  map.width = function(value) {
    if (!arguments.length) return width;
    width = value;
    if (typeof updateMap === 'function') updateMap(value);
    return map;
  };

  return map;
}
