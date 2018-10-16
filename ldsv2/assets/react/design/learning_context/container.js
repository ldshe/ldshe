import classnames from 'classnames';
import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import {connect} from 'react-redux';
import {Config} from 'js/util';
import {StateName as AppStateName} from 'react/app/design/types';
import {StateName as SessionStateName, StageType} from 'react/design/learning_session/allocation_panel/types';
import AutoSuggest from 'react/components/auto_suggest';
import {StateName as ContextStateName, SubjectAutoSuggests, LearningModes, CourseTypes, Prerequisites} from './types'
import {initFieldChange, fieldChange} from './actions';
import {validateForm} from './validator';

class LearningContext extends Component {

    constructor(props, context) {
        super(props, context);
        this.enableNavLink = this.enableNavLink.bind(this);
        this.validate = this.validate.bind(this);
        this.validateField = this.validateField.bind(this);
        this.handleFieldChange = this.handleFieldChange.bind(this);
        this.renderEditForm = this.renderEditForm.bind(this);
        this.renderField = this.renderField.bind(this);
        this.state = {errors: null};
        this.docTitle = 'Learning Design Studio HE';
    }

    componentDidMount() {
        const {isNewDesign} = this.props.app;
        const {isInitialized, data} = this.props.course;
        if(isNewDesign && !isInitialized) {
            const {initFieldChange} = this.props;
            initFieldChange();
        }

        document.title = `${data.title} - ${this.docTitle}`;
    }

    componentDidUpdate() {
        const {isInitialized, isInitialFailed, data} = this.props.course;
        if(isInitialized) {
            let $titleInput = $(ReactDOM.findDOMNode(this.titleInput));
            if($titleInput.val() == 'Untitled') $titleInput.select();
            this.enableNavLink();
        }

        if(isInitialFailed) {
            this.enableNavLink();
        }

        document.title = `${data.title} - ${this.docTitle}`;
    }

    enableNavLink() {
        $('#createDesignNavLink').unbind('click');
    }

    validateField(key) {
        if(this.props.isReadOnly()) {
            this.setState({errors: null});
            return;
        }

        const oldErrs = this.state.errors ||  {};
        let newErrs = validateForm($('#lc-form').get(0));
        if(newErrs) {
            if(newErrs[key]) {
                oldErrs[key] = newErrs[key];
                let $input = $('#lc-form').find(`[name=${key}]`);
                if($input.attr('value')) setTimeout(() => $input.select(), 0);
            } else {
                delete oldErrs[key];
            }
            this.setState({errors: oldErrs});
        } else {
            this.setState({errors: null});
        }
    }

    validate() {
        if(this.props.isReadOnly()) {
            this.setState({errors: null});
            return true;
        }

        let errors = validateForm($('#lc-form').get(0));
        this.setState({errors});
        return !errors;
    }

    handleFieldChange(name, value) {
        const {onFieldChange} = this.props;
        this.validateField(name);
        onFieldChange(name, value);
    }

    renderField(name, labelEl, fieldEl, errors) {
        let hasErr = errors && errors[name];
        let grpCls = classnames({
            'form-group': true,
            'has-error': hasErr,
        });
        let helpEl;
        if(hasErr) {
            let messages = errors[name];
            helpEl = messages.map(
                (m, i) => <div key={i} className="col-sm-9 col-sm-offset-3 col-md-offset-2">
                              <p className="help-block">
                                <small>{m}</small>
                              </p>
                          </div>
            );
        } else {
            helpEl = null;
        }
        return (
            <div className={grpCls}>
                {labelEl}
                {fieldEl}
                {helpEl}
            </div>
        )
    }

    renderEditForm() {
        const {course, session} = this.props;
        const {title, type, subject, semester, teacher, classSize, sessionNum, mode, prerequisite, purpose, sessInDuration, sessPpDuration} = course.data;
        const {teachingTime, selfStudyTime} = course;
        const {errors} = this.state;
        const sessionRanges = Array.apply(null, {length: 30})
            .map(Number.call, Number)
            .map(n => n+1)
            .filter(n => n >= session.data.filter(d => d.stage == StageType.IN).length);
        return (
            <form className="form-horizontal" id="lc-form" autoComplete="off" onSubmit={e => e.preventDefault()}>
                {this.renderField(
                    'title',
                    <label htmlFor="lc-title" className="col-sm-3 col-md-2 control-label-sm">Course Title</label>,
                    <div className="col-sm-9 col-md-9">
                        <input ref={input => this.titleInput = input} className="form-control input-sm" id="lc-title" type="text" name="title" value={title} placeholder="Course Title" maxLength="255" onChange={e => this.handleFieldChange(e.target.name, e.target.value)}/>
                    </div>,
                    errors
                )}

                {this.renderField(
                    'subject',
                    <label htmlFor="lc-subject" className="col-sm-3 col-md-2 control-label-sm">Subject</label>,
                    <div className="col-sm-9 col-md-9">
                    <AutoSuggest
                        suggests={SubjectAutoSuggests}
                        inputProps={{
                            id: 'lc-subject',
                            type: 'text',
                            name: 'subject',
                            placeholder: 'Subject',
                            maxLength: '255',
                        }}
                        inputSize="sm"
                        value={subject}
                        onFieldChange={this.handleFieldChange}
                        readOnly={this.props.isReadOnly()}
                    />
                    </div>,
                    errors
                )}

                {this.renderField(
                    'semester',
                    <label htmlFor="lc-semester" className="col-sm-3 col-md-2 control-label-sm">Semester of Course Offering</label>,
                    <div className="col-sm-9 col-md-9">
                        <input className="form-control input-sm" id="lc-semester" type="text" name="semester" value={semester} placeholder="e.g. 2nd term, 2017-2018" maxLength="255" onChange={e => this.handleFieldChange(e.target.name, e.target.value)}/>
                    </div>,
                    errors
                )}

                {this.renderField(
                    'teacher',
                    <label htmlFor="lc-teacher" className="col-sm-3 col-md-2 control-label-sm">Teacher / Instructor</label>,
                    <div className="col-sm-9 col-md-9">
                        <input className="form-control input-sm" id="lc-teacher" type="text" name="teacher" value={teacher} placeholder="Teacher / Instructor" maxLength="255" onChange={e => this.handleFieldChange(e.target.name, e.target.value)}/>
                    </div>,
                    errors
                )}

                <div className="row"><div className="col-sm-12">{' '}</div></div>

                {this.renderField(
                    'classSize',
                    <label htmlFor="lc-class-size" className="col-sm-3 col-md-2 control-label-sm">Class Size</label>,
                    <div className="col-sm-9 col-md-9">
                        <input className="form-control input-sm" id="lc-class-size" type="number" name="classSize" value={classSize ? classSize : ''} min="1" max="9999999" placeholder="Class Size" onChange={e => this.handleFieldChange(e.target.name, e.target.value)}/>
                    </div>,
                    errors
                )}

                {this.renderField(
                    'sessionNum',
                    <label htmlFor="lc-session-num" className="col-sm-3 col-md-2 control-label-sm">No. of Sessions</label>,
                    <div className="col-sm-9 col-md-9">
                        <select className="form-control input-sm" id="lc-session-num" name="sessionNum" value={sessionNum} onChange={e => this.handleFieldChange(e.target.name, e.target.value)}>
                            {sessionRanges.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                    </div>,
                    errors
                )}

                {this.renderField(
                    'mode',
                    <label htmlFor="lc-mode" className="col-sm-3 col-md-2 control-label-sm">Mode of Learning</label>,
                    <div className="col-sm-9 col-md-9">
                        <select className="form-control input-sm" id="lc-mode" name="mode" value={mode} onChange={e => this.handleFieldChange(e.target.name, e.target.value)}>
                            {LearningModes.map(m => <option key={m.value} value={m.value}>{m.name}</option>)}
                        </select>
                    </div>,
                    errors
                )}

                {this.renderField(
                    'sessInDuration',
                    <label htmlFor="lc-sess-in-duration" className="col-sm-3 col-md-2 control-label-sm">Session Duration</label>,
                    <div className="col-sm-9 col-md-9">
                        <input className="form-control input-sm" id="lc-sess-in-duration" type="number" name="sessInDuration" value={sessInDuration ? sessInDuration : ''} min="1" max="9999" placeholder="Hours" onChange={e => this.handleFieldChange(e.target.name, e.target.value)}/>
                        <small>{sessInDuration ? ` (hours) / ${sessInDuration*60} (minutes)` : ` (hours) / 0 (minutes)`}</small>
                    </div>,
                    errors
                )}

                {this.renderField(
                    'sessPpDuration',
                    <label htmlFor="lc-sess-pp-duration" className="col-sm-3 col-md-2 control-label-sm">Pre+Post Session Duration</label>,
                    <div className="col-sm-9 col-md-9">
                        <input className="form-control input-sm" id="lc-sess-pp-duration" type="number" name="sessPpDuration" value={sessPpDuration ? sessPpDuration : ''} min="1" max="9999" placeholder="Hours" onChange={e => this.handleFieldChange(e.target.name, e.target.value)}/>
                        <small>{sessPpDuration ? ` (hours) / ${sessPpDuration*60} (minutes)` : ` (hours) / 0 (minutes)`}</small>
                    </div>,
                    errors
                )}

                {this.renderField(
                    'type',
                    <label htmlFor="lc-type" className="col-sm-3 col-md-2 control-label-sm">Type of Course</label>,
                    <div className="col-sm-9 col-md-9">
                        <select className="form-control input-sm" id="lc-type" name="type" value={type} onChange={e => this.handleFieldChange(e.target.name, e.target.value)}>
                            {CourseTypes.map(m => <option key={m.value} value={m.value}>{m.name}</option>)}
                        </select>
                    </div>,
                    errors
                )}

                {this.renderField(
                    'prerequisite',
                    <label htmlFor="lc-prerequisite" className="col-sm-3 col-md-2 control-label-sm">Prerequisites</label>,
                    <div className="col-sm-9 col-md-9">
                        <select className="form-control input-sm" id="lc-prerequisite" name="prerequisite" value={prerequisite} onChange={e => this.handleFieldChange(e.target.name, e.target.value)}>
                            {Prerequisites.map(m => <option key={m.value} value={m.value}>{m.name}</option>)}
                        </select>
                    </div>,
                    errors
                )}

                {this.renderField(
                    'purpose',
                    <label htmlFor="lc-purpose" className="col-sm-3 col-md-2 control-label-sm">Purpose</label>,
                    <div className="col-sm-9 col-md-9">
                        <textarea className="form-control input-sm" id="lc-purpose" name="purpose" value={purpose}  placeholder="Purpose" onChange={e => this.handleFieldChange(e.target.name, e.target.value)}/>
                    </div>,
                    errors
                )}

                {this.renderField(
                    'teachingTime',
                    <label htmlFor="lc-teaching-time" className="col-sm-3 col-md-2 control-label-sm">Teaching Contact Time</label>,
                    <div className="col-sm-9 col-md-9">
                        <small className="time">{`${Math.round(teachingTime/6)/10} (hours) / ${teachingTime} (minutes)`}</small>
                    </div>,
                    errors
                )}

                {this.renderField(
                    'selfStudyTime',
                    <label htmlFor="lc-self-study-time" className="col-sm-3 col-md-2 control-label-sm">Self-study Time</label>,
                    <div className="col-sm-9 col-md-9">
                        <small className="time">{`${Math.round(selfStudyTime/6)/10} (hours) / ${selfStudyTime} (minutes)`}</small>
                    </div>,
                    errors
                )}
            </form>
        );
    }

    render() {
        return (
            <div className="lc">
                <h4>Learning Context & Characteristics of the Course</h4>
                {this.renderEditForm()}
            </div>
        );
    }
}

const mapStateToProps = state => ({
    app: Config.get(state, AppStateName.DESIGN_APP),
    course: Config.get(state, ContextStateName.LEARNING_CONTEXT),
    session: Config.get(state, SessionStateName.LEARNING_SESSION),
});

const mapDispatchToProps = dispatch => ({
    initFieldChange: () => dispatch(initFieldChange()),
    onFieldChange: (name, value) => dispatch(fieldChange({[name]: value})),
});

export default connect(
    mapStateToProps,
    mapDispatchToProps,
    null,
    {withRef: true}
)(LearningContext);
