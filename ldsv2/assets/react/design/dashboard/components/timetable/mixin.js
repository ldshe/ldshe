import * as d3 from 'd3';
import React from 'react';
import ReactDOM from 'react-dom';
import {DEFAULT_UNIT_SEQ_PREFIX} from 'react/design/learning_unit/design_panel/types';

export default (superclass) => class extends superclass {

    init() {
        $('.timetable .unit').each((e, el) => {
            let $el = $(el);
            $el.css('backgroundColor', $el.data('background'));
        });

        $('.timetable .duration').each((e, el) => {
            let $el = $(el);
            $el.height($el.attr('data-duration'));
            $el.css('backgroundColor', $el.attr('data-background'));
        });
    }

    drawTooltip(e) {
        const chart = ReactDOM.findDOMNode(this.chart);
        const tooltip = ReactDOM.findDOMNode(this.tooltip);
        let $el = $(e.target);
        let unit = $el.attr('data-unit');
        let duration = $el.attr('data-duration');
        let {left, top} = $(chart).offset();
        $(tooltip).css('left', `${e.pageX-left+5}px`);
        $(tooltip).css('top', `${e.pageY-top+52}px`);
        $(tooltip).css('display', 'inline-block');
        $(tooltip).html(`${unit} <br/> ${duration} min(s)`);
    }

    hideTooltip(e) {
        const tooltip = ReactDOM.findDOMNode(this.tooltip);
        $(tooltip).css('display', 'none');
    }

    renderUnits(totalDuration) {
        const {unit} = this.props;
        const color = d3.schemeCategory20;
        return unit.data.map((u, i) => {
            let title = u.title ? u.title : `${DEFAULT_UNIT_SEQ_PREFIX}${i+1}`;
            let duration = totalDuration.unitGroup[title];
            if(duration == undefined) return null;

            let background = color[i % 20];
            this.unitColorMap[title] = background;
            return <div key={i}
                        className="unit"
                        data-unit={title}
                        data-duration={duration}
                        data-background={background}
                        onMouseMove={this.drawTooltip}
                        onMouseLeave={this.hideTooltip}>
                        {title}
                    </div>;
        });
    }

    renderActivities(data, i) {
        return data.map((d, j) => {
            const {unit, duration} = d;
            const background = this.unitColorMap[unit];
            return duration > 0 ?
                <div key={`${i}-${j}`}
                     className="duration"
                     data-unit={unit}
                     data-duration={duration}
                     data-background={background}
                     onMouseMove={this.drawTooltip}
                     onMouseLeave={this.hideTooltip} /> :
                null;
        });
    }

};
