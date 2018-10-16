import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Config} from 'js/util';
import EditContext from 'react/app/design/context/edit';
import {StateName as WizardStateName} from '../design_wizard/types';
import WizardContext from '../design_wizard/context';
import LearningContext from '../learning_context';
import LearningOutcome from '../learning_outcome';
import {PedagogicalSequence} from '../learning_unit';

class CourseStep extends Component {

    constructor(props, context) {
        super(props, context);
    }

    componentDidMount() {
        $(window).scrollTop(0);
    }

    render() {
        return (
            <EditContext.Consumer>{
                editCtx => (
                    <WizardContext.Consumer>{
                        ({getWizard}) => (
                            <div className="cs">
                                <LearningContext {...editCtx}/>
                                <LearningOutcome {...editCtx}/>
                                <PedagogicalSequence {...editCtx} getWizard={getWizard}/>
                            </div>
                        )
                    }</WizardContext.Consumer>
                )
            }</EditContext.Consumer>
        );
    }
}

const mapStateToProps = state => ({
    step: Config.get(state, WizardStateName.DESIGN_STEP),
});

export default connect(
    mapStateToProps,
    null,
)(CourseStep);
