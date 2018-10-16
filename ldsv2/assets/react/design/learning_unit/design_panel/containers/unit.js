import classnames from 'classnames';
import React from 'react';
import ReactDOMServer from 'react-dom/server'
import {connect} from 'react-redux';
import 'jquery-bootstrap-scrolling-tabs';
import TreeModel from 'tree-model';
import {Config, caseInsensitiveSort} from 'js/util';
import {fileupload} from 'react/app/design/actions';
import {Panel} from 'react/design/unit_step/types';
import {pushPanel} from 'react/design/unit_step/actions';
import {StateName as UnitStateName} from '../../pedagogical_sequence/types';
import {PatternImport, PublicPatternImport,  PatternExport} from '../../import_panel';
import {createDraggableNode} from '../components/draggable_node';
import {createDroppableWorkspace} from '../components/droppable_workspace';
import PanelLayout from '../components/panel_layout';
import Graph from '../components/graph';
import graphSettings from '../graph_settings';
import {getPatternClassName, comparePattern} from '../util';
import {DEFAULT_UNIT_SEQ_PREFIX, DragType, GraphType, StateName as PatternStateName} from '../types';
import UnitContext from '../context';
import * as PatternDesign from '../actions/pattern';
import {loadUserPattern, addPattern, deletePattern,
    updatePosition, updateConnection, changeLevel, selectChild, activityFieldChange,
    resetAdditionalSettingsPanel, freshAdditionalSettingsPanel, pushAdditionalSettingsPanel, popAdditionalSettingsPanel, jumpToAdditionalSettingsPanel,
    addAdditionalSettings, removeAdditionalSettings, removeAllAdditionalSettings, moveAdditionalSettings, updateAdditionalSettings,
} from '../actions/unit';
import Base, {baseContext} from './base';

const DraggableNode = createDraggableNode(DragType);
const DroppableWorkspace = createDroppableWorkspace(DragType);

class DesignUnit extends Base {

    static getDerivedStateFromProps(nextProps, prevState) {
        const {editUnitId, userPatts} = nextProps.patternInstance;
        let needUpdateTab = false;
        if(Object.keys(prevState.tabMap).length != userPatts.length) {
            needUpdateTab = true;
        }
        if(!needUpdateTab) {
            userPatts.forEach(({id, patt}) => {
                if(!prevState.tabMap[id] ||
                    prevState.tabMap[id].fullname != patt.model.fullname ||
                    prevState.tabMap[id].subType != patt.model.subType) {
                    needUpdateTab = true;
                }
            });
        }
        let tabMap = {};
        userPatts.forEach(({id, patt}) => tabMap[id] = {fullname: patt.model.fullname, subType: patt.model.subType});
        return {
            needUpdateTab,
            tabMap,
        };
    }

    constructor(props, context) {
        super(props, context);
        this.onAddPattern = this.onAddPattern.bind(this);
        this.onModifyPattern = this.onModifyPattern.bind(this);
        this.onPathChange = this.onPathChange.bind(this);
        this.onImport = this.onImport.bind(this);
        this.onPublicImport = this.onPublicImport.bind(this);
        this.onExport = this.onExport.bind(this);
        this.isSidebarDisabled = this.isSidebarDisabled.bind(this);
        this.renderPatternControl = this.renderPatternControl.bind(this);
        this.renderUnitTabs = this.renderUnitTabs.bind(this);
        this.renderNavigationPath = this.renderNavigationPath.bind(this);
        this.renderControlContent = this.renderControlContent.bind(this);
        this.renderDefaultOptions = this.renderDefaultOptions.bind(this);
        this.renderUserOptions = this.renderUserOptions.bind(this);
        this.renderSidebarContent = this.renderSidebarContent.bind(this);
        this.renderWorkspaceContent = this.renderWorkspaceContent.bind(this);
        this.renderNavigationContent = this.renderNavigationContent.bind(this);
        this.renderPatternPreview = super.renderPatternPreview.bind(this);
        this.renderSettingsContent = this.renderSettingsContent.bind(this);
        this.renderActivitySettings = super.renderActivitySettings.bind(this);
        this.state = {
            needUpdateTab: false,
            tabMap: {},
        };
    }

    componentDidMount() {
        const {data} = this.props.unit;
        const {loadUserPattern, selectChild} = this.props;
        const {editUnitId, editUnitPos} = this.props.patternInstance;
        if(editUnitPos != -1) {
            loadUserPattern(editUnitId);
            selectChild(null);
        } else if(data.length > 0) {
            loadUserPattern(data[0].id);
            selectChild(null);
        }
        $('.units.nav-tabs').scrollingTabs({
            tabClickHandler: e => {
                let $el = $(e.target);
                loadUserPattern($el.data('id'));
                selectChild(null);
            }
        });
        $('a[data-parent^="#patt-accordion"]').bind('click', e => {
            setTimeout(() => $('.composite .title').resizeText({maxfont: 12}), 100);
        });
        setTimeout(() => {
            $('.composite .title').resizeText({maxfont: 12});
            $('.us .sidebar-content [data-toggle="tooltip"]').tooltip();
        }, 0);
    }

    componentDidUpdate() {
        const {needUpdateTab} = this.state;
        const {editUnitId} = this.props.patternInstance;
        if(needUpdateTab) {
            const {loadUserPattern, selectChild} = this.props;
            let $tabs = $(ReactDOMServer.renderToStaticMarkup(<div>{this.renderUnitTabs()}</div>));
            $('.units.nav-tabs').scrollingTabs('destroy');
            $('.units.nav-tabs').html($tabs.html());
            $('.units.nav-tabs').scrollingTabs({
                tabClickHandler: e => {
                    let $el = $(e.target);
                    loadUserPattern($el.data('id'));
                    selectChild(null);
                }
            });
        }
        $('a[id^="unit-tab-"]').parent().removeClass('active');
        $(`#unit-tab-${editUnitId}`).parent().addClass('active');
    }

    componentWillUnmount() {
        super.componentWillUnmount();
        $('.us .sidebar-content [data-toggle="tooltip"]').tooltip('destroy');
        $('a[data-parent^="#patt-accordion"]').unbind('click');
        $('.units.nav-tabs').scrollingTabs('destroy');
    }

    onAddPattern(e) {
        e.preventDefault();
        const {pushPanel, PatternDesign} = this.props;
        PatternDesign.loadUserPattern();
        pushPanel(Panel.DESIGN_PATTERN);
    }

    onModifyPattern(e, id) {
        e.preventDefault();
        const {pushPanel, PatternDesign} = this.props;
        PatternDesign.loadUserPattern(id);
        pushPanel(Panel.DESIGN_PATTERN, {editId: id});
    }

    onPathChange(e, id) {
        e.preventDefault();
        const {changeLevel} = this.props;
        changeLevel(id);
    }

    onImport(e) {
        e.preventDefault();
        this.patternImport.getWrappedInstance().show();
    }

    onPublicImport(e) {
        e.preventDefault();
        this.publicPatternImport.getWrappedInstance().show();
    }

    onExport(e) {
        e.preventDefault();
        this.patternExport.getWrappedInstance().show();
    }

    isSidebarDisabled() {
        const {editRoot, currEditNode} = this.props.patternInstance;
        return editRoot.model.id != currEditNode.model.id;
    }

    renderPatternControl() {
        const {userPatts} = this.props.pattern;
        return (
            <div>
                <form className="navbar-form navbar-right pull-right">
                    <div className="btn-group">
                        <button type="button" className="btn btn-sm btn-primary" onClick={e => this.onAddPattern(e)}>
                            <i className="fa fa-plus"></i>
                            {' New Pattern'}
                        </button>
                        <button type="button" className="btn btn-sm btn-success" onClick={this.onImport} disabled={this.props.isReadOnly()}>
                            <i className="fa fa-download"></i>{' My Patterns'}
                        </button>
                        <button type="button" className="btn btn-sm btn-success" onClick={this.onPublicImport} disabled={this.props.isReadOnly()}>
                            <i className="fa fa-download"></i>{' Public Patterns'}
                        </button>
                        <button type="button" className="btn btn-sm btn-info" onClick={this.onExport} disabled={this.props.isReadOnly()}>
                            <i className="fa fa-upload"></i>{' Save to My Patterns'}
                        </button>
                        {
                            userPatts.length > 0 ?
                            <button type="button" className="btn btn-sm btn-primary dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                <span className="caret"></span>
                            </button> :
                            <button type="button" className="btn btn-sm btn-primary dropdown-toggle" onClick={e => this.onAddPattern(e)}>
                                <span className="caret"></span>
                            </button>
                        }
                        {
                            userPatts.length > 0 ?
                            <ul className="dropdown-menu">{
                                userPatts.sort(comparePattern)
                                         .map((p, i) => {
                                             let id = p.id;
                                             let {fullname} = p.patt.model;
                                             return <li key={id}><a href="#" onClick={e => this.onModifyPattern(e, id)}>{fullname}</a></li>;
                                         })
                            }</ul> :
                            null
                        }
                    </div>
                </form>
                <div className="clearfix"></div>
            </div>
        );
    }

    renderUnitTabs() {
        const {editUnitPos} = this.props.patternInstance;
        const {data} = this.props.unit;
        const {userPatts} = this.props.patternInstance;
        return data.map((d, i) => {
            let userPatt = userPatts.filter(u => u.id == d.id);
            let name;
            if(userPatt.length > 0) {
                let patt = userPatt[0].patt;
                name = patt.model.fullname;
                name = name ? name : patt.model.subType;
            } else {
                name = `${DEFAULT_UNIT_SEQ_PREFIX}${i+1}`;
            }
            return (
                <li key={d.id}>
                    <a href={`#unit-tab-${i}`} id={`unit-tab-${d.id}`} data-toggle="tab" data-id={d.id} data-pos={i} title={name}>{name}</a>
                </li>
            )
        });
    }

    renderNavigationPath() {
        const {editRoot, currEditNode} = this.props.patternInstance;
        if(currEditNode) {
            let tree = new TreeModel();
            let paths = currEditNode.getPath();
            return (
                <ol className="breadcrumb">{
                    paths.map(n => {
                        let id = n.model.id;
                        let name = n.model.fullname;
                        name = name ? name : n.model.subType;
                        let seq = '';
                        if(n.parent) {
                            let sequenceMap = n.parent.model.sequenceMap;
                            if(sequenceMap)
                                seq = sequenceMap[n.model.id];
                        }
                        if(id == currEditNode.model.id)
                            return <li key={id} className="active">{`${seq} ${name}`}</li>
                        else
                            return <li key={id}><a href="#" onClick={e => this.onPathChange(e, id)}>{`${seq} ${name}`}</a></li>
                    })
                }</ol>
            );
        } else {
            return null;
        }
    }

    renderControlContent() {
        return (
            <div className="row">
                <div className="col-sm-12">
                    {this.renderNavigationPath()}
                </div>
            </div>
        );
    }

    renderDefaultOptions(sysPatts) {
        return (
            <div className="panel panel-tasks">
                <div className="panel-heading" id="patt-accordion-tasks-heading">
                    <a data-toggle="collapse" data-parent="#patt-accordion" href="#patt-accordion-tasks" aria-expanded="true" aria-controls="patt-accordion-tasks">
                        <div>Tasks</div>
                    </a>
                </div>
                <div id="patt-accordion-tasks" className="panel-collapse collapse in" aria-labelledby="patt-accordion-tasks-heading">
                    <div className="panel-body">{super.renderDefaultOptions(sysPatts)}</div>
                </div>
            </div>
        );
    }

    renderUserOptions(userPatts, filter, key) {
        if(userPatts.length > 0) {
            let patts = userPatts.filter(({patt}) => {
                let tags = patt.model.tags;
                return filter == 'Patterns' ?
                    tags.length == 0 || tags.indexOf('Patterns') != -1 :
                    tags.indexOf(filter) != -1;
            });
            let accordId = `patt-accordion-${key}`;
            let panelCls = classnames('panel', {
                'panel-patterns': filter == 'Patterns',
                'panel-customs': filter != 'Patterns',
            });
            return patts.length > 0 ?
                <div key={key} className={panelCls}>
                    <div className="panel-heading" id={`${accordId}-heading`}>
                        <a className="collapsed" data-toggle="collapse" data-parent="#patt-accordion" href={`#${accordId}`} aria-expanded="false" aria-controls={accordId}>
                            <div>{filter}</div>
                        </a>
                    </div>
                    <div id={accordId} className="panel-collapse collapse" aria-labelledby={`${accordId}-heading`}>
                        <div className="panel-body">{
                            patts.sort(comparePattern)
                                .map((p, i) => {
                                    let id = p.id;
                                    let seed = p.patt;
                                    let {fullname} = seed.model;
                                    let className = classnames(getPatternClassName(seed), {item: true});
                                    let dragProps = {
                                        key: id,
                                        seed,
                                    };
                                    return (
                                        <DraggableNode {...dragProps}>
                                            <div className="composite">
                                                <button className="control btn btn-default btn-xs" type="button" title="Edit pattern" onClick={e => this.onModifyPattern(e, id)}>
                                                    <i className="fa fa-cog"></i>
                                                </button>
                                                <div className="title">{fullname}</div>
                                            </div>
                                        </DraggableNode>
                                    );
                                })
                        }</div>
                    </div>
                </div> :
                null;
        } else {
            return (
                <div key="0" className="panel panel-patterns">
                    <div className="panel-heading" id="patt-accordion-0-heading">
                        <a className="collapsed" data-toggle="collapse" data-parent="#patt-accordion" href="#patt-accordion-0" aria-expanded="false" aria-controls="patt-accordion-0">
                            Patterns
                        </a>
                    </div>
                    <div id="patt-accordion-0" className="panel-collapse collapse" aria-labelledby="patt-accordion-0-heading">
                        <div className="panel-body empty">Click the <strong>&quot;+ New Pattern&quot;</strong> button or expand the <strong>&quot;Tasks&quot;</strong> panel above to insert a task.</div>
                    </div>
                </div>
            );
        }
    }

    renderSidebarContent() {
        const {sysPatts} = this.props.patternInstance;
        const {userPatts} = this.props.pattern;
        let tag = {Patterns: 'Patterns'};
        userPatts.forEach(({patt}) => patt.model.tags.forEach(t => tag[t] = t));
        let tags = caseInsensitiveSort(Object.keys(tag));
        return (
            <div className="panel-group" id="patt-accordion" aria-multiselectable="true">
                {this.renderDefaultOptions(sysPatts)}
                {tags.map((t, i) => this.renderUserOptions(userPatts, t, i))}
            </div>
        );
    }

    renderWorkspaceContent() {
        const {currEditNode, selectedChildId} = this.props.patternInstance;
        const {load, onDropTarget, deletePattern, updatePosition, updateConnection, changeLevel, selectChild} = this.props;
        let dropProps = {
            onDropTarget,
        };
        let graphProps = {
            type: GraphType.PATTERN_INSTANCE,
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
        const {editRoot, currEditNode, selectedChildId} = this.props.patternInstance;
        return this.renderPatternPreview(editRoot, currEditNode, selectedChildId);
    }

    renderSettingsContent() {
        const {currEditNode, selectedChildId, additional, fileState} = this.props.patternInstance;
        const {isReadOnly, getAlertify} = this.props;
        let props = {
            additional,
            fileState,
            isReadOnly,
            getAlertify,
        };
        return this.renderActivitySettings(GraphType.PATTERN_INSTANCE, currEditNode, selectedChildId, props);
    }

    render() {
        let sidebarDisabled = this.isSidebarDisabled();

        const props = {
            controlContent: this.renderControlContent(),
            sidebarDisabled,
            sidebarContent: this.renderSidebarContent(),
            workspaceContent: this.renderWorkspaceContent(),
            navigationContent: this.renderNavigationContent(),
            settingsContent: this.renderSettingsContent(),
        }
        return (
            <UnitContext.Provider value={baseContext}>
                <div className="unit-tabs">
                    {this.renderPatternControl()}
                    <ul className="nav nav-tabs units">
                        {this.renderUnitTabs()}
                    </ul>
                    <div className="tab-content units">
                        <PanelLayout {...props}/>
                    </div>
                    <PatternImport ref={im => this.patternImport = im}/>
                    <PublicPatternImport ref={im => this.publicPatternImport = im}/>
                    <PatternExport ref={ex => this.patternExport = ex}/>
                </div>
            </UnitContext.Provider>
        );
    }
}

const mapStateToProps = state => ({
    unit: Config.get(state, UnitStateName.LEARNING_UNIT),
    pattern: Config.get(state, PatternStateName.LEARNING_UNIT_PATTERN),
    patternInstance: Config.get(state, PatternStateName.LEARNING_UNIT_PATTERN_INSTANCE),
});

const mapDispatchToProps = dispatch => ({
    loadUserPattern: id => dispatch(loadUserPattern(id)),
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
    pushPanel: (p, opts) => dispatch(pushPanel(p, opts)),
    PatternDesign: {
        loadUserPattern: id => dispatch(PatternDesign.loadUserPattern(id)),
    },
    uploadFile: file => dispatch(fileupload(file)),
});

export default connect(
    mapStateToProps,
    mapDispatchToProps,
    null,
    {withRef: true}
)(DesignUnit);
