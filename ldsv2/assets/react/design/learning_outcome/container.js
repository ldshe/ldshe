import classnames from 'classnames';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Config} from 'js/util';
import SortableList from 'react/components/sortable_list';
import TextareaComplete from 'react/components/textarea_complete';
import {StateName, LearningOutcomes, LearningOutcomeDescriptions} from './types';
import {addItem, updateItemField, removeItem, moveItem} from './actions';
import {validateForm} from './validator';

class LearningOutcome extends Component {

    constructor(props, context) {
        super(props, context);
        this.validate = this.validate.bind(this);
        this.validateField = this.validateField.bind(this);
        this.onAddItem = this.onAddItem.bind(this);
        this.onRemoveItem = this.onRemoveItem.bind(this);
        this.onMoveItem = this.onMoveItem.bind(this);
        this.handleFieldChange = this.handleFieldChange.bind(this);
        this.renderField = this.renderField.bind(this);
        this.renderEditForm = this.renderEditForm.bind(this);
        this.renderHeaderCols = this.renderHeaderCols.bind(this);
        this.renderBodyRows = this.renderBodyRows.bind(this);
        this.state = {errors: null};
        this.formIds = [];
    }

    componentDidMount() {
        $('.lo.sortable-list [data-toggle="tooltip"]').tooltip();
    }

    componentWillUnmount() {
        $('.lo.sortable-list [data-toggle="tooltip"]').tooltip('destroy');
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
        const {handleRemoveItem, getAlertify} = this.props;
        const alertify = getAlertify();
        alertify.confirm({
            okLabel: 'CONFIRM',
            cancelLabel: 'CANCEL',
            iconClass: 'fa-exclamation-triangle danger',
            confirmAction: () => handleRemoveItem(pos, id),
            title: 'DELETE OUTCOME',
            subTitle: 'This action cannot be undone.',
        });
    }

    onMoveItem(e, prevPos, newPos) {
        e.preventDefault();
        const {handleMoveItem} = this.props;
        handleMoveItem(prevPos, newPos);
    }

    handleFieldChange(id, pos, name, value) {
        const {onFieldChange} = this.props;
        this.validateField(id, name);
        onFieldChange(pos, name, value);
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
                              <div className="col-sm-6 col-md-5">
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

    renderEditForm(id, pos, type, description) {
        id = 'lo-form-'+id;
        this.formIds.push(id);
        let typClsName = LearningOutcomes.filter(o => o.value == type)[0].className;
        const {errors} = this.state;
        const selCls = classnames({
            'form-control': true,
            'input-sm': true,
            'disciplinary-knowledge': typClsName == 'disciplinary-knowledge',
            'disciplinary-skills': typClsName == 'disciplinary-skills',
            'generic-skills': typClsName == 'generic-skills',
        });
        return (
            <form id={id} className="lo" autoComplete="off" onSubmit={e => e.preventDefault()}>
                {this.renderField(
                    'type',
                    null,
                    <div className="row">
                        <div className="col-sm-6 col-md-5">
                            <select
                                className={selCls}
                                name="type"
                                value={type}
                                onChange={e => {
                                    let typClsName = LearningOutcomes.filter(o => o.value == e.target.value)[0].className;
                                    this.handleFieldChange(id, pos, e.target.name, e.target.value);
                                }}
                            >
                                {LearningOutcomes.map(m => <option className={m.className} key={m.value} value={m.value}>{m.name}</option>)}
                            </select>
                        </div>
                    </div>,
                    errors && errors[id]
                )}

                {this.renderField(
                    'description',
                    null,
                    <TextareaComplete
                        suggests={LearningOutcomeDescriptions}
                        inputProps={{
                            type: 'text',
                            name: 'description',
                            placeholder: 'Description. Type "?" to show some suggestions.',
                        }}
                        inputSize="sm"
                        value={description}
                        onFieldChange={(name, value) => this.handleFieldChange(id, pos, name, value)}
                        readOnly={this.props.isReadOnly()}
                    />,
                    errors && errors[id]
                )}
            </form>
        );
    }

    renderHeaderCols() {
        let headerMeta = [
            {name: 'Type', className: 'col-type', tooltip: 'Type'},
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
            return <th {...props}>{m.name}</th>;
        });
        return headerCols;
    }

    renderBodyRows() {
        const {data} = this.props.outcome;
        this.formIds = [];
        let bodyRows = [];
        if(data.length > 0) {
            let bodyMeta = [
                {className: 'col-type'},
            ];
            bodyRows = data.map((d, i) => {
                return {
                    id: d.id,
                    els: <td className={bodyMeta[0].className}>{this.renderEditForm(d.id, i, d.type, d.description)}</td>,
                }
            });
        }
        return bodyRows;
    }

    render() {
        const props = {
            className: {lo: true},
            tableClassName: {'table-sm': true},
            controlClassName: {'btn-default': true, 'btn-xs': true},
            headerCols: this.renderHeaderCols(),
            bodyRows: this.renderBodyRows(),
            onAddItem: this.onAddItem,
            onRemoveItem: this.onRemoveItem,
            onMoveItem: this.onMoveItem,
            emptyMessage: 'Please add a new Outcome',
        }
        return (
            <div>
                <h4>Learning Outcomes</h4>
                <SortableList {...props}/>
            </div>
        );
    }
}

const mapStateToProps = state => ({
    outcome: Config.get(state, StateName.LEARNING_OUTCOME),
});

const mapDispatchToProps = dispatch => ({
    handleAddItem: pos => dispatch(addItem(pos)),
    handleRemoveItem: (pos, id) => dispatch(removeItem(pos, id)),
    handleMoveItem: (prevPos, newPos) => dispatch(moveItem(prevPos, newPos)),
    onFieldChange: (pos, name, value) => {
        dispatch(updateItemField(pos, {[name]: value}));
    },
});

export default connect(
    mapStateToProps,
    mapDispatchToProps,
    null,
    {withRef: true}
)(LearningOutcome);
