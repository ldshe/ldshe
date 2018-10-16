import classnames from 'classnames';
import React, {Component} from 'react';

export default class AdditionalUrl extends Component {

    constructor(props, context) {
        super(props, context);
        this.renderPreview = this.renderPreview.bind(this);
    }

    renderPreview() {
        const {title, url} = this.props;
        let link;
        if(title && url)
            link = <a href={url} target="_blank">{title}</a>;
        else if(title || url)
            link = <a href={url || ''} target="_blank" onClick={url ? null : e => e.preventDefault()}>{title || url}</a>;
        else
            link = null;
        return (
            <div>
                <i className="fa fa-link"></i>
                {' '}
                {link}
            </div>
        );
    }

    render() {
        return this.renderPreview();
    }
}
