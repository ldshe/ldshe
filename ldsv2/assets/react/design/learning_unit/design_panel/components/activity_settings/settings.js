import classnames from 'classnames';
import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import 'eonasdan-bootstrap-datetimepicker';
import moment from 'moment';
import {isNumber} from 'js/util';
import TagsInput from 'react/components/tags_input';
import {GraphType, PatternType, LearningActivity, SocialOrganization, Feedback, Motivator, Setting, Resource, Tool, Panel} from '../../types';
import {validateForm} from './validator';
import AdditionalSettings from './additionals';

const ref = {};

export default class Settings extends Component {

    static getDerivedStateFromProps(nextProps, prevState) {
        if(nextProps.node) {
            return {
                showGroupSize: nextProps.node.model.socialOrganization == SocialOrganization.GROUP,
                showDueDate: nextProps.node.model.assessment,
            };
        }
        return null;
    }

    constructor(props, context) {
        super(props, context);
        this.initDueDate = this.initDueDate.bind(this);
        this.setActiveTab = this.setActiveTab.bind(this);
        this.validateField = this.validateField.bind(this);
        this.validateGroupSize = this.validateGroupSize.bind(this);
        this.handleFieldChange = this.handleFieldChange.bind(this);
        this.showAdditionalSettings = this.showAdditionalSettings.bind(this);
        this.refreshSelectize = this.refreshSelectize.bind(this);
        this.renderField = this.renderField.bind(this);
        this.renderTagInput = this.renderTagInput.bind(this);
        this.renderEditCompositeForm = this.renderEditCompositeForm.bind(this);
        this.renderEditActivityForm = this.renderEditActivityForm.bind(this);
        this.renderAdditionalSettings = this.renderAdditionalSettings.bind(this);
        this.state = {
            errors: null,
            showGroupSize: true,
            showDueDate: false,
            additionalSettings: null,
        };
        this.dpCanChange = true;
        this.dueDateChange = false;
        this.filterByFields = props.filterByFields || [
            'subType',
            'fullname',
            'description',
            'assessment',
            'dueDate',
            'socialOrganization',
            'groupSize',
            'feedbacks',
            'motivators',
            'duration',
            'setting',
            'resources',
            'tools',
            'note',
        ];
        this.colLabelClassname = classnames({'control-label-sm': true,}, props.colLabelClassname || {'col-md-2': true});
        this.colInputClassname = classnames(props.colInputClassname || {'col-md-10': true});
    }

    getSnapshotBeforeUpdate(prevProps, prevState) {
        if(prevProps.node && this.props.node) {
            if(prevProps.node.model.dueDate != this.props.node.model.dueDate)
                this.dueDateChange = true;
        }
        return null;
    }

    setActiveTab() {
        const {setActivitySettingsActive, setNavigationActive} = this.props;
        let node = this.props.node;
        if(node) {
            if(setActivitySettingsActive) setActivitySettingsActive();
        } else {
            if(setNavigationActive) setNavigationActive();
        }
    }

    initDueDate() {
        const {node} = this.props;
        let $date = $(ReactDOM.findDOMNode(this.dueDateInput));

        if($date.length == 0) return;

        if(node && node.model.pattType == PatternType.COMPOSITE)
            return;

        if(node && !$date.data('DateTimePicker')) {
            $date.datetimepicker({
                useCurrent: false,
                format: '(ddd) D MMM',
                widgetPositioning: {
                    horizontal: 'right',
                    vertical: 'bottom',
                }
            });
            $date.on('dp.change', e => {
                let id = $date.data('nodeId');
                if(this.dpCanChange) {
                    let date = e.date;
                    if(date) {
                        let m = moment(date);
                        m.hour(0);
                        m.minute(0);
                        m.second(0);
                        m.millisecond(0);
                        this.handleFieldChange(id, 'dueDate', m.toISOString());
                    } else {
                        this.handleFieldChange(id, 'dueDate', '');
                    }
                }
            });
        }

        if(node && ($date.data('nodeId') != node.model.id || this.dueDateChange)) {
            const {id, dueDate} = node.model;
            this.dpCanChange = false;
            $date.data('DateTimePicker').date(null);
            if(Date.parse(dueDate) && !isNumber(dueDate)) {
                let tzOffset = moment().utcOffset();
                let fmtDate = moment(dueDate).minute(tzOffset);
                $date.data('DateTimePicker').date(fmtDate);
            }
            this.dpCanChange = true;
            this.dueDateChange = false;
            $date.data('nodeId', id);
        }
    }

    componentDidMount() {
        this.setActiveTab();
        $(document).on('click', '#ud-act-feedbacks + .selectize-control .item', e => this.showAdditionalSettings(e, 'feedbacks'));
        $(document).on('click', '#ud-act-motivators + .selectize-control .item', e => this.showAdditionalSettings(e, 'motivators'));
        $(document).on('click', '#ud-act-resources + .selectize-control .item', e => this.showAdditionalSettings(e, 'resources'));
        $(document).on('click', '#ud-act-tools + .selectize-control .item', e => this.showAdditionalSettings(e, 'tools'));
    }

    componentDidUpdate() {
        this.initDueDate();
        this.setActiveTab();
    }

    componentWillUnmount() {
        let $date = $(ReactDOM.findDOMNode(this.dueDateInput));
        if($date.data('DateTimePicker')) {
            $date.data('DateTimePicker').destroy();
            $date.off('dp.change');
        }
        $(document).off('click', '#ud-act-feedbacks + .selectize-control .item');
        $(document).off('click', '#ud-act-motivators + .selectize-control .item');
        $(document).off('click', '#ud-act-resources + .selectize-control .item');
        $(document).off('click', '#ud-act-tools + .selectize-control .item');
    }

    validateField(key) {
        if(this.props.isReadOnly()) {
            this.setState({errors: null});
            return;
        }

        const oldErrs = this.state.errors ||  {};
        let newErrs = validateForm($('#ud-act-form').get(0));
        if(newErrs) {
            if(newErrs[key])
                oldErrs[key] = newErrs[key];
            else
                delete oldErrs[key];
            this.setState({errors: oldErrs});
        } else {
            this.setState({errors: null});
        }
    }

    validateGroupSize(id, field) {
        const {node} = this.props;
        const {activityFieldChange} = this.props;
        let groupSize = node.model.groupSize;
        let groupSizeMax = node.model.groupSizeMax;
        let needChanged = false;
        if(groupSize && groupSizeMax) {
        	if(groupSize > groupSizeMax) {
                needChanged = true;
                if(field == 'groupSize')
                    groupSizeMax = groupSize;
                else
                    groupSize = groupSizeMax;
            }
        } else if(groupSize || groupSizeMax) {
            needChanged = true;
        	if(!groupSize && field == 'groupSize') groupSizeMax = null;
            if(!groupSize && field == 'groupSizeMax') groupSize = groupSizeMax;
            if(!groupSizeMax && field == 'groupSize') groupSizeMax = groupSize;
        	if(!groupSizeMax && field == 'groupSizeMax') groupSize = null;
        }
        if(needChanged) {
            activityFieldChange(id, 'groupSize', groupSize);
            activityFieldChange(id, 'groupSizeMax', groupSizeMax);
        }
    }

    handleFieldChange(id, name, value) {
        const {activityFieldChange} = this.props;
        // this.validateField(name);
        activityFieldChange(id, name, value);

        if(name == 'socialOrganization' && !this.props.isReadOnly()) {
            if(value == SocialOrganization.GROUP) {
                this.setState({showGroupSize: true});
            } else {
                this.setState({showGroupSize: false});
            }
        }

        if(name == 'assessment' && !this.props.isReadOnly()) {
            if(value) {
                this.setState({showDueDate: true});
            } else {
                this.setState({showDueDate: false});
            }
        }

        if(name == 'dueDate' && !this.props.isReadOnly()) {
            if(!Date.parse(value) || isNumber(value)) {
                let $date = $(ReactDOM.findDOMNode(this.dueDateInput));
                this.dpCanChange = false;
                $date.data('DateTimePicker').date(null);
                this.dpCanChange = true;
            }
        }
    }

    showAdditionalSettings(e, name) {
        e.preventDefault();
        let value = $(e.target).attr('data-value');
        this.setState({
            additionalSettings: {
                name,
                value,
            }
        });
        const {freshAdditionalSettingsPanel} = this.props;
        freshAdditionalSettingsPanel(Panel.ADDITIONAL_SETTINGS_LIST, {title: value});
        this.additionalSettings.show();
    }

    refreshSelectize(name, value=null) {
        const {node} = this.props;
        $(`#ud-act-${name} + .selectize-control > .selectize-input`)
            .find('.item')
            .each(function() {
                const dataVal = $(this).attr('data-value');
                if(value == null || dataVal == value) {
                    let hasAdds = node.model['additional'+name.capitalize()][dataVal] &&
                        node.model['additional'+name.capitalize()][dataVal].data.length > 0;
                    if(hasAdds)
                        $(this).addClass('hasAdds');
                    else
                        $(this).removeClass('hasAdds');
                }
            });
        if(value && ref[name].refOpts.indexOf(value) == -1) {
            let $selectize = $(`#ud-act-${name}`).selectize();
            $selectize[0].selectize.removeOption(value);
        }
    }

    renderField(name, labelEl, fieldEl, errors) {

        if(this.filterByFields.indexOf(name) == -1) return null;

        let style={};
        if(name == 'groupSize') {
            const {showGroupSize} = this.state;
            style = showGroupSize ? {display: 'block'} : {display: 'none'};
        }
        if(name == 'dueDate') {
            const {showDueDate} = this.state;
            style = showDueDate ? {display: 'block'} : {display: 'none'};
        }
        let hasErr = errors && errors[name];
        let grpCls = classnames({
            'form-group': true,
            'has-error': hasErr,
        });
        let helpEl;
        if(hasErr) {
            let messages = errors[name];
            helpEl = messages.map(
                (m, i) => <div key={i} className="col-xs-8 col-xs-offset-4">
                              <p className="help-block">
                                <small>{m}</small>
                              </p>
                          </div>
            );
        } else {
            helpEl = null;
        }
        return (
            <div className={grpCls} style={style}>
                {labelEl}
                {fieldEl}
                {helpEl}
            </div>
        )
    }

    renderTagInput(id, key, name, value, placeholder, options) {
        const {node} = this.props;
        const {removeAllAdditionalSettings} = this.props;
        let self = this;
        let refOpts = [];
        let defaultOpts = {};
        let custOpts = {};
        Object.keys(options)
            .forEach(k => {
                defaultOpts[options[k]] = options[k];
                refOpts.push(options[k]);
            });
        value.forEach(v => {if(!refOpts.includes(v)) custOpts[v] = v});
        let resultOpts = Object.assign({}, defaultOpts, custOpts);
        setTimeout(() => this.refreshSelectize(name, null), 0);
        if(this.props.isReadOnly()) {
            return (
                <TagsInput
                    key={key}
                    value={value}
                    inputProps={{
                        id: `ud-act-${name}`,
                        name,
                        placeholder,
                    }}
                    selectizeOptions={{
                        delimiter: ',',
                        options: value,
                        items: value,
                    }}
                    inputSize="sm"
                    readOnly={this.props.isReadOnly()}
                />
            );
        } else {
            ref[name] = {};
            ref[name].refOpts = refOpts;
            ref[name].value = value;
            return (
                <TagsInput
                    key={key}
                    value={value}
                    options={options}
                    inputProps={{
                        id: `ud-act-${name}`,
                        name,
                        placeholder,
                    }}
                    selectizeOptions={{
                        delimiter: ',',
                        persist: true,
                        create: input => {
                            let find = false;
                            let existsVal = null;
                            ref[name].refOpts.forEach(o => {if(o.toLowerCase() == input.toLowerCase()) existsVal = o});
                            ref[name].value.forEach(v => {if(v.toLowerCase() == input.toLowerCase()) find = true});
                            return find ? null : {value: existsVal ? existsVal : input, text: existsVal ? existsVal : input};
                        },
                        options: resultOpts,
                        items: value,
                        onDelete: function(values) {
                            const alertify = self.props.getAlertify();
                            let val = values[0];
                            if(!val) return false;
                            alertify.confirm({
                                okLabel: 'CONFIRM',
                                cancelLabel: 'CANCEL',
                                iconClass: 'fa-exclamation-triangle danger',
                                confirmAction: () => {
                                    removeAllAdditionalSettings({
                                        id: node.model.id,
                                        field: name,
                                        value: val,
                                    });
                                    setTimeout(() => {
                                        self.refreshSelectize(name, val);
                                        this.removeItem(val);
                                    }, 0);
                                },
                                title: `DELETE SETTING "${val}"`,
                                subTitle: 'All additional items for this setting will also be deleted.',
                            });
                            return false;
                        },
                    }}
                    inputSize="sm"
                    onFieldChange={(name, value) => this.handleFieldChange(id, name, value)}
                />
            );
        }
    }

    renderEditCompositeForm() {
        const {node} = this.props;
        const {id, subType, fullname} = node.model;
        const {errors} = this.state;

        return (
            <form className="ud-act settings form-horizontal" id="ud-act-form" autoComplete="off" onSubmit={e => e.preventDefault()}>
                {this.renderField(
                    'subType',
                    <label htmlFor="ud-act-subType" className={this.colLabelClassname}>Pattern</label>,
                    <div className={this.colInputClassname}>
                        <input className="form-control input-sm" id="ud-act-subType" type="text" name="subType" value={subType} readOnly disabled/>
                    </div>,
                    errors
                )}

                {this.renderField(
                    'fullname',
                    <label htmlFor="ud-act-fullname" className={this.colLabelClassname}>Title</label>,
                    <div className={this.colInputClassname}>
                        <input className="form-control input-sm" id="ud-act-fullname" type="text" name="fullname" value={fullname} placeholder="Title" maxLength="255" onChange={e => this.handleFieldChange(id, e.target.name, e.target.value)}/>
                    </div>,
                    errors
                )}
            </form>
        );
    }

    renderEditActivityForm() {
        const {type, node} = this.props;
        const {id, subType, fullname, description, assessment, dueDate, socialOrganization, groupSize, groupSizeMax, feedbacks, motivators, duration, setting, resources, tools, note} = node.model;
        const {errors} = this.state;

        let groups = Object.keys(LearningActivity)
                           .map(k => LearningActivity[k].patt)
                           .filter(p => p.model.group == node.model.group);
        let isSubTypeEditable = !(type == GraphType.PATTERN_INSTANCE && !node.parent.isRoot());
        let custDueDate = Date.parse(dueDate) && !isNumber(dueDate) ? '' : (dueDate ? dueDate : '');
        return (
            <form className="ud-act settings form-horizontal" id="ud-act-form" autoComplete="off" onSubmit={e => e.preventDefault()}>
                {this.renderField(
                    'subType',
                    <label htmlFor="ud-act-subType" className={this.colLabelClassname}>Type</label>,
                    <div className={this.colInputClassname}>
                        <select key={'ud-act-subType-'+id} className="form-control input-sm" id="ud-act-subType" name="subType" value={subType} onChange={e => this.handleFieldChange(id, e.target.name, e.target.value)} readOnly={!isSubTypeEditable} disabled={!isSubTypeEditable}>
                            {groups.map(g => g.model).map(g => <option key={g.subType} value={g.subType}>{g.fullname}</option>)}
                        </select>
                    </div>,
                    errors
                )}

                {this.renderField(
                    'fullname',
                    <label htmlFor="ud-act-fullname" className={this.colLabelClassname}>Title</label>,
                    <div className={this.colInputClassname}>
                        <input className="form-control input-sm" id="ud-act-fullname" type="text" name="fullname" value={fullname} placeholder="Title" maxLength="255" onChange={e => this.handleFieldChange(id, e.target.name, e.target.value)}/>
                    </div>,
                    errors
                )}

                {this.renderField(
                    'description',
                    <label htmlFor="ud-act-description" className={this.colLabelClassname}>Description</label>,
                    <div className={this.colInputClassname}>
                        <textarea className="form-control input-sm" id="ud-act-description" name="description" value={description} placeholder="Description" onChange={e => this.handleFieldChange(id, e.target.name, e.target.value)}/>
                    </div>,
                    errors
                )}

                {this.renderField(
                    'assessment',
                    <label htmlFor="ud-act-assessment-no" className={this.colLabelClassname}>Assessment</label>,
                    <div className={this.colInputClassname}>
                        <div className="radio">
                            <label className="input-sm">
                                <input id="ud-act-assessment-no" type="radio" name="assessment" value={false} checked={!assessment} onChange={e => this.handleFieldChange(id, e.target.name, e.target.value)}/>
                                No
                            </label>
                            {' '}
                            <label className="input-sm">
                                <input id="ud-act-assessment-yes" type="radio" name="assessment" value={true} checked={assessment} onChange={e => this.handleFieldChange(id, e.target.name, e.target.value)}/>
                                Yes
                            </label>
                        </div>
                    </div>,
                    errors
                )}

                {this.renderField(
                    'dueDate',
                    <label htmlFor="ud-act-due-date" className={this.colLabelClassname}>Due Date</label>,
                    <div className={this.colInputClassname}>
                        <div ref={date => this.dueDateInput = date} className="input-group input-group-sm date">
                            <input className="form-control input-sm" id="ud-act-due-date" type="text" placeholder="Formatted Date" readOnly={this.props.isReadOnly()}/>
                            <span className="input-group-addon">
                                <span className="glyphicon glyphicon-calendar"></span>
                            </span>
                        </div>
                        <input className="form-control input-sm" type="text" name="dueDate" value={custDueDate} placeholder="Custom Date" onChange={e => this.handleFieldChange(id, e.target.name, e.target.value)}/>
                    </div>,
                    errors
                )}

                {this.renderField(
                    'socialOrganization',
                    <label htmlFor="ud-act-social-org" className={this.colLabelClassname}>Social Organization</label>,
                    <div className={this.colInputClassname}>
                        <select key={'ud-act-social-org-'+id} className="form-control input-sm" id="ud-act-social-org" name="socialOrganization" value={socialOrganization} onChange={e => this.handleFieldChange(id, e.target.name, e.target.value)}>
                            <option value={SocialOrganization.GROUP}>Group</option>
                            <option value={SocialOrganization.INDIVIDUAL}>Individual</option>
                            <option value={SocialOrganization.PEER_REVIEW}>Peer-review</option>
                            <option value={SocialOrganization.WHOLE_CLASS}>Whole Class</option>
                        </select>
                    </div>,
                    errors
                )}

                {this.renderField(
                    'groupSize',
                    <label htmlFor="ud-act-group-size" className={this.colLabelClassname}>Group Size</label>,
                    <div className={this.colInputClassname}>
                        <div className="input-group input-group-sm groupSize">
                            <input className="form-control" id="ud-act-group-size" type="number" min="1" max="9999" name="groupSize" value={groupSize == null ? '' : groupSize} placeholder="Min." onChange={e => this.handleFieldChange(id, e.target.name, e.target.value)} onBlur={e => this.validateGroupSize(id, e.target.name)}/>
                            <span className="input-group-addon">to</span>
                            <input className="form-control" id="ud-act-group-size-max" type="number" min="1" max="9999" name="groupSizeMax" value={groupSizeMax == null ? '' : groupSizeMax} placeholder="Max." onChange={e => this.handleFieldChange(id, e.target.name, e.target.value)} onBlur={e => this.validateGroupSize(id, e.target.name)}/>
                        </div>
                    </div>,
                    errors
                )}

                {this.renderField(
                    'feedbacks',
                    <label htmlFor="ud-act-feedbacks" className={this.colLabelClassname}>Feedback</label>,
                    <div className={this.colInputClassname}>
                        {this.renderTagInput(id, `ud-act-feedbacks-${id}`, 'feedbacks', feedbacks, 'Select a Feedback', {
                            'Group Feedback': Feedback.GROUP_FEEDBACK,
                            'Automated Feedback': Feedback.AUTOMATED_FEEDBACK,
                            'Individual Feedback': Feedback.INDIVIDUAL_FEEDBACK,
                            'Peer-review Feedback': Feedback.PEER_REVIEW_FEEDBACK,
                            'Score': Feedback.SCORE,
                            'Teacher Feedback': Feedback.TEACHER_FEEDBACK,
                        })}
                    </div>,
                    errors
                )}

                {this.renderField(
                    'motivators',
                    <label htmlFor="ud-act-motivators" className={this.colLabelClassname}>Motivators</label>,
                    <div className={this.colInputClassname}>
                        {this.renderTagInput(id, `ud-act-motivators-${id}`, 'motivators', motivators, 'Select a Motivator', {
                            'Badges': Motivator.BADGES,
                            'Leaderboard': Motivator.LEADERBOARD,
                            'Peer Competition': Motivator.PEER_COMPETITION,
                            'Peer Response (Quantity and Quality)': Motivator.PEER_RESPONSE_QUANTITY_AND_QUALITY,
                            'Score': Motivator.SCORE,
                            'Team Agency': Motivator.TEAM_AGENCY,
                            'Individual Agency': Motivator.INDIVIDUAL_AGENCY,
                            'Extra Activities': Motivator.EXTRA_ACTIVITIES,
                        })}
                    </div>,
                    errors
                )}

                {this.renderField(
                    'duration',
                    <label htmlFor="ud-act-duration" className={this.colLabelClassname}>Duration <small>(min)</small></label>,
                    <div className={this.colInputClassname}>
                        <input className="form-control input-sm" id="ud-act-duration" type="number" min="1" max="9999" name="duration" value={duration == null ? '' : duration} placeholder="Duration" onChange={e => this.handleFieldChange(id, e.target.name, e.target.value)}/>
                    </div>,
                    errors
                )}

                {this.renderField(
                    'setting',
                    <label htmlFor="ud-act-setting" className={this.colLabelClassname}>Setting</label>,
                    <div className={this.colInputClassname}>
                        <select key={'ud-act-setting-'+id} className="form-control input-sm" id="ud-act-setting" name="setting" value={setting} onChange={e => this.handleFieldChange(id, e.target.name, e.target.value)}>
                            <option value={Setting.FACE_TO_FACE_SYNCHRONOUS}>Face-to-face (Synchronous)</option>
                            <option value={Setting.FACE_TO_FACE_CLASSROOM}>Face-to-face (Classroom)</option>
                            <option value={Setting.FACE_TO_FACE_FIELD_WORK}>Face-to-face (Field Work)</option>
                            <option value={Setting.INFORMAL_ON_OR_OFFLINE}>Informal (On or Offline)</option>
                            <option value={Setting.ONLINE_ASYNCHRONOUS}>Online (Asynchronous)</option>
                            <option value={Setting.ONLINE_SYNCHRONOUS}>Online (Synchronous)</option>
                        </select>
                    </div>,
                    errors
                )}

                {this.renderField(
                    'resources',
                    <label htmlFor="ud-act-resources" className={this.colLabelClassname}>Resources</label>,
                    <div className={this.colInputClassname}>
                        {this.renderTagInput(id, `ud-act-resources-${id}`, 'resources', resources, 'Select a Resource', {
                            'Additional Examples': Resource.ADDITIONAL_EXAMPLES,
                            'Assessment Rubric': Resource.ASSESSMENT_RUBRIC,
                            'Audio': Resource.AUDIO,
                            'Book': Resource.BOOK,
                            'Book Chapter': Resource.BOOK_CHAPTER,
                            'Checklist': Resource.CHECKLIST,
                            'Course / Session Outline': Resource.COURSE_SESSION_OUTLINE,
                            'Demo Video': Resource.DEMO_VIDEO,
                            'Discussion Questions': Resource.DISCUSSION_QUESTIONS,
                            'Interactive Learning Material': Resource.INTERACTIVE_LEARNING_MATERIAL,
                            'Lecture Text': Resource.LECTURE_TEXT,
                            'Lecture Video': Resource.LECTURE_VIDEO,
                            'Paper': Resource.PAPER,
                            'PPT Slides': Resource.PPT_SLIDES,
                            'Quiz': Resource.QUIZ,
                            'Sample Work by Students': Resource.SAMPLE_WORK_BY_STUDENTS,
                            'Survey': Resource.SURVEY,
                            'Task Example': Resource.TASK_EXAMPLE,
                            'Template': Resource.TEMPLATE,
                            'Tutorial Text': Resource.TUTORIAL_TEXT,
                            'Tutorial Video': Resource.TUTORIAL_VIDEO,
                            'Video': Resource.VIDEO,
                            'Website': Resource.WEBSITE,
                            'Worksheet': Resource.WORKSHEET,
                            'Writing Template': Resource.WRITING_TEMPLATE,
                        })}
                    </div>,
                    errors
                )}

                {this.renderField(
                    'tools',
                    <label htmlFor="ud-act-tools" className={this.colLabelClassname}>Tools</label>,
                    <div className={this.colInputClassname}>
                        {this.renderTagInput(id, `ud-act-tools-${id}`, 'tools', tools, 'Select a Tool', {
                            'Blog': Tool.BLOG,
                            'Brainstorming Tool': Tool.BRAINSTORMING_TOOL,
                            'Chatroom': Tool.CHATROOM,
                            'Course Outline Templet': Tool.COURSE_OUTLINE_TEMPLET,
                            'Design Log': Tool.DESIGN_LOG,
                            'Discussion Forum': Tool.DISCUSSION_FORUM,
                            'e-Portfolio': Tool.E_PORTFOLIO,
                            'Learning Design Studio': Tool.LEARNING_DESIGN_STUDIO,
                            'LMS-Moodle': Tool.LMS_MOODLE,
                            'Mind-mapping Tool': Tool.MIND_MAPPING_TOOL,
                            'Online Assign Submission': Tool.ONLINE_ASSIGN_SUBMISSION,
                            'Online Course Room': Tool.ONLINE_COURSE_ROOM,
                            'Online Shared Drive': Tool.ONLINE_SHARED_DRIVE,
                            'Online Shared Workspace': Tool.ONLINE_SHARED_WORKSPACE,
                            'Programming Language': Tool.PROGRAMMING_LANGUAGE,
                            'Quiz Tool': Tool.QUIZ_TOOL,
                            'Survey Tool': Tool.SURVEY_TOOL,
                            'Survey-Poll': Tool.SURVEY_POLL,
                            'Video Quiz': Tool.VIDEO_QUIZ,
                            'Wiki': Tool.WIKI,
                        })}
                    </div>,
                    errors
                )}

                {this.renderField(
                    'note',
                    <label htmlFor="ud-act-note" className={this.colLabelClassname}>Notes & Observations</label>,
                    <div className={this.colInputClassname}>
                        <textarea className="form-control input-sm" id="ud-act-note" name="note" value={note} placeholder="Notes & Observations" onChange={e => this.handleFieldChange(id, e.target.name, e.target.value)}/>
                    </div>,
                    errors
                )}
            </form>
        );
    }

    renderAdditionalSettings() {
        const {node, additional, fileState} = this.props;
        const {
            isReadOnly, getAlertify,
            resetAdditionalSettingsPanel, freshAdditionalSettingsPanel, pushAdditionalSettingsPanel, popAdditionalSettingsPanel, jumpToAdditionalSettingsPanel,
            addAdditionalSettings, removeAdditionalSettings, removeAllAdditionalSettings, moveAdditionalSettings, updateAdditionalSettings,
            uploadFile,
        } = this.props;
        const {additionalSettings} = this.state;
        let props = {
            isReadOnly,
            getAlertify,
            node,
            additional,
            fileState,
            resetAdditionalSettingsPanel,
            freshAdditionalSettingsPanel,
            pushAdditionalSettingsPanel,
            popAdditionalSettingsPanel,
            jumpToAdditionalSettingsPanel,
            addAdditionalSettings,
            removeAdditionalSettings,
            removeAllAdditionalSettings,
            moveAdditionalSettings,
            updateAdditionalSettings,
            uploadFile,
        };
        if(additionalSettings) props = Object.assign({}, props, additionalSettings);
        return <AdditionalSettings ref={modal => this.additionalSettings = modal} {...props}/>;
    }

    render() {
        const {node} = this.props;
        if(node) {
            return (
                <div>
                    {node.model.pattType == PatternType.COMPOSITE ?
                        this.renderEditCompositeForm() :
                        this.renderEditActivityForm()}
                    {this.renderAdditionalSettings()}
                </div>
            );
        } else {
            return null;
        }
    }
}
