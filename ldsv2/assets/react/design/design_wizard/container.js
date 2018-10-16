import classnames from 'classnames';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Config} from 'js/util';
import Wizard from 'react/components/wizard';
import CourseStep from '../course_step';
import UnitStep from '../unit_step';
import SessionStep from '../session_step';
import {Step, StateName} from './types';
import WizardContext from './context';
import {stepBack, stepNext, jumpTo} from './actions';

const ref = {};

const wizardContext = {
    getWizard: () => ref.wizard,
};

class DesignWizard extends Component {

    constructor(props, context) {
        super(props, context);
        this.onStepBack = this.onStepBack.bind(this);
        this.onStepNext = this.onStepNext.bind(this);
        this.onJump = this.onJump.bind(this);
        this.setStepStatus = this.setStepStatus.bind(this);
        this.renderStep = this.renderStep.bind(this);
        this.renderHeader = this.renderHeader.bind(this);
        this.renderCurrentStep = this.renderCurrentStep.bind(this);
    }

    componentDidMount() {
        const {handleJump} = this.props;
        ref.wizard = {
            jumpTo: step => {handleJump(step)},
        };
    }

    onStepBack(e) {
        e.preventDefault();
        const {handleStepBack} = this.props;
        handleStepBack();
    }

    onStepNext(e) {
        e.preventDefault();
        const {handleStepNext} = this.props;
        handleStepNext();
    }

    onJump(e, step) {
        e.preventDefault();
        const {handleJump} = this.props;
        handleJump(step);
    }

    setStepStatus(inStep) {
        const {step} = this.props;
        return classnames({
            ['wizard-step step-'+step.total+' active']: inStep == step.current,
            ['wizard-step step-'+step.total+' activated']: inStep != step.current && inStep <=  step.max,
            ['wizard-step step-'+step.total+' unactivated']: inStep >  step.max
        });
    }

    renderStep(inStep, partial) {
        const {step} = this.props;
        if(inStep <= step.max && inStep != step.current)
            return  <a key={inStep} href="#" onClick={e => {this.onJump(e, inStep)}}>{partial}</a>;
        else
            return <div key={inStep}>{partial}</div>;
    }

    renderHeader() {
        return [
            this.renderStep(Step.COURSE,
                <div className={this.setStepStatus(Step.COURSE)}>
                    <div className="wizard-step-icon">
                        <i className="fa fa-leanpub"></i>
                    </div>
                    <p>Course</p>
                </div>
            ),
            this.renderStep(Step.UNIT,
                <div className={this.setStepStatus(Step.UNIT)}>
                    <div className="wizard-step-icon">
                        <i className="fa fa-object-group"></i>
                    </div>
                    <p>Strategic Components and Tasks</p>
                </div>
            ),
            this.renderStep(Step.SESSION,
                <div className={this.setStepStatus(Step.SESSION)}>
                    <div className="wizard-step-icon">
                        <i className="fa fa-calendar"></i>
                    </div>
                    <p>Session Organization</p>
                </div>
            )
        ];
    }

    renderCurrentStep() {
        const {step} = this.props;
        switch(step.current) {
            case Step.COURSE: {
                return <CourseStep ref="courseStep"/>;
            }
            case Step.UNIT: {
                return <UnitStep ref="unitStep"/>;
            }
            case Step.SESSION: {
                return <SessionStep ref="sessionStep"/>;
            }
        }
    }

    render() {
        const {step} = this.props;
        let header = this.renderHeader();
        let content = this.renderCurrentStep();
        const wizProps = {
            header,
            step,
            onStepBack: this.onStepBack,
            onStepNext: this.onStepNext,
        }
        return (
            <WizardContext.Provider value={wizardContext}>
                <Wizard {...wizProps}>{content}</Wizard>
            </WizardContext.Provider>
        );
    }
}

const mapStateToProps = state => ({
    step: Config.get(state, StateName.DESIGN_STEP),
});

const mapDispatchToProps = dispatch => ({
    handleStepBack: () => dispatch(stepBack()),
    handleStepNext: () => dispatch(stepNext()),
    handleJump: step => dispatch(jumpTo(step)),
});

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(DesignWizard);
