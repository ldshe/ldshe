import React, {Component} from 'react';
import {LearningModes, CourseTypes, Prerequisites} from 'react/design/learning_context/types';

export default class Context extends Component {

    constructor(props, context) {
        super(props, context);
        this.renderContext = this.renderContext.bind(this);
    }

    renderContext() {
        const {data, teachingTime, selfStudyTime} = this.props.course;
        const {subject, semester, teacher, classSize, sessionNum} = data;
        let mode = LearningModes.filter(m => m.value = data.mode) [0].name;
        let type = CourseTypes.filter(c => c.value = data.type) [0].name;
        let prerequisite = Prerequisites.filter(p => p.value = data.prerequisite) [0].name;
        return (
            <div className="context">
                <div className="ctx-row">
                    <div className="heading">Subject</div>
                    <div>{subject}</div>
                </div>
                <div className="ctx-row">
                    <div className="heading">Semester of Course Offering</div>
                    <div>{semester}</div>
                </div>
                <div className="ctx-row">
                    <div className="heading">Teacher / Instructor</div>
                    <div>{teacher}</div>
                </div>
                <div className="ctx-row">
                    <div className="heading">Class Size</div>
                    <div>{classSize}</div>
                </div>
                <div className="ctx-row">
                    <div className="heading">No. of Sessions</div>
                    <div>{sessionNum}</div>
                </div>
                <div className="ctx-row">
                    <div className="heading">Mode of Learning</div>
                    <div>{mode}</div>
                </div>
                <div className="ctx-row">
                    <div className="heading">Teaching Contact Time</div>
                    <div>{`${Math.round(teachingTime/6)/10} (hours) / ${teachingTime} (minutes)`}</div>
                </div>
                <div className="ctx-row">
                    <div className="heading">Self-study Time</div>
                    <div>{`${Math.round(selfStudyTime/6)/10} (hours) / ${selfStudyTime} (minutes)`}</div>
                </div>
                <div className="ctx-row">
                    <div className="heading">Type of Course</div>
                    <div>{type}</div>
                </div>
                <div className="ctx-row">
                    <div className="heading">Prerequisites</div>
                    <div>{prerequisite}</div>
                </div>
            </div>
        );
    }

    render() {
        return (
            <div>
                <h4>Learning Context & Characteristics of the Course</h4>
                {this.renderContext()}
            </div>
        );
    }
}
