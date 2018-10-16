import classnames from 'classnames';
import React from 'react';
import ReactDOM from 'react-dom';
import Dropzone from 'react-dropzone';
import {formatSize} from 'js/util';
import appConfig from 'react/app/design/config';
import {validateFileForm} from './validator';
import AdditionalForm from './additional_form';

export default class AdditionalFileForm extends AdditionalForm {

    static getDerivedStateFromProps(nextProps, prevState) {
        if(!nextProps.id || prevState.id != nextProps.id) {
            return {
                shouldPop: true,
            };
        };
        if(prevState.loading && prevState.uploadNum == nextProps.fileState.uploadNum) {
            let err = nextProps.fileState.error ? nextProps.fileState.error.message : null;
            return {
                loading: false,
                uploadNum: -1,
                uploadErr: err,
                fileUploaded: !err,
            };
        }
        return null;
    }

    constructor(props, context) {
        super(props, context);
        this.onDrop = this.onDrop.bind(this);
        this.onFileUploaded = this.onFileUploaded.bind(this);
        this.handleFieldChange = this.handleFieldChange.bind(this);
        this.renderField = this.renderField.bind(this);
        this.renderLoading = this.renderLoading.bind(this);
        this.renderDropzone = this.renderDropzone.bind(this);
        this.renderFileLink = this.renderFileLink.bind(this);
        this.renderFileView = this.renderFileView.bind(this);
        this.renderEditForm = this.renderEditForm.bind(this);
        this.validateForm = validateFileForm;
        this.dropzone = null;
        this.formIds = [];
        this.state = {
            id: props.id || null,
            loading: false,
            uploadNum: -1,
            uploadErr: null,
            uploadFile: null,
            fileUploaded: false,
            shouldPop: false,
        }
    }

    componentDidUpdate() {
        const {shouldPop, fileUploaded} = this.state;
        if(shouldPop) {
            const {popAdditionalSettingsPanel} = this.props;
            popAdditionalSettingsPanel();
            this.setState({shouldPop: false});
            return;
        }
        if(fileUploaded) {
            this.onFileUploaded();
            this.setState({fileUploaded: false});
        }
    }

    onDrop(file) {
        const {fileState} = this.props;
        const {onUploadFile} = this.props;
        this.setState({
            loading: true,
            uploadNum: fileState.uploadNum + 1,
            uploadErr: null,
            uploadFile: file,
        });
        if(file[0].size > appConfig.maxFileSize) {
            this.setState({
                loading: false,
                uploadNum: -1,
                uploadErr: `Maximum allowed file size: ${formatSize(appConfig.maxFileSize, 'MB')}MB.`,
            });
        } else {
            onUploadFile(file);
        }
    }

    onFileUploaded() {
        const {onFieldChange} = this.props;
        const {pos, fileState} = this.props;
        const {uploadedFile} = fileState;
        let file = Object.assign({}, uploadedFile.data, {id: uploadedFile.fileId});
        onFieldChange(pos, {file});
        setTimeout(() => this.validateField('file'), 0);
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

    renderLoading() {
        return (
            <div className="loading">
                <p>Uploading file, please wait!</p>
                <i className="fa fa-spinner fa-spin fa-2x fa-fw"></i>
            </div>
        );
    }

    renderDropzone() {
        const {uploadErr} = this.state;
        const {id, fileState, isReadOnly} = this.props;
        let props = {
            multiple: false,
            name: 'file',
        };
        if(uploadErr) setTimeout(() => $(ReactDOM.findDOMNode(this.dropzone)).find('input').val(''), 0);
        return (
            <div>
                <div className="warning-msg">
                    <small>{`Maximum size for a new file: ${formatSize(appConfig.maxFileSize, 'MB')}MB.`}</small>
                </div>
                <Dropzone ref={dz => this.dropzone = dz} className="dropzone" {...props} onDrop={this.onDrop} disabled={isReadOnly()}>
                    {
                        uploadErr ?
                        <div className="alert alert-danger">{`${uploadErr} Please try again!`}</div> :
                        <div className="alert alert-default">Drop a file here, or click to select a file.</div>
                    }
                </Dropzone>
                <div className="danger-msg">
                    <small>
                        <i className="fa fa-exclamation-triangle"></i>
                        {' Please do not upload a file which contains sensitive / confidential information!'}
                    </small>
                </div>
            </div>
        );
    }

    renderFileLink() {
        const {file} = this.props;
        return (
            <a className="btn btn-sm btn-info" href={`/api/lds/files/${file.id}`} target="_blank">
                <i className="fa fa-cloud-download"></i>
                {` ${file.name}`}
                <input type="hidden" name="file" value={file.id}/>
            </a>
        );
    }

    renderFileView() {
        const {file} = this.props;
        return (file && file.id) ? this.renderFileLink() : this.renderDropzone();
    }

    renderEditForm() {
        const {shouldPop, loading} = this.state;
        if(shouldPop) return null;

        const {id, pos, title, description, url} = this.props;
        const {popAdditionalSettingsPanel} = this.props;
        this.formIds.push(id);
        const {errors} = this.state;
        return (
            <form id={`ud-as-file-form-${id}`} className="as-file form-horizontal" autoComplete="off" onSubmit={e => e.preventDefault()}>
                {this.renderField(
                    'title',
                    <label htmlFor={`ud-as-file-title-${id}`} className="col-xs-12 col-sm-2 control-label-sm">Title</label>,
                    <div className="col-xs-12 col-sm-10">
                        <input className="form-control input-sm" id={`ud-as-file-title-${id}`} type="text" name="title" value={title} placeholder="Title" maxLength="255" onChange={e => this.handleFieldChange(pos, e.target.name, e.target.value)}/>
                    </div>,
                    errors
                )}
                {this.renderField(
                    'description',
                    <label htmlFor={`ud-as-file-description-${id}`} className="col-xs-12 col-sm-2 control-label-sm">Description</label>,
                    <div className="col-xs-12 col-sm-10">
                        <textarea className="form-control input-sm" id={`ud-as-file-description-${id}`} name="description" value={description} placeholder="Description" onChange={e => this.handleFieldChange(pos, e.target.name, e.target.value)}/>
                    </div>,
                    errors
                )}
                {this.renderField(
                    'file',
                    <label htmlFor={`ud-as-file-file-${id}`} className="col-xs-12 col-sm-2 control-label-sm">* File</label>,
                    <div className="col-xs-12 col-sm-10">
                        {loading ? this.renderLoading() : this.renderFileView()}
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
