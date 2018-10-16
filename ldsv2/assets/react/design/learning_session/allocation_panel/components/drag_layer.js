import classnames from 'classnames';
import React, {Component} from 'react';
import {DragLayer} from 'react-dnd';
import {getPatternClassName, getDefaultActivityName} from 'react/design/learning_unit/design_panel/util';
import {PatternType} from 'react/design/learning_unit/design_panel/types';
import {DragType} from '../types';

class Layer extends Component {

    constructor(props, context) {
        super(props, context);
        this.getStyles = this.getStyles.bind(this);
        this.renderNode = this.renderNode.bind(this);
    }

    componentDidUpdate() {
        $().clearSelection();
    }

    getStyles() {
        const {currentOffset} = this.props;
        if(!currentOffset) return {display: 'none'};
        let {x, y} = currentOffset;
        let transform = `translate(${x}px, ${y}px)`;
        return {
            transform,
            WebkitTransform: transform,
            position: 'absolute',
        }
    }

    renderNode() {
        const {item} = this.props;
        const {root, pattId} = item;
        const isRoot = root.model.id == pattId;
        const node = isRoot ? root : root.first(n => n.model.id == pattId);
        let labelName, type;
        if(isRoot) {
            const {pattType, subType, fullname} = root.model;
            type = pattType;
            labelName = fullname ? fullname : subType;
        } else {
            const {id, pattType, subType, fullname} = node.model;
            const {sequenceMap} = node.parent.model;
            type = pattType;
            labelName = `${sequenceMap[id]} ${fullname ? fullname : getDefaultActivityName(subType)}`;
        }

        switch(type) {
            case PatternType.COMPOSITE: {
                let wrapperCls = classnames({
                    'patt-wrapper': true,
                });
                let labelCls = classnames({
                    root: isRoot,
                    label: true,
                    expandable: true,
                });
                let compCls = classnames({
                    composite: true,
                    expanded: false,
                });
                return (
                    <div className={wrapperCls}>
                        <div className="label-wrapper">
                            <label className={labelCls}>{labelName}</label>
                        </div>
                    </div>
                );
            }
            case PatternType.ACTIVITY: {
                let wrapperCls = classnames({
                    'node-wrapper': true,
                });
                let spanCls = classnames(getPatternClassName(node), {
                    label: true,
                    activity: true,
                });
                return (
                    <div className={wrapperCls}>
                        <a className="node">
                            <span className={spanCls}>{labelName}</span>
                        </a>
                    </div>
                );
            }
        };
    }

    render() {
        const {isDragging, itemType} = this.props;

        if(itemType != DragType.UNALLOC_PATTERN &&
                itemType != DragType.MOVE_STAGE_ITEM) return null;

        return isDragging ?
            <div className="drag-layer">
                <div className="drag-inner-layer" style={this.getStyles()}>
                    {this.renderNode()}
                </div>
            </div> :
            null;
    }
}

export default DragLayer(monitor => ({
    item: monitor.getItem(),
    itemType: monitor.getItemType(),
    currentOffset: monitor.getSourceClientOffset(),
    isDragging: monitor.isDragging(),
}))(Layer);
