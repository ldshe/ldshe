import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Config} from 'js/util';
import AppContext from 'react/app/design/context/app';
import EditContext from 'react/app/design/context/edit';
import StackedPanel from 'react/components/stacked_panel';
import {StateName as WizardStateName} from '../design_wizard/types';
import {DesignGrid, DesignUnit, DesignPattern} from '../learning_unit';
import {StateName as UnitStepStateName, Panel, PanelType} from './types';
import {freshPanel, pushPanel, popPanel, jumpToPanel} from './actions';

class UnitStep extends Component {

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

    renderContent({getHistory, isReadOnly, getAlertify}) {
        const {currPanel} = this.props.unit;
        const {pushPanel, popPanel} = this.props;
        let props = {
            initProps: currPanel.opts,
            pushPanel,
            popPanel,
            getHistory,
            isReadOnly,
            getAlertify,
        }
        switch(currPanel.panel) {
            case Panel.DESIGN_GRID:
                return <DesignGrid {...props}/>;
            case Panel.DESIGN_UNIT:
                return <DesignUnit {...props}/>;
            case Panel.DESIGN_PATTERN:
                return <DesignPattern {...props}/>;
        }
    }

    render() {
        const {panels} = this.props.unit;
        const {jumpToPanel} = this.props;
        let props = {
            className: 'us',
            panels,
            panelType: PanelType,
            jumpToPanel,
        }
        return (
            <StackedPanel {...props}>
                <AppContext.Consumer>{
                    appCtx => (
                        <EditContext.Consumer>
                            {editCtx => this.renderContent(Object.assign({}, appCtx, editCtx))}
                        </EditContext.Consumer>
                    )
                }</AppContext.Consumer>
            </StackedPanel>
        );
    }
};

const mapStateToProps = state => ({
    step: Config.get(state, WizardStateName.DESIGN_STEP),
    unit: Config.get(state, UnitStepStateName.UNIT_STEP),
});

const mapDispatchToProps = dispatch => ({
    freshPanel: (p, opts) => dispatch(freshPanel(p, opts)),
    pushPanel: (p, opts) => dispatch(pushPanel(p, opts)),
    popPanel: () => dispatch(popPanel()),
    jumpToPanel: p => dispatch(jumpToPanel(p)),
});

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(UnitStep);
