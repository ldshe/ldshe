import alertify from 'alertify.js';
import React, {Component} from 'react';

export default class Alertify extends Component {

    constructor(props, context) {
        super(props, context);
        this.confirm = this.confirm.bind(this);
    }

    confirm(props) {
        const {okLabel, cancelLabel, iconClass, confirmAction, cancelAction, title, subTitle} = props;
        let confirm = confirmAction ? confirmAction : () => {};
        let cancel = cancelAction ? cancelAction : () => {};
        let content =
        `<div class="row msg">
            <div class="col-sm-2 col-sm-offset-1 icon">
                <i class="fa ${iconClass}"></i>
            </div>
            <div class="col-sm-9">
                <h4 class="title">${title}</h4>
                <p class="sub-title">${subTitle}</p>

            </div>
        </div>`;
        alertify.theme('bootstrap')
            .okBtn(okLabel)
            .cancelBtn(cancelLabel)
            .confirm(content,
                e => {
                    e.preventDefault();
                    confirm();
                },
                e => {
                    e.preventDefault();
                    cancel();
                },
            );
    }

    render() {
        return <div></div>;
    }
}
