import classnames from 'classnames';
import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import MultiClamp from 'multi-clamp';
import {DragType} from '../../types';
import {createItemSortable} from './item_sortable';
import Item from './item';

const SortableItem = createItemSortable(DragType.MOVE_STAGE_ITEM);

export default class Group extends Component {

    static getDerivedStateFromProps(nextProps, prevState) {
        if(prevState.id != nextProps.parent.model.id) {
            return {
                id: nextProps.parent.model.id,
                clampTitle: true,
            };
        } else {
            return {
                clampTitle: false,
            };
        }
    }

    constructor(props, context) {
        super(props, context);
        this.clampTitleLabel = this.clampTitleLabel.bind(this);
        this.state = {
            id: null,
            clampTitle: false,
        };
    }

    componentDidMount() {
        const {clampTitle} = this.state;
        this.clampTitleLabel();
    }

    componentDidUpdate() {
        const {clampTitle} = this.state;
        if(clampTitle)
            this.clampTitleLabel();
    }

    clampTitleLabel() {
        let label = ReactDOM.findDOMNode(this.titleLabel);
        new MultiClamp(label, {
          ellipsis: '...',
          clamp: 2
        });
    }

    renderGroup(data) {
        const {sessId, stageType, compositeExpanded, unitId, root, parent, selectedItemIds, startPos} = this.props;
        const {expandStageItem, editStageItem, reorderStageItem, removeStageItem} = this.props;
        const paths = parent.getPath()
            .map(n => {
                let {id, fullname, subType} = n.model;
                let name = fullname ? fullname : subType;
                if(!n.isRoot()) {
                    let {id, fullname, subType} = n.model;
                    return `${n.parent.model.sequenceMap[id]} ${name}`;
                } else {
                    return name;
                }
            })
            .map((p, i) => i==0 ? p : ` > ${p}`)
            .join('');
        const {dependencies, sequenceMap} = parent.model;
        let labelCls = classnames({
            label: true,
            expanded: true,
        });
        let compCls = classnames({
            composite: true,
            expanded: true,
        });
        let hasDependencies = dependencies && dependencies.graph.nodes.length > 0;
        let pos = startPos;
        return (
            <div className="stage-group">
                <label ref={label => this.titleLabel = label} className={labelCls} title={paths}>
                    {paths}
                </label>
                <div className="composite-wrapper">
                    <div className={compCls}>
                        <ul>{
                            hasDependencies?
                            selectedItemIds.map(selectedItemId => {
                                let sortProps = {
                                    key: selectedItemId,
                                    root,
                                    pattId: selectedItemId,
                                    sessId,
                                    stageType,
                                    pos: pos++,
                                    reorderStageItem,
                                };
                                let itemProps = {
                                    unitId,
                                    root,
                                    selectedItemId,
                                    dependentSource: dependencies.graph,
                                    dependentSequence: sequenceMap,
                                    sessId,
                                    stageType,
                                    initCompositeExpanded: compositeExpanded,
                                    removeStageItem,
                                    editStageItem,
                                    expandStageItem,
                                };
                                return (
                                    <SortableItem {...sortProps}>
                                        <Item {...itemProps}/>
                                    </SortableItem>
                                );
                            }) :
                            null
                        }</ul>
                    </div>
                </div>
            </div>
        );
    }

    render() {
        return this.renderGroup();
    }
}
