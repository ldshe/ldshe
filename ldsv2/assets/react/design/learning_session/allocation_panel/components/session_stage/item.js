import classnames from 'classnames';
import React, {Component} from 'react';
import {Graph, alg, json} from 'graphlib';
import {getPatternClassName, getDefaultActivityName} from 'react/design/learning_unit/design_panel/util';
import {PatternType} from 'react/design/learning_unit/design_panel/types';

export default class Item extends Component {

    static getDerivedStateFromProps(nextProps, prevState) {
        const {draggingItem, selectedItemId} = nextProps;
        if(!prevState.isDragging && draggingItem && draggingItem.pattId == selectedItemId) {
            let compositeExpand = Object.assign({}, prevState.compositeExpand);
            if(compositeExpand[selectedItemId]) {
                compositeExpand[selectedItemId] = false;
            }
            return {
                isDragging: true,
                compositeExpand,
            };
        }
        if(prevState.isDragging  && !draggingItem) {
            return {
                isDragging: false,
            };
        }
        return null;
    }

    constructor(props, context) {
        super(props, context);
        this.connectDragSource = this.connectDragSource.bind(this);
        this.expandToggle = this.expandToggle.bind(this);
        this.onCompositeExpand = this.onCompositeExpand.bind(this);
        this.handleRemove = this.handleRemove.bind(this);
        this.handleEdit = this.handleEdit.bind(this);
        this.renderByType = this.renderByType.bind(this);
        this.renderDependencies = this.renderDependencies.bind(this);
        this.state = {
            compositeExpand: Object.assign({}, props.initCompositeExpanded) || {},
            isDragging: false,
        };
    }

    connectDragSource(id, el) {
        const {selectedItemId, connectDragSource} = this.props;
        if(id == selectedItemId) {
            const dropEffect = 'move';
            return connectDragSource(el, {dropEffect});
        } else {
            return el;
        }
    }

    expandToggle(id) {
        const {expandStageItem} = this.props;
        let compositeExpand = Object.assign({}, this.state.compositeExpand);
        compositeExpand[id] = !compositeExpand[id];
        this.setState({compositeExpand});
        expandStageItem(id, compositeExpand[id]);
    }

    onCompositeExpand(e, id) {
        e.preventDefault();
        this.expandToggle(id);
    }

    handleRemove(e, id) {
        e.preventDefault();
        const {sessId, stageType} = this.props;
        const {removeStageItem} = this.props;
        removeStageItem(sessId, stageType, id);
    }

    handleEdit(e, node) {
        e.preventDefault();
        const {unitId} = this.props;
        const {editStageItem} = this.props;
        editStageItem(unitId, node);
    }

    renderByType(source) {
        const {compositeExpand} = this.state;
        const {unitId, root, dragType, selectedItemId, allocedLookup, dependentSequence} = this.props;
        const {editStageItem} = this.props;
        const node = root.first(n => n.model.id == source.id);
        const {id, pattType, subType, fullname} = node.model;
        const {dependencies, sequenceMap} = node.model;
        const parentId = node.parent.model.id;

        if(selectedItemId && selectedItemId != id) return null;

        let name = fullname ? fullname : getDefaultActivityName(subType);
        let hasDependencies = dependencies && dependencies.graph.nodes.length > 0;
        let isDraggable, isRemovable;
        isDraggable = isRemovable = selectedItemId == id;
        switch(pattType) {
            case PatternType.COMPOSITE: {
                let wrapperCls = classnames({
                    'label-wrapper': true,
                });
                let labelCls = classnames({
                    label: true,
                    expandable: true,
                    expanded:  compositeExpand[id],
                    draggable: isDraggable,
                });
                let compCls = classnames({
                    composite: true,
                    expanded: compositeExpand[id],
                });
                let itemProps = hasDependencies ? {
                    unitId,
                    root,
                    dependentSource: dependencies.graph,
                    dependentSequence: sequenceMap,
                    editStageItem,
                } : null;
                return (
                    <div>
                        <div className={wrapperCls}>
                            {this.connectDragSource(
                                id,
                                <label className={labelCls} title={name}>
                                    {`${dependentSequence[id]} ${name}`}
                                </label>
                            )}
                            <span onClick={e => this.onCompositeExpand(e, id)}></span>
                            {isRemovable ? <span className="remove" title="Remove" onClick={e => this.handleRemove(e, selectedItemId)}></span> : null}
                        </div>
                        {
                            hasDependencies ?
                            <div className="composite-wrapper">
                            	<div className={compCls}>
                                    <ul><Item {...itemProps}/></ul>
                            	</div>
                            </div> :
                            null
                        }
                    </div>
                );
            }
            case PatternType.ACTIVITY: {
                let nodeCls = classnames({
                    node: true,
                    draggable: isDraggable,
                });
                let spanCls = classnames(getPatternClassName(node), {
                    label: true,
                    activity: true,
                    draggable: isDraggable,
                });
                return (
                    <div className="node-wrapper">
                        {this.connectDragSource(
                            id,
                            <a className={nodeCls} onClick={e => this.handleEdit(e, node)}>
                                <span className={spanCls} title={name}>
                                    {`${dependentSequence[id]} ${name}  `}
                                    <span className="edit" title="Edit">
                                        <i className="fa fa-pencil"></i>
                                    </span>
                                </span>
                            </a>
                        )}
                        {isRemovable ? <span className="remove" title="Remove" onClick={e => this.handleRemove(e, selectedItemId)}></span> : null}
                    </div>
                );
            }
        };
    }

    renderDependencies() {
        const {dependentSource, dependentSequence} = this.props;
        let nodes = [];
        if(dependentSource) {
            let g = json.read(dependentSource);
            nodes = Object.keys(dependentSequence)
                .sort((a, b) => dependentSequence[a] - dependentSequence[b])
                .map(id => g.node(id));
        }
        return nodes.map((n, i) => <li key={i}>{this.renderByType(n)}</li>);
    }

    render() {
        const {isDragging} = this.state;
        let itemCls = classnames({
            'stage-item': true,
            dragging: isDragging,
        });
        return <div className={itemCls}>{this.renderDependencies()}</div>;
    }
}
