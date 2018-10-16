import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Config} from 'js/util';
import {StateName as ContextStateName} from 'react/design/learning_context/types';
import {StateName as OutcomeStateName} from 'react/design/learning_outcome/types';
import {StateName as UnitStateName} from 'react/design/learning_unit/pedagogical_sequence/types';
import {StateName as PattStateName} from 'react/design/learning_unit/design_panel/types';
import {StateName as SessionStateName} from 'react/design/learning_session/allocation_panel/types';
import Context from './components/context';
import Purpose from './components/purpose';
import Outcome from './components/outcome';
import Assessment from './components/assessment';
import Session from './components/session';

class DesignPrintable extends Component {

    constructor(props, context) {
        super(props, context);
    }

    componentDidMount() {
        setTimeout(() => window.print(), 0);
    }

    render() {
        const {course, outcome, unit, patternInstance, session} = this.props;
        const {title} = course.data;
        const ctxProps = {course};
        const loProps = {outcome};
        const unitProps = {outcome, unit, patternInstance};
        const sessProps = {session, patternInstance};
        return (
            <div className="dp">
                <div className="header">
                    <h3><i>{title}</i></h3>
                </div>
                <div className="section">
                    <Context {...ctxProps}/>
                </div>
                <div className="section">
                    <Purpose {...ctxProps}/>
                </div>
                <div className="section">
                    <Outcome {...loProps}/>
                </div>
                <div className="section">
                    <Assessment {...unitProps}/>
                </div>
                <div className="section">
                    <Session {...sessProps}/>
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => ({
    course: Config.get(state, ContextStateName.LEARNING_CONTEXT),
    outcome: Config.get(state, OutcomeStateName.LEARNING_OUTCOME),
    unit: Config.get(state, UnitStateName.LEARNING_UNIT),
    session: Config.get(state, SessionStateName.LEARNING_SESSION),
    patternInstance: Config.get(state, PattStateName.LEARNING_UNIT_PATTERN_INSTANCE),
});


export default connect(
    mapStateToProps,
    null,
)(DesignPrintable);
