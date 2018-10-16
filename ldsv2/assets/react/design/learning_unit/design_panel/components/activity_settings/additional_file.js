import classnames from 'classnames';
import React, {Component} from 'react';

export default class AdditionalFile extends Component {

    constructor(props, context) {
        super(props, context);
        this.renderPreview = this.renderPreview.bind(this);
    }

    renderPreview() {
        const {title, file} = this.props;
        let link;

        if(file && file.id) {
            let url = `/api/lds/files/${file.id}`;
            link = <a href={url} target="_blank">{title || file.name}</a>;
        } else {
            if(title) {
                link = <a href="" onClick={e => e.preventDefault()}>{title}</a>;
            } else {
                link = null;
            }
        }
        return (
            <div>
                <i className="fa fa-file-o"></i>
                {' '}
                {link}
            </div>
        );
    }

    render() {
        return this.renderPreview();
    }
}
