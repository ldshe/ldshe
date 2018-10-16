import classnames from 'classnames';
import React, {Component} from 'react';
import {Graph, alg, json} from 'graphlib';
import {getPatternClassName, getDefaultActivityName} from 'react/design/learning_unit/design_panel/util';
import {PatternType} from 'react/design/learning_unit/design_panel/types';
import {Draggable} from './preview';

export default class Node extends Component {

    constructor(props, context) {
        super(props, context);
        this.startDragging = this.startDragging.bind(this);
        this.endDragging = this.endDragging.bind(this);
        this.connectDragSource = this.connectDragSource.bind(this);
        this.expand = this.expand.bind(this);
        this.onCompositeExpand = this.onCompositeExpand.bind(this);
        this.renderByType = this.renderByType.bind(this);
        this.renderDependencies = this.renderDependencies.bind(this);
        this.state = {
            compositeExpand: Object.assign({}, props.initCompositeExpanded) || {},
            isDragging: false,
        };
    }

    startDragging(dragId) {
        this.setState({
            isDragging: true,
            dragId,
        });
    }

    endDragging() {
        this.setState({isDragging: false});
    }

    connectDragSource(isDraggable, id, el) {
        const {startDragging, endDragging} = this;
        const {root} = this.props;
        if(isDraggable) {
            const props = {
                root,
                pattId: id,
                startDragging,
                endDragging,
            }
            return <Draggable {...props}>{el}</Draggable>;
        } else {
            return el;
        }
    }

    expand(id) {
        const {expandFilterItem} = this.props;
        let compositeExpand = Object.assign({}, this.state.compositeExpand);
        compositeExpand[id] = !compositeExpand[id];
        this.setState({compositeExpand});
        expandFilterItem(id, compositeExpand[id]);
    }

    onCompositeExpand(e, id) {
        e.preventDefault();
        this.expand(id);
    }

    renderByType(source, key) {
        const {compositeExpand, isDragging, dragId} = this.state;
        const {root, selectedNodeId, allocedLookup, dependentSequence} = this.props;
        const node = root.first(n => n.model.id == source.id);
        const {id, pattType, subType, fullname} = node.model;
        const {dependencies, sequenceMap} = node.model;
        const parentId = node.parent.model.id;

        if(selectedNodeId && selectedNodeId != id) return null;

        let name = fullname ? fullname : getDefaultActivityName(subType);
        let hasDependencies = dependencies && dependencies.graph.nodes.length > 0;
        let isDraggable = !(allocedLookup && allocedLookup[id]);
        switch(pattType) {
            case PatternType.COMPOSITE: {
                let isDisabled = node.children.reduce((c, n) => c && allocedLookup && allocedLookup[n.model.id], true);
                let wrapperCls = classnames({
                    'patt-wrapper': true,
                    dragging: isDragging && dragId == id,
                });
                let labelCls = classnames({
                    label: true,
                    expandable: true,
                    expanded:  compositeExpand[id],
                    disabled: isDisabled,
                    draggable: isDraggable,
                });
                let compCls = classnames({
                    composite: true,
                    expanded: compositeExpand[id],
                    disabled: isDisabled,
                });
                let nodeProps = hasDependencies ? {
                    root,
                    dependentSource: dependencies.graph,
                    dependentSequence: sequenceMap,
                    allocedLookup,
                } : null;
                return (
                    <div className={wrapperCls}>
                        <div className="label-wrapper">
                            {this.connectDragSource(
                                isDraggable,
                                id,
                                <label className={labelCls} title={name}>
                                    {`${dependentSequence[id]} ${name}`}
                                </label>
                            )}
                            <span onClick={e => this.onCompositeExpand(e, id)}></span>
                        </div>
                        {
                            hasDependencies ?
                            <div className="composite-wrapper">
                            	<div className={compCls}>
                                    <ul><Node {...nodeProps}/></ul>
                            	</div>
                            </div> :
                            null
                        }
                    </div>
                );
            }
            case PatternType.ACTIVITY: {
                let wrapperCls = classnames({
                    'node-wrapper': true,
                    dragging: isDragging && dragId == id,
                });
                let spanCls = classnames(getPatternClassName(node), {
                    label: true,
                    activity: true,
                    draggable: isDraggable,
                    disabled: !isDraggable,
                });
                return this.connectDragSource(
                    isDraggable,
                    id,
                    <div className={wrapperCls}>
                        <a className="node">
                            <span className={spanCls} title={name}>{`${dependentSequence[id]} ${name}`}</span>
                        </a>
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
        return <div>{this.renderDependencies()}</div>;
    }
}
