import classnames from 'classnames';
import React, {Component} from 'react';
import _ from 'lodash';
import {Graph, alg, json} from 'graphlib';
import {isDblTouchTap} from 'js/util';
import {getPatternClassName, getDefaultActivityName} from '../../util';
import {PatternType} from '../../types';

export default class Node extends Component {

    constructor(props, context) {
        super(props, context);
        this.expand = this.expand.bind(this);
        this.propagateExpand = this.propagateExpand.bind(this);
        this.onCompositeExpand = this.onCompositeExpand.bind(this);
        this.onCompositeSelect = this.onCompositeSelect.bind(this);
        this.onChildSelect = this.onChildSelect.bind(this);
        this.renderByType = this.renderByType.bind(this);
        this.renderDependencies = this.renderDependencies.bind(this);
        this.state = {
            compositeExpand: {},
        };
        this.propagated = true;
    }

    shouldComponentUpdate(nextProps, nextState) {
        return !_.isEqual(this.props, nextProps) || !_.isEqual(this.state, nextState);
    };

    getSnapshotBeforeUpdate(prevProps, prevState) {
        const prevCurr = prevProps.curr;
        const {curr} = this.props;
        if(prevCurr != curr)
            return {propagated: false};
        return {propagated: true};
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const {curr} = this.props;
        if(!snapshot.propagated) this.propagated = false;
        if(curr && !this.propagated)
            this.propagateExpand(curr);
    }

    expand(id, def=null) {
        let compositeExpand = Object.assign({}, this.state.compositeExpand);
        if(def == null)
            compositeExpand[id] = !compositeExpand[id];
        else
            compositeExpand[id] = def;
        this.setState({compositeExpand});
    }

    propagateExpand(curr) {
        this.propagated = true;
        const {parentPropagateExpand} = this.props;
        const {pattType, id} = curr.model;
        if(pattType == PatternType.COMPOSITE)
            this.expand(id, true);
        parentPropagateExpand(curr.parent);
    }

    onCompositeExpand(e, id) {
        e.preventDefault();
        this.expand(id);
    }

    onCompositeSelect(e, parentId, id, keepNav=true) {
        e.preventDefault();
        const {changeLevel, selectChild, keepNavigationActive} = this.props;
        changeLevel(parentId);
        selectChild(id);
        if(keepNav) keepNavigationActive();
    }

    onChildSelect(e, id, keepNav=true) {
        e.preventDefault();
        const {changeLevel, keepNavigationActive} = this.props;
        changeLevel(id);
        if(keepNav) keepNavigationActive();
    }

    renderByType(source, key) {
        const {compositeExpand} = this.state;
        const {root, curr, selectedChildId, changeLevel, keepNavigationActive, dependentSequence} = this.props;
        const node = root.first(n => n.model.id == source.id);
        const {id, pattType, subType, fullname} = node.model;
        const {dependencies, sequenceMap} = node.model;
        const parentId = node.parent.model.id;
        let name = fullname ? fullname : getDefaultActivityName(subType);
        switch(pattType) {
            case PatternType.COMPOSITE: {
                let wrapperCls = classnames({
                    'label-wrapper': true,
                });
                let labelCls = classnames({
                    label: true,
                    expandable: true,
                    expanded: compositeExpand[id],
                    current: curr && id == curr.model.id,
                    selected: id == selectedChildId,
                });
                let compCls = classnames({
                    composite: true,
                    expanded: compositeExpand[id],
                    current: curr && id == curr.model.id,
                });
                let nodeProps = (dependencies && dependencies.graph.nodes.length > 0) ? {
                    root,
                    dependentSource: dependencies.graph,
                    dependentSequence: sequenceMap,
                    selectedChildId,
                    changeLevel,
                    keepNavigationActive,
                } : null;
                return (
                    <div>
                        <div className={wrapperCls}>
                            <label className={labelCls}
                                title={name}
                                onClick={e => {
                                    if($.support.touch && isDblTouchTap(e)) {
                                        this.onCompositeSelect(e, parentId, id, false);
                                        return;
                                    }
                                    this.onCompositeSelect(e, parentId, id);
                                }}
                                onDoubleClick={e => this.onCompositeSelect(e, parentId, id, false)}>
                                {`${dependentSequence[id]} ${name}`}
                            </label>
                            <span onClick={e => this.onCompositeExpand(e, id)}></span>
                        </div>
                        {(dependencies && dependencies.graph.nodes.length > 0) ?
                            <div className="composite-wrapper">
                            	<div className={compCls}>
                                    <ul><Node {...nodeProps}/></ul>
                            	</div>
                            </div> :
                            null}
                    </div>
                );
            }
            case PatternType.ACTIVITY: {
                let spanCls = classnames(getPatternClassName(node), {
                    selected: id == selectedChildId,
                    label: true,
                    activity: true,
                });
                return (
                    <a className="node" href="#"
                        onClick={e => {
                            if($.support.touch && isDblTouchTap(e)) {
                                this.onChildSelect(e, id, false);
                                return;
                            }
                            this.onChildSelect(e, id);
                        }}
                        onDoubleClick={e => this.onChildSelect(e, id, false)}>
                        <span className={spanCls} title={name}>{`${dependentSequence[id]} ${name}`}</span>
                    </a>
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
