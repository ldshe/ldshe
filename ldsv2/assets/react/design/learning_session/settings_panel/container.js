import classnames from 'classnames';
import React from 'react';
import {connect} from 'react-redux';
import {Config} from 'js/util';
import EditContext from 'react/app/design/context/edit';
import {fileupload} from 'react/app/design/actions';
import {StateName as PanelStateName} from 'react/design/learning_unit/design_panel/types';
import UnitContext from 'react/design/learning_unit/design_panel/context';
import Settings from 'react/design/learning_unit/design_panel/components/activity_settings/settings';
import BasePanel, {baseContext} from 'react/design/learning_unit/design_panel/containers/base';
import {
    loadUserPattern, activityFieldChange, unloadUserPattern,
    resetAdditionalSettingsPanel, freshAdditionalSettingsPanel, pushAdditionalSettingsPanel, popAdditionalSettingsPanel, jumpToAdditionalSettingsPanel,
    addAdditionalSettings, removeAdditionalSettings, removeAllAdditionalSettings, moveAdditionalSettings, updateAdditionalSettings,
} from './actions';

class SettingsPanel extends BasePanel {

    constructor(props, context) {
        super(props, context);
        this.onDone = this.onDone.bind(this);
        this.renderEditForm = this.renderEditForm.bind(this);
        this.editUnitId = null;
    }

    componentDidMount() {
        const {unitId} = this.props;
        const {editUnitId} = this.props.patternInstance;
        const {loadUserPattern} = this.props;
        this.editUnitId = editUnitId;
        loadUserPattern(unitId);
        $(window).scrollTop(0);
    }

    componentDidUpdate() {
        const {nodeId, patternInstance} = this.props;
        const {popPanel} = this.props;

        const {editRoot} = patternInstance;
        if(!editRoot || !editRoot.first(n => n.model.id == nodeId))
            popPanel();
    }

    componentWillUnmount() {
        super.componentWillUnmount();
        const {editUnitId} = this.props.patternInstance;
        const {unloadUserPattern} = this.props;
        if(this.editUnitId)
            unloadUserPattern(this.editUnitId);
    }

    onDone(e) {
        e.preventDefault();
        const {popPanel} = this.props;
        popPanel();
    }

    renderEditForm(editCtx) {
        const {nodeId, patternInstance} = this.props;
        const {editRoot, additional, fileState} = patternInstance;
        if(editRoot) {
            const node = editRoot.first(n => n.model.id == nodeId);
            const {
                activityFieldChange,
                resetAdditionalSettingsPanel, freshAdditionalSettingsPanel, pushAdditionalSettingsPanel, popAdditionalSettingsPanel, jumpToAdditionalSettingsPanel,
                addAdditionalSettings, removeAdditionalSettings, removeAllAdditionalSettings, moveAdditionalSettings, updateAdditionalSettings,
                uploadFile,
            } = this.props;
            const props = Object.assign({}, editCtx, {
                node,
                filterByFields: [
                    'duration',
                    'setting',
                    'resources',
                    'tools',
                    'note',
                ],
                additional,
                fileState,
                activityFieldChange,
                resetAdditionalSettingsPanel,
                freshAdditionalSettingsPanel,
                pushAdditionalSettingsPanel,
                popAdditionalSettingsPanel,
                jumpToAdditionalSettingsPanel,
                addAdditionalSettings,
                removeAdditionalSettings,
                removeAllAdditionalSettings,
                moveAdditionalSettings,
                updateAdditionalSettings,
                uploadFile,
            });
            return <Settings {...props}/>;
        } else {
            return null;
        }
    }

    render() {
        return (
            <div className="sa">
                <UnitContext.Provider value={baseContext}>
                    <EditContext.Consumer>{editCtx => this.renderEditForm(editCtx)}</EditContext.Consumer>
                </UnitContext.Provider>
                <div className="col-md-offset-2">
                    <button type="button" className="btn btn-sm btn-primary" onClick={this.onDone}>Done</button>
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => ({
    patternInstance: Config.get(state, PanelStateName.LEARNING_UNIT_PATTERN_INSTANCE),
});

const mapDispatchToProps = dispatch => ({
    loadUserPattern: id => dispatch(loadUserPattern(id)),
    activityFieldChange: (id, name, value) => dispatch(activityFieldChange(id, name, value)),
    resetAdditionalSettingsPanel: () => dispatch(resetAdditionalSettingsPanel()),
    freshAdditionalSettingsPanel: (panel, opts) => dispatch(freshAdditionalSettingsPanel(panel, opts)),
    pushAdditionalSettingsPanel: (panel, opts) => dispatch(pushAdditionalSettingsPanel(panel, opts)),
    popAdditionalSettingsPanel: (...args) => dispatch(popAdditionalSettingsPanel(...args)),
    jumpToAdditionalSettingsPanel: panel => dispatch(jumpToAdditionalSettingsPanel(panel)),
    addAdditionalSettings: (nodeArgs, itemArgs) => dispatch(addAdditionalSettings(nodeArgs, itemArgs)),
    removeAdditionalSettings: (nodeArgs, itemArgs) => dispatch(removeAdditionalSettings(nodeArgs, itemArgs)),
    removeAllAdditionalSettings: nodeArgs => dispatch(removeAllAdditionalSettings(nodeArgs)),
    moveAdditionalSettings: (nodeArgs, itemArgs) => dispatch(moveAdditionalSettings(nodeArgs, itemArgs)),
    updateAdditionalSettings: (nodeArgs, itemArgs) => dispatch(updateAdditionalSettings(nodeArgs, itemArgs)),
    unloadUserPattern: id => dispatch(unloadUserPattern(id)),
    uploadFile: file => dispatch(fileupload(file)),
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(SettingsPanel);
