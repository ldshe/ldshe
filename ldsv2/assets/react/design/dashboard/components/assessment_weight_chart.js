import React from 'react';
import ReactDOM from 'react-dom';
import * as d3 from 'd3';
import {Pie} from 'react/components/charts';
import {relaxText} from 'react/components/charts/util';
import {AssessmentType} from '../types';

export default class AssessmentWeightChart extends Pie {

    static get defaultProps() {
        const width = 520;
        const height = 350;
        let superProps = Pie.defaultProps;
        let props = {
            width,
            height,
            outerRadius: width * 0.2,
            legendHeight: 40,
            chartTranslateX: width * 0.38,
            chartTranslateY: height * 0.52,
            legendTranslateX: width * 0.5,
            legendTextPaddedX: 0,
            legendTextPaddedY: 15,
            legendTranslateX: width * 0.68,
            legendTranslateY: height * 0.05,
        };
        return Object.assign({}, superProps, props);
    }

    constructor(props, context) {
        super(props, context);
        this.drawTooltip = this.drawTooltip.bind(this);
    }

    color() {
        const groupColors = [
            '#9ee836',
            '#66d74e',
            '#15c072',
            '#0fa483',
            '#0d8891',
            '#096683',
            '#064a75',
            '#062545',
        ];
        const individualColors = [
            '#fefe35',
            '#fee831',
            '#fece2c',
            '#feae27',
            '#fe9823',
            '#fc7a1f',
            '#f4491e',
            '#eb291e',
        ]
        const {data} = this.props;

        let distColor = (t, srcCols) => {
            let dLen, cols;
            dLen = data.filter(d => d.type == t).length;
            if(dLen < srcCols.length) {
                cols = [];
                let step = Math.floor(srcCols.length / dLen);
                for(let i=0; i<srcCols.length; i+=step)
                    cols.push(srcCols[i]);
            } else {
                cols = srcCols;
            }
            return cols;
        };

        let grpCols = distColor(AssessmentType.GROUP, groupColors);
        let indCols = distColor(AssessmentType.INDIVIDUAL, individualColors);

        const color = {
            [AssessmentType.GROUP]: d3.scaleOrdinal(grpCols),
            [AssessmentType.INDIVIDUAL]: d3.scaleOrdinal(indCols),
        };

        return t => color[t];
    }

    fill(color) {
        return d => color(d.data.type)(d.data.id);
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

    drawLegend({g, pieG, pie, color}) {
        if(this.isEmpty) return;

        const chart = ReactDOM.findDOMNode(this.chart);
        const {
            data,
            outerRadius,
            legendHeight,
            legendTranslateX, legendTranslateY,
            legendRectWidth, legendRectHeight,
            legendRectTranslateOffsetX, legendRectTranslateOffsetY,
            legendTextPaddedX,
            legendLimit,
        } = this.props;

        let legendArc = d3.arc()
                    .outerRadius(outerRadius)

        let legendP = pieG.selectAll('.legend')
                          .data(pie(data))
                          .enter()
                            .append('g')
                            .attr('class', 'legend');

        let legendPTxt = legendP.append('text')
                                  .attr("transform", d => {
                                      d.outerRadius = outerRadius + 90;
                                      d.innerRadius = outerRadius + 80;
                                      let [cx, cy] = legendArc.centroid(d);
                                      d.cx = cx + 10;
                                      d.cy = cy;
                                      return `translate(${d.cx} ${d.cy})`;
                                  })
                                  .attr("cx", d => d.cx)
                                  .attr("cy", d => d.cy)
                                  .attr("text-anchor", "middle");

        legendPTxt.append('tspan')
                          .text(d => `${d.data.name} ${Math.round(d.data.ratio*1000)/10}%`)
                          .attr('x', 0)
                          .attr('y', 0);

        // legendPTxt.append('tspan')
        //                   .text(d => `${Math.round(d.data.ratio*1000)/10}%`)
        //                   .attr('x', 0)
        //                   .attr('y', 15);

        let relax = relaxText(0.5, 12);
        relax(legendPTxt);

        let currType = null;
        let j = -1;

        let legendG = g.append('g')
                       .attr('class', 'legend');

        let legendGG = legendG.selectAll('.legend-group')
                       .data(pie(data))
                       .enter()
                       .append('g')
                         .attr('transform', (d, i) => {
                             let transY;
                             if(currType != d.data.type) {
                                 currType = d.data.type;
                                 j++;
                             }
                             return `translate(${legendTranslateX}, ${j * legendHeight + legendTranslateY})`;
                         })
                         .attr('class', 'legend-group');

        currType = null;
        j = 0;
        legendGG.append('rect')
                 .attr('width', legendRectWidth)
                 .attr('height', legendRectHeight)
                 .attr('x', 0)
                 .attr('y', 0)
                 .attr('fill', this.fill(color))
                 .attr('transform', (d, i) => {
                     let rectX;
                     if(currType != d.data.type) {
                         j=0;
                         currType = d.data.type;
                         rectX = legendRectTranslateOffsetX;
                     } else {
                         j++;
                         rectX = legendRectTranslateOffsetX + legendRectWidth*j;
                     }
                     return `translate(${rectX}, ${legendRectTranslateOffsetY})`;
                 })

        legendG.append('text')
                 .text(AssessmentType.GROUP)
                 .attr('x', legendTranslateX)
                 .attr('y', legendTranslateY + legendRectHeight + 5)
               .append('title')
                 .text(AssessmentType.GROUP);

         legendG.append('text')
                  .text(AssessmentType.INDIVIDUAL)
                  .attr('x', legendTranslateX)
                  .attr('y', legendTranslateY + legendHeight + legendRectHeight + 5)
                .append('title')
                  .text(AssessmentType.INDIVIDUAL);
    }
}
