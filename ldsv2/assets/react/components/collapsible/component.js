import classnames from 'classnames';
import React, {Component} from 'react';
import Animate from 'rc-animate';

export default class Collapsible extends Component {

    constructor(props, context) {
        super(props, context);
        this.onToggle = this.onToggle.bind(this);
        this.collapse = this.collapse.bind(this);
        this.expand = this.expand.bind(this);
        this.state = {
            isExpand: props.isExpand && true,
        }
    }

    collapse() {
        this.setState({isExpand: false});
    }

    expand() {
        this.setState({isExpand: true});
    }

    onToggle(e) {
        e.preventDefault();
        const {toggleCallBack, pos} = this.props;
        let isExpand = !this.state.isExpand;
        this.setState({isExpand});
        if(toggleCallBack) toggleCallBack(pos, isExpand);
    }

    render() {
        const {connectDragSource, title, className, children} = this.props;
        const {isExpand} = this.state;
        let contCls = classnames(Object.assign({}, {
            collapsible: true,
            panel: true,
            'panel-default': true,
            'draggable': connectDragSource && true,
        }, className ? className : {}));
        let headCls = classnames({
            'panel-heading': true,
            active: isExpand,
        });
        return (
            <div className={contCls}>
                <a href="#" onClick={e => this.onToggle(e)}>
                    <div className={headCls}>
                        {connectDragSource ? connectDragSource(<i className="drag fa fa-arrows"></i>) : null}
                        {title}
                    </div>
                </a>
                <Animate component="" transitionName="panel-body">
                    {
                        isExpand ?
                        <div className="panel-body">{children}</div> :
                        null
                    }
                </Animate>
            </div>
        );
    }
}
