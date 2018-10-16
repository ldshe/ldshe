import classnames from 'classnames';
import React, {Component} from 'react';

export default class Wizard extends Component {

    constructor(props, context) {
        super(props, context);
        this.setStepProgress = this.setStepProgress.bind(this);
        this.setStepBackVisible = this.setStepBackVisible.bind(this);
        this.setStepNextVisible = this.setStepNextVisible.bind(this);
        this.onStepBack = this.onStepBack.bind(this);
        this.onStepNext = this.onStepNext.bind(this);
    }

    setStepProgress() {
        const {step} = this.props;
        return classnames({
            'wizard-progress-line': true,
            ['step-'+step.total+'-'+step.max]: true,
        });
    }

    setStepBackVisible() {
        const {step} = this.props;
        return {
            display: (step.current == 1 ? 'none' : 'block')
        };
    }

    setStepNextVisible() {
        const {step} = this.props;
        return {
            display: (step.current == step.total ? 'none' : 'block')
        };
    }

    onStepBack(e) {
        e.preventDefault();
        const {onStepBack} = this.props;
        onStepBack();
    }

    onStepNext(e) {
        e.preventDefault();
        const {onStepNext} = this.props;
        onStepNext();
    }

    render() {
        const {header, children} = this.props;
        const {onStepBack, onStepNext} = this.props;
        return (
            <div className="wizard">
                <div className="wizard-steps">
            		<div className="wizard-progress">
            		    <div className={this.setStepProgress()}></div>
            		</div>
                    {header}
            	</div>
                {children}
                <nav>
                    <ul className="pager">
                        <li className="previous">
                            <a href="#" onClick={e => onStepBack(e)} style={this.setStepBackVisible()}><span>&larr;</span> Back</a>
                        </li>
                        <li className="next next-primary">
                            <a href="#" onClick={e => onStepNext(e)} style={this.setStepNextVisible()}>Next <span>&rarr;</span></a>
                        </li>
                    </ul>
                </nav>
            </div>
        );
    }
}
