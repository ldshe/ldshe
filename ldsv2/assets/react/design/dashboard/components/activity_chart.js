import React from 'react';
import ReactDOM from 'react-dom';
import * as d3 from 'd3';
import {Pie} from 'react/components/charts';
import {LearningType} from 'react/design/learning_unit/design_panel/types';

export default class ActivityChart extends Pie {

    static get defaultProps() {
        const width = 520;
        const height = 350;
        let superProps = Pie.defaultProps;
        let props = {
            width,
            height,
            legendTitlePaddedY: 3,
            chartTranslateX: width * 0.25,
            chartTranslateY: height * 0.4,
            legendTranslateX: width * 0.5,
            legendTranslateY: 10,
            textSplit: 27,
        };
        return Object.assign({}, superProps, props);
    }

    constructor(props, context) {
        super(props, context);
        this.color = this.color.bind(this);
        this.fill = this.fill.bind(this);
        this.drawTooltip = this.drawTooltip.bind(this);
        this.drawLegend = this.drawLegend.bind(this);
    }

    color() {
        const color = {
            [LearningType.REVISION]: '#82009d',
            [LearningType.REFLECTION]: '#7f1b72',
            [LearningType.SELF_OR_PEER_ASSESSMENT]: '#b759ef',
            [LearningType.CONCEPTUAL_OR_VISUAL_ARTEFACTS]: '#ff5513',
            [LearningType.TANGIBLE_MANIPULABLE_ARTIFACT]: '#ff8d00',
            [LearningType.PRESENTATIONS_PERFORMANCE_ILLUSTRATION]: '#ffc500',
            [LearningType.TANGIBLE_OR_IMMERSIVE_INVESTIGATION]: '#abd848',
            [LearningType.EXPLORATIONS_THROUGH_CONVERSATION]: '#91b541',
            [LearningType.INFORMATION_EXPLORATION]: '#4cc981',
            [LearningType.TEST_ASSESSMENT]: '#48aeda',
            [LearningType.PRACTICE]: '#1d799f',
            [LearningType.RECEIVING_AND_INTERPRETING_INFORMATION]: '#48448a',
        };
        return t => color[t];
    }

    fill(color) {
        return d => color(d.data.type);
    }

    drawTooltip(d) {
        const chart = ReactDOM.findDOMNode(this.chart);
        const tooltip = ReactDOM.findDOMNode(this.tooltip);
        let {left, top} = $(chart).offset();
        $(tooltip).css('left', `${d3.event.pageX-left+5}px`);
        $(tooltip).css('top', `${d3.event.pageY-top+45}px`);
        $(tooltip).css('display', 'inline-block');
        $(tooltip).html(`${d.data.name} <br/> ${Math.round(d.data.ratio*1000)/10}%`);
    }

    drawLegend({g, pie, color}) {
        if(this.isEmpty) return;

        const chart = ReactDOM.findDOMNode(this.chart);
        const props = this.props;
        const {data} = props;
        let keys = [];
        data.forEach(d => {
            if(keys.indexOf(d.group) < 0)
                keys.push(d.group);
        });

        let needTrim = $(chart).width() < props.width;
        let currGp;
        let legendOffsetY = 0;
        let wrapTextOffsetY = 0;
        let titleTranslateYs = [];
        let legendG = g.selectAll('.legend')
                       .data(pie(data))
                       .enter()
                       .append('g')
                         .attr('transform', (d, i) => {
                             let transX = props.legendTranslateX;
                             let transY = i * props.legendHeight + props.legendTranslateY + wrapTextOffsetY;
                             if(currGp !== d.data.group) {
                                 titleTranslateYs.push(transY + legendOffsetY + props.legendTitlePaddedY);
                                 legendOffsetY += props.legendHeight + props.legendTitlePaddedY;
                                 currGp = d.data.group;
                             }

                             if(needTrim && d.data.name.length > props.textSplit)
                                wrapTextOffsetY += props.legendHeight;

                             return `translate(${transX}, ${transY+legendOffsetY})`;
                         })
                         .attr('class', 'legend');

        legendG.append('rect')
                 .attr('width', props.legendRectWidth)
                 .attr('height', props.legendRectHeight)
                 .attr('x', 0)
                 .attr('y', 0)
                 .attr('fill', d => color(d.data.type))
                 .attr('transform', (d, i) => `translate(${props.legendRectTranslateOffsetX}, ${props.legendRectTranslateOffsetY})`);

        let legendTxt = legendG.append('text');
        legendTxt.append('title')
                   .text(d => d.data.name);

        if(needTrim) {
            legendTxt.append('tspan')
                     .text(d => d.data.name.slice(0, props.textSplit))
                     .attr('x', props.legendTextPaddedX)
                     .attr('y', 0);

            legendTxt.append('tspan')
                     .text(d => d.data.name.slice(props.textSplit))
                     .attr('x', props.legendTextPaddedX)
                     .attr('y', props.legendHeight);
        } else {
            legendTxt.append('tspan')
                     .text(d => d.data.name)
                     .attr('x', props.legendTextPaddedX)
                     .attr('y', 0);
        }

        let legendTitleG = g.selectAll('.title')
                            .data(keys)
                            .enter()
                            .append('g')
                              .attr('transform', (d, i) => `translate(${props.legendTranslateX}, ${titleTranslateYs[i]})`)
                              .attr('class', 'title');

        legendTitleG.append('text')
                    .text(d => d)
                      .attr('x', 0)
                      .attr('y', 0)
                      .style('font-weight', 'bold');
    }
}
