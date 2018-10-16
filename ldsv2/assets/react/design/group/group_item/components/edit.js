import classnames from 'classnames';
import React, {Component} from 'react';
import {Link} from 'react-router-dom';

export default class Edit extends Component {

    static getDerivedStateFromProps(nextProps, prevState) {
        if(prevState.updatedNum != nextProps.item.updatedNum) {
            return {
                updatedNum: nextProps.item.updatedNum,
                resetEditField: true,
            };
        }
        return null;
    }

    constructor(props, context) {
        super(props, context);
        this.resetEditFieldState = this.resetEditFieldState.bind(this);
        this.setEditFieldState = this.setEditFieldState.bind(this);
        this.onEditClick = this.onEditClick.bind(this);
        this.onCancelClick = this.onCancelClick.bind(this);
        this.onDoneClick = this.onDoneClick.bind(this);
        this.renderField = this.renderField.bind(this);
        this.renderEditField = this.renderEditField.bind(this);
        this.renderEditForm = this.renderEditForm.bind(this);
        this.state = {
            errors: null,
            editField: {
                name: -1,
                description: -1,
            },
            updatedNum: props.item.updatedNum,
            resetEditField: false,
        };
    }

    componentDidUpdate() {
        const {resetEditField} = this.state;
        if(resetEditField) {
            this.resetEditFieldState();
            this.setState({resetEditField: false});
        }
    }

    resetEditFieldState() {
        this.setState({
            editField: {
                name: -1,
                description: -1,
            },
        });
    }

    setEditFieldState(name, state) {
        this.setState({editField: Object.assign({}, this.state.editField, {[name]: state})});
        setTimeout(() => {$(`#ug-form-${name}`).focus()}, 0);
    }

    onEditClick(e, name) {
        e.preventDefault();
        this.setEditFieldState(name, 1);
    }

    onCancelClick(e, name) {
        e.preventDefault();
        this.setEditFieldState(name, -1);
    }

    onDoneClick(e, name) {
        e.preventDefault();
        let value = $(`#ug-form [name=${name}]`).val();
        if(value) value = value.trim();
        if(value || name == 'description') {
            const {groupId} = this.props;
            const {configureGroup} = this.props;
            configureGroup(groupId, {[name]: value});
            this.setEditFieldState(name, 0);
        } else {
            this.setEditFieldState(name, -1);
        }
    }

    renderField(name, labelEl, value) {
        let fState = this.state.editField[name];
        if(fState > 0) return null;
        return (
            <div className="form-group">
                {labelEl}
                <div className="col-sm-5 col-md-6">
                    <div className="panel panel-default">
                        <div className="panel-body">{fState ? value : null}</div>
                    </div>
                </div>
                <div className="col-sm-2">
                    <button className="btn btn-sm btn-default" title="Edit" onClick={e => this.onEditClick(e, name)}>
                        <i className="fa fa-pencil"></i>
                    </button>
                </div>
            </div>
        );
    }

    renderEditField(name, labelEl, fieldEl, errors) {
        let fState = this.state.editField[name];
        if(fState <= 0) return null;
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
                <div className="col-sm-5 col-md-6">{fieldEl}</div>
                {helpEl}
                <div className="col-sm-9 col-sm-offset-3 col-md-offset-2">
                    <div className="btn-toolbar">
                        <div className="btn-group btn-group-sm">
                            <button type="button" className="btn btn-default" onClick={e => this.onCancelClick(e, name)}>Cancel</button>
                        </div>
                        <div className="btn-group btn-group-sm">
                            <button type="button" className="btn btn-primary" onClick={e => this.onDoneClick(e, name)}>Done</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    renderEditForm() {
        const {name, description} = this.props.item.data;
        const {errors} = this.state;
        return (
            <form className="form-horizontal" id="ug-form" autoComplete="off" onSubmit={e => e.preventDefault()}>
                {this.renderField(
                    'name',
                    <label className="col-sm-3 col-md-2 control-label-sm">Group Name</label>,
                    name,
                )}
                {this.renderEditField(
                    'name',
                    <label htmlFor="ug-form-name" className="col-sm-3 col-md-2 control-label-sm">Group Name</label>,
                    <input className="form-control input-sm" id="ug-form-name" type="text" name="name" defaultValue={name} placeholder="Group Name" maxLength="255"/>,
                    errors
                )}

                {this.renderField(
                    'description',
                    <label className="col-sm-3 col-md-2 control-label-sm">Description</label>,
                    description,
                )}
                {this.renderEditField(
                    'description',
                    <label htmlFor="ug-form-description" className="col-sm-3 col-md-2 control-label-sm">Description</label>,
                    <textarea className="form-control input-sm" id="ug-form-description" name="description" defaultValue={description}  placeholder="Description"/>,
                    errors
                )}
            </form>
        );
    }

    render() {
        const {groupId} = this.props;
        const {name} = this.props.item.data;
        return (
            <div>
                <div className="panel panel-default">
                    <div className="panel-heading">General Settings</div>
                    <div className="panel-body">
                        {this.renderEditForm()}
                    </div>
                </div>

                <div className="panel panel-default">
                    <div className="panel-heading">Basic Management</div>
                    <Link to={{pathname: `/group/edit/${groupId}/member`, state: {subTitle: name}}}>
                        <div className="panel-body">
                            <i className="fa fa-users"></i>{' Members Management'}
                            <i className="fa fa-chevron-right pull-right"></i>
                        </div>
                    </Link>

                </div>
            </div>
        );
    }
}
