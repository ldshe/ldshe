import classnames from 'classnames';
import React from 'react';
import ReactDOM from 'react-dom';
import {connect} from 'react-redux';
import {Config, caseInsensitiveSort} from 'js/util';
import {fileupload} from 'react/app/design/actions';
import TagsInput from 'react/components/tags_input';
import {popPanel} from 'react/design/unit_step/actions';
import {createDroppableWorkspace} from '../components/droppable_workspace';
import PanelLayout from '../components/panel_layout';
import Graph from '../components/graph';
import OverrideConfirmModal from '../components/override_confirm_modal';
import graphSettings from '../graph_settings';
import {StateName, DragType, GraphType} from '../types';
import UnitContext from '../context';
import {deleteUserPattern, changeName, changeTags, addPattern, deletePattern,
    updatePosition, updateConnection, changeLevel, selectChild, activityFieldChange,
    applyPatternChange, cancelPatternChange,
    resetAdditionalSettingsPanel, freshAdditionalSettingsPanel, pushAdditionalSettingsPanel, popAdditionalSettingsPanel, jumpToAdditionalSettingsPanel,
    addAdditionalSettings, removeAdditionalSettings, removeAllAdditionalSettings, moveAdditionalSettings, updateAdditionalSettings,
} from '../actions/pattern';
import Base, {baseContext} from './base';

const DroppableWorkspace = createDroppableWorkspace(DragType);

class DesignPattern extends Base {

    constructor(props, context) {
        super(props, context);
        this.onNameChange = this.onNameChange.bind(this);
        this.onDone = this.onDone.bind(this);
        this.onCancel = this.onCancel.bind(this);
        this.onDelete = this.onDelete.bind(this);
        this.renderDelete = this.renderDelete.bind(this);
        this.renderControlContent = this.renderControlContent.bind(this);
        this.renderDefaultOptions = super.renderDefaultOptions.bind(this);
        this.renderSidebarContent = this.renderSidebarContent.bind(this);
        this.renderWorkspaceContent = this.renderWorkspaceContent.bind(this);
        this.renderNavigationContent = this.renderNavigationContent.bind(this);
        this.renderPatternPreview = super.renderPatternPreview.bind(this);
        this.renderSettingsContent = this.renderSettingsContent.bind(this);
        this.renderActivitySettings = super.renderActivitySettings.bind(this);
        this.isSubmitted = false;
        this.isNameUpdateRemined = false;
        this.noInstance = true;
    }

    componentDidMount() {
        const {selectChild} = this.props;
        selectChild(null);

        let blockMsg = '<p>You are about leaving the Pattern Design panel, changes you made may not be saved!</p>';
            blockMsg += '<p>To save changes, click the "Done" button before you leave or cancel to abort.</p>';
        this.pushHistBlockMsg(blockMsg);
        setTimeout(() => {
            $('.us .sidebar-content [data-toggle="tooltip"]').tooltip();
        }, 0);
    }

    componentDidUpdate() {
        let $input = $(ReactDOM.findDOMNode(this.input));
        if($input.attr('value') == 'New Pattern' && !this.isNameUpdateRemined) {
            this.isNameUpdateRemined = true;
            $input.select();
        }
    }

    componentWillUnmount() {
        super.componentWillUnmount();
        $('.us .sidebar-content [data-toggle="tooltip"]').tooltip('destroy');
        $(window).unbind('beforeunload');
        if(this.unblock) {
            this.unblock();
            this.unblock = null;
        }

        const {handleUnsubmitted} = this.props;
        if(!this.isSubmitted) {
            handleUnsubmitted();
        }
    }

    onNameChange(e) {
        e.preventDefault();
        const {handleNameChange} = this.props;
        handleNameChange(e.target.value);
    }

    onDone(e) {
        e.preventDefault();
        const {handleConfirm} = this.props;
        const {activityFieldChanged} = this.props.pattern;
        let readOnly= this.props.isReadOnly();
        if(readOnly || this.noInstance || !activityFieldChanged)
            handleConfirm();
        else
            this.confirmModal.show();
    }

    onCancel(e) {
        e.preventDefault();
        const {structuralChanged, activityFieldChanged} = this.props.pattern;
        const {handleCancel} = this.props;
        if(structuralChanged || activityFieldChanged) {
            const alertify = this.props.getAlertify();
            alertify.confirm({
                okLabel: 'LEAVE ANYWAY',
                cancelLabel: 'STAY',
                iconClass: 'fa-exclamation-triangle danger',
                confirmAction: () => handleCancel(),
                title: 'LEAVE WITHOUT SAVE',
                subTitle: 'Changes you made may not be saved.',
            });
        } else {
            handleCancel();
        }
    }

    onDelete(e, id) {
        e.preventDefault();
        const {handleDelete} = this.props;
        const alertify = this.props.getAlertify();
        alertify.confirm({
            okLabel: 'CONFIRM',
            cancelLabel: 'CANCEL',
            iconClass: 'fa-exclamation-triangle danger',
            confirmAction: () => handleDelete(id),
            title: 'DELETE PATTERN',
            subTitle: 'This action cannot be undone.',
        });
    }

    renderDelete() {
        const {initProps} = this.props;
        const {editRoot} = this.props.pattern;
        const {userPatts} = this.props.patternInstance;
        if(initProps.editId && editRoot) {
            let id = editRoot.model.id;
            let canDel = true;
            userPatts.some(p => {
                let patt = p.patt;
                patt.walk(n => {
                    let ref = n.model.ref;
                    if(ref && ref == id) {
                        canDel = false;
                        return false;
                    }
                })
                return !canDel;
            });
            this.noInstance = canDel;
            return (
                <button type="button" className="btn btn-sm btn-danger pull-right" onClick={e => this.onDelete(e, id)} disabled={!canDel}>
                    Delete
                </button>
            );
        } else {
            return null;
        }
    }

    renderControlContent() {
        const {userPatts, editRoot} = this.props.pattern;
        const {handleTagsChange} = this.props;
        const tags = caseInsensitiveSort(editRoot ? editRoot.model.tags : []);
        let tagsOpts = caseInsensitiveSort(userPatts.reduce((c, {patt}) => c.concat(patt.model.tags), []));
        return (
            <form className="navbar-form" autoComplete="off">
                <div className="form-group">
                    <label htmlFor="ud-patt-name">Name</label>
                    <input ref={input => this.input = input} type="text" className="form-control input-sm" id="ud-patt-name" placeholder="Pattern Name" maxLength="255" value={editRoot ? editRoot.model.fullname : ''} onChange={this.onNameChange}/>
                </div>
                <div className="form-group">
                    <label htmlFor="ud-patt-tags">Tags</label>
                    {editRoot ?
                    <TagsInput
                        key="ud-patt-tags"
                        value={tags}
                        inputProps={{
                            id: 'ud-patt-tags',
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
                        readOnly={this.props.isReadOnly()}/> :
                        null}
                </div>
                <div className="form-group">
                    <button type="button" className="btn btn-sm btn-primary" onClick={this.onDone}>
                        Done
                    </button>
                    <button type="button" className="btn btn-sm btn-default" onClick={this.onCancel}>
                        Cancel
                    </button>
                </div>
                {this.renderDelete()}
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

    renderSettingsContent(editCtx) {
        const {currEditNode, selectedChildId, additional, fileState} = this.props.pattern;
        const {isReadOnly, getAlertify} = this.props;
        let props = Object.assign({}, editCtx, {
            additional,
            fileState,
            isReadOnly,
            getAlertify,
        });
        return this.renderActivitySettings(GraphType.PATTERN, currEditNode, selectedChildId, props);
    }

    render() {
        const {editRoot} = this.props.pattern;
        const {handleConfirm} = this.props;
        const layoutProps = {
            controlContent: this.renderControlContent(),
            sidebarContent: this.renderSidebarContent(),
            workspaceContent: this.renderWorkspaceContent(),
            navigationContent: this.renderNavigationContent(),
            settingsContent: this.renderSettingsContent(),
        }
        const modalProps = {
            root: editRoot,
            handleSubmit: handleConfirm,
        }
        return (
            <UnitContext.Provider value={baseContext}>
                <div>
                    <PanelLayout {...layoutProps}/>
                    <OverrideConfirmModal ref={modal => this.confirmModal = modal} {...modalProps}/>
                </div>
            </UnitContext.Provider>
        );
    }
}

const mapStateToProps = state => ({
    pattern: Config.get(state, StateName.LEARNING_UNIT_PATTERN),
    patternInstance: Config.get(state, StateName.LEARNING_UNIT_PATTERN_INSTANCE),
});

const mapDispatchToProps = dispatch => ({
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
    moveAdditionalSettings: (nodeArgs, itemArgs) => dispatch(moveAdditionalSettings(nodeArgs, itemArgs)),
    updateAdditionalSettings: (nodeArgs, itemArgs) => dispatch(updateAdditionalSettings(nodeArgs, itemArgs)),
    handleNameChange: value => dispatch(changeName(value)),
    handleTagsChange: tags => dispatch(changeTags(tags)),
    handleConfirm: overrides => {
        this.isSubmitted = true;
        dispatch(applyPatternChange(overrides));
        dispatch(popPanel());
    },
    handleCancel: () => {
        this.isSubmitted = true;
        dispatch(cancelPatternChange());
        dispatch(popPanel());
    },
    handleDelete: id => {
        dispatch(deleteUserPattern(id));
        dispatch(popPanel());
    },
    handleUnsubmitted: () => dispatch(cancelPatternChange()),
    uploadFile: file => dispatch(fileupload(file)),
});

export default connect(
    mapStateToProps,
    mapDispatchToProps,
    null,
    {withRef: true}
)(DesignPattern);
