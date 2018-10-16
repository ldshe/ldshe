import classnames from 'classnames';
import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import {connect} from 'react-redux';
import alertify from 'alertify.js';
import 'eonasdan-bootstrap-datetimepicker';
import moment from 'moment';
import {Config} from 'js/util';
import {StateName, StageType} from '../allocation_panel/types';
import {removeSession, fieldChange, autofillUtcDate} from '../allocation_panel/actions';
import {validateForm} from './validator';

class EditPanel extends Component {

    static getDerivedStateFromProps(nextProps, prevState) {
        let utcDate = nextProps.session.data.filter(s => s.id == nextProps.session.editSessId);
        if(utcDate.length == 0) {
            return {
                isDeleted: true,
            };
        }
        utcDate = utcDate[0].utcDate;
        if(prevState.utcDate != utcDate) {
            return {
                needInitDate: true,
                utcDate,
            };
        }
        return null;
    }

    constructor(props, context) {
        super(props, context);
        this.state = {errors: null};
        this.initDate = this.initDate.bind(this);
        this.validateField = this.validateField.bind(this);
        this.validate = this.validate.bind(this);
        this.onDelete = this.onDelete.bind(this);
        this.onAutofill = this.onAutofill.bind(this);
        this.onDone = this.onDone.bind(this);
        this.handleFieldChange = this.handleFieldChange.bind(this);
        this.renderDelete = this.renderDelete.bind(this);
        this.renderField = this.renderField.bind(this);
        this.renderEditForm = this.renderEditForm.bind(this);
        this.state = {
            needInitDate: false,
            utcDate: null,
            isDeleted: false,
        };
        this.dpCanChange = true;
    }

    componentDidMount() {
        this.initDate();
        $(window).scrollTop(0);
    }

    componentDidUpdate() {
        const {isDeleted, needInitDate} = this.state;
        if(isDeleted) {
            const {popPanel} = this.props;
            popPanel();
            this.setState({isDeleted: false});
            return;
        }
        if(needInitDate) {
            this.dpCanChange = false;
            const {data, editSessId} = this.props.session;
            const {utcDate} = data.filter(s => s.id == editSessId)[0];
            let $date = $(ReactDOM.findDOMNode(this.dateInput));
            let $dp = $date.data('DateTimePicker');
            $dp.clear();
            if(utcDate) {
                let tzOffset = moment().utcOffset();
                $dp.date(moment(utcDate).minute(tzOffset));
            }
            this.dpCanChange = true;
            this.setState({needInitDate: false});
        }
    }

    componentWillUnmount() {
        let $date = $(ReactDOM.findDOMNode(this.dateInput));
        $date.data('DateTimePicker').destroy();
        $date.off('dp.change');
    }

    initDate() {
        const {data, editSessId} = this.props.session;
        const {utcDate} = data.filter(s => s.id == editSessId)[0];
        const {onFieldChange} = this.props;
        let $date = $(ReactDOM.findDOMNode(this.dateInput));
        let tzOffset = moment().utcOffset();
        $date.datetimepicker({
            useCurrent: false,
            format: '(dddd) D MMMM, YYYY',
            date: utcDate ? moment(utcDate).minute(tzOffset) : null,
            widgetPositioning: {
                horizontal: 'left',
                vertical: 'bottom',
            }
        });
        $date.on('dp.change', e => {
            if(this.dpCanChange) {
                let date = e.date;
                if(date) {
                    let m = moment(date);
                    m.hour(0).minute(0).second(0).millisecond(0);
                    this.handleFieldChange('utcDate', m.toISOString());
                } else {
                    this.handleFieldChange('utcDate', null);
                }
            }
        });
    }

    validateField(key) {
        const oldErrs = this.state.errors ||  {};
        let newErrs = validateForm($('#sa-details').get(0));
        if(newErrs) {
            if(newErrs[key]) {
                oldErrs[key] = newErrs[key];
                let $input = $('#sa-details').find(`[name=${key}]`);
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
        let errors = validateForm($('#sa-details').get(0));
        this.setState({errors});
        return !errors;
    }

    onDelete(e) {
        e.preventDefault();
        const {editSessId} = this.props.session;
        const {popPanel, handleDelete, getAlertify} = this.props;
        const alertify = getAlertify();
        alertify.confirm({
            okLabel: 'CONFIRM',
            cancelLabel: 'CANCEL',
            iconClass: 'fa-exclamation-triangle danger',
            confirmAction: () => {
                popPanel();
                handleDelete(editSessId);
            },
            title: 'DELETE SESSION',
            subTitle: 'This action cannot be undone.',
        });
    }

    onAutofill(e) {
        e.preventDefault();
        if(this.props.isReadOnly()) return;

        const {editSessId} = this.props.session;
        const {autofillUtcDate} = this.props;
        let $date = $(ReactDOM.findDOMNode(this.dateInput));
        let $dp = $date.data('DateTimePicker');
        let tzOffset = moment().utcOffset();
        let date = $dp.date();
        if(!date) {
            let now = moment();
            now.hour(0).minute(0).second(0).millisecond(0);
            $dp.date(now);
            date = $dp.date();
        }
        autofillUtcDate(editSessId, date);
        alertify.theme('bootstrap').success('Dates filled in subsequent sessions');
    }

    onDone(e) {
        e.preventDefault();
        const {popPanel} = this.props;
        popPanel();
    }

    handleFieldChange(name, value) {
        const {onFieldChange, isReadOnly} = this.props;
        if(!isReadOnly()) this.validateField(name);
        onFieldChange(name, value);
    }

    renderDelete() {
        const {data} = this.props.session;
        let disabled = data.filter(d => d.stage == StageType.IN).length <= 1 ? true : false;
        return (
            <div className="row">
                <div className="col-md-12">
                    <button type="button" className="btn btn-sm btn-danger pull-right" onClick={this.onDelete} disabled={disabled}>Delete</button>
                </div>
            </div>
        );
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
        const {data, editSessId} = this.props.session;
        const {isReadOnly} = this.props;
        let sess = data.filter(s => s.id == editSessId);
        const {topic, objective, date} = sess.length > 0 ? sess[0] : {topic: '', objective: '', date: null};
        const {errors} = this.state;
        return (
            <form className="sa-details settings form-horizontal" id="sa-details" autoComplete="off" onSubmit={e => e.preventDefault()}>
                {this.renderField(
                    'topic',
                    <label htmlFor="sa-details-topic" className="col-sm-3 col-md-2 control-label-sm">Topic</label>,
                    <div className="col-sm-9 col-md-9">
                        <input className="form-control input-sm" id="sa-title" type="text" name="topic" value={topic} placeholder="Topic" maxLength="255" onChange={e => this.handleFieldChange(e.target.name, e.target.value)}/>
                    </div>,
                    errors
                )}

                {this.renderField(
                    'objective',
                    <label htmlFor="sa-details-objective" className="col-sm-3 col-md-2 control-label-sm">Objective</label>,
                    <div className="col-sm-9 col-md-9">
                        <textarea className="form-control input-sm" name="objective" value={objective} placeholder="Objective" onChange={e => this.handleFieldChange(e.target.name, e.target.value)}/>
                    </div>,
                    errors
                )}

                {this.renderField(
                    'utcDate',
                    <label htmlFor="sa-details-date" className="col-sm-3 col-md-2 control-label-sm">Date</label>,
                    <div className="col-sm-4 col-md-4">
                        <div ref={date => this.dateInput = date} className="input-group input-group-sm date">
                            <input className="form-control input-sm" type="text" name="utcDate" placeholder="Pick a Date" readOnly={isReadOnly()} disabled={isReadOnly()}/>
                            <span className="input-group-addon">
                                <span className="glyphicon glyphicon-calendar"></span>
                            </span>
                            <span className="input-group-btn">
                                <button type="button" className="btn btn-default btn-sm dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                    <span className="caret"></span>
                                </button>
                                <ul className="dropdown-menu dropdown-menu-right">
                                    <li><a href="#" onClick={this.onAutofill}>Continuity date filling</a></li>
                                </ul>
                            </span>
                        </div>
                    </div>,
                    errors
                )}

                <div className="col-sm-offset-3 col-md-offset-2">
                    <button type="button" className="btn btn-sm btn-primary" onClick={this.onDone}>Done</button>
                </div>
            </form>
        );
    }

    render() {
        return (
            <div className="sa">
                {this.renderDelete()}
                {this.renderEditForm()}
            </div>
        );
    }
}

const mapStateToProps = state => ({
    session: Config.get(state, StateName.LEARNING_SESSION),
});

const mapDispatchToProps = dispatch => ({
    handleDelete: sessId => dispatch(removeSession(sessId)),
    onFieldChange: (name, value) => dispatch(fieldChange({[name]: value})),
    autofillUtcDate: (sessId, utcDate) => dispatch(autofillUtcDate(sessId, utcDate)),
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(EditPanel);
