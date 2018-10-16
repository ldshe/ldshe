import classnames from 'classnames';
import React, {Component} from 'react';
import _ from 'lodash';
import moment from 'moment';
import {isSafari} from 'js/util';
import {StageType} from 'react/design/learning_session/allocation_panel/types';
import * as Util from './util';
import Mixin from './mixin';

class ClassTimetable extends Component {

    constructor(props, context) {
        super(props, context);
        this.calcClassTime = this.calcClassTime.bind(this);
        this.renderUnits = this.renderUnits.bind(this);
        this.renderActivities = this.renderActivities.bind(this);
        this.renderWeekGroups = this.renderWeekGroups.bind(this);
        this.unitColorMap = {};
    }

    shouldComponentUpdate(nextProps, nextState) {
        return !_.isEqual(this.props, nextProps) || !_.isEqual(this.state, nextState);
    };

    componentDidMount() {
        this.init();
        if(isSafari()) {
            let $el = $('.class-timetable .no-class');
            $el.height($('.class-timetable').height()-30);
        }
    }

    componentDidUpdate() {
        this.init();
    }

    calcClassTime() {
        const {session} = this.props;
        const {userPatts} = this.props.patternInstance;
        const {convertComposite, rearrangeActivities, calcWeekGroups, mergeWeekGroups, mergeActivities, calcBreakPoint, calcTotalDuration} = Util;
        let data = JSON.parse(JSON.stringify(session.data.filter(d => d.stage == StageType.IN)));

        data.forEach(d => {
            d.date = d.utcDate ? moment(d.utcDate).minute(moment().utcOffset()) : null;
            delete d.topic;
            delete d.objective;
            delete d.utcDate;
            d.activities = convertComposite(userPatts, d.in);
            delete d.pre;
            delete d.in;
            delete d.post;
        });

        if(data.some(d => d.date == null)) {
            let startDate = moment('1970-01-05');
            data.forEach((d, i) => {
                d.date = moment(startDate).add(i, 'w');
            });
        }

        data = data.filter(d => d.date)
            .sort((a, b) => a.date.diff(b.date));

        data = calcWeekGroups(data);
        data = mergeWeekGroups(data);
        data = mergeActivities(data);

        let weekGroups = calcBreakPoint(data);
        let totalDuration = calcTotalDuration(data);
        return {weekGroups, totalDuration, data};
    }

    renderWeekGroups(weekGroups, totalDuration, data) {
        let sessCount = 0;
        let els = weekGroups.map((w, i) => {
            let sDate = w.startWeekDay.format('D MMM');
            let eDate = w.endWeekDay.format('D MMM');
            let d = data.filter(d => d.startWeekDay.diff(w.startWeekDay) == 0)[0];
            let date = d ? d.date.format('D MMM') : '';
            let fmtDate = d ? (d.date.isAfter('1975-01-01', 'year') ? d.date.format('D MMM') : '') : '';
            return w.breakPoint ?
                <div key={i} className="time-slot">
                    <div className="slot-title">
                        {`(${sDate} - ${eDate})`}
                        <div>{'　'}</div>
                    </div>
                    <div className="no-class">
                        <div>NO CLASS</div>
                    </div>
                </div> :
                <div key={i} className="time-slot">
                    <div className="slot-title">
                        <strong>{`S${++sessCount}`}</strong>{fmtDate ? ` (${fmtDate})` : null}
                        <div className="text-center">{`${totalDuration.dateGroup[date]} min(s)`}</div>
                    </div>
                    {this.renderActivities(d.activities, i)}
                </div>;
        });
        return els;
    }

    render() {
        const {weekGroups, totalDuration, data} = this.calcClassTime();
        let empty = data.length == 0;
        let timetableCls = classnames({
            'class-timetable': true,
            empty,
        });
        return (
            <div className="chart">
                <div className="title">Class Contact Time - {totalDuration.total} min(s)</div>
                <div ref={chart => {this.chart = chart}} className="timetable">
                    <div className="class-unit-panel">{this.renderUnits(totalDuration)}</div>
                    <div className={timetableCls}>{
                        empty ?
                        <div className="empty">Not available</div> :
                        this.renderWeekGroups(weekGroups, totalDuration, data)
                    }</div>
                    <div ref={tooltip => {this.tooltip = tooltip}} className="chart-tooltip"></div>
                </div>
            </div>
        );
    }
}

export default class ClassTimetableMixin extends Mixin(ClassTimetable) {
    constructor(props, context) {
        super(props, context);
        this.init = super.init.bind(this);
        this.drawTooltip = super.drawTooltip.bind(this);
        this.hideTooltip = super.hideTooltip.bind(this);
        this.renderUnits = super.renderUnits.bind(this);
        this.renderActivities = super.renderActivities.bind(this);
    }
}
