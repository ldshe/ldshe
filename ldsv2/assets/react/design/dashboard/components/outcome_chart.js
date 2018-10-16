import React from 'react';
import ReactDOM from 'react-dom';
import * as d3 from 'd3';
import {trimLegend} from 'react/components/charts/util';
import {HorizontalBar} from 'react/components/charts';
import {LearningOutcomeTypes} from 'react/design/learning_outcome/types';

export default class OutcomeChart extends HorizontalBar {

    static get defaultProps() {
        const width = 650;
        const height = 300;
        const marginLeft = 50;
        const marginRight = 150;
        const marginTop = 20;
        const marginBottom = 20;
        let superProps = HorizontalBar.defaultProps;
        let props = {
            width,
            height,
            chartTranslateX: marginLeft,
            chartTranslateY: marginTop,
            chartWidth: width - marginLeft - marginRight,
            chartHeight: height - marginTop - marginBottom,
            legendHeight: 15,
            legendRectWidth: 10,
            legendRectHeight: 10,
            legendRectTranslateOffsetX: 0,
            legendRectTranslateOffsetY: -10,
            legendTextPaddedX: 15,
            legendLimit: 0,
            legendTranslateX: width * 0.7,
            legendTranslateY: marginTop,
        };
        return Object.assign({}, superProps, props);
    }

    constructor(props, context) {
        super(props, context);
        this.color = this.color.bind(this);
        this.fill = this.fill.bind(this);
        this.drawTooltip = this.drawTooltip.bind(this);
    }

    color() {
        const color = {
            [LearningOutcomeTypes.DISCIPLINARY_KNOWLEDGE]: '#ff5512',
            [LearningOutcomeTypes.DISCIPLINARY_SKILLS]: '#4472c4',
            [LearningOutcomeTypes.GENERIC_SKILLS]: '#48cb81',
        };
        return t => color[t];
    }

    fill(color) {
        return d => color(d.type);
    }

    drawTooltip(d) {
        const chart = ReactDOM.findDOMNode(this.chart);
        const tooltip = ReactDOM.findDOMNode(this.tooltip);
        let {left, top} = $(chart).offset();
        $(tooltip).css('left', `${d3.event.pageX-left+5}px`);
        $(tooltip).css('top', `${d3.event.pageY-top+45}px`);
        $(tooltip).css('display', 'inline-block');
        $(tooltip).html(`${d.description} <br/> ${d.value} min(s)`);
    }

    drawLegend({g, color}) {
        if(this.isEmpty) return;

        const chart = ReactDOM.findDOMNode(this.chart);
        const {
            data,
            legendHeight,
            legendTranslateX, legendTranslateY,
            legendRectWidth, legendRectHeight,
            legendRectTranslateOffsetX, legendRectTranslateOffsetY,
            legendTextPaddedX,
            legendLimit,
        } = this.props;

        let groupData = [
            {type: LearningOutcomeTypes.DISCIPLINARY_KNOWLEDGE, group: LearningOutcomeTypes.DISCIPLINARY_KNOWLEDGE.splitSnakeCase().capitalizeAll()},
            {type: LearningOutcomeTypes.DISCIPLINARY_SKILLS, group: LearningOutcomeTypes.DISCIPLINARY_SKILLS.splitSnakeCase().capitalizeAll()},
            {type: LearningOutcomeTypes.GENERIC_SKILLS, group: LearningOutcomeTypes.GENERIC_SKILLS.splitSnakeCase().capitalizeAll()},
        ];

        let legendG = g.selectAll('.legend')
                   .data(groupData)
                   .enter()
                   .append('g')
                     .attr('transform', (d, i) => `translate(${legendTranslateX}, ${i*legendHeight+legendTranslateY})`)
                     .attr('class', 'legend');

        legendG.append('rect')
                 .attr('width', legendRectWidth)
                 .attr('height', legendRectHeight)
                 .attr('x', 0)
                 .attr('y', 0)
                 .attr('fill', this.fill(color))
                 .attr('transform', (d, i) => `translate(${legendRectTranslateOffsetX}, ${legendRectTranslateOffsetY})`);

        legendG.append('text')
                 .attr('x', legendTextPaddedX)
                 .attr('y', 0)
                 .text(d => d.group)
               .append('title')
                 .text(d => d.group);

        trimLegend(chart, legendLimit);
    }
}
