import React, {Component} from 'react';

export default class Purpose extends Component {

    constructor(props, context) {
        super(props, context);
    }

    render() {
        const {purpose} = this.props.course.data;
        return (
            <div className="purpose">
                <h4>Purpose of the Course</h4>
                <div className="content">
                    {purpose}
                </div>
            </div>
        );
    }
}
