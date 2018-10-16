import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Config} from 'js/util';
import StackedPanel from 'react/components/stacked_panel';
import GroupItem from '../group_item/container';
import MemberList from '../member_list/container';
import {StateName, Panel, PanelType} from './types';
import {pushPanel, popPanel, jumpToPanel, reset} from './actions';

class GroupPanel extends Component {

    constructor(props, context) {
        super(props, context);
        this.renderContent = this.renderContent.bind(this);
    }

    componentDidMount() {
        $(window).scrollTop(0);
    }

    componentDidUpdate() {
        $(window).scrollTop(0);
    }

    componentWillUnmount() {
        const {reset} = this.props;
        reset();
    }

    renderContent() {
        const {currPanel} = this.props.panel;
        if(!currPanel) return null;
        const {pushPanel, popPanel} = this.props;
        let props = {
            initProps: currPanel.opts,
            pushPanel,
            popPanel,
        }
        switch(currPanel.panel) {
            case Panel.GROUP_MANAGEMENT: {
                let {groupId} = currPanel.opts;
                props.isEditable = true;
                return <GroupItem {...props}/>;
            }
            case Panel.MEMBERS_MANAGEMENT: {
                let {groupId} = currPanel.opts;
                props.isEditable = true;
                return <MemberList {...props}/>;
            }
            case Panel.MY_GROUP: {
                return <GroupItem {...props}/>;
            }
        }
    }

    render() {
        const {currPanel, panels} = this.props.panel;
        const {jumpToPanel} = this.props;
        let props = {
            className: 'ug',
            currPanel,
            panels,
            panelType: PanelType,
            jumpToPanel,
        }
        return (
            <StackedPanel {...props}>
                {this.renderContent()}
            </StackedPanel>
        );
    }
};

const mapStateToProps = state => ({
    panel: Config.get(state, StateName.PANEL),
});

const mapDispatchToProps = dispatch => ({
    freshPanel: (p, opts) => dispatch(freshPanel(p, opts)),
    pushPanel: (p, opts) => dispatch(pushPanel(p, opts)),
    popPanel: () => dispatch(popPanel()),
    jumpToPanel: p => dispatch(jumpToPanel(p)),
    reset: () => dispatch(reset()),
});

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(GroupPanel);
