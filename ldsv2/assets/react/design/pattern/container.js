import classnames from 'classnames';
import React from 'react';
import ReactDOM from 'react-dom';
import {connect} from 'react-redux';
import {Config, caseInsensitiveSort} from 'js/util';
import {fileupload} from 'react/app/design/actions';
import TagsInput from 'react/components/tags_input';
import {createDroppableWorkspace} from 'react/design/learning_unit/design_panel/components/droppable_workspace';
import PanelLayout from 'react/design/learning_unit/design_panel/components/panel_layout';
import Graph from 'react/design/learning_unit/design_panel/components/graph';
import graphSettings from 'react/design/learning_unit/design_panel/graph_settings';
import {DragType, GraphType} from 'react/design/learning_unit/design_panel/types';
import UnitContext from 'react/design/learning_unit/design_panel/context';
import Base, {baseContext} from 'react/design/learning_unit/design_panel/containers/base';
import {
    loadUserPattern, changeName, changeTags, addPattern, deletePattern,
    updatePosition, updateConnection, changeLevel, selectChild, activityFieldChange,
    resetAdditionalSettingsPanel, freshAdditionalSettingsPanel, pushAdditionalSettingsPanel, popAdditionalSettingsPanel, jumpToAdditionalSettingsPanel,
    addAdditionalSettings, removeAdditionalSettings, removeAllAdditionalSettings, moveAdditionalSettings, updateAdditionalSettings,
} from './actions';
import {StateName} from './types';

const DroppableWorkspace = createDroppableWorkspace(DragType);

class Pattern extends Base {

    constructor(props, context) {
        super(props, context);
        this.onNameChange = this.onNameChange.bind(this);
        this.renderControlContent = this.renderControlContent.bind(this);
        this.renderDefaultOptions = super.renderDefaultOptions.bind(this);
        this.renderSidebarContent = this.renderSidebarContent.bind(this);
        this.renderWorkspaceContent = this.renderWorkspaceContent.bind(this);
        this.renderNavigationContent = this.renderNavigationContent.bind(this);
        this.renderPatternPreview = super.renderPatternPreview.bind(this);
        this.renderSettingsContent = this.renderSettingsContent.bind(this);
        this.renderActivitySettings = super.renderActivitySettings.bind(this);
        this.isNameUpdateRemined = false;
        this.docTitle = 'Learning Design Studio HE';
    }

    componentDidMount() {
        const {editPattId} = this.props.pattern;
        const {loadUserPattern} = this.props;
        loadUserPattern(editPattId);
        selectChild(null);
        setTimeout(() => {
            $('.pc .sidebar-content [data-toggle="tooltip"]').tooltip();
        }, 0);
    }

    componentDidUpdate() {
        const {editRoot} = this.props.pattern;
        document.title = editRoot ? `${editRoot.model.fullname} - ${this.docTitle}` : this.docTitle;

        let $input = $(ReactDOM.findDOMNode(this.input));
        if($input.attr('value') == 'New Pattern' && !this.isNameUpdateRemined) {
            this.isNameUpdateRemined = true;
            $input.select();
        }
    }

    componentWillUnmount() {
        super.componentWillUnmount();
        $('.pc .sidebar-content [data-toggle="tooltip"]').tooltip('destroy');
    }

    onNameChange(e) {
        e.preventDefault();
        const {handleNameChange} = this.props;
        handleNameChange(e.target.value);
    }

    renderControlContent() {
        const {editRoot} = this.props.pattern;
        const {handleTagsChange, isReadOnly} = this.props;
        const tags = caseInsensitiveSort(editRoot ? editRoot.model.tags : []);
        let tagsOpts = tags;
        return (
            <form className="navbar-form" autoComplete="off">
                <div className="form-group">
                    <label htmlFor="pc-patt-name">Name</label>
                    <input ref={input => this.input = input} type="text" className="form-control input-sm" id="pc-patt-name" placeholder="Pattern Name" maxLength="255" value={editRoot ? editRoot.model.fullname : ''} onChange={this.onNameChange}/>
                </div>
                <div className="form-group">
                    <label htmlFor="pc-patt-tags">Tags</label>
                    {editRoot ?
                    <TagsInput
                        key="pc-patt-tags"
                        value={tags}
                        inputProps={{
                            id: 'pc-patt-tags',
                            name: 'tags',
                            placeholder: 'Tags',
                        }}
                        selectizeOptions={{
                            delimiter: ',',
                            persist: true,
                            create: input => ({value: input, text: input}),
                            options: tagsOpts,
                            items: tags,
                        }}
                        inputSize="sm"
                        onFieldChange={(name, value) => handleTagsChange(value)}
                        readOnly={isReadOnly()}/> :
                        null}
                </div>
            </form>
        );
    }

    renderSidebarContent() {
        const {sysPatts} = this.props.pattern;
        return this.renderDefaultOptions(sysPatts);
    }

    renderWorkspaceContent() {
        const {currEditNode, selectedChildId} = this.props.pattern;
        const {load, onDropTarget, deletePattern, updatePosition, updateConnection, changeLevel, selectChild} = this.props;
        let dropProps = {
            onDropTarget,
        };
        let graphProps = {
            type: GraphType.PATTERN,
            graphSettings,
            currEditNode,
            selectedChildId,
            deletePattern,
            updatePosition,
            updateConnection,
            changeLevel,
            selectChild,
        }

        return (
            <DroppableWorkspace {...dropProps}>
                <Graph {...graphProps}/>
            </DroppableWorkspace>
        );
    }

    renderNavigationContent() {
        const {editRoot, currEditNode, selectedChildId} = this.props.pattern;
        return this.renderPatternPreview(editRoot, currEditNode, selectedChildId);
    }

    renderSettingsContent() {
        const {currEditNode, selectedChildId, additional, fileState} = this.props.pattern;
        const {isReadOnly, getAlertify, getHistory} = this.props;
        let props = {
            additional,
            fileState,
            isReadOnly,
            getAlertify,
            getHistory,
        };
        return this.renderActivitySettings(GraphType.PATTERN, currEditNode, selectedChildId, props);
    }

    render() {
        const {editRoot} = this.props.pattern;
        const layoutProps = {
            controlContent: this.renderControlContent(),
            sidebarContent: this.renderSidebarContent(),
            workspaceContent: this.renderWorkspaceContent(),
            navigationContent: this.renderNavigationContent(),
            settingsContent: this.renderSettingsContent(),
        }
        return (
            <UnitContext.Provider value={baseContext}>
                <PanelLayout {...layoutProps}/>
            </UnitContext.Provider>
        );
    }
}

const mapStateToProps = state => ({
    pattern: Config.get(state, StateName.PATTERN),
});

const mapDispatchToProps = dispatch => ({
    loadUserPattern: (id) => dispatch(loadUserPattern(id)),
    onDropTarget: (item, pos) => dispatch(addPattern(item, pos)),
    deletePattern: id => dispatch(deletePattern(id)),
    updatePosition: (id, pos) => dispatch(updatePosition(id, pos)),
    updateConnection: (conns) => dispatch(updateConnection(conns)),
    changeLevel: id => dispatch(changeLevel(id)),
    selectChild: id => dispatch(selectChild(id)),
    activityFieldChange: (id, name, value) => dispatch(activityFieldChange(id, name, value)),
    resetAdditionalSettingsPanel: () => dispatch(resetAdditionalSettingsPanel()),
    freshAdditionalSettingsPanel: (panel, opts) => dispatch(freshAdditionalSettingsPanel(panel, opts)),
    pushAdditionalSettingsPanel: (panel, opts) => dispatch(pushAdditionalSettingsPanel(panel, opts)),
    popAdditionalSettingsPanel: (...args) => dispatch(popAdditionalSettingsPanel(...args)),
    jumpToAdditionalSettingsPanel: panel => dispatch(jumpToAdditionalSettingsPanel(panel)),
    addAdditionalSettings: (nodeArgs, itemArgs) => dispatch(addAdditionalSettings(nodeArgs, itemArgs)),
    removeAdditionalSettings: (nodeArgs, itemArgs) => dispatch(removeAdditionalSettings(nodeArgs, itemArgs)),
    removeAllAdditionalSettings: nodeArgs => dispatch(removeAllAdditionalSettings(nodeArgs)),
    updateAdditionalSettings: (nodeArgs, itemArgs) => dispatch(updateAdditionalSettings(nodeArgs, itemArgs)),
    moveAdditionalSettings: (nodeArgs, itemArgs) => dispatch(moveAdditionalSettings(nodeArgs, itemArgs)),
    handleNameChange: value => dispatch(changeName(value)),
    handleTagsChange: tags => dispatch(changeTags(tags)),
    uploadFile: file => dispatch(fileupload(file)),
});

export default connect(
    mapStateToProps,
    mapDispatchToProps,
    null,
    {withRef: true}
)(Pattern);
