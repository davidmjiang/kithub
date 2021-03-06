Gradebook.directive('d3Line', ['$window', 'VisualService', function($window, VisualService) {
  return {
    restrict: "EA",
    scope: true,
    link: function(scope, element, attrs) {

      scope.$watch('course', function(newCourseVal) {
        if (newCourseVal.assignments) {
          var d3 = $window.d3


          var margin = {top: 20, right: 20, bottom: 50, left: 50},
              width = 560 - margin.left - margin.right,
              height = 300 - margin.top - margin.bottom

          var x = d3.scaleLinear().range([0, width]);
          var y = d3.scaleLinear().range([height,0]);

          var svg = d3.select(element[0])
              .append("svg")
              .attr('width', width + margin.left + margin.right)
              .attr('height', height + margin.top + margin.bottom)
              .append('g')
                .attr('transform', 'translate(' + margin.left + ", " + margin.top + ")");

          var data = VisualService.coursePerformanceOverTime(newCourseVal)

          var valueline = d3.line()
              .x(function(d, i) { return i * width / data.length })
              .y(function(d) { return y(d.class_performance) })

          for (var i = 0; i < data.length; i++) {
            data[i].class_performance = +data[i].class_performance
          }

          x.domain([1, data.length + 1])
          if (d3.min(data, function(d) {return d.class_performance}) < 40) {
            y.domain(d3.extent(data, function(d, i) {return i}))
          } else {
            y.domain([40, 100])
          }
          console.log(data)

          var path = svg.append("path")
            .data([data])
            .attr("class", "line")
            .attr("d", valueline);

          var totalLength = path.node().getTotalLength();
          console.log(totalLength)

          path
            .attr("stroke-dasharray", totalLength + " " + totalLength)
            .attr("stroke-dashoffset", totalLength)
            .transition()
              .duration(1000)
              .attr("stroke-dashoffset", 0);

          svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x))

          svg.append("text")
            .attr("transform", "translate(" + (width/2) + " ," + (height + margin.top + 20) + ")")
            .style("text-anchor", "middle")
            .text("Assignment Number")

          svg.append("g")
            .call(d3.axisLeft(y))

          svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left)
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("Average Cumulative Grade")
        }
      })
    }
  }
}]);