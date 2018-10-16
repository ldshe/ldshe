import React, {Component} from 'react';
import ReactDOM from 'react-dom';

export default class Settings extends Component {

    constructor(props, context) {
        super(props, context);
        this.onNameChange = this.onNameChange.bind(this);
        this.show = this.show.bind(this);
        this.renderGroup = this.renderGroup.bind(this);
        this.renderSettings = this.renderSettings.bind(this);
        this.state = {
            name: props.group.name,
        }
    }

    componentWillUnmount() {
        let $modal = $(ReactDOM.findDOMNode(this.modal));
        $modal.modal('hide');
    }

    onNameChange(e) {
        e.preventDefault();
        const {id} = this.props.group;
        const {configure} = this.props;
        let value = $('#user-group-name').val();
        if(value = value.trim()) {
            this.setState({name: value});
            configure(id, {name: value});
        }
    }

    show() {
        let $modal = $(ReactDOM.findDOMNode(this.modal));
        $modal.modal('show');

        const {name} = this.props.group;
        this.setState({name: null});
        setTimeout(() => {this.setState({name})}, 0)
    }

    renderGroup() {
        const {name} = this.state;
        return (
            <div className="col-md-12">
                <div className="row">
                    <div className="group-title col-sm-8"><strong>Group settings</strong></div>
                </div>
                <div className="row">
                    <div className="col-sm-offset-1 col-sm-11">
                        <div className="input-group input-group-sm">
                            {name ? <input id="user-group-name" type="text" className="form-control" placeholder="Group name" defaultValue={name}/> : null}
                            <span className="input-group-btn">
                                <button className="btn btn-primary" onClick={this.onNameChange}>Rename</button>
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    renderSettings() {
        const {name} = this.state;
        return (
            <div ref={modal => this.modal = modal} className="modal fade settings" tabIndex="-1" role="dialog" aria-labelledby="settings-modal">
                <div className="modal-dialog" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h4 className="modal-title" id="settings-modal">{name}</h4>
                        </div>
                        <div className="modal-body">
                            <div>
                                <div className="row group">
                                    {this.renderGroup()}
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-default" data-dismiss="modal">Close</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    render() {
        return this.renderSettings();
    }
}
