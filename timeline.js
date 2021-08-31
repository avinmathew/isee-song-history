const margin = {top: 10, right: 40, bottom: 20, left: 10};
const width = $('.container').outerWidth() - margin.left - margin.right;
const height = 50 - margin.top - margin.bottom;

const svg = d3.select('#timeline')
  .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
  .append('g')
    .attr('transform',
          'translate(' + margin.left + ',' + margin.top + ')');


// Add X axis
const oneYearAgo = new Date(new Date().getTime() - 365 * 24 * 60 * 60 * 1000);
const x = d3.scaleTime()
  .domain([oneYearAgo, new Date()])
  .range([0, width])
  .nice();
svg.append('g')
  .attr('class', 'axis')
  .attr('transform', 'translate(0,' + height + ')')
  .call(
    d3.axisBottom(x)
      .tickFormat(
        d3.timeFormat('%b')
      )
  );

function addCircles(data) {
  svg.selectAll('circle')
    .data(data)
    .join(
      enter => enter.append('circle')
        .attr('cx', date => x(date))
        .attr('cy', () => height - 10)
        .attr('r', 5)
        .style('fill', '#DD0332')
        .style('fill-opacity', 0)
        .style('fill-opacity', 1),
      update => update.attr('cx', date => x(date)),
      exit => exit.style('fill-opacity', 0)
                  .remove()
    )
}
