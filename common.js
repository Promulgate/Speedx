var bMap = bMap || {};
bMap.init = (function () {
  var xyz = {
        lat: 40.778912,
        lng: -73.962255
      },
      yza = {
        lat: 40.784717,
        lng: -73.958034
      },
      center = {
        lat: 40.781593,
        lng: -73.958806
      },
      map = new google.maps.Map(document.getElementById('js-bike-map'), {
        center: center,
        scrollwheel: false,
        zoom: 15
      }),
      hoverPoint = new google.maps.Marker({
        map: map
      });
  
  var getMap = function () {
    return map;
  }
  
  // Set destination, origin and travel mode.
  var request = {
    destination: yza,
    origin: xyz,
    travelMode: google.maps.TravelMode.BICYCLING
  };

  // Pass the directions request to the directions service.
  var bikePath = null;
  var directionsService = new google.maps.DirectionsService();
  directionsService.route(request, function(response, status) {
    if (status == google.maps.DirectionsStatus.OK) {

      // Display the best route on the map.
      bikePath = new google.maps.Polyline({
        path: response.routes[0].overview_path,
        geodesic: true,
        strokeColor: '#0000FF',
        strokeOpacity: 0.4,
        strokeWeight: 10,
        map: map
      });

      google.maps.event.addListener(bikePath, 'mousemove', function(event) {
        if (hoverPoint);
        hoverPoint.setPosition(event.latLng);
      });
    }
  });
  var getHoverPoint = function () {
    if (typeof hoverPoint === 'undefined') {
      return false;
    }
    
    return hoverPoint;
  }
  var marker = new google.maps.Marker({
    position: xyz,
  });
  marker.setMap(map);
  var infowindow = new google.maps.InfoWindow({
    content:"Start"
  });
  infowindow.open(map,marker);
  
  return {
    getHoverPoint: getHoverPoint,
    getMap: getMap
  }
})();

//Speed Graph
(function () {
  var data = [
{date:"05:00",close:0},
{date:"04:50",close:5},
{date:"04:40",close:15},
{date:"04:30",close:25},
{date:"04:20",close:33},
{date:"04:10",close:31},
{date:"04:00",close:30},
{date:"03:50",close:29},
{date:"03:40",close:30},
{date:"03:30",close:29},
{date:"03:20",close:28},
{date:"03:10",close:26},
{date:"03:00",close:25},
{date:"02:50",close:22},
{date:"02:40",close:24},
{date:"02:30",close:25},
{date:"02:20",close:28},
{date:"02:10",close:29},
{date:"02:00",close:30},
{date:"01:50",close:31},
{date:"01:40",close:33},
{date:"01:30",close:35},
{date:"01:20",close:34},
{date:"01:10",close:31},
{date:"01:00",close:27},
{date:"00:50",close:25},
{date:"00:40",close:23},
{date:"00:30",close:22},
{date:"00:20",close:20},
{date:"00:10",close:15},
{date:"00:00",close:0},
];

var margin = {top: 30, right: 20, bottom: 30, left: 50},
    width = 600 - margin.left - margin.right,
    height = 270 - margin.top - margin.bottom;

var parseDate = d3.time.format("%M:%S").parse,
  bisectDate = d3.bisector(function(d) { return d.date;}).left,
  formatValue = d3.format(""),
    formatCurrency = function(d) { return formatValue(d) + "mph"; };

var x = d3.time.scale()
    .range([0, width]);

var y = d3.scale.linear()
    .range([height, 0]);

var xAxis = d3.svg.axis()
  .scale(x)
    .orient("bottom")
    .ticks(0);

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");

var line = d3.svg.line()
  .interpolate("cardinal")
    .x(function(d) { return x(d.date); })
    .y(function(d) { return y(d.close); });

var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


  data.forEach(function(d) {
    d.date = parseDate(d.date);
    d.close = +d.close;
  });

  data.sort(function(a, b) {
    return a.date - b.date;
  });

  x.domain(d3.extent(data, function(d) { return d.date; }));
    y.domain([0, d3.max(data, function(d) { return d.close; })]);

  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
      .append("text")
      .attr("dx",".71em")
      .style("text-anchor", "start")
      .text("Distance Travelled: 0.6 mi.");

  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Miles Per Hour (mph)");

  svg.append("path")
      .datum(data)
      .attr("class", "line")
      .attr("d", line);

  var focus = svg.append("g")
      .attr("class", "focus")
      .style("display", "none");

  focus.append("circle")
      .attr("r", 4.5);

  focus.append("text")
      .attr("x", 9)
      .attr("dy", ".35em");

  svg.append("rect")
      .attr("class", "overlay")
      .attr("width", width)
      .attr("height", height)
      .on("mouseover", function() { focus.style("display", null); })
      .on("mouseout", function() { focus.style("display", "none"); })
      .on("mousemove", mousemove);

  var testCoords = {
        lat: 40.778912,
        lng: -73.962255
      },
      newHoverPoint = null;
  function mousemove() {
    var x0 = x.invert(d3.mouse(this)[0]),
        i = bisectDate(data, x0, 1),
        d0 = data[i - 1],
        d1 = data[i],
        d = x0 - d0.date > d1.date - x0 ? d1 : d0;
    focus.attr("transform", "translate(" + x(d.date) + "," + y(d.close) + ")");
    focus.select("text").text(formatCurrency(d.close));
    
    if (newHoverPoint) {
      testCoords.lat = testCoords.lat + 0.000001;
      newHoverPoint.setPosition(testCoords);
      return;
    }
    else {
      newHoverPoint = google.maps.Marker({
        position: testCoords,
        map: bMap.init.getMap()
      });
      console.log(newHoverPoint);
      
    }
  }
})();

  //Altitude Graph
(function () {
var data2 = [
{date:"05:00",close:18},
{date:"04:50",close:19},
{date:"04:40",close:20},
{date:"04:30",close:19},
{date:"04:20",close:18},
{date:"04:10",close:19},
{date:"04:00",close:19},
{date:"03:50",close:20},
{date:"03:40",close:19},
{date:"03:30",close:20},
{date:"03:20",close:21},
{date:"03:10",close:22},
{date:"03:00",close:23},
{date:"02:50",close:24},
{date:"02:40",close:25},
{date:"02:30",close:26},
{date:"02:20",close:27},
{date:"02:10",close:26},
{date:"02:00",close:25},
{date:"01:50",close:24},
{date:"01:40",close:23},
{date:"01:30",close:23},
{date:"01:20",close:22},
{date:"01:10",close:21},
{date:"01:00",close:20},
{date:"00:50",close:19},
{date:"00:40",close:18},
{date:"00:30",close:18},
{date:"00:20",close:18},
{date:"00:10",close:18},
{date:"00:00",close:18},
];
var margin2 = {top: 30, right: 20, bottom: 30, left: 50},
    width2 = 600 - margin2.left - margin2.right,
    height2 = 270 - margin2.top - margin2.bottom;

var parseDate2 = d3.time.format("%M:%S").parse,
  bisectDate2 = d3.bisector(function(d) { return d.date;}).left,
  formatValue2 = d3.format(""),
    formatCurrency2 = function(d) { return formatValue2(d) + "feet"; };

var x2 = d3.time.scale()
    .range([0, width2]);

var y2 = d3.scale.linear()
    .range([height2, 0]);

var xAxis2 = d3.svg.axis()
  .scale(x2)
    .orient("bottom")
    .ticks(0);

var yAxis2 = d3.svg.axis()
    .scale(y2)
    .orient("left");

var line = d3.svg.line()
  .interpolate("cardinal")
    .x(function(d) { return x2(d.date); })
    .y(function(d) { return y2(d.close); });

var svg2 = d3.select("body").append("svg")
    .attr("width", width2 + margin2.left + margin2.right)
    .attr("height", height2 + margin2.top + margin2.bottom)
  .append("g")
    .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");


  data2.forEach(function(d) {
    d.date = parseDate2(d.date);
    d.close = +d.close;
  });

  data2.sort(function(a, b) {
    return a.date - b.date;
  });

    x2.domain(d3.extent(data2, function(d) { return d.date; }));
    y2.domain([0, d3.max(data2, function(d) { return d.close; })]);

  svg2.append("g")
      .attr("class", "x axis2")
      .attr("transform", "translate(0," + height2 + ")")
      .call(xAxis2)
      .append("text")
      .attr("dx",".71em")
      .style("text-anchor", "start")
      .text("Distance Travelled: 0.6mi.");

  svg2.append("g")
      .attr("class", "y axis2")
      .call(yAxis2)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Altitude (ft)");

  svg2.append("path")
      .datum(data2)
      .attr("class", "line2")
      .attr("d", line);

  var focus2 = svg2.append("g")
      .attr("class", "focus2")
      .style("display", "none");

  focus2.append("circle")
      .attr("r", 4.5);

  focus2.append("text")
      .attr("x", 9)
      .attr("dy", ".35em");

  svg2.append("rect")
      .attr("class", "overlay")
      .attr("width", width2)
      .attr("height", height2)
      .on("mouseover", function() { focus2.style("display", null); })
      .on("mouseout", function() { focus2.style("display", "none"); })
      .on("mousemove", mousemove);
 
  function mousemove() {
    var x1 = x2.invert(d3.mouse(this)[0]),
        i1 = bisectDate2(data2, x1, 1),
        d2 = data2[i1 - 1],
        d1 = data2[i1],
        d = x1 - d2.date > d1.date - x1 ? d1 : d2;
    focus2.attr("transform", "translate(" + x2(d.date) + "," + y2(d.close) + ")");
    focus2.select("text").text(formatCurrency2(d.close));
  }

})();

