import * as d3 from 'd3';
import {
  sankey as d3Sankey,
  sankeyLeft,
  sankeyLinkHorizontal,
} from 'd3-sankey';

const getBreakIndex = (text: string): number => {
  let processed = 0;
  for (const word of text.split(' ')) {
    processed += word.length + 1;
    if (processed > 30) return processed;
  }
  return 0;
};

export function createSankey(sankeydata) {
  // set the dimensions and margins of the graph
  const margin = { top: 10, right: 10, bottom: 10, left: 10 },
    width = 600 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

  // format variables
  const formatNumber = d3.format(',.0f'), // zero decimal places
    format = function (d) {
      return formatNumber(d);
    },
    color = d3.scaleOrdinal(d3.schemeCategory10);

  // append the svg object to the body of the page
  const svg = d3
    .create('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom);

  const base = svg
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  // Set the sankey diagram properties
  const sankey = d3Sankey()
    .nodeId((node) => node?.id)
    .nodeWidth(24)
    .nodeAlign(sankeyLeft)
    .nodePadding(10)
    .size([width, height]);

  const path = sankey.links();

  // load the data
  const graph = sankey(sankeydata);

  // add in the links
  const link = base
    .append('g')
    .selectAll('.link')
    .data(graph.links)
    .enter()
    .append('path')
    .attr('class', 'link')
    .attr('d', sankeyLinkHorizontal())
    .attr('stroke-width', function (d) {
      return d.width;
    });

  // add the link titles
  link.append('title').text(function (d) {
    return d.source.id + ' → ' + d.target.id + '\n' + format(d.value);
  });

  // add in the nodes
  const node = base
    .append('g')
    .selectAll('.node')
    .data(graph.nodes)
    .enter()
    .append('g')
    .attr('class', 'node');

  // add the rectangles for the nodes
  node
    .append('rect')
    .attr('x', function (d) {
      return d.x0;
    })
    .attr('y', function (d) {
      return d.y0;
    })
    .attr('height', function (d) {
      return d.y1 - d.y0;
    })
    .attr('width', sankey.nodeWidth())
    .style('fill', function (d) {
      return (d.color = color(d.id.replace(/ .*/, '')));
    })
    .style('stroke', function (d) {
      return d3.rgb(d.color).darker(2);
    })
    .append('title')
    .text(function (d) {
      return d.id + '\n' + format(d.value);
    });

  let title = node
    .append('a')
    .attr('aria-label-position', 'top')
    .attr('class', 'internal-link')
    .attr('target', '_blank')
    .attr('rel', 'noopener')
    .attr('aria-label', (d) => d.path)
    .attr('data-href', (d) => d.path)
    .attr('href', (d) => d.path)
    .append('text')
    .attr('x', function (d) {
      return d.x0 - 6;
    })
    .attr('y', function (d) {
      return (d.y1 + d.y0) / 2;
    })
    .attr('dy', '-1em')
    .attr('text-anchor', 'end')
    .attr('class', 'internal-link');

  title.filter((d) => d.id.length < getBreakIndex(d.id)).text((d) => d.id);
  const firstText = title
    .filter((d) => d.id.length >= getBreakIndex(d.id))
    .append('tspan')
    .attr('x', function (d) {
      return d.x0 - 6;
    })
    .text((d) => d.id.slice(0, getBreakIndex(d.id)));

  firstText
    .filter(function (d) {
      return d.x0 < width / 2 && d.x0 >= width / 4;
    })
    .attr('dy', '1.2em');

  firstText
    .filter(function (d) {
      return d.x0 < width / 4;
    })
    .attr('dy', '0.50em');

  const secondText = title
    .filter((d) => d.id.length >= getBreakIndex(d.id))
    .append('tspan')
    .attr('x', function (d) {
      return d.x0 - 6;
    })
    .text((d) => d.id.slice(getBreakIndex(d.id)));

  secondText
    .filter(function (d) {
      return d.x0 < width / 2 && d.x0 >= width / 4;
    })
    .attr('dy', '1.2em');

  secondText
    .filter(function (d) {
      return d.x0 < width / 4;
    })
    .attr('dy', '0.50em');

  title
    .filter(function (d) {
      return d.x0 < width / 2 && d.x0 >= width / 4;
    })
    .attr('dy', '2em')
    .attr('text-anchor', 'middle');

  title
    .filter(function (d) {
      return d.x0 < width / 4;
    })
    .attr('x', function (d) {
      return d.x1 + 6;
    })
    .attr('dy', '0.50em')
    .attr('text-anchor', 'start');

  return svg.node();
}
