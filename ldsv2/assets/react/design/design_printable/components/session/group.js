import classnames from 'classnames';
import React, {Component} from 'react';
import {PatternType} from 'react/design/learning_unit/design_panel/types';
import Item from './item';

export default class Group extends Component {
    constructor(props, context) {
        super(props, context);
    }

    render() {
        const {root, parent, selectedItemId} = this.props;
        const {dependencies, sequenceMap} = parent.model;
        let hasDependencies = dependencies && dependencies.graph.nodes.length > 0;
        let itemProps = {
            root,
            selectedItemId,
            dependentSource: dependencies.graph,
            dependentSequence: sequenceMap,
            rootItem: true,
        };
        let activities = root.first(n => n.model.id == selectedItemId)
            .all(n => n.model.pattType == PatternType.ACTIVITY);
        let duration = activities.reduce((c, {model}) => c + (model.duration ? model.duration : 0), 0);
        return (
            <div className="group">
                <div className="duration">
                    {`${duration} mins`}
                </div>
                <ul className="patt">{
                    hasDependencies ?
                    <Item {...itemProps}/> :
                    null
                }</ul>
            </div>
        );
    }
}
