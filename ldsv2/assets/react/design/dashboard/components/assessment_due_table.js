import React, {Component} from 'react';
import moment from 'moment';
import {getDefaultActivityName} from 'react/design/learning_unit/design_panel/util';
import {PatternType, SocialOrganization} from 'react/design/learning_unit/design_panel/types';

export default class AssessmentDueTable extends Component {

    constructor(props, context) {
        super(props, context);
    }

    render() {
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
        return custDates.length == 0 && fmtDates.length == 0 ?
            <div className="activity">
                <div className="activity-row text-center">
                    <div>Not available</div>
                </div>
            </div> :
            <div className="activity">
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
            </div>;
    }
}
