import 'selectize';
import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import 'bootstrap-toggle';
import Clipboard from 'clipboard';
import moment from 'moment';
import {isEmail} from 'js/util';
import {ContributionRequest} from 'react/design/design_list/types';
import {ShareMode, Permission} from '../types';

export default class Settings extends Component {

    static getDerivedStateFromProps(nextProps, prevState) {
        const {configLoadedNum, groupLoadedNum, groups} = nextProps.list;
        if(prevState.isLoading && prevState.configLoadedNum != configLoadedNum) {
            return {
                isLoading: false,
                configLoadedNum,
            };
        }
        if(prevState.groupLoadedNum != groupLoadedNum) {
            return {
                updGroupSelect: groups.length > 0,
                groupLoadedNum,
            };
        }
        return null;
    }

    constructor(props, context) {
        super(props, context);
        this.setShareToggle = this.setShareToggle.bind(this);
        this.hide = this.hide.bind(this);
        this.show = this.show.bind(this);
        this.onShareAllImportChange = this.onShareAllImportChange.bind(this);
        this.onShareSelectedUserAdd = this.onShareSelectedUserAdd.bind(this);
        this.onShareSelectedGroupAdd = this.onShareSelectedGroupAdd.bind(this);
        this.onShareSelectedChange = this.onShareSelectedChange.bind(this);
        this.onShareSelectedRemove = this.onShareSelectedRemove.bind(this);
        this.onMakeContribution = this.onMakeContribution.bind(this);
        this.handleConfigure = this.handleConfigure.bind(this);
        this.renderStatus = this.renderStatus.bind(this);
        this.renderSharedLink = this.renderSharedLink.bind(this);
        this.renderContribution = this.renderContribution.bind(this);
        this.renderShareAll = this.renderShareAll.bind(this);
        this.renderShareSelectedUsers = this.renderShareSelectedUsers.bind(this);
        this.renderShareSelectedGroups = this.renderShareSelectedGroups.bind(this);
        this.renderLoading = this.renderLoading.bind(this);
        this.renderSettings = this.renderSettings.bind(this);
        this.state = {
            isLoading: false,
            configLoadedNum: props.list.configLoadedNum,
            groupLoadedNum: props.list.groupLoadedNum,
            updGroupSelect: false,
        };
        this.displayContribution = props.displayContribution || false;
        this.displayShareAll = props.displayShareAll || false;
        this.displayShareSelected = props.displayShareSelected || false;
        this.shareChange = true;
        this.clipboard = null;
    }

    componentDidMount() {
        const {refreshList} = this.props;
        let $modal = $(ReactDOM.findDOMNode(this.modal));
        $modal.on('hidden.bs.modal', e => {
            refreshList();
            this.hide();
        });
    }

    getSnapshotBeforeUpdate(prevProps, prevState) {
        let setShareToggle = false;
        if(this.displayShareAll && prevProps.list.configLoadedNum != this.props.list.configLoadedNum) setShareToggle = true;
        return {setShareToggle};
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const {updGroupSelect} = this.state;
        if(updGroupSelect) {
            setTimeout(() => {
            let $selectize = $('#share-group-select').selectize({
                placeholder: 'Select a user group',
                sortField: 'text',
            });
            $selectize[0].selectize.setValue('', true);
            }, 0);
            this.setState({updGroupSelect: false});
        }
        if(snapshot && snapshot.setShareToggle) {
            const {editId} = this.props.list;
            const {configure} = this.props;
            let $share = $(ReactDOM.findDOMNode(this.shareToggle));
            $share.unbind('change');
            $share.bootstrapToggle('off');
            this.setShareToggle();
            $share.bind('change', e => {
                if(this.shareChange) {
                    let perms = {enabled: $(e.target).prop('checked'), mode: ShareMode.ALL, read: true};
                    configure(editId, {share: perms});
                }
            });
        }
    }

    componentWillUnmount() {
        const {resetSettings} = this.props;
        resetSettings();

        let $modal = $(ReactDOM.findDOMNode(this.modal));
        $modal.off('hidden.bs.modal');
        $modal.modal('hide');
        this.hide();
    }

    setShareToggle() {
        const {acls} = this.props.list;

        let mode = acls.filter(l => l.mode == ShareMode.ALL);
        if(mode.length == 0) return;
        mode = mode[0];

        let $share = $(ReactDOM.findDOMNode(this.shareToggle));
        if($share.prop('checked') && !mode.read) {
            this.shareChange = false;
            $share.bootstrapToggle('off');
            this.shareChange = true;
            return;
        }

        if(!$share.prop('checked') && mode.read) {
            this.shareChange = false;
            $share.bootstrapToggle('on');
            this.shareChange = true;
            return;
        }
    }

    hide() {
        const {resetSettings} = this.props;
        resetSettings();

        if(this.displayShareAll) {
            let $share = $(ReactDOM.findDOMNode(this.shareToggle));
            $share.unbind('change');
            $share.bootstrapToggle('destroy');
        }

        if(this.clipboard) {
            this.clipboard.off('success');
            this.clipboard.destroy();
            this.clipboard = null;
        }
    }

    show() {
        const {editId} = this.props.list;
        const {loadConfig, loadGroup} = this.props;

        let $modal = $(ReactDOM.findDOMNode(this.modal));
        $modal.modal('show');

        loadConfig(editId);
        this.setState({isLoading: true});

        setTimeout(() => {
            if(this.displayShareSelected) loadGroup();
            
            if(this.copyBtn) {
                let $copyBtn = $(ReactDOM.findDOMNode(this.copyBtn));
                $copyBtn.tooltip({
                    trigger: 'manual',
                });
                this.clipboard = new Clipboard(this.copyBtn, {
                     container: ReactDOM.findDOMNode(this.modal)
                });
                this.clipboard.on('success', e => {
                    $copyBtn.tooltip('show');
                    setTimeout(() => $copyBtn.tooltip('hide'), 1000);
                });
            }
        }, 300);
    }

    onShareAllImportChange(e) {
        e.preventDefault();
        let perms = {enabled: true, mode: ShareMode.ALL, read: true};
        perms.import = $(e.target).prop('checked');
        this.handleConfigure(perms);
    }

    onShareSelectedUserAdd(e) {
        e.preventDefault();
        let perms = {enabled: true, mode: ShareMode.USER, read: true};

        if($('#share-user-perms').val() == Permission.IMPORT) {
            perms['import'] = true;
        }

        if($('#share-user-perms').val() == Permission.EDIT) {
            perms['import'] = true;
            perms['edit'] = true;
        }

        let userKey = $('#share-user-input').val().trim();
        if(isEmail(userKey)) perms['email'] = userKey;
        else perms['username'] = userKey;

        this.handleConfigure(perms);
        $('#share-user-input').val('');
    }

    onShareSelectedGroupAdd(e) {
        e.preventDefault();
        let perms = {enabled: true, mode: ShareMode.GROUP, read: true};

        if($('#share-group-perms').val() == Permission.IMPORT) {
            perms['import'] = true;
        }

        if($('#share-group-perms').val() == Permission.EDIT) {
            perms['import'] = true;
            perms['edit'] = true;
        }

        let $selectize = $('#share-group-select').selectize();
        let groupId = $selectize[0].selectize.getValue();
        perms['groupId'] = groupId;

        this.handleConfigure(perms);
        $selectize[0].selectize.setValue('', true);
    }

    onShareSelectedChange(e, mode, perms) {
        e.preventDefault();
        perms = Object.assign({}, perms, {enabled: true, mode, read: true});

        if($(e.target).val() == Permission.IMPORT) {
            perms['import'] = true;
        }

        if($(e.target).val() == Permission.EDIT) {
            perms['import'] = true;
            perms['edit'] = true;
        }

        this.handleConfigure(perms);
    }

    onShareSelectedRemove(e, mode, perms) {
        e.preventDefault();
        const {getAlertify} = this.props;
        const alertify = getAlertify();
        alertify.confirm({
            okLabel: 'CONFIRM',
            cancelLabel: 'CANCEL',
            iconClass: 'fa-exclamation-triangle danger',
            confirmAction: () => {
                perms = Object.assign({}, perms, {enabled: false, mode});
                this.handleConfigure(perms);
            },
            title: 'REMOVE PERMISSION',
            subTitle: 'This action cannot be undone.',
        });
    }

    onMakeContribution(e) {
        e.preventDefault();
        const {editId} = this.props.list;
        const {contribute} = this.props;
        contribute(editId);
    }

    handleConfigure(perms) {
        const {editId} = this.props.list;
        const {configure} = this.props;
        configure(editId, {share: perms});
    }

    renderStatus() {
        const {contribution} = this.props.list;
        if(!contribution) return null;

        const status = contribution.status;
        if(status == ContributionRequest.APPROVED && !contribution.publicSharedId) return null;

        let updatedAt = moment(contribution.updatedAt);
        updatedAt = updatedAt.format('D MMMM, YYYY');
        return (
            <div className="row">
                <div className="col-sm-offset-1 col-sm-11">
                    <h5>
                        {'Status: '}
                        {status == ContributionRequest.PENDING ?
                         <span className="label label-info">Pending</span> : status == ContributionRequest.APPROVED ?
                         <span className="label label-success">Approved</span> :
                         <span className="label label-danger">Denied</span>}
                         <small>{` (${updatedAt})`}</small>
                    </h5>
                </div>
            </div>
        );
    }

    renderSharedLink() {
        const {contribution} = this.props.list;
        const {buildSharedLink} = this.props;
        if(!contribution) return null;

        return (
            <div className="row">
                <div className="col-sm-offset-1 col-sm-11">
                    {contribution.publicSharedId ?
                    <div className="input-group input-group-sm">
                        <input className="form-control" placeholder="URL" readOnly={true} defaultValue={buildSharedLink(contribution.publicSharedId)} onClick={e => $(e.target).select()}/>
                        <span className="input-group-btn">
                            <button ref={btn => this.copyBtn = btn} className="btn btn-default" type="button" data-toggle="tooltip" data-placement="top" title="Copied!" data-clipboard-text={buildSharedLink(contribution.publicSharedId)}>
                                <i className="fa fa-copy"></i>
                            </button>
                        </span>
                    </div> :
                    null}
                </div>
            </div>
        );
    }

    renderContribution() {
        const {contributeTitle} = this.props;
        const {contribution} = this.props.list;
        const status = contribution ? contribution.status : null;
        let disableBtn = contribution != null && (status == ContributionRequest.PENDING || contribution.publicSharedId);
        return (
            <div className="col-md-12">
                <div className="row">
                    <div className="col-sm-8">
                        <strong>{contributeTitle}</strong>
                    </div>
                    <div className="col-sm-4 text-right">
                        <button className="btn btn-primary btn-sm" disabled={disableBtn} onClick={this.onMakeContribution}>Send Request</button>
                    </div>
                </div>
                {this.renderStatus()}
                {this.renderSharedLink()}
            </div>
        );
    }

    renderShareAll() {
        const {acls} = this.props.list;
        let share = acls.filter(l => l.mode == ShareMode.ALL);
        let shareEnabled = share.length > 0 && share[0].read;
        let importEnabled = shareEnabled && share[0].import;
        return (
            <div className="col-md-12">
                <div className="row">
                    <div className="col-sm-8">
                        <strong>Share to Public</strong>
                    </div>
                    <div className="col-sm-4 text-right">
                        <input ref={toggle => this.shareToggle = toggle}
                               type="checkbox"
                               data-toggle="toggle"
                               data-size="mini"/>
                    </div>
                </div>
                {shareEnabled ?
                <div className="row">
                    <div className="col-sm-offset-1 col-sm-11">
                        <div className="checkbox">
                            <label>
                                <input type="checkbox" value="import" checked={importEnabled} onChange={this.onShareAllImportChange}/>
                                Allow anyone to save a copy
                            </label>
                        </div>
                    </div>
                </div> :
                null}
            </div>
        );
    }

    renderShareSelectedUsers() {
        const {acls} = this.props.list;
        let shares = acls.filter(l => l.mode == ShareMode.USER)
            .sort((a, b) => a.fullname.toUpperCase() > b.fullname.toUpperCase());
        return(
            <div className="col-md-12">
                <div className="share-title row">
                    <div className="col-sm-8">
                        <strong>Share to selected users</strong>
                    </div>
                </div>
                <div className="row">
                    <div className="col-sm-offset-1 col-sm-11">
                        <div className="share-user input-group input-group-sm">
                            <input id="share-user-input" type="text" className="form-control" placeholder="Add selected by Username / Email"/>
                            <select id="share-user-perms" className="form-control">
                                <option value={Permission.READ}>View Only</option>
                                <option value={Permission.IMPORT}>Allow Copy</option>
                                <option value={Permission.EDIT}>Allow Edit</option>
                            </select>
                            <span className="input-group-btn">
                                <button className="btn btn-primary" onClick={this.onShareSelectedUserAdd}>
                                    <i className="fa fa-plus"></i> Share
                                </button>
                            </span>
                        </div>
                    </div>
                </div>
                {shares.length > 0 ?
                    shares.map(s => {
                        let user = `${s.fullname} <${s.email}>`;
                        let username = s.username;
                        let selVal = s.edit ? Permission.EDIT : (s.import ? Permission.IMPORT : Permission.READ);
                        return (
                            <div key={s.id} className="row">
                                <div className="col-sm-offset-1 col-sm-11">
                                    <div className="share-user input-group input-group-sm">
                                        <input type="text" className="form-control" placeholder="Username / Email" defaultValue={user} readOnly/>
                                        <select className="form-control" defaultValue={selVal} onChange={e => this.onShareSelectedChange(e, ShareMode.USER, {username})}>
                                            <option value={Permission.READ}>View Only</option>
                                            <option value={Permission.IMPORT}>Allow Copy</option>
                                            <option value={Permission.EDIT}>Allow Edit</option>
                                        </select>
                                        <span className="input-group-btn">
                                            <button className="btn btn-danger" onClick={e => this.onShareSelectedRemove(e, ShareMode.USER, {username})}>
                                                <i className="fa fa-trash"></i> Remove
                                            </button>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                : null}
            </div>
        );
    }

    renderShareSelectedGroups() {
        const {acls, groups} = this.props.list;
        let shares = acls.filter(l => l.mode == ShareMode.GROUP)
            .sort((a, b) => a.name.toUpperCase() > b.name.toUpperCase());
        let hasGroup = groups.length > 0;
        return(
            <div className="col-md-12">
                <div className="share-title row">
                    <div className="col-sm-8">
                        <strong>Share to selected user groups</strong>
                    </div>
                </div>
                <div className="row">
                    <div className="col-sm-offset-1 col-sm-11">
                        <div className="share-group input-group input-group-sm">
                            <select id="share-group-select" className="form-control group-select" disabled={!hasGroup} defaultValue="">
                                {!hasGroup ? <option value="" disabled={true}>No user group found</option> : null}
                                {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                            </select>
                            <select id="share-group-perms" className="form-control group-perms" disabled={!hasGroup}>
                                <option value={Permission.READ}>View Only</option>
                                <option value={Permission.IMPORT}>Allow Copy</option>
                                <option value={Permission.EDIT}>Allow Edit</option>
                            </select>
                            <span className="input-group-btn">
                                <button className="btn btn-primary" onClick={this.onShareSelectedGroupAdd} disabled={!hasGroup}>
                                    <i className="fa fa-plus"></i> Share
                                </button>
                            </span>
                        </div>
                    </div>
                </div>
                {shares.length > 0 ?
                    shares.map(s => {
                        const {name, groupId} = s;
                        let selVal = s.edit ? Permission.EDIT : (s.import ? Permission.IMPORT : Permission.READ);
                        return (
                            <div key={s.id} className="row">
                                <div className="col-sm-offset-1 col-sm-11">
                                    <div className="share-group input-group input-group-sm">
                                        <input type="text" className="form-control" placeholder="User group" defaultValue={name} readOnly/>
                                        <select className="form-control" defaultValue={selVal} onChange={e => this.onShareSelectedChange(e, ShareMode.GROUP, {groupId})}>
                                            <option value={Permission.READ}>View Only</option>
                                            <option value={Permission.IMPORT}>Allow Copy</option>
                                            <option value={Permission.EDIT}>Allow Edit</option>
                                        </select>
                                        <span className="input-group-btn">
                                            <button className="btn btn-danger" onClick={e => this.onShareSelectedRemove(e, ShareMode.GROUP, {groupId})}>
                                                <i className="fa fa-trash"></i> Remove
                                            </button>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                : null}
            </div>
        );
    }

    renderLoading() {
        return (
            <div className="loading">
                <i className="fa fa-spinner fa-spin fa-2x fa-fw"></i>
            </div>
        );
    }

    renderSettings() {
        const {isLoading} = this.state;
        const {title} = this.props;
        return (
            <div ref={modal => this.modal = modal} className="modal fade settings" tabIndex="-1" role="dialog" aria-labelledby="settings-modal">
                <div className="modal-dialog" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h4 className="modal-title" id="settings-modal">{title}</h4>
                        </div>
                        <div className="modal-body">{
                            isLoading ?
                            this.renderLoading() :
                            <div>
                                <div className="row contribution">
                                    {this.displayContribution ? this.renderContribution() : null}
                                </div>
                                {this.displayContribution && (this.displayShareAll || this.displayShareSelected) ? <hr/> : null}
                                <div className="row share">
                                    {this.displayShareAll ? this.renderShareAll() : null}
                                    {this.displayShareSelected ? this.renderShareSelectedUsers() : null}
                                    {this.displayShareSelected ? <div className="col-sm-12"><hr/></div> : null}
                                    {this.displayShareSelected ? this.renderShareSelectedGroups() : null}
                                </div>
                            </div>
                        }</div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-default" data-dismiss="modal">Close</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    render() {
        return this.renderSettings();
    }
}
