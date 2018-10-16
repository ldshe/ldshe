import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import AppContext from 'react/app/design/context/app';
import {MessageType} from '../types';
import GroupInvitation from './group_invitation';

export default class Popup extends Component {

    constructor(props, context) {
        super(props, context);
        this.show = this.show.bind(this);
        this.hide = this.hide.bind(this);
        this.dismiss = this.dismiss.bind(this);
        this.onClose = this.onClose.bind(this);
        this.renderContent = this.renderContent.bind(this);
        this.renderPopup = this.renderPopup.bind(this);
        this.state = {
            msg: null,
        };
        this.noteId = null;
    }

    componentWillUnmount() {
        this.hide();
    }

    show(id) {
        this.noteId = id;
        let $modal = $(ReactDOM.findDOMNode(this.modal));
        $modal.modal('show');

        const {data} = this.props.list;
        let msg = data.filter(d => d.id == id)[0];
        this.setState({msg});
    }

    hide() {
        let $modal = $(ReactDOM.findDOMNode(this.modal));
        $modal.modal('hide');
    }

    dismiss() {
        const {dismiss} = this.props;
        dismiss(this.noteId);
        this.hide();
    }

    onClose(e) {
        e.preventDefault();
        this.dismiss();
    }

    renderContent({getHistory}) {
        const {msg} = this.state;
        const {data} = msg;
        const {succeedNum, failedNum} = this.props.list;
        let props = {
            data,
            succeedNum,
            failedNum,
            dismiss: this.dismiss,
            getHistory,
        };
        switch(msg.type) {
            case MessageType.GROUP_INVITATION: {
                const {joinGroup} = this.props;
                props = Object.assign({}, props, {
                    joinGroup,
                });
                return <GroupInvitation {...props} />;
            }
        }
    }

    renderPopup() {
        const {msg} = this.state;
        let title = msg ? msg.data.title : '';
        return (
            <div ref={modal => this.modal = modal} className="modal fade settings" tabIndex="-1" role="dialog" aria-labelledby="notification-modal">
                <div className="modal-dialog modal-sm" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <a href="#" onClick={this.onClose}><span className="pull-right" title="Dismiss"><i className="fa fa-close"/></span></a>
                            <h4 className="modal-title" id="notification-modal">{title}</h4>
                        </div>
                        <div className="modal-body">
                            <AppContext>
                                {appCtx => <div>{msg ? this.renderContent(appCtx) : null}</div>}
                            </AppContext>
                        </div>
                        <div className="modal-footer"/>
                    </div>
                </div>
            </div>
        );
    }

    render() {
        return this.renderPopup();
    }
}
