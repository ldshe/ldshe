import React, {Component} from 'react';
import moment from 'moment';
import {StageType} from 'react/design/learning_session/allocation_panel/types';
import Group from './group';

export default class Session extends Component {

    constructor(props, context) {
        super(props, context);
        this.renderheading = this.renderheading.bind(this);
        this.renderStageGroup = this.renderStageGroup.bind(this);
        this.renderStage = this.renderStage.bind(this);
        this.renderContent = this.renderContent.bind(this);
        this.renderSession = this.renderSession.bind(this);
    }

    renderheading(d, i) {
        let {topic, objective} = d;
        let tzOffset = moment().utcOffset();
        let date = d.utcDate ? moment(d.utcDate).minute(tzOffset).format('(dddd) D MMMM, YYYY') : null;
        return(
            <div className="sess-heading">
                <div className="sess-row">
                    <div className="heading">Session</div>
                    <div>{i+1}</div>
                    <div className="heading">Date</div>
                    <div>{date}</div>
                </div>
                <div className="sess-row">
                    <div className="heading">Topics</div>
                    <div className="topic">{topic}</div>
                </div>
                <div className="sess-row">
                    <div className="heading">Objectives</div>
                    <div className="objective">{objective}</div>
                </div>
            </div>
        );
    }

    renderStageGroup(items) {
        const {userPatts} = this.props.patternInstance;
        let groups = [];
        items.forEach(id => {
            let root, parent;
            userPatts.forEach(({patt}) => {
                let n = patt.first(n => n.model.id == id);
                if(n) {
                    groups.push({
                        root: patt,
                        parent: n.parent,
                        selectedItemId: id,
                    });
                }
            });
        });
        return groups.map(({root, parent, selectedItemId}) => {
            let props = {
                key: selectedItemId,
                root,
                parent,
                selectedItemId,
            }
            return <Group {...props}/>;
        });
    }

    renderStage(stageType, items) {
        let title;
        switch(stageType) {
            case StageType.PRE:
            title = 'Pre-class';
            break;
            case StageType.IN:
            title = 'In-class';
            break;
            case StageType.POST:
            title = 'Post-class';
            break;
        }
        if(items.length > 0) {
            return (
                <div className="stage">
                    <div className="heading">{title}</div>
                    {this.renderStageGroup(items)}
                </div>
            );
        } else {
            return null;
        }
    }

    renderContent(d) {
        return (
            <div className="sess-content">
                {this.renderStage(StageType.PRE, d.pre)}
                {this.renderStage(StageType.IN, d.in)}
                {this.renderStage(StageType.POST, d.post)}
            </div>
        );
    }

    renderSession() {
        const {data} = this.props.session;
        return data
            .filter(d => d.stage == StageType.IN)
            .map((d, i) => {
                if(d.pre.length > 0 || d.in.length > 0 || d.post.length > 0) {
                    return (
                        <div key={d.id} className="sess-slot">
                            {this.renderheading(d, i)}
                            {this.renderContent(d)}
                        </div>
                    );
                } else {
                    return null;
                }
            });
    }

    render() {
        return (
            <div>
                <h4>Course Delivery</h4>
                <div className="session">{this.renderSession()}</div>
            </div>
        );
    }
}
