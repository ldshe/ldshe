import classnames from 'classnames';
import React, {Component} from 'react';
import _ from 'lodash';
import TreeModel from 'tree-model';
import {graph} from '../graph';
import Node from './node';

export default class Preview extends Component {

    constructor(props, context) {
        super(props, context);
        this.propagateExpand = this.propagateExpand.bind(this);
        this.onCompositeExpand = this.onCompositeExpand.bind(this);
        this.onCompositeSelect = this.onCompositeSelect.bind(this);
        this.state = {
            compositeExpand: true,
        };

        this.changeLevel = props.changeLevel ? props.changeLevel : () => {};
        this.selectChild = props.selectChild ? props.selectChild : () => {};
        this.keepNavigationActive = props.keepNavigationActive ? props.keepNavigationActive : () => {};
    }

    shouldComponentUpdate(nextProps, nextState) {
        return !_.isEqual(this.props, nextProps) || !_.isEqual(this.state, nextState);
    };

    propagateExpand() {
        this.setState({compositeExpand: true});
    }

    onCompositeExpand(e) {
        e.preventDefault();
        this.setState({compositeExpand: !this.state.compositeExpand});
    }

    onCompositeSelect(e, id) {
        e.preventDefault();
        this.changeLevel(id);
    }

    render() {
        const {compositeExpand, navPath} = this.state;
        const {root, curr, selectedChildId} = this.props;
        const {id, fullname, subType, dependencies, sequenceMap} = root.model;
        let name = fullname ? fullname : subType;
        let labelCls = classnames({
            label: true,
            root: true,
            expandable: true,
            expanded: compositeExpand,
            current: curr && id == curr.model.id,
        });
        let compCls = classnames({
            composite: true,
            root: true,
            expanded: compositeExpand,
            current: curr && id == curr.model.id,
        });
        let nodeProps = (dependencies && dependencies.graph.nodes.length > 0) ? {
            root,
            curr,
            selectedChildId,
            dependentSource: dependencies.graph,
            dependentSequence: sequenceMap,
            changeLevel: this.changeLevel,
            selectChild: this.selectChild,
            keepNavigationActive: this.keepNavigationActive,
            parentPropagateExpand: this.propagateExpand,
        } : {};
        let hasDependencies = dependencies && dependencies.graph.nodes.length > 0;
        return (
            <div>
                <label className={labelCls} onClick={e => this.onCompositeSelect(e, id)} title={name}>
                    {name}
                </label>
                {hasDependencies ? <span onClick={e => this.onCompositeExpand(e)}></span> : null}
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
}
