import classnames from 'classnames';
import React, {Component} from 'react';
import _ from 'lodash';
import moment from 'moment';
import {isSafari} from 'js/util';
import {StageType} from 'react/design/learning_session/allocation_panel/types';
import * as Util from './util';
import Mixin from './mixin';

class LearningTimetable extends Component {

    constructor(props, context) {
        super(props, context);
        this.calcLearningTime = this.calcLearningTime.bind(this);
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
            let $el = $('.learning-timetable .no-class');
            $el.height($('.learning-timetable').height()-30);
        }
    }

    componentDidUpdate() {
        this.init();
    }

    calcLearningTime() {
        const {session} = this.props;
        const {userPatts} = this.props.patternInstance;
        const {convertComposite, rearrangeActivities, calcWeekGroups, mergeWeekGroups, mergeActivities, calcBreakPoint, calcTotalDuration} = Util;
        let data = JSON.parse(JSON.stringify(session.data.filter(d => d.stage == StageType.IN)));

        data.forEach(d => {
            d.date = d.utcDate ? moment(d.utcDate).minute(moment().utcOffset()) : null;
            delete d.topic;
            delete d.objective;
            delete d.utcDate;
            d.pre = convertComposite(userPatts, d.pre);
            d.in = convertComposite(userPatts, d.in);
            d.post = convertComposite(userPatts, d.post);
        });

        if(data.some(d => d.date == null)) {
            let startDate = moment('1970-01-05');
            data.forEach((d, i) => {
                d.date = moment(startDate).add(i, 'w');
            });
        }

        data = data.filter(d => d.date)
            .sort((a, b) => a.date.diff(b.date));

        data = rearrangeActivities(data);
        data = calcWeekGroups(data);
        data = mergeWeekGroups(data);
        data = mergeActivities(data);

        let data2 = JSON.parse(JSON.stringify(session.data.filter(d => d.stage == StageType.POST)));
        data2 = mergeActivities(
            data2.map(d => ({activities: convertComposite(userPatts, d.in)}))
        );

        let weekGroups = calcBreakPoint(data);
        let totalDuration = calcTotalDuration(data);
        totalDuration = calcTotalDuration(data2, totalDuration);

        return {
            weekGroups,
            totalDuration,
            data,
            data2,
        };
    }

    renderWeekGroups(weekGroups, totalDuration, data, data2) {
        let weekCount = 0;
        let currEndWeekDay = null;
        let els = weekGroups.map((w, i) => {
            let sDate = w.startWeekDay.format('D MMM');
            let eDate = w.endWeekDay.format('D MMM');
            let isShow = w.endWeekDay.isAfter('1975-01-01', 'year');
            let d = data.filter(d => d.startWeekDay.diff(w.startWeekDay) == 0)[0];
            currEndWeekDay = w.endWeekDay;
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
                        <strong>{`W${++weekCount}`}</strong>{isShow ? ` (${sDate} - ${eDate})` : null}
                        <div className="text-center">{`${totalDuration.weekGroup[sDate]} min(s)`}</div>
                    </div>
                    {this.renderActivities(d.activities, i)}
                </div>;
        });

        if(els.length > 0) {
            let hasFinal = false;
            let newEls = els.concat(
                data2.map(d => {
                    let startWeekDay = moment(currEndWeekDay).hour(24);
                    let sDate = startWeekDay.format('D MMM');
                    let isShow = startWeekDay.isAfter('1975-01-01', 'year');
                    hasFinal = d.activities.length > 0;
                    return (
                        <div key="last" className="time-slot">
                            <div className="slot-title">
                                <strong>{`\u003E W${weekCount}`}</strong>{isShow ? ` (${sDate})` : null}
                                <div className="text-center">{`${totalDuration.weekGroup['lastWeek']} min(s)`}</div>
                            </div>
                            {this.renderActivities(d.activities, 'last')}
                        </div>
                    );
                })
            );
            return hasFinal ? newEls : els;
        } else {
            return els;
        }
    }

    render() {
        const {weekGroups, totalDuration, data, data2} = this.calcLearningTime();
        let empty = weekGroups.length == 0;
        let timetableCls = classnames({
            'learning-timetable': true,
            empty,
        });
        return (
            <div className="chart">
                <div className="title">Self-directed Study Time: Individual & Group - {totalDuration.total} min(s)</div>
                <div ref={chart => {this.chart = chart}} className="timetable">
                    <div className="learning-unit-panel">{this.renderUnits(totalDuration)}</div>
                    <div className={timetableCls}>{
                        empty ?
                        <div className="empty">Not available</div> :
                        this.renderWeekGroups(weekGroups, totalDuration, data, data2)
                    }</div>
                    <div ref={tooltip => {this.tooltip = tooltip}} className="chart-tooltip"></div>
                </div>
            </div>
        );
    }
}

export default class LearningTimetableMixin extends Mixin(LearningTimetable) {
    constructor(props, context) {
        super(props, context);
        this.init = super.init.bind(this);
        this.drawTooltip = super.drawTooltip.bind(this);
        this.hideTooltip = super.hideTooltip.bind(this);
        this.renderUnits = super.renderUnits.bind(this);
        this.renderActivities = super.renderActivities.bind(this);
    }
}
