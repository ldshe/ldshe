import classnames from 'classnames';
import React, {Component} from 'react';
import {Graph, alg, json} from 'graphlib';
import {getPatternClassName, getDefaultActivityName} from 'react/design/learning_unit/design_panel/util';
import {PatternType, SocialOrganization} from 'react/design/learning_unit/design_panel/types';
import {getSocialOrganizationName, getMotivatorName, getResourceName} from 'react/design/learning_unit/design_panel/util.js';

export default class Item extends Component {

    constructor(props, context) {
        super(props, context);
        this.renderByType = this.renderByType.bind(this);
        this.renderDependencies = this.renderDependencies.bind(this);
    }

    renderByType(source, key) {
        const {root, selectedItemId, dependentSequence} = this.props;
        const node = root.first(n => n.model.id == source.id);
        const {id, pattType, subType, fullname, description, socialOrganization, motivators, duration, resources} = node.model;
        const {dependencies, sequenceMap} = node.model;
        const parentId = node.parent.model.id;

        if(selectedItemId && selectedItemId != id) return null;

        let name = fullname ? fullname : getDefaultActivityName(subType);
        let hasDependencies = dependencies && dependencies.graph.nodes.length > 0;
        switch(pattType) {
            case PatternType.COMPOSITE: {
                let wrapperCls = classnames({
                    'label-wrapper': true,
                });
                let compCls = classnames({
                    composite: true,
                });
                let itemProps = hasDependencies ? {
                    root,
                    dependentSource: dependencies.graph,
                    dependentSequence: sequenceMap,
                } : null;
                return (
                    <div>
                        <div className={wrapperCls}>
                            {`${name}`}
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
                let spanCls = classnames(getPatternClassName(node), {
                    activity : true,
                });
                return (
                    <div className="node-wrapper">
                        <div className="node">
                            <div className="patt">
                                <div className="title"><span className={spanCls} title={name}>{`${name}`}</span></div>
                                <div className="description"><span>{description ? description : '　'}</span></div>
                            </div>
                            <div className="settings">
                                <ul className="activity">
                                    <li>
                                        <span>
                                            <i className={socialOrganization == SocialOrganization.INDIVIDUAL ? 'fa fa-user' : 'fa fa-users'}></i>
                                            {` ${getSocialOrganizationName(socialOrganization)}`}
                                        </span>
                                    </li>
                                    <li>
                                        <span>
                                            <i className="fa fa-line-chart"></i>
                                            {` ${motivators.map(m => getMotivatorName(m)).join(', ')}`}
                                        </span>
                                    </li>
                                    <li>
                                        <span>
                                            <i className="fa fa-clock-o"></i>
                                            {` ${duration ? duration : 0} mins`}
                                        </span>
                                    </li>
                                    <li>
                                        <span>
                                            <i className="fa fa-database"></i>
                                            {` ${resources.map(r => getResourceName(r)).join(', ')}`}
                                        </span>
                                    </li>
                                </ul>
                            </div>
                        </div>
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
        return nodes.map((n, i) => {
            let el = this.renderByType(n);
            return el ?
                <li key={i}>{el}</li> :
                <li key={i} className="empty">{el}</li>;
        });
    }

    render() {
        const {rootItem} = this.props;
        let itemCls = classnames({
            'item': true,
            'sub-item': !rootItem,
        });
        return <div className={itemCls}>{this.renderDependencies()}</div>;
    }
}
