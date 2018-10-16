import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import * as d3 from 'd3';
import _ from 'lodash';
import {trimLegend} from './util';

export default class HorizontalBar extends Component {

    static get defaultProps() {
        const width = 450;
        const height = 250;
        const marginLeft = 100;
        const marginRight = 10;
        const marginTop = 20;
        const marginBottom = 20;
        return {
            width,
            height,
            chartTranslateX: marginLeft,
            chartTranslateY: marginTop,
            chartWidth: width - marginLeft - marginRight,
            chartHeight: height - marginTop - marginBottom,
        }
    }

    constructor(props, context) {
        super(props, context);
        this.color = this.color.bind(this);
        this.fill = this.fill.bind(this);
        this.drawTooltip = this.drawTooltip.bind(this);
        this.drawLegend = this.drawLegend.bind(this);
        this.draw = this.draw.bind(this);
    }

    shouldComponentUpdate(nextProps, nextState) {
        return !_.isEqual(this.props, nextProps) || !_.isEqual(this.state, nextState);
    };

    get isEmpty() {
        const {data} = this.props;
        return data.filter(d => d.value > 0).length == 0;
    }

    color() {
        return d3.scaleOrdinal(d3.schemeCategory10);
    }

    fill(color) {
        return d => color(d.name);
    }

    drawTooltip() {}

    drawLegend() {}

    draw() {
        const chart = ReactDOM.findDOMNode(this.chart);
        const {
            data,
            width, height,
            chartTranslateX, chartTranslateY,
            chartWidth, chartHeight,
        } = this.props;

        let g = d3.select(chart)
                  .append('svg')
                    .attr('width', width)
                    .attr('height', height)
                  .append('g')
                    .attr('transform', `translate(${chartTranslateX}, ${chartTranslateY})`);

        let color = this.color();

        if(this.isEmpty) {
            g.append('text')
                .text('Not available')
                .attr('x', chartWidth/2-20)
                .attr('y', chartHeight/2);
        } else {
            let x = d3.scaleLinear()
                      .rangeRound([0, chartWidth]);

            let y = d3.scaleBand()
                      .rangeRound([0, chartHeight])
                      .paddingInner(0.25)
                      .align(0.5);



            x.domain([0, d3.max(data, d => d.value)]).nice();
            y.domain(data.map(d => d.name));

            let bar = g.selectAll('.bar')
                       .data(data)
                       .enter()
                       .append('rect')
                         .attr('class', 'bar')
                         .attr('x', 0)
                         .attr('width', d => x(d.value))
                         .attr('y', d => y(d.name))
                         .attr('height', y.bandwidth())
                         .attr('fill', this.fill(color));

             g.append('g')
                 .attr('class', 'y-axis')
                 .attr('transform', `translate(0, 0)`)
                 .style('font-weight', 'bold')
                 .call(d3.axisLeft(y));

             g.append('g')
                 .attr('class', 'x-axis')
                 .attr('transform', `translate(0, ${chartHeight})`)
                 .call(d3.axisBottom(x).ticks(null, 's'))
               .append('text')
                 .attr('x', x(x.ticks().pop()) + 0.5)
                 .attr('y', 2)
                 .attr('dx', '0.32em')
                 .style('text-anchor', 'start')
                 .style('font-weight', 'bold');

             bar.on('mousemove', this.drawTooltip);
             bar.on('mouseout', () => $(this.tooltip).css('display', 'none'));
             this.removeEvent = () => {
                 bar.on('mousemove', null);
                 bar.on('mouseout', null);
             };
        }

        this.drawLegend({g, color});
    }

    componentDidMount() {
        this.draw();
    }

    componentDidUpdate() {
        let $chart = $(ReactDOM.findDOMNode(this.chart));
        $chart.children().remove();
        this.draw();
    }

    componentWillUnmount() {
        if(this.removeEvent) this.removeEvent();
    }

    render() {
        return (
            <div className="chart-canvas">
                <div ref={tooltip => {this.tooltip = tooltip}} className="chart-tooltip"></div>
                <div ref={chart => {this.chart = chart}} />
            </div>
        );
    }
}
