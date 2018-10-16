import classnames from 'classnames';
import React, {Component} from 'react';
import {Redirect} from 'react-router-dom';
import {ListType as DesignListType} from 'react/design/design_list/types';
import DesignList from 'react/design/design_list';
import {ListType as PatternListType} from 'react/design/pattern_list/types';
import PatternList from 'react/design/pattern_list';
import MemberList from '../../member_list/container';

export default class Preview extends Component {

    static getDerivedStateFromProps(nextProps, prevState) {
        if(prevState.groupId != nextProps.groupId) {
            return {
                activeTab: 'member',
                groupId: nextProps.groupId,
            };
        }
        if(nextProps.item.leftNum > prevState.leftNum) {
            return {
                isLeft: true,
                leftNum: nextProps.item.leftNum,
            };
        }
        return null;
    }

    constructor(props, context) {
        super(props, context);
        this.onChangeTab = this.onChangeTab.bind(this);
        this.onLeave = this.onLeave.bind(this);
        this.renderDescription = this.renderDescription.bind(this);
        this.renderTabControl = this.renderTabControl.bind(this);
        this.renderContent = this.renderContent.bind(this);
        this.state = {
            activeTab: 'member',
            isLeft: false,
            groupId: props.groupId,
            leftNum: props.item.leftNum,
        };
    }

    onChangeTab(e, activeTab) {
        e.preventDefault();
        this.setState({activeTab});
    }

    onLeave(e) {
        e.preventDefault();
        const {group} = this.props;
        const {handleLeave, getAlertify} = this.props;
        const alertify = getAlertify();
        alertify.confirm({
            okLabel: 'CONFIRM',
            cancelLabel: 'CANCEL',
            iconClass: 'fa-exclamation-triangle danger',
            confirmAction: () => handleLeave(),
            title: 'LEAVE GROUP',
            subTitle: 'This action cannot be undone.',
        });
    }

    renderDescription() {
        const {description} = this.props.item.data;
        return (
            <div className="row">
                <div className="col-md-6">{description}</div>
            </div>
        );
    }

    renderTabControl() {
        const {activeTab} = this.state;
        const {data} = this.props.item;
        let memberCls = classnames({'active': activeTab == 'member'});
        let designCls = classnames({'active': activeTab == 'design'});
        let patternCls = classnames({'active': activeTab == 'pattern'});
        return (
            <div>
                {data ? (data.isOwner ? null : <button className="btn btn-danger btn-sm pull-right" onClick={this.onLeave}><i className="fa fa-sign-out"/> Leave Group</button>) : null}
                <ul className="nav nav-tabs">
                    <li className={memberCls}>
                        <a href="#" onClick={e => this.onChangeTab(e, 'member')}>Members</a>
                    </li>
                    <li className={designCls}>
                        <a href="#" onClick={e => this.onChangeTab(e, 'design')}>Shared Designs</a>
                    </li>
                    <li className={patternCls}>
                        <a href="#" onClick={e => this.onChangeTab(e, 'pattern')}>Shared Patterns</a>
                    </li>
                </ul>
                <div className="tab-content">
                    <div role="tabpanel" className="tab-pane active">{this.renderContent()}</div>
                </div>
            </div>
        );

    }

    renderContent() {
        const {activeTab} = this.state;
        const {groupId} = this.props;
        switch(activeTab){
            case 'member': {
                let props = {
                    initProps: {groupId},
                };
                return <MemberList {...props}/>;
            }
            case 'design': {
                let props = {
                    initListType: DesignListType.GROUP,
                };
                return <DesignList {...props}/>;
            }
            case 'pattern': {
                let props = {
                    initListType: PatternListType.GROUP,
                };
                return <PatternList {...props}/>;
            }
            default:
                return null;
        }
    }

    render() {
        const {isLeft} = this.state;
        if(isLeft) {
            return <Redirect to="/group"/>;
        } else {
            return (
                <div>
                    {this.renderDescription()}
                    <hr/>
                    {this.renderTabControl()}
                </div>
            );
        }
    }
}
