
// Creating a scatter plot to visualize ACS 1 year estimates data
// 1. SVG definitions
var svgWidth = 1000;
var svgHeight = 800;

// 2. SVG borders
var margin = {
  top: 40, 
  right: 40, 
  bottom: 200,
  left: 100
};

// 3. Fix chart height and width
var width = svgWidth - margin.right - margin.left;
var height = svgHeight - margin.top - margin.bottom;

// 4. Append div class to the scatter element
var chart = d3.select('#scatter')
  .append('div')
  .classed('chart', true);

//5. Append the SVG element to the chart 
var svg = chart.append('svg')
  .attr('width', svgWidth)
  .attr('height', svgHeight);

var chartGroup = svg.append('g')
  .attr('transform', `translate(${margin.left}, ${margin.top})`);

//6. x and y axis
var xaxis = 'poverty';
var yaxis = 'healthcare';

//7. 
// updating x-scale variable upon click of label
function xScale(cnsData, xaxis) {
    var xLinearScale = d3.scaleLinear()
      .domain([d3.min(cnsData, d => d[xaxis]) * 0.8,
        d3.max(cnsData, d => d[xaxis]) * 1.2])
      .range([0, width]);
    return xLinearScale;
}
// updating y-scale variable upon click of label
function yScale(cnsData, yaxis) {
  var yLinearScale = d3.scaleLinear()
    .domain([d3.min(cnsData, d => d[yaxis]) * 0.8,
      d3.max(cnsData, d => d[yaxis]) * 1.2])
    .range([height, 0]);
  return yLinearScale;
}
//8.
// updating xAxis upon click
function renderXAxis(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);
  xAxis.transition()
    .duration(2000)
    .call(bottomAxis);
  return xAxis;
}

//updating xAxis upon click
function renderYAxis(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);
  yAxis.transition()
    .duration(2000)
    .call(leftAxis);
  return yAxis;
}

//9. updating the circles with a transition to new circles 
function renderCircles(circlesGroup, newXScale, xaxis, newYScale, yaxis) {
    circlesGroup.transition()
      .duration(2000)
      .attr('cx', data => newXScale(data[xaxis]))
      .attr('cy', data => newYScale(data[yaxis]))
    return circlesGroup;
}

//10. updating state labels
function renderText(textGroup, newXScale, xaxis, newYScale, yaxis) {
    textGroup.transition()
      .duration(2000)
      .attr('x', d => newXScale(d[xaxis]))
      .attr('y', d => newYScale(d[yaxis]));
    return textGroup
}
//11. function to bring out x-axis values for tooltips
function styleX(value, xaxis) {

    if (xaxis === 'poverty') {
        return `${value}%`;
    }
    
    else if (xaxis === 'income') {
        return `${value}`;
    }
    else {
      return `${value}`;
    }
}

//12. funtion for updating circles group
function updateToolTip(xaxis, yaxis, circlesGroup) {

    //poverty
    if (xaxis === 'poverty') {
      var xLabel = 'Poverty:';
    }
    //income
    else if (xaxis === 'income'){
      var xLabel = 'Median Income:';
    }
    //age
    else {
      var xLabel = 'Age:';
    }
//Y label
  //healthcare
  if (yaxis ==='healthcare') {
    var yLabel = "No Healthcare:"
  }
  else if(yaxis === 'obesity') {
    var yLabel = 'Obesity:';
  }
  //smoking
  else{
    var yLabel = 'Smokers:';
  }

  //create tooltip
  var toolTip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-8, 0])
    .html(function(d) {
        return (`${d.state}<br>${xLabel} ${styleX(d[xaxis], xaxis)}<br>${yLabel} ${d[yaxis]}%`);
  });

  circlesGroup.call(toolTip);

  //add
  circlesGroup.on('mouseover', toolTip.show)
    .on('mouseout', toolTip.hide);

    return circlesGroup;
}
//retrieve data
d3.csv('data.csv').then(function(censusData) {

    console.log(censusData);
    
    //Parse data
    censusData.forEach(function(data){
        data.obesity = +data.obesity;
        data.income = +data.income;
        data.smokes = +data.smokes;
        data.age = +data.age;
        data.healthcare = +data.healthcare;
        data.poverty = +data.poverty;
    });

    //create linear scales
    var xLinearScale = xScale(censusData, xaxis);
    var yLinearScale = yScale(censusData, yaxis);

    //create x axis
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    //append X
    var xAxis = chartGroup.append('g')
      .classed('x-axis', true)
      .attr('transform', `translate(0, ${height})`)
      .call(bottomAxis);

    //append Y
    var yAxis = chartGroup.append('g')
      .classed('y-axis', true)
      //.attr
      .call(leftAxis);
    
    //append Circles
    var circlesGroup = chartGroup.selectAll('circle')
      .data(censusData)
      .enter()
      .append('circle')
      .classed('stateCircle', true)
      .attr('cx', d => xLinearScale(d[xaxis]))
      .attr('cy', d => yLinearScale(d[yaxis]))
      .attr('r', 14)
      .attr('opacity', '.5');

    //append Initial Text
    var textGroup = chartGroup.selectAll('.stateText')
      .data(censusData)
      .enter()
      .append('text')
      .classed('stateText', true)
      .attr('x', d => xLinearScale(d[xaxis]))
      .attr('y', d => yLinearScale(d[yaxis]))
      .attr('dy', 3)
      .attr('font-size', '10px')
      .text(function(d){return d.abbr});

    //create a group for the x axis labels
    var xLabelsGroup = chartGroup.append('g')
      .attr('transform', `translate(${width / 2}, ${height + 10 + margin.top})`);

    var povertyLabel = xLabelsGroup.append('text')
      .classed('aText', true)
      .classed('active', true)
      .attr('x', 0)
      .attr('y', 20)
      .attr('value', 'poverty')
      .text('In Poverty (%)');
      
    var ageLabel = xLabelsGroup.append('text')
      .classed('aText', true)
      .classed('inactive', true)
      .attr('x', 0)
      .attr('y', 40)
      .attr('value', 'age')
      .text('Age (Median)');  

    var incomeLabel = xLabelsGroup.append('text')
      .classed('aText', true)
      .classed('inactive', true)
      .attr('x', 0)
      .attr('y', 60)
      .attr('value', 'income')
      .text('Household Income (Median)')

    //create a group for Y labels
    var yLabelsGroup = chartGroup.append('g')
      .attr('transform', `translate(${0 - margin.left/4}, ${height/2})`);

    var healthcareLabel = yLabelsGroup.append('text')
      .classed('aText', true)
      .classed('active', true)
      .attr('x', 0)
      .attr('y', 0 - 20)
      .attr('dy', '1em')
      .attr('transform', 'rotate(-90)')
      .attr('value', 'healthcare')
      .text('Lacks Healthcare (%)');
    
    var smokesLabel = yLabelsGroup.append('text')
      .classed('aText', true)
      .classed('inactive', true)
      .attr('x', 0)
      .attr('y', 0 - 40)
      .attr('dy', '1em')
      .attr('transform', 'rotate(-90)')
      .attr('value', 'smokes')
      .text('Smoker (%)');
    
    var obesityLabel = yLabelsGroup.append('text')
      .classed('aText', true)
      .classed('inactive', true)
      .attr('x', 0)
      .attr('y', 0 - 60)
      .attr('dy', '1em')
      .attr('transform', 'rotate(-90)')
      .attr('value', 'obesity')
      .text('Obese (%)');
    
    //update the toolTip
    var circlesGroup = updateToolTip(xaxis, yaxis, circlesGroup);

    //x axis event listener
    xLabelsGroup.selectAll('text')
      .on('click', function() {
        var value = d3.select(this).attr('value');

        if (value != xaxis) {

          //replace chosen x with a value
          //xaxis = value; 

          //update x for new data
          xLinearScale = xScale(censusData, value);

          //update x 
          xAxis = renderXAxis(xLinearScale, xAxis);

          //upate circles with a new x value
          circlesGroup = renderCircles(circlesGroup, xLinearScale, xaxis, yLinearScale, yaxis);

          //update text 
          textGroup = renderText(textGroup, xLinearScale, xaxis, yLinearScale, yaxis);

          //update tooltip
          circlesGroup = updateToolTip(xaxis, yaxis, circlesGroup);

          //change of classes changes text
          if (xaxis === 'poverty') {
            povertyLabel.classed('active', true);
            ageLabel.classed('active', false).classed('inactive', true);
            incomeLabel.classed('active', false).classed('inactive', true);
          }
          else if (xaxis === 'age') {
            povertyLabel.classed('active', false).classed('inactive', true);
            ageLabel.classed('active', true).classed('inactive', false);
            incomeLabel.classed('active', false).classed('inactive', true);
          }
          else {
            povertyLabel.classed('active', false).classed('inactive', true);
            ageLabel.classed('active', false).classed('inactive', true);
            incomeLabel.classed('active', true).classed('inactive', false);
          }
        }
      });
    //y axis lables event listener
    yLabelsGroup.selectAll('text')
      .on('click', function() {
        var value = d3.select(this).attr('value');

        if(value !=yaxis) {
            //replace chosenY with value  
            yaxis = value;

            //update Y scale
            yLinearScale = yScale(censusData, yaxis);

            //update Y axis 
            yAxis = renderYAxis(yLinearScale, yAxis);

            //Udate CIRCLES with new y
            circlesGroup = renderCircles(circlesGroup, xLinearScale, xaxis, yLinearScale, yaxis);

            //update TEXT with new Y values
            textGroup = renderText(textGroup, xLinearScale, xaxis, yLinearScale, yaxis);

            //update tooltips
            circlesGroup = updateToolTip(xaxis, yaxis, circlesGroup);

            //Change of the classes changes text
            if (yaxis === 'obesity') {
              obesityLabel.classed('active', true).classed('inactive', false);
              smokesLabel.classed('active', false).classed('inactive', true);
              healthcareLabel.classed('active', false).classed('inactive', true);
            }
            else if (yaxis === 'smokes') {
              obesityLabel.classed('active', false).classed('inactive', true);
              smokesLabel.classed('active', true).classed('inactive', false);
              healthcareLabel.classed('active', false).classed('inactive', true);
            }
            else {
              obesityLabel.classed('active', false).classed('inactive', true);
              smokesLabel.classed('active', false).classed('inactive', true);
              healthcareLabel.classed('active', true).classed('inactive', false);
            }
          }
        });
});