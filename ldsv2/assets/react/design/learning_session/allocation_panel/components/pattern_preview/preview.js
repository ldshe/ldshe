import classnames from 'classnames';
import React, {Component} from 'react';
import {DragType} from '../../types';
import {createDraggable} from './draggable';
import Node from './node';

export const Draggable = createDraggable(DragType.UNALLOC_PATTERN);

export default class Preview extends Component {

    constructor(props, context) {
        super(props, context);
        this.startDragging = this.startDragging.bind(this);
        this.endDragging = this.endDragging.bind(this);
        this.expand = this.expand.bind(this);
        this.onCompositeExpand = this.onCompositeExpand.bind(this);
        this.connectDragSource = this.connectDragSource.bind(this);
        this.state = {
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

    expand(id) {
        const {filterExpanded} = this.props;
        const {expandFilterItem} = this.props;
        expandFilterItem(id, filterExpanded[id] ? false : true);
    }

    onCompositeExpand(e, id) {
        e.preventDefault();
        this.expand(id);
    }

    connectDragSource(isAllowDrag, id, el) {
        const {startDragging, endDragging} = this;
        const {root} = this.props;
        if(isAllowDrag) {
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

    render() {
        const {isDragging, dragId} = this.state;
        const {root, allocedLookup, filterExpanded} = this.props;
        const {expandFilterItem} = this.props;
        const {id, fullname, subType, dependencies, sequenceMap} = root.model;
        let name = fullname ? fullname : subType;
        let isDisabled = root.all(n => !n.isRoot()).reduce((c, n) => c && allocedLookup != undefined && allocedLookup[n.model.id] != undefined, true);
        let isAllowDrag = !root.all(n => !n.isRoot()).reduce((c, n) => c || (allocedLookup != undefined && allocedLookup[n.model.id] != undefined), false);
        let hasDependencies = dependencies && dependencies.graph.nodes.length > 0;
        let unitCls = classnames({
            unit: true,
            dragging: isDragging,
        });
        let labelCls = classnames({
            label: true,
            root: true,
            expandable: true,
            expanded: filterExpanded[id],
            disabled: isDisabled,
            draggable: isAllowDrag,
        });
        let compCls = classnames({
            composite: true,
            root: true,
            expanded: filterExpanded[id],
            disabled: isDisabled,
        });
        let nodeProps = hasDependencies ? {
            root,
            dependentSource: dependencies.graph,
            dependentSequence: sequenceMap,
            allocedLookup,
            initCompositeExpanded: filterExpanded,
            expandFilterItem,
        } : {};
        return (
            <div className={unitCls}>
                <div>
                    {this.connectDragSource(
                        isAllowDrag,
                        id,
                        <label className={labelCls} title={name}>
                            {name}
                        </label>
                    )}
                    <span onClick={e => this.onCompositeExpand(e, id)}></span>
                </div>
                <div className="composite-wrapper">
                    <div className={compCls}>
                        <ul><Node {...nodeProps}/></ul>
                    </div>
                </div>
            </div>
        );
    }
}
