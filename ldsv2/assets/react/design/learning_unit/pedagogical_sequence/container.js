import classnames from 'classnames';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Config, isNumber} from 'js/util';
import SortableList from 'react/components/sortable_list';
import {Step} from 'react/design/design_wizard/types';
import {Panel} from 'react/design/unit_step/types';
import {freshPanel, pushPanel} from 'react/design/unit_step/actions';
import {StateName as OutcomeStateName, LearningOutcomeTypes, LearningOutcomes} from 'react/design/learning_outcome/types';
import {loadUserPattern} from 'react/design/learning_unit/design_panel/actions/unit';
import {StateName as UnitStateName, PedagogicalApproaches} from './types';
import {addItem, updateItemField, removeItem, moveItem} from './actions';
import {validateForm} from './validator';

class PedagogicalSequence extends Component {

    constructor(props, context) {
        super(props, context);
        this.initPopover = this.initPopover.bind(this);
        this.validate = this.validate.bind(this);
        this.validateField = this.validateField.bind(this);
        this.onAddItem = this.onAddItem.bind(this);
        this.onRemoveItem = this.onRemoveItem.bind(this);
        this.onMoveItem = this.onMoveItem.bind(this);
        this.onEditDesign = this.onEditDesign.bind(this);
        this.handleFieldChange = this.handleFieldChange.bind(this);
        this.renderTimeBar = this.renderTimeBar.bind(this);
        this.renderField = this.renderField.bind(this);
        this.renderTitleEditForm = this.renderTitleEditForm.bind(this);
        this.renderApproachEditForm = this.renderApproachEditForm.bind(this);
        this.renderLOsEditForm = this.renderLOsEditForm.bind(this);
        this.renderAssessmentEditForm = this.renderAssessmentEditForm.bind(this);
        this.renderGroupAssessmentEditForm = this.renderGroupAssessmentEditForm.bind(this);
        this.renderIndividualAssessmentEditForm = this.renderIndividualAssessmentEditForm.bind(this);
        this.renderHeaderCols = this.renderHeaderCols.bind(this);
        this.renderBodyRows = this.renderBodyRows.bind(this);
        this.renderFooterCols = this.renderFooterCols.bind(this);
        this.renderControlEls = this.renderControlEls.bind(this);
        this.state = {errors: null};
        this.formIds = [];
    }

    initPopover() {
        $('.ps.sortable-list [data-toggle="popover"]').each(el => $(el).popover('destroy'));
        $('.ps.sortable-list [data-toggle="popover"]').popover({
            trigger: 'hover',
            html: true,
            template: '<div class="popover popover-lo" role="tooltip"><div class="arrow"></div><div class="popover-title"></div><div class="popover-content"></div></div>',
            delay: {
               show: 500,
               hide: 100,
            },
            title: function() {
                let cls = '';
                if($(this).attr('data-dk') == 'true') cls = 'dk';
                if($(this).attr('data-ds') == 'true') cls = 'ds';
                if($(this).attr('data-gs') == 'true') cls = 'gs';
                return '<div class="'+cls+'">'+$(this).attr('data-title')+'</div>';
            },
            content: function() {
                let cls = '';
                if($(this).attr('data-dk') == 'true') cls = 'dk';
                if($(this).attr('data-ds') == 'true') cls = 'ds';
                if($(this).attr('data-gs') == 'true') cls = 'gs';
                return '<div class="'+cls+'">'+$(this).attr('data-description')+'</div>';
            },
        });
    }

    componentDidUpdate() {
        this.initPopover();
    }

    componentDidMount() {
        $('.ps.sortable-list [data-toggle="tooltip"]').tooltip();
        this.initPopover();
    }

    componentWillUnmount() {
        $('.ps.sortable-list [data-toggle="tooltip"]').tooltip('destroy');
        $('.ps.sortable-list [data-toggle="popover"]').popover('destroy');
    }

    validateField(id, key) {
        if(this.props.isReadOnly()) {
            this.setState({errors: Object.assign({}, this.state.errors, {[id]: null})});
            return;
        }

        let oldErrs = (this.state.errors && this.state.errors[id]) ||  {};
        let {hasErr, errors} = validateForm(this.formIds);
        let newErrs = errors[id];
        if(newErrs) {
            if(newErrs[key])
                oldErrs[key] = newErrs[key];
            else
                delete oldErrs[key];
            this.setState({errors: Object.assign({}, this.state.errors, {[id]: oldErrs})});
        } else {
            this.setState({errors: Object.assign({}, this.state.errors, {[id]: null})});
        }
    }

    validate() {
        if(this.props.isReadOnly()) {
            this.setState({errors: {}});
            return true;
        }

        const {hasErr, errors} = validateForm(this.formIds);
        this.setState({errors});
        return !hasErr;
    }

    onAddItem(e, pos) {
        e.preventDefault();
        const {handleAddItem} = this.props;
        handleAddItem(pos);
    }

    onRemoveItem(e, pos, id) {
        e.preventDefault();
        const {handleRemoveItem} = this.props;
        const alertify = this.props.getAlertify();
        alertify.confirm({
            okLabel: 'CONFIRM',
            cancelLabel: 'CANCEL',
            iconClass: 'fa-exclamation-triangle danger',
            confirmAction: () => handleRemoveItem(pos, id),
            title: 'DELETE UNIT',
            subTitle: 'This action cannot be undone.',
        });
    }

    onMoveItem(e, prevPos, newPos) {
        e.preventDefault();
        const {handleMoveItem} = this.props;
        handleMoveItem(prevPos, newPos);
    }

    onEditDesign(e, pos, id) {
        e.preventDefault();
        const {handleEditDesign} = this.props;
        const wizard = this.props.getWizard();
        handleEditDesign(pos, id);
        wizard.jumpTo(Step.UNIT);
    }

    handleFieldChange(id, pos, name, value) {
        const {handleFieldChange} = this.props;
        this.validateField(id, name);
        handleFieldChange(pos, name, value);
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
                (m, i) => <div key={i} className="row">
                              <div className="col-sm-12">
                                  <p className="help-block">
                                      <small>{m}</small>
                                  </p>
                              </div>
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

    renderTimeBar() {
        const {data} = this.props.unit;
        let teachingTimes = [];
        let selfStudyTimes = [];
        data.forEach(d => {
            teachingTimes.push(d.teachingTime);
            selfStudyTimes.push(d.selfStudyTime);
        });
        let totalTeachingTime = teachingTimes.reduce((c, t) => t+c, 0);
        let totalSelfStudyTime = selfStudyTimes.reduce((c, t) => t+c, 0);
        let totalTime = totalTeachingTime + totalSelfStudyTime;

        let teachingStudyPercents = [
            {name: 'T-c', value: Math.round(totalTeachingTime/totalTime*1000)/10},
            {name: 'T-s', value: 100 - Math.round(totalTeachingTime/totalTime*1000)/10},
        ];
        let c = 0;
        let unitTimePercents = data.map((d, i) => {
            let percent = Math.round((teachingTimes[i]+selfStudyTimes[i])/totalTime*1000)/10;
            percent = (data.length > 1 && i == data.length-1) ? 100-c : percent;
            c += percent;
            return {name: i+1, value: percent};
        });
        return (
            <div className="ps">
                {(totalTime > 0) ? (
                    <div className="progress">{
                        teachingStudyPercents.map(
                            (p, i) => <div key={i}
                                           title={p.name == 'T-c' ? `Teaching contact overall time: ${p.value.toFixed(1)}%` : `Self-study overall time: ${p.value.toFixed(1)}%`}
                                           className="teaching-study progress-bar"
                                           aria-valuenow={p.value.toFixed(1)}
                                           aria-valuemin="0"
                                           aria-valuemax="100"
                                           style={{width: `${p.value}%`}}>{`${p.name}: ${p.value}%`}</div>)
                        }</div>
                ) : null}
                {(totalTime > 0) ? (
                    <div className="progress">{
                        unitTimePercents.map(
                            (p, i) => <div key={i}
                                           title={`Unit overall time: ${p.value.toFixed(1)}%`}
                                           className="unit progress-bar"
                                           aria-valuenow={p.value.toFixed(1)}
                                           aria-valuemin="0"
                                           aria-valuemax="100"
                                           style={{width: `${p.value}%`}}>{p.name}</div>)

                    }</div>
                ) : null}
            </div>
        );
    }

    renderTitleEditForm(id, pos, title) {
        id = 'ps-form-title-'+id;
        this.formIds.push(id);
        const {errors} = this.state;
        return (
            <form id={id} className="ps" autoComplete="off" onSubmit={e => e.preventDefault()}>
                {this.renderField(
                    'title',
                    null,
                    <input className="form-control input-sm" type="text" name="title" value={title}  placeholder="Component Title" maxLength="255" onChange={e => this.handleFieldChange(id, pos, e.target.name, e.target.value)}/>,
                    errors && errors[id]
                )}
            </form>
        );
    }

    renderApproachEditForm(id, pos, approach) {
        id = 'ps-form-approach-'+id;
        this.formIds.push(id);
        const {errors} = this.state;
        return (
            <form id={id} className="ps" autoComplete="off" onSubmit={e => e.preventDefault()}>
                {this.renderField(
                    'approach',
                    null,
                    <input className="form-control input-sm" type="text" name="approach" value={approach}  placeholder="Pedagogical Strategy" maxLength="255" onChange={e => this.handleFieldChange(id, pos, e.target.name, e.target.value)}/>,
                    errors && errors[id]
                )}
            </form>
        );
    }

    renderLOsEditForm(oid, pos, los) {
        const {data} = this.props.outcome;
        if(data.length > 0) {
            let id = 'ps-form-los-'+oid;
            this.formIds.push(id);
            const {errors} = this.state;
            return (
                <form id={id} className="ps form-inline" autoComplete="off" onSubmit={e => e.preventDefault()}>
                    {this.renderField(
                        'los[]',
                        null,
                        data.map((lo, i) => {
                            let helperId = `ps-form-los-helper-${oid}-${i}`;
                            let helperCls = classnames('helper', {
                                dk: LearningOutcomeTypes.DISCIPLINARY_KNOWLEDGE == lo.type,
                                ds: LearningOutcomeTypes.DISCIPLINARY_SKILLS == lo.type,
                                gs: LearningOutcomeTypes.GENERIC_SKILLS == lo.type,
                            });
                            return (
                                <label key={i} className="los-wrapper" data-lo={'LO'+(i+1)}>
                                    <input className="form-control input-sm"
                                        id={helperId}
                                        type="checkbox"
                                        name="los[]"
                                        value={lo.id}
                                        checked={los.indexOf(lo.id) != -1}
                                        onChange={e => this.handleFieldChange(id, pos, e.target.name, (e.target.checked ? e.target.value+':checked' : e.target.value))}
                                    />
                                    <label className={helperCls} htmlFor={helperId}
                                        data-dk={LearningOutcomeTypes.DISCIPLINARY_KNOWLEDGE == lo.type}
                                        data-ds={LearningOutcomeTypes.DISCIPLINARY_SKILLS == lo.type}
                                        data-gs={LearningOutcomeTypes.GENERIC_SKILLS == lo.type}
                                        data-toggle="popover"
                                        data-placement="bottom"
                                        data-title={LearningOutcomes.filter(o => o.value == lo.type)[0].name}
                                        data-description={lo.description}>
                                    </label>
                                </label>
                            );
                        }),
                        errors && errors[id]
                    )}
                </form>
            );
        } else {
            return <label className="control-label na">Not applicable</label>;
        }
    }

    renderAssessmentEditForm(id, pos, assessment) {
        id = 'ps-form-assessment-'+id;
        this.formIds.push(id);
        const {errors} = this.state;
        return (
            <form id={id} className="ps form-inline" autoComplete="off">
                {this.renderField(
                    'assessment',
                    null,
                    <input className="form-control" type="checkbox" name="assessment" value={assessment} checked={assessment} onChange={e => this.handleFieldChange(id, pos, e.target.name, e.target.checked)} data-ignored/>,
                    errors && errors[id]
                )}
            </form>
        );
    }

    renderGroupAssessmentEditForm(id, pos, groupAssessment) {
        id = 'ps-form-group-assessment-'+id;
        this.formIds.push(id);
        const {errors} = this.state;
        return (
            <form id={id} className="ps" autoComplete="off">
                {this.renderField(
                    'groupAssessment',
                    null,
                    <input className="form-control input-sm" type="number" min="1" max="100" name="groupAssessment" value={groupAssessment} onChange={e => this.handleFieldChange(id, pos, e.target.name, e.target.value)}/>,
                    errors && errors[id]
                )}
            </form>
        );
    }

    renderIndividualAssessmentEditForm(id, pos, individualAssessment) {
        id = 'ps-form-individual-assessment-'+id;
        this.formIds.push(id);
        const {errors} = this.state;
        return (
            <form id={id} className="ps" autoComplete="off">
                {this.renderField(
                    'individualAssessment',
                    null,
                    <input className="form-control input-sm" type="number"  min="1" max="100" name="individualAssessment" value={individualAssessment} onChange={e => this.handleFieldChange(id, pos, e.target.name, e.target.value)}/>,
                    errors && errors[id]
                )}
            </form>
        );
    }

    renderHeaderCols() {
        let headerMeta = [
            {name: 'title', el: 'Component Title', className: 'col-title', tooltip: 'Component Title'},
            {name: 'approach', el: 'Pedagogical Strategy', className: 'col-approach', tooltip: 'Pedagogical Strategy'},
            {name: 'los', el: 'LOs', className: 'col-los', tooltip: 'Learning Outcomes'},
            {name: 'assessment', el: <span className="glyphicon glyphicon-check"></span>, className: 'col-assessment', tooltip: 'Have assessment?'},
            {name: 'groupAssessment', el: <div><i className="fa fa-percent"></i> W-g</div>, className: 'col-group-assessment', tooltip: 'Weight of Group work (%)'},
            {name: 'individualAssessment', el: <div><i className="fa fa-percent"></i> W-i</div>, className: 'col-individual-assessment', tooltip: 'Weight of Individual work (%)'},
            {name: 'teachingTime', el: <div><span className="glyphicon glyphicon-time"></span> T-c</div>, className: 'col-teaching-time', tooltip: 'Teaching contact time (min)'},
            {name: 'selfStudyTime', el: <div><span className="glyphicon glyphicon-time"></span> T-s</div>, className: 'col-self-study-time', tooltip: 'Self-study time (min)'},
        ];
        let headerCols = headerMeta.map((m, i) => {
            let props = {
                key: m.name,
                className: m.className,
                'data-toggle': 'tooltip',
                'data-placement': 'top',
                'data-container': 'body',
                title: m.tooltip,
            }
            return <th {...props}>{m.el}</th>;
        });
        return headerCols;
    }

    renderBodyRows() {
        this.formIds = [];
        const {data} = this.props.unit;
        let bodyRows = [];
        if(data.length > 0) {
            bodyRows = data.map((d, i) => {
                return {
                    id: d.id,
                    els: [
                        <td key="title" className="col-title">{this.renderTitleEditForm(d.id, i, d.title)}</td>,
                        <td key="approach" className="col-approach">{this.renderApproachEditForm(d.id, i, d.approach)}</td>,
                        <td key="los" className="col-los">{this.renderLOsEditForm(d.id, i, d.outcomes)}</td>,
                        <td key="assessment" className="col-assessment">{this.renderAssessmentEditForm(d.id, i, d.assessment)}</td>,
                        <td key="groupAssessment" className="col-group-assessment">{this.renderGroupAssessmentEditForm(d.id, i, d.groupAssessment ? d.groupAssessment : '')}</td>,
                        <td key="individualAssessment" className="col-individual-assessment">{this.renderIndividualAssessmentEditForm(d.id, i, d.individualAssessment ? d.individualAssessment : '')}</td>,
                        <td key="teachingTime" className="col-teaching-time">{d.teachingTime}</td>,
                        <td key="selfStudyTime" className="col-self-study-time">{d.selfStudyTime}</td>,
                    ],
                }
            });
        }
        return bodyRows;
    }

    renderFooterCols() {
        const {data} = this.props.unit;
        let totalGroupAssessment=0, totalIndividualAssessment=0, totalAssessment=0;
        data.forEach(d => {
            totalGroupAssessment += isNumber(d.groupAssessment) ? d.groupAssessment : 0;
            totalIndividualAssessment += isNumber(d.individualAssessment) ? d.individualAssessment : 0;
        });
        totalAssessment = totalGroupAssessment + totalIndividualAssessment;
        let groupCls = classnames('cell group', {
            ['text-danger']: totalGroupAssessment > 100,
        });
        let individualCls = classnames('cell individual', {
            ['text-danger']: totalIndividualAssessment > 100,
        });
        let totalCls = classnames('cell total', {
            ['text-danger']: totalAssessment > 100,
        });
        return [
            <td key="1" colSpan="4">{' '}</td>,
            <td key="5" colSpan="2">
                <div className="assessment-total">
                    <div className="row">
                        <div className={groupCls}>{`${totalGroupAssessment}%`}</div>
                        <div className={individualCls}>{`${totalIndividualAssessment}%`}</div>
                    </div>
                </div>
                <hr/>
                <div className="assessment-total">
                    <div className="row">
                        <div className={totalCls}>Total: {`${totalAssessment}%`}</div>
                    </div>
                </div>
            </td>,
            <td key="7" colSpan="2">{' '}</td>,
        ];
    }

    renderControlEls(pos, id) {
        return [
            <button key={id} type="button" title="Edit" onClick={e => this.onEditDesign(e, pos, id)}>
                <i className="fa fa-pencil" ></i>
            </button>
        ];
    }

    render() {
        const props = {
            className: {ps: true},
            tableClassName: {'table-sm': true},
            headerCols: this.renderHeaderCols(),
            controlClassName: {'btn-default': true, 'btn-xs': true},
            bodyRows: this.renderBodyRows(),
            footerCols: this.renderFooterCols(),
            renderControlEls: this.renderControlEls,
            onAddItem: this.onAddItem,
            onRemoveItem: this.onRemoveItem,
            onMoveItem: this.onMoveItem,
            emptyMessage: 'Please add a new Sequence',
        }
        return (
            <div>
                <h4>Strategic Components</h4>
                {/*this.renderTimeBar()*/}
                <SortableList {...props}/>
            </div>
        );
    }
}

const mapStateToProps = state => ({
    outcome: Config.get(state, OutcomeStateName.LEARNING_OUTCOME),
    unit: Config.get(state, UnitStateName.LEARNING_UNIT),
});

const mapDispatchToProps = dispatch => ({
    handleAddItem: pos => dispatch(addItem(pos)),
    handleRemoveItem: (pos, id) => dispatch(removeItem(pos, id)),
    handleMoveItem: (prevPos, newPos) => dispatch(moveItem(prevPos, newPos)),
    handleFieldChange: (pos, name, value) => dispatch(updateItemField(pos, {[name]: value})),
    handleEditDesign: (pos, id) => {
        dispatch(freshPanel());
        dispatch(pushPanel(Panel.DESIGN_UNIT));
        dispatch(loadUserPattern(id));
    },
});

export default connect(
    mapStateToProps,
    mapDispatchToProps,
    null,
    {withRef: true}
)(PedagogicalSequence);
