import React, {Component} from 'react';

export default class StackedPanel extends Component {

    constructor(props, context) {
        super(props, context);
        this.onPathJump = this.onPathJump.bind(this);
        this.renderNavPath = this.renderNavPath.bind(this);
        this.renderPathLink = this.renderPathLink.bind(this);
    }

    onPathJump(e, panel) {
        e.preventDefault();
        const {jumpToPanel} = this.props;
        jumpToPanel(panel);
    }

    renderPathLink(panel, title, subTitle, pos, last) {
        let titleEl = subTitle ? <div className="sub-title">{title}<small>{ subTitle}</small></div> : title;
        return (
            <li key={pos} className={pos==last && pos !=0 ? 'active' : ''}>{
                last > 0 && pos != last ?
                <a href="#" onClick={e => this.onPathJump(e, panel)}>{titleEl}</a> :
                titleEl
            }</li>
        );
    }

    renderNavPath() {
        const {panelType, panels, currPanel} = this.props;
        return (
            (panels.length > 0) ?
            <ol className="breadcrumb">{
                panels.map((p, i) => {
                    let last = panels.length-1;
                    let panel = p.panel;
                    let title = panelType[panel].title || (p.opts && p.opts.title) || null;
                    let subTitle = null;
                    if(currPanel &&
                        panel == currPanel.panel &&
                        currPanel.opts &&
                        currPanel.opts.subTitle) {
                            subTitle = currPanel.opts.subTitle;
                        }
                    return this.renderPathLink(panel, title, subTitle, i, last);
                })
            }</ol> :
            null
        );
    }

    render() {
        const {className, children} = this.props;
        return (
            <div className={className}>
                {this.renderNavPath()}
                {children}
            </div>
        );
    }
}
