import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import * as d3 from 'd3';
import _ from 'lodash';
import {trimLegend} from './util';

export default class Pie extends Component {

    static get defaultProps() {
        const width = 300;
        const height = 250;
        return {
            width,
            height,
            innerRadius: 0,
            legendHeight: 15,
            legendRectWidth: 10,
            legendRectHeight: 10,
            legendRectTranslateOffsetX: 0,
            legendRectTranslateOffsetY: -10,
            legendTextPaddedX: 15,
            legendTextPaddedY: 0,
            delay: 0,
            duration: 0,
            legendLimit: 0,
            outerRadius: width * 0.35,
            chartTranslateX: width * 0.35,
            chartTranslateY: height * 0.5,
            legendTranslateX: width * 0.68,
            legendTranslateY: height * 0.1,
        };
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
        return data.reduce((c, d) => c && isNaN(d.ratio), true);
    }

    color() {
        return d3.scaleOrdinal(d3.schemeCategory10);
    }

    fill(color) {
        return d => color(d.data.name);
    }

    drawTooltip() {}

    drawLegend({g, pie, color}) {
        if(this.isEmpty) return;

        const chart = ReactDOM.findDOMNode(this.chart);
        const {
            data,
            legendHeight,
            legendTranslateX, legendTranslateY,
            legendRectWidth, legendRectHeight,
            legendRectTranslateOffsetX, legendRectTranslateOffsetY,
            legendTextPaddedX, legendTextPaddedY,
            legendLimit,
        } = this.props;

        let legendG = g.selectAll('.legend')
                       .data(pie(data))
                       .enter()
                       .append('g')
                         .attr('transform', (d, i) => `translate(${legendTranslateX}, ${i * legendHeight + legendTranslateY})`)
                         .attr('class', 'legend');

        legendG.append('rect')
                 .attr('width', legendRectWidth)
                 .attr('height', legendRectHeight)
                 .attr('x', 0)
                 .attr('y', 0)
                 .attr('fill', this.fill(color))
                 .attr('transform', (d, i) => `translate(${legendRectTranslateOffsetX}, ${legendRectTranslateOffsetY})`);

        legendG.append('text')
                 .text(d => d.data.name)
                 .attr('x', legendTextPaddedX)
                 .attr('y', legendTextPaddedY)
               .append('title')
                 .text(d => d.data.name);

        trimLegend(chart, legendLimit);
    }

    draw() {
        const chart = ReactDOM.findDOMNode(this.chart);
        const {
            data,
            width, height, outerRadius, innerRadius,
            chartTranslateX, chartTranslateY,
            delay, duration,
        } = this.props;

        let color = this.color();

        let pie = d3.pie()
                    .value(d => d.ratio)
                    .sort(null);
                    // .padAngle(.03);

        let arc = d3.arc()
                    .outerRadius(outerRadius)
                    .innerRadius(innerRadius)

        let g = d3.select(chart)
                  .append('svg')
                    .attr('width', width)
                    .attr('height', height)
                  .append('g');

        let pieG = null;
        if(this.isEmpty) {
            g.append('text')
                .text('Not available')
                .attr('x', chartTranslateX-20)
                .attr('y', chartTranslateY);
        } else {
            pieG = g.append('g')
                        .attr('transform', `translate(${chartTranslateX}, ${chartTranslateY})`);

            let path = pieG.selectAll('path')
                           .data(pie(data))
                           .enter()
                           .append('path')
                             .attr('fill', this.fill(color));

            path.transition()
                .delay(delay)
                .duration(duration)
                .attrTween('d', d => {
                    let iAngle = d3.interpolate({startAngle: 0, endAngle: 0}, d);
                    return t => arc(iAngle(t));
                });

            path.on('mousemove', this.drawTooltip);
            path.on('mouseout', () => $(this.tooltip).css('display', 'none'));

            this.removeEvent = () => {
                path.on('mousemove', null);
                path.on('mouseout', null);
            };
        }

        this.drawLegend({g, pieG, pie, color});
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
                <div ref={chart => {this.chart = chart}}/>
            </div>
        );
    }
}
