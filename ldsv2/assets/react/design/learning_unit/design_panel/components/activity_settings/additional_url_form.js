import classnames from 'classnames';
import React from 'react';
import {validateUrlForm} from './validator';
import AdditionalForm from './additional_form';

export default class AdditionalUrlForm extends AdditionalForm {

    static getDerivedStateFromProps(nextProps, prevState) {
        if(!nextProps.id || prevState.id != nextProps.id) {
            return {
                shouldPop: true,
            };
        };
        return null;
    }

    constructor(props, context) {
        super(props, context);
        this.handleFieldChange = this.handleFieldChange.bind(this);
        this.renderField = this.renderField.bind(this);
        this.renderEditForm = this.renderEditForm.bind(this);
        this.validateForm = validateUrlForm;
        this.formIds = [];
        this.state = {
            id: props.id || null,
            shouldPop: false,
        }
    }

    componentDidUpdate() {
        const {shouldPop} = this.state;
        if(shouldPop) {
            const {popAdditionalSettingsPanel} = this.props;
            popAdditionalSettingsPanel();
            this.setState({shouldPop: false});
            return;
        }
    }

    handleFieldChange(pos, name, value) {
        const {onFieldChange} = this.props;
        this.validateField(name);
        onFieldChange(pos, {[name]: value});
    }

    renderField(name, labelEl, fieldEl, errors) {
        const {id} = this.props;
        let hasErr = errors &&  errors[id] && errors[id][name];
        let grpCls = classnames({
            'form-group': true,
            'has-error': hasErr,
        });
        let helpEl;
        if(hasErr) {
            let messages = errors[id][name];
            helpEl = messages.map(
                (m, i) => <div key={i} className="col-xs-12 col-sm-offset-2 col-sm-10">
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
        const {shouldPop} = this.state;
        if(shouldPop) return null;
        
        const {id, pos, title, description, url} = this.props;
        const {popAdditionalSettingsPanel} = this.props;
        this.formIds.push(id);
        const {errors} = this.state;
        return (
            <form id={`ud-as-url-form-${id}`} className="as-url form-horizontal" autoComplete="off" onSubmit={e => e.preventDefault()}>
                {this.renderField(
                    'title',
                    <label htmlFor={`ud-as-url-title-${id}`} className="col-xs-12 col-sm-2 control-label-sm">* Title</label>,
                    <div className="col-xs-12 col-sm-10">
                        <input className="form-control input-sm" id={`ud-as-url-title-${id}`} type="text" name="title" value={title} placeholder="Title" maxLength="255" onChange={e => this.handleFieldChange(pos, e.target.name, e.target.value)}/>
                    </div>,
                    errors
                )}
                {this.renderField(
                    'description',
                    <label htmlFor={`ud-as-url-description-${id}`} className="col-xs-12 col-sm-2 control-label-sm">Description</label>,
                    <div className="col-xs-12 col-sm-10">
                        <textarea className="form-control input-sm" id={`ud-as-url-description-${id}`} name="description" value={description} placeholder="Description" onChange={e => this.handleFieldChange(pos, e.target.name, e.target.value)}/>
                    </div>,
                    errors
                )}
                {this.renderField(
                    'url',
                    <label htmlFor={`ud-as-url-url-${id}`} className="col-xs-12 col-sm-2 control-label-sm">* URL</label>,
                    <div className="col-xs-12 col-sm-10">
                        <input className="form-control input-sm" id={`ud-as-url-url-${id}`} type="text" name="url" value={url} placeholder="URL" onChange={e => this.handleFieldChange(pos, e.target.name, e.target.value)} />
                    </div>,
                    errors
                )}
            </form>
        );
    }

    render() {
        return this.renderEditForm();
    }
}
