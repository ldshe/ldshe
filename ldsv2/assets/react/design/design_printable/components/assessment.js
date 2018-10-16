import React, {Component} from 'react';
import moment from 'moment';
import {getDefaultActivityName} from 'react/design/learning_unit/design_panel/util';
import {PatternType, SocialOrganization} from 'react/design/learning_unit/design_panel/types';

export default class Assessment extends Component {

    constructor(props, context) {
        super(props, context);
        this.renderAssessment = this.renderAssessment.bind(this);
        this.renderActivity = this.renderActivity.bind(this);
    }

    renderAssessment() {
        const {outcome, unit} = this.props;
        if(unit.data.length > 0) {
            return (
                <div className="unit">
                    <div className="unit-row">
                        <div className="heading">Assessment</div>
                        {outcome.data.map((o, i) => <div key={i} className="heading lo">{`LO${i+1}`}</div>)}
                    </div>
                    {unit.data.map(u => {
                        return (
                            <div key={u.id} className="unit-row">
                                <div>{u.title}</div>
                                {outcome.data.map((o, i) => {
                                    return (
                                        <div key={i} className="lo">
                                            {u.outcomes.indexOf(o.id) != -1 ? <i className="fa fa-check"></i> : '　'}
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    })}
                </div>
            );
        } else {
            return null;
        }
    }

    renderActivity() {
        const {userPatts} = this.props.patternInstance;
        let activities = [];
        let userPatt = userPatts.forEach(({patt}) => {
            let nodes = patt.all(({model}) => model.pattType == PatternType.ACTIVITY && model.assessment);
            activities = activities.concat(nodes);
        });
        let custDates = [];
        let fmtDates = [];
        activities.forEach(a => {
            if(Date.parse(a.model.dueDate))
                fmtDates.push(a);
            else
                custDates.push(a);
        });
        let dateSort = (a, b) => {
            if (a.model.dueDate > b.model.dueDate)
                return 1;
            if (a.model.dueDate < b.model.dueDate)
                return -1;
            return 0;
        };
        custDates.sort(dateSort);
        fmtDates.sort(dateSort);
        return (
            <div className="activity">
                <div className="activity-caption">
                    <h5>Important Dates</h5>
                </div>
                <div className="activity-row">
                    <div className="heading time">Time</div>
                    <div className="heading">Task</div>
                </div>
                {custDates.map(n => {
                    const root = n.getPath()[0];
                    const {id, subType, fullname, dueDate, socialOrganization} = n.model;
                    if(!dueDate) return null;
                    // let name = fullname ? fullname : getDefaultActivityName(subType);
                    let name = root.model.fullname ? root.model.fullname : root.model.subType;
                    let icon = socialOrganization == SocialOrganization.INDIVIDUAL ?
                        <i className="fa fa-user"></i> :
                        <i className="fa fa-users"></i>;
                    return (
                        <div key={id} className="activity-row">
                            <div>{dueDate}</div>
                            <div>{`${name} `}{icon}</div>
                        </div>
                    );
                })}
                {fmtDates.map(n => {
                    const root = n.getPath()[0];
                    const {id, subType, fullname, dueDate, socialOrganization} = n.model;
                    // let name = fullname ? fullname : getDefaultActivityName(subType);
                    let name = root.model.fullname ? root.model.fullname : root.model.subType;
                    let tzOffset = moment().utcOffset();
                    let date = moment(dueDate).minute(tzOffset).format('D MMMM');
                    let icon = socialOrganization == SocialOrganization.INDIVIDUAL ?
                        <i className="fa fa-user"></i> :
                        <i className="fa fa-users"></i>;
                    return (
                        <div key={id} className="activity-row">
                            <div>{date}</div>
                            <div>{`${name} `}{icon}</div>
                        </div>
                    );
                })}
            </div>
        );
    }

    render() {
        return (
            <div>
                <h4>Assessment</h4>
                <div className="assessment">
                    <div className="first-half">{this.renderAssessment()}</div>
                    <div className="second-half">{this.renderActivity()}</div>
                    <div className="clearfix"></div>
                </div>
            </div>
        );
    }
}
