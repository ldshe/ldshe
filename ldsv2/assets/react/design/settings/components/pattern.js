import React, {Component} from 'react';
import Settings from './settings';

export default class Pattern extends Component {

    constructor(props, context) {
        super(props, context);
        this.buildSharedLink = this.buildSharedLink.bind(this);
        this.show = this.show.bind(this);
    }

    buildSharedLink(id) {
        const {protocol, hostname, port, pathname} = location;
        if(port) {
            return `${protocol}//${hostname}:${port}${pathname}#/pattern/preview/${id}`;
        } else {
            return `${protocol}//${hostname}${pathname}#/pattern/preview/${id}`;
        }
    }

    show() {
        this.settings.show();
    }

    render() {
        const props = Object.assign({}, this.props, {
            buildSharedLink: this.buildSharedLink,
        });
        return <Settings ref={settings => this.settings = settings} {...props}/>;
    }
}
