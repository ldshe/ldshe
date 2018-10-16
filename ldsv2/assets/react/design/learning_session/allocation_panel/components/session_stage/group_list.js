import md5 from 'md5';
import React, {Component} from 'react';
import Group from './group';

export default class GroupList extends Component {

    constructor(props, context) {
        super(props, context);
        this.renderGroup = this.renderGroup.bind(this);
        this.renderList = this.renderList.bind(this);
    }

    shouldComponentUpdate(nextProps, nextState) {
        return !_.isEqual(this.props.pattIds, nextProps.pattIds);
    }

    renderGroup(data) {
        const {unitId, root, parent, selectedItemIds, startPos} = data;
        const {sessId, stageType, compositeExpanded} = this.props;
        const {expandStageItem, editStageItem, reorderStageItem, removeStageItem} = this.props;
        let props = {
            key: md5(selectedItemIds.join('')),
            unitId, root, parent, selectedItemIds, startPos,
            sessId, stageType, compositeExpanded,
            expandStageItem, editStageItem, reorderStageItem, removeStageItem,
        };
        return <Group {...props}/>;
    }

    renderList() {
        const {userPatts, compositeExpanded, pattIds} = this.props;
        let groups = [];
        let lastUnitId;
        let lastRoot;
        let lastParent;
        let lastGroupIds = [];
        pattIds.forEach(id => {
            let unitId, root, node;
            userPatts.forEach(u => {
                let n = u.patt.first(n => n.model.id == id);
                if(n) {
                    unitId = u.id;
                    root = u.patt;
                    node = n;
                }
            });
            if(!node) return;
            let {parent} = node;
            if(lastParent && lastParent.model.id == parent.model.id) {
                lastGroupIds.push(node.model.id);
            } else {
                if(lastGroupIds.length > 0) {
                    groups.push({
                        unitId: lastUnitId,
                        root: lastRoot,
                        parent: lastParent,
                        ids: lastGroupIds,
                    });
                }
                lastUnitId = unitId;
                lastRoot = root;
                lastParent = parent;
                lastGroupIds = [node.model.id];
            }
        });
        if(lastGroupIds.length > 0) {
            groups.push({
                unitId: lastUnitId,
                root: lastRoot,
                parent: lastParent,
                ids: lastGroupIds,
            });
        }
        let startPos = 0;
        return groups.map(({unitId, root, parent, ids}) => {
            let data = {
                unitId,
                root,
                parent,
                selectedItemIds: ids,
                startPos,
            }
            startPos += ids.length;
            return this.renderGroup(data);
        });
    }

    render() {
        return <div>{this.renderList()}</div>;
    }
}
