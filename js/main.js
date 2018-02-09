/* global d3, crossfilter, timeSeriesChart, barChart, dc */

// 2015-05-01 00:43:28
var dateFmt = d3.timeParse("%Y-%m-%d %H:%M:%S");

var chartTimeline = timeSeriesChart()
  .width(1000)
  .x(function (d) { return d.key;})
  .y(function (d) { return d.value;});
var barChartYear = barChart()
  .width(600)
  .x(function (d) { return d.key;})
  .y(function (d) { return d.value;});
var barChartBody = barChart()
  .x(function (d) { return d.key;})
  .y(function (d) { return d.value;});



d3.csv("data/Lekagul_slice.csv",
  function (d) {
    // This function is applied to each row of the dataset
    d.Timestamp = dateFmt(d.Timestamp);
    return d;
  },
  function (err, data) {
    if (err) throw err;

    var csData = crossfilter(data);

    // We create dimensions for each attribute we want to filter by
    csData.dimTime = csData.dimension(function (d) { return d["year"]; });
    csData.dimBodyType = csData.dimension(function (d) { return d["body-type"]; });
    csData.dimYear = csData.dimension(function (d) { return d["year"]; });

    // We bin each dimension
    csData.timesByYear = csData.dimTime.group();
    csData.bodyTypes = csData.dimBodyType.group();
    csData.years = csData.dimYear.group();


    chartTimeline.onBrushed(function (selected) {
      csData.dimTime.filter(selected);
      update();
    });

    barChartBody.onMouseOver(function (d) {
      csData.dimBodyType.filter(d.key);
      update();
    }).onMouseOut(function () {
      // Clear the filter
      csData.dimBodyType.filterAll();
      update();
    });

    barChartYear.onMouseOver(function (d) {
      csData.dimYear.filter(d.key);
      update();
    }).onMouseOut(function () {
      // Clear the filter
      csData.dimYear.filterAll();
      update();
    });

    function update() {
      d3.select("#timeline")
        .datum(csData.timesByYear.all())
        .call(chartTimeline)
        .select(".x.axis") //Adjusting the tick labels after drawn
        .selectAll(".tick text")
        .attr("transform", "translate(-8,-1) rotate(-45)");

      d3.select("#bodyTypes")
        .datum(csData.bodyTypes.all())
        .call(barChartBody);

      d3.select("#years")
        .datum(csData.years.all())
        .call(barChartYear)
        .select(".x.axis") //Adjusting the tick labels after drawn
        .selectAll(".tick text")
        .attr("transform", "translate(-8,-1) rotate(-45)");


    }



    update();


  }
);
