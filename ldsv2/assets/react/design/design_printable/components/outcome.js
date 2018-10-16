import React, {Component} from 'react';
import {LearningOutcomeTypes, LearningOutcomes} from 'react/design/learning_outcome/types';

export default class Outcome extends Component {

    constructor(props, context) {
        super(props, context);
        this.renderOutcome =  this.renderOutcome.bind(this);
    }

    renderOutcome() {
        const {outcome} = this.props;
        let data = [];
        outcome.data.forEach((d, i) => {
            let o = Object.assign({}, d, {pos: i});
            data.push(o);
        });
        let result = {};
        Object.keys(LearningOutcomeTypes)
            .forEach(k => {
                let los = data.filter(d => d.type == LearningOutcomeTypes[k]);
                let group = LearningOutcomes.filter(o => o.value == LearningOutcomeTypes[k])[0].name;
                result[group] = los;
            })
        return (
            <div>{
                Object.keys(result)
                    .map((g, i) => {
                        let los = result[g];
                        if(los.length > 0) {
                            return (
                                <div key={i} className="sub-section">
                                    <div className="heading">{g}</div>
                                    {los.map(lo => {
                                        return (
                                            <div key={lo.id} className="content">
                                                <span>{`LO${lo.pos+1}: `}</span>
                                                {lo.description}
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        } else {
                            return null;
                        }
                    })
            }</div>
        );
    }

    render() {
        return (
            <div className=" outcome">
                <h4>Specific intended Learning Outcomes</h4>
                {this.renderOutcome()}
            </div>
        );
    }
}
