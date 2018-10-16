import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import {withRouter} from 'react-router-dom';

export default class Invitation extends Component {

    static getDerivedStateFromProps(nextProps, prevState) {
        if(prevState.succeedNum != nextProps.succeedNum){
            return {
                succeedNum: nextProps.succeedNum,
                succeedLoad: true,
            }
        }
        if(prevState.failedNum != nextProps.failedNum){
            return {
                failedNum: nextProps.failedNum,
                failedLoad: true,
            }
        }
        return null;
    }

    constructor(props, context) {
        super(props, context);
        this.onAccept = this.onAccept.bind(this);
        this.onReject = this.onReject.bind(this);
        this.answeredAccept = false;
        this.state = {
            succeedNum: 0,
            failedNum: 0,
            succeedLoad: false,
            failedLoad: false,
        }
    }

    componentDidUpdate() {
        const {succeedLoad, failedLoad} = this.state;
        if(succeedLoad) {
            if(this.answeredAccept) {
                this.answeredAccept = false;
                const {groupId} = this.props.data;
                const history = this.props.getHistory();
                history.push(`/group/preview/${groupId}`);
            }
        }
        if(succeedLoad || failedLoad) {
            const {dismiss} = this.props;
            setTimeout(() => dismiss());
            this.setState({
                succeedLoad: false,
                failedLoad: false,
            });
        }
    }

    onAccept(e) {
        e.preventDefault();
        this.answeredAccept = true;
        const {groupId, memberId} = this.props.data;
        const {joinGroup} = this.props;
        joinGroup(groupId, memberId, true);
    }

    onReject(e) {
        e.preventDefault();
        const {groupId, memberId} = this.props.data;
        const {joinGroup} = this.props;
        joinGroup(groupId, memberId, false);
    }

    render() {
        const {from, groupName} = this.props.data;
        return (
            <div>
                <div className="row">
                    <div className="col-xs-12">
                        <p>
                            <strong>{from}</strong>
                            {' would like to invite you to join '}
                            <strong>{groupName}</strong>
                            {' group.'}
                        </p>
                    </div>
                </div>
                <div className="row">
                    <div className="col-xs-12">
                        <div className="btn-toolbar pull-right">
                            <div className="btn-group">
                                <button className="btn btn-sm btn-default" onClick={this.onReject}>Deny</button>
                            </div>
                            <div className="btn-group">
                                <button className="btn btn-sm btn-primary" onClick={this.onAccept}>Accept</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
