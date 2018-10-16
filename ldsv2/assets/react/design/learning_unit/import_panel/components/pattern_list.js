import classnames from 'classnames';
import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import {Panel} from '../types';

export default class PatternList extends Component {

    static getDerivedStateFromProps(nextProps, prevState) {
        if(prevState.isLoading && prevState.loadedNum != nextProps.modal.loadedNum) {
            return {
                isLoading: false,
                loadedNum: nextProps.modal.loadedNum,
            };
        }
        return null;
    }

    constructor(props, context) {
        super(props, context);
        this.onDetails = this.onDetails.bind(this);
        this.onImexport = this.onImexport.bind(this);
        this.renderLoading = this.renderLoading.bind(this);
        this.renderItem = this.renderItem.bind(this);
        this.renderList = this.renderList.bind(this);
        this.state = {
            isLoading: false,
            loadedNum: 0,
        }
    }

    componentDidMount() {
        const {scrollTop} = this.props.modal;
        const {userPatts} = this.props.globalPattern;
        const {loadList} = this.props;
        let $group = $(ReactDOM.findDOMNode(this.group));
        if(scrollTop) $group.scrollTop(scrollTop);
        if(userPatts.length == 0) {
            this.setState({isLoading: true});
            setTimeout(() => loadList());
        }
    }

    componentWillUnmount() {
        const {rememberScroll} = this.props;
        let $group = $(ReactDOM.findDOMNode(this.group));
        rememberScroll($group.scrollTop());
    }

    onDetails(e, id, subTitle) {
        e.preventDefault();
        const {pushPanel} = this.props;
        pushPanel(Panel.PATTERN_PREVIEW, {id, subTitle})
    }

    onImexport(e, id) {
        e.preventDefault();
        e.stopPropagation();
        const {imexportPattern} = this.props;
        imexportPattern(id);
    }

    renderLoading() {
        return (
            <div className="loading">
                <i className="fa fa-spinner fa-spin fa-2x fa-fw"></i>
            </div>
        );
    }

    renderItem() {
        const {userPatts, previewId} = this.props.globalPattern;
        const {imexportName, imexportBtnClsName} = this.props;
        let items = [];
        if(userPatts.length > 0) {
            items = userPatts.map(patt => {
                const {id, fullname, tags, permissions} = patt;
                if(permissions && !permissions[0].import) return null;
                let btnCls = classnames('imexport btn btn-xs', imexportBtnClsName);
                let itemCls = classnames('list-group-item', {
                    active: previewId && previewId == id,
                });
                return (
                    <a key={id} href="#" className={itemCls} onClick={e => this.onDetails(e, id, fullname)}>
                        <span className="list-group-item-heading">{fullname}</span>
                        <p className="list-group-item-text">
                            {tags.map((t, i) => <span key={i} className="label label-primary">{t}</span>)}
                        </p>
                        <button type="button" className={btnCls} onClick={e => this.onImexport(e, id)}>{imexportName}</button>
                    </a>
                );
            })
            .filter(i => i);
        }

        if(items.length > 0) {
            return items;
        } else {
            return (
                <div className="empty">Not available</div>
            );
        }
    }

    renderList() {
        const {isLoading} = this.state;
        return (
            <ul className="list-group" ref={group => this.group = group}>{
                isLoading ?
                this.renderLoading() :
                this.renderItem()
            }</ul>
        );
    }

    render() {
        return <div>{this.renderList()}</div>;
    }
}
