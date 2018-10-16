import classnames from 'classnames';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Config} from 'js/util';
import {Panel} from 'react/design/unit_step/types';
import {StateName as OutcomeStateName, LearningOutcomes, LearningOutcomeTypes} from 'react/design/learning_outcome/types';
import {StateName as UnitStateName} from '../pedagogical_sequence/types';
import {StateName as PanelStateName} from '../design_panel/types';
import {PedagogicalApproaches} from '../pedagogical_sequence/types';
import {addItem, updateItemField} from '../pedagogical_sequence/actions';
import PatternPreview from '../design_panel/components/pattern_preview';
import {loadUserPattern} from '../design_panel/actions/unit';
import {validateForm} from './validator';

class DesignGrid extends Component {

    constructor(props, context) {
        super(props, context);
        this.validate = this.validate.bind(this);
        this.validateField = this.validateField.bind(this);
        this.handleFieldChange = this.handleFieldChange.bind(this);
        this.onAdd = this.onAdd.bind(this);
        this.onEdit = this.onEdit.bind(this);
        this.renderField = this.renderField.bind(this);
        this.renderEditForm = this.renderEditForm.bind(this);
        this.renderLOs = this.renderLOs.bind(this);
        this.renderPreview = this.renderPreview.bind(this);
        this.renderUnits = this.renderUnits.bind(this);
        this.renderAddUnit = this.renderAddUnit.bind(this);
        this.renderEmptyUnit = this.renderEmptyUnit.bind(this);
        this.renderGrid = this.renderGrid.bind(this);
        this.state = {errors: null};
        this.formIds = [];
    }

    componentDidMount() {
        $('.us .thumbnail [data-toggle="popover"]').popover({
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

    componentWillUnmount() {
        $('.us .thumbnail [data-toggle="popover"]').popover('destroy');
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

    handleFieldChange(id, pos, name, value) {
        const {onFieldChange} = this.props;
        this.validateField(id, name);
        onFieldChange(pos, name, value);
    }

    onAdd(e) {
        e.preventDefault();
        const {addItem} = this.props;
        addItem();
    }

    onEdit(e, id) {
        e.preventDefault();
        const {pushPanel, loadUserPattern} = this.props;
        pushPanel(Panel.DESIGN_UNIT);
        loadUserPattern(id);
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

    renderEditForm(id, pos, title, approach, description) {
        id = 'dg-form-unit-'+id;
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
                {this.renderField(
                    'approach',
                    null,
                    <input className="form-control input-sm" type="text" name="approach" value={approach}  placeholder="Pedagogical Strategy" maxLength="255" onChange={e => this.handleFieldChange(id, pos, e.target.name, e.target.value)}/>,
                    errors && errors[id]
                )}
                {this.renderField(
                    'description',
                    null,
                    <textarea className="form-control input-sm" name="description" value={description}  placeholder="Description" onChange={e => this.handleFieldChange(id, pos, e.target.name, e.target.value)}/>,
                    errors && errors[id]
                )}
            </form>
        );
    }

    renderLOs(vals) {
        const {outcome} = this.props;
        if(outcome.data.length == 0)
            return null;

        let data = outcome.data.map(d => Object.assign({}, d));
        let los = vals.map(v => data.map((o, i) => {o.pos = i; return o})
                                    .filter(o => o.id == v)[0]);
        los = los.map(lo => {
            lo.name = LearningOutcomes.filter(o => o.value == lo.type)[0].name;
            return lo;
        });

        let els = [];
        los.sort((a, b) => a.pos-b.pos)
           .map((lo, i) => {
               let tagProps = {
                   key: i,
                   className: classnames({
                       label: true,
                       'label-dk': LearningOutcomeTypes.DISCIPLINARY_KNOWLEDGE == lo.type,
                       'label-ds': LearningOutcomeTypes.DISCIPLINARY_SKILLS == lo.type,
                       'label-gs': LearningOutcomeTypes.GENERIC_SKILLS == lo.type,
                   }),
                   'data-dk': LearningOutcomeTypes.DISCIPLINARY_KNOWLEDGE == lo.type,
                   'data-ds': LearningOutcomeTypes.DISCIPLINARY_SKILLS == lo.type,
                   'data-gs': LearningOutcomeTypes.GENERIC_SKILLS == lo.type,
                   'data-toggle': 'popover',
                   'data-placement': 'bottom',
                   'data-title': lo.name,
                   'data-description': lo.description,
               }
               els.push(<span {...tagProps}>{'[LO'+(lo.pos+1)+'] '+lo.name}</span>);
           });
        return (
            <div className="los row">
                {els}
            </div>
        );
    }

    renderPreview(id) {
        const {patternInstance} = this.props;
        let patt = patternInstance.userPatts.filter(p => p.id == id);
        let root;
        if(patt.length > 0 && (root=patt[0].patt).hasChildren()) {
            let props = {
                root,
                curr: null,
            }
            return (
                <div className="preview">
                    <PatternPreview {...props}/>
                </div>
            );
        } else {
            return (
                <div className="preview">
                    <span>No pattern for preview yet</span>
                </div>
            );
        }
    }

    renderUnits() {
        const {data} = this.props.unit;
        return data.map((d, i) => {
            return (
                <div key={d.id} className="col-md-4">
                    <div className="thumbnail">
                        <h5 className="title">Component {i+1}</h5>
                        {this.renderEditForm(d.id, i, d.title, d.approach, d.description)}
                        {this.renderLOs(d.outcomes)}
                        <button className="btn btn-primary btn-sm edit" onClick={e => this.onEdit(e, d.id)}>
                            <i className="fa fa-pencil"></i>
                            {' Edit Strategic Component'}
                        </button>
                        {this.renderPreview(d.id)}
                    </div>
                </div>
            )
        });
    }

    renderAddUnit() {
        return (
            <div key="add" className="col-md-4">
                <div className="thumbnail empty">
                    <div className="form-group">
                        <button className="btn btn-sm btn-default" href="#" onClick={this.onAdd}>
                            <i className="fa fa-plus"></i>
                            {' Add a new component'}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    renderEmptyUnit(n) {
        return <div key={`empty-${n}`} className="col-md-4"/>;
    }

    renderGrid() {
        this.formIds = [];
        const units = this.renderUnits();
        const rows = [];
        if(units.length > 0) {
            units.push(this.renderAddUnit());
            for(let i=0, len=units.length; i<len; i+=3) {
                rows.push(
                    <div key={i} className="row">
                        {
                            Array.apply(null, {length: 3})
                                .map(Number.call, Number)
                                .map(n => (i+n < len) ? units[i+n] : this.renderEmptyUnit(n))
                        }
                    </div>
                );
            }
            return rows;
        } else {
            return (
                <div className="col-md-12 empty">
                    <button className="btn btn-sm btn-primary" href="#" onClick={this.onAdd}>
                        <i className="fa fa-plus"></i>
                        {' Add a new component'}
                    </button>
                </div>
            );
        }
    }

    render() {
        return (
            <div className="grid">
                {this.renderGrid()}
            </div>
        );
    }
}

const mapStateToProps = state => ({
    outcome: Config.get(state, OutcomeStateName.LEARNING_OUTCOME),
    unit: Config.get(state, UnitStateName.LEARNING_UNIT),
    patternInstance: Config.get(state, PanelStateName.LEARNING_UNIT_PATTERN_INSTANCE),
});

const mapDispatchToProps = dispatch => ({
    addItem: () => dispatch(addItem(-1)),
    onFieldChange: (pos, name, value) => {
        dispatch(updateItemField(pos, {[name]: value}));
    },
    loadUserPattern: id => dispatch(loadUserPattern(id)),
});

export default connect(
    mapStateToProps,
    mapDispatchToProps,
    null,
    {withRef: true}
)(DesignGrid);
