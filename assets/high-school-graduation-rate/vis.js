var chart = makeChart($(".chart-container").width());
d3.select(".chart-container").call(chart);

var map1 = makeMap($("#map1").width(), 'Queens');
d3.select("#map1").call(map1);

var map2 = makeMap($("#map2").width(), 'Bronx');
d3.select("#map2").call(map2);

var map3 = makeMap($("#map3").width(), 'Manhattan');
d3.select("#map3").call(map3);

var map4 = makeMap($("#map4").width(), 'Brooklyn');
d3.select("#map4").call(map4);

var map5 = makeMap($("#map5").width(), 'Staten Island');
d3.select("#map5").call(map5);

opacity = 0.75;
opacityLow = 0;
highlightColor = 'orange';
buttons = ["red", "black", "green"];
duration = 300;

setTimeout(function() {
  $( ".chart-control .red" ).click();
}, 1);


function makeMap(w, borough) { // http://bl.ocks.org/phil-pedruco/6646844

  var width = Math.floor(w),
      height = width,
      scaleMultiplier = 80,
      scalemap = width * scaleMultiplier,
      pathMapData = "/assets/high-school-graduation-rate/nyc.json",
      duration = 0;

  function map(selection) {

    var projection = d3.geo.mercator()
      .center([-73.94, 40.70])
      .scale(scalemap)
      .translate([(width) / 2, (height) / 2]);

    var path = d3.geo.path().projection(projection);

    var svg = selection
      .append("svg")
        .attr("width", width)
        .attr("height", height);

    d3.json(pathMapData, function(error, nyb) {
      if (error) return console.error(error);

      svg
        .append("g")
          .attr("id", "all-boroughs")
          .attr("transform", "translate(" + 0 + "," + 0 + ")")
          .selectAll(".borough")
          .data(nyb.features)
          .enter()
        .append("path")
          .style("opacity", opacity)
          .style("fill", function(d) {
            if (d.properties.borough === borough) return highlightColor;
          })
          .attr("class", function(d){ return d.properties.name; })
          .attr("d", path)
          .on("mouseover", function(d) {
            d3.select(this).style("opacity", "1");
          })
          .on("mouseout", function(d) {
            d3.select(this).transition().duration(duration).style("opacity", opacity);
          })
          .attr("class", function(d) { return d.properties.borough; });

    });

    $(window).resize(function() {

      var mapDivId = selection.node().id,
        width = $("#" + mapDivId).width(),
        heigth = width,
        scalemap = width * scaleMultiplier;

      d3.select("#info-text").text(width);

      svg
        .attr("width", width)
        .attr("height", width);

      projection
        .center([-73.94, 40.70])
        .scale(scalemap)
        .translate([(width) / 2, (height) / 2]);

      path.projection(projection);

      svg.selectAll("path").attr("d", path);

    });

  } //function map

  return map;
} //function makeMap


function makeChart(w) {

  var margin = {top: 25, right: 35, bottom: 40, left: 0};

  var width = w / 5 - margin.left - margin.right,
      height = 600 - margin.top - margin.bottom,
      years = [2012, 2013];

  var xScale = d3.scale.linear()
      .range([0, width]);

  var yScale = d3.scale.linear()
      .range([height, 0]);

  var line = d3.svg.line()
      .x(function(d) { return xScale(d.year); })
      .y(function(d) { return yScale(d.graduation_rate); });

  function chart(selection) {
    d3.csv("/assets/high-school-graduation-rate/vis.csv", type, function(error, data) {

      var boroughs = d3.nest()
        .key(function(d) { return d.boro; })
        .key(function(d) {
          return d.dbn;
        })
        .rollup(function(v) {
          var out = [];
          years.forEach(function(d) {
            out.push({
              boro: v[0].boro,
              dbn: v[0].dbn,
              year: d,
              graduation_rate: v[0]['graduation_rate_' + d]
            });
          });
          return out;
        })
        .entries(data);

      var countBorough = boroughs.length;

      xScale.domain(years);
      yScale.domain([0.17, 1]);

      // Add an SVG element for each Borough.
      var svg = selection.selectAll("svg")
          .data(boroughs)
        .enter().append("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
        .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      svg.selectAll(".school-line")
          .data(function(d) { return d.values; })
          .enter()
          .append("path")
          .attr("class", "school-line")
          .attr("d", function(d) { return line(d.values); })
          .style("opacity", opacity)
          .style("stroke", function(d) {
            var gFirst = d.values[0].graduation_rate,
                gSecond = d.values[1].graduation_rate;
            if (gFirst > gSecond) { d3.select(this).classed("red", true); return "red"; }
            else if (gFirst < gSecond) { d3.select(this).classed("green", true); return "green"; }
            d3.select(this).classed("black", true);
            return "lightgray";
          });

      // Add borough names.
      svg.append("text")
          .attr("x", width / 2)
          .attr("y", - margin.top / 2)
          .style("text-anchor", "middle")
          .text(function(d) { return d.key; });

      var xAxisFormat = d3.format(".1d");

      xAxis = d3.svg.axis()
          .scale(xScale)
          .ticks(years.length - 1)
          .tickFormat(xAxisFormat)
          .orient("bottom");

      var svgAxisX = svg.append("g")
          .attr("class", "x axis xaxis")
          .attr("transform", "translate(0," + height + ")")
          .call(xAxis)
        .selectAll("text")
          .style("text-anchor", function(d, i) { return i === 0 ? "start" : "end"; } );

      svg
          .append("line")
          .attr("class", "line-svg-base")
          .attr({
            x1: xScale(years[0]),
            y1: height,
            x2: xScale(years[1]),
            y2: height
          });

      // y axis
      var yAxisFormat = d3.format(".1p");

      yAxis = d3.svg.axis()
          .scale(yScale)
          .ticks(4)
          .tickFormat(yAxisFormat)
          .orient("right");

      var svgAxisY = svg.append("g")
          .attr("class", function(d, i) { return "y axis yaxis" + i; } )
          .attr("transform", "translate(" + width + "," + 0 + ")")
          .call(yAxis);


      d3.selectAll(".y.axis g line" )
          .attr("x2", -width)
          .style("visibility", "visible");

      // make the last y axis visible
      d3.select(".yaxis" + (countBorough - 1)).style("visibility", "visible");

      }); // d3.csv("vis.csv"
  } //function chart()

  return chart;
} //function makeChart


function type(d) {
  d.lon = +d.lon;
  d.lat = +d.lat;
  d.ontrack_year1_2013 = +d.ontrack_year1_2013;
  d.graduation_rate_2013 = +d.graduation_rate_2013;
  d.college_career_rate_2013 = +d.college_career_rate_2013;
  d.student_satisfaction_2013 = +d.student_satisfaction_2013;
  d.ontrack_year1_2012 = +d.ontrack_year1_2012;
  d.graduation_rate_2012 = +d.graduation_rate_2012;
  d.college_career_rate_2012 = +d.college_career_rate_2012;
  d.student_satisfaction_2012 = +d.student_satisfaction_2012;
  return d;
}


d3.csv("/assets/high-school-graduation-rate/vis.csv", type, function(error, data) {
  window.boroughSummary = d3.nest()
    .key(function(d) { return d.boro; })
    .rollup(function(r) {

      var red = 0,
          black = 0,
          green = 0;

      r.forEach( function(i) {
        if (i.graduation_rate_2012 > i.graduation_rate_2013) { red += 1; }
        else if (i.graduation_rate_2012 < i.graduation_rate_2013) { green += 1; }
        else { black += 1; }
      });

      out = {
        school_count: r.length,
        red: red,
        black: black,
        green: green
      };

      return out;
    })
    .entries(data);

  // button click actions
  buttons.forEach(function(b) {

    d3.select(".chart-control ." + b)
      .on("click", function(d) {

        d3.selectAll(".chart-control button")
            .classed("active", false);

        d3.select(this).classed("active", true);

        d3.selectAll(".school-line")
            .transition()
            .style("opacity", opacityLow);

        d3.selectAll(".school-line." + b)
            .transition()
            .style("opacity", opacity)
            .style("stroke", b);

    var boroughRoll = d3.nest()
      .key(function(d) { return d.key; })
      .rollup(function(v) {
        return d3.sum(v, function(d) { return d.values[b]; });
      })
      .entries(boroughSummary);


    var bronx = boroughRoll.filter(function(d) { return d.key === 'Bronx'; }),
        brooklyn = boroughRoll.filter(function(d) { return d.key === 'Brooklyn'; }),
        manhattan = boroughRoll.filter(function(d) { return d.key === 'Manhattan'; }),
        queens = boroughRoll.filter(function(d) { return d.key === 'Queens'; }),
        staten = boroughRoll.filter(function(d) { return d.key === 'Staten Island'; });

    var buttonXref = {
      red: "decreased",
      black: "did not change",
      green: "increased"
    };

    var changingText = bronx[0].values + " Bronx, " +
      manhattan[0].values + " Manhattan, " +
      brooklyn[0].values + " Brooklyn, " +
      queens[0].values + " Queens and " +
      staten[0].values + " Staten Island high schools had " +
      (b === "red" ? "higher" : b === "green" ? "lower" : "same") +
      " graduation rates " + (b === "black" ? "between 2012 and 2013." : "in 2012 compared to 2013.");

    var ctContainer = d3.select(".changing");

    ctContainer
      .text(changingText);

    });

  });

});
