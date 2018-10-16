import classnames from 'classnames';
import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import {Graph, alg, json} from 'graphlib';
import {getPatternClassName, getDefaultActivityName} from '../util';

export default class OverrideConfirmModal extends Component {

    constructor(props, context) {
        super(props, context);
        this.show = this.show.bind(this);
        this.onCheckAll = this.onCheckAll.bind(this);
        this.onCheck = this.onCheck.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.renderByType = this.renderByType.bind(this);
        this.renderDependencies = this.renderDependencies.bind(this);
        this.state = {checked : {}};
    }

    componentWillUnmount() {
        let $confirm = $(ReactDOM.findDOMNode(this.confirmModal));
        $confirm.modal('hide');
    }

    show() {
        let $confirm = $(ReactDOM.findDOMNode(this.confirmModal));
        $confirm.modal('show');
    }

    onCheckAll(e) {
        const {root} = this.props;
        let checked = {};
        let $el = $(e.target);
        if($el.prop('checked') && root) {
            root.all(n => true)
                .forEach(n => {checked[n.model.id] = n.model.id});
            delete checked[root.model.id];
        }
        this.setState({checked})
    }

    onCheck(e) {
        let checked = Object.assign({}, this.state.checked);
        let $el = $(e.target);
        if($el.prop('checked')) {
            checked[$el.val()] = $el.val();
        } else {
            delete checked[$el.val()];
        }
        this.setState({checked})
    }

    onSubmit(e) {
        e.preventDefault();
        const {handleSubmit} = this.props;
        handleSubmit(Object.keys(this.state.checked));
    }

    renderByType(source, key) {
        const {checked} = this.state;
        const {root} = this.props;
        const {sequenceMap} = root.model;
        const node = root.first(n => n.model.id == source.id);
        const {id, subType, fullname} = node.model;
        let name = fullname ? fullname : getDefaultActivityName(subType);
        let spanCls = classnames(getPatternClassName(node), {
            label: true,
            activity: true,
        });
        return (
            <div>
                <input type="checkbox" id={key} value={id} onChange={this.onCheck} checked={checked[id] ? true : false}/>
                <label htmlFor={key}>
                    <span className={spanCls} title={name}>{`${sequenceMap[id]} ${name}`}</span>
                </label>
            </div>
        );
    }

    renderDependencies() {
        const {checked} = this.state;
        const {root} = this.props;
        if(!root) return null;

        const {dependencies, sequenceMap} = root.model;
        let nodes = [];
        let dependentSource;
        if(dependencies && (dependentSource = dependencies.graph)) {
            let g = json.read(dependentSource);
            nodes = Object.keys(sequenceMap)
                .sort((a, b) => sequenceMap[a] - sequenceMap[b])
                .map(id => g.node(id));
        }
        let allChecked = Object.keys(checked).length == nodes.length;
        return (
            <ul>
                <li><div>
                    <input type="checkbox" id="ud-patt-modal-checkAll" value="all" onChange={this.onCheckAll} checked={allChecked}/>
                    <label htmlFor="ud-patt-modal-checkAll">{allChecked ? 'Deselect All' : 'Select All'}</label>
                </div></li>
                {nodes.map((n, i) => <li key={i}>{this.renderByType(n, i)}</li>)}
            </ul>
        );
    }

    render() {
        const {root} = this.props;
        const title = root ? root.model.fullname : '';
        return (
            <div ref={modal => this.confirmModal = modal} className="modal fade confirm" tabIndex="-1" role="dialog" aria-labelledby="ud-patt-modal">
                <div className="modal-dialog" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h4 className="modal-title" id="ud-patt-modal">{title}</h4>
                        </div>
                        <div className="modal-body">
                            <p>Please select the tasks that you want to propagate the settings to theirs corresponding instances, if any.</p>
                            {this.renderDependencies()}
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-default" data-dismiss="modal">Close</button>
                            <button type="button" className="btn btn-primary" onClick={this.onSubmit}>Apply changes</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
