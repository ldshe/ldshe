import React from 'react';
import ReactDOM from 'react-dom';
import * as d3 from 'd3';
import {Donut} from 'react/components/charts';
import {SocialOrganization} from 'react/design/learning_unit/design_panel/types';

export default class SocialChart extends Donut {

    static get defaultProps() {
        const width = 520;
        const height = 350;
        let superProps = Donut.defaultProps;
        let props = {
            width,
            height,
            chartTranslateX: width * 0.25,
            chartTranslateY: height * 0.4,
            legendTranslateX: width * 0.5,
        };
        return Object.assign({}, superProps, props);
    }

    constructor(props, context) {
        super(props, context);
        this.drawTooltip = this.drawTooltip.bind(this);
    }

    color() {
        const color = {
            [SocialOrganization.GROUP]: '#ff5512',
            [SocialOrganization.INDIVIDUAL]: '#01bcaf',
            [SocialOrganization.PEER_REVIEW]: '#247a9d',
            [SocialOrganization.WHOLE_CLASS]: '#ffc500',
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
}
