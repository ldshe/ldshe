import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Config} from 'js/util';
import AppContext from 'react/app/design/context/app';
import EditContext from 'react/app/design/context/edit';
import StackedPanel from 'react/components/stacked_panel';
import {StateName as WizardStateName} from '../design_wizard/types';
import {AllocationPanel, EditPanel, SettingsPanel} from 'react/design/learning_session';
import {rememberScroll} from 'react/design/learning_session/allocation_panel/actions';
import {StateName as SessionStateName, Panel, PanelType} from './types';
import {freshPanel, pushPanel, popPanel, jumpToPanel} from './actions';

class SessionStep extends Component {

    constructor(props, context) {
        super(props, context);
        this.renderContent = this.renderContent.bind(this);
    }

    componentDidMount() {
        $(window).scrollTop(0);
    }

    componentWillUnmount() {
        const {freshPanel, resetScroll} = this.props;
        freshPanel(Panel.SESSION);
        resetScroll();
    }

    renderContent(ctx) {
        const {currPanel} = this.props.session;
        const {pushPanel, popPanel} = this.props;
        let props = Object.assign({}, currPanel.opts, ctx);
        props = Object.assign({}, props, {
            pushPanel,
            popPanel,
        });
        switch(currPanel.panel) {
            case Panel.SESSION:
                return <AllocationPanel {...props}/>;
            case Panel.SESSION_DETAILS:
                return <EditPanel {...props}/>;
            case Panel.SESSION_SETTINGS:
                return <SettingsPanel {...props}/>;
        }
    }

    render() {
        const {panels, currPanel} = this.props.session;
        const {jumpToPanel} = this.props;
        let props = {
            className: 'ss',
            panels,
            panelType: PanelType,
            currPanel,
            jumpToPanel,
        }
        return (
            <StackedPanel {...props}>
                <AppContext.Consumer>{
                    appCtx => (
                        <EditContext.Consumer>{
                            editCtx => {
                                let ctx = Object.assign({}, appCtx, editCtx);
                                return this.renderContent(ctx);
                            }
                        }</EditContext.Consumer>
                    )
                }</AppContext.Consumer>
            </StackedPanel>
        );
    }
};

const mapStateToProps = state => ({
    step: Config.get(state, WizardStateName.DESIGN_STEP),
    session: Config.get(state, SessionStateName.SESSION_STEP),
});

const mapDispatchToProps = dispatch => ({
    freshPanel: (p, opts) => dispatch(freshPanel(p, opts)),
    pushPanel: (p, opts) => dispatch(pushPanel(p, opts)),
    popPanel: () => dispatch(popPanel()),
    jumpToPanel: p => dispatch(jumpToPanel(p)),
    resetScroll: () => setTimeout(() => dispatch(rememberScroll({scrollTop: 0, scrollInnerLeft: 0, scrollInnerTop: 0})), 0),
});

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(SessionStep);
