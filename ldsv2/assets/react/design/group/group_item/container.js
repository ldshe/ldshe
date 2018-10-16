import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Link} from 'react-router-dom';
import {Config} from 'js/util';
import {StateName as AppStateName} from 'react/app/design/types';
import {configureGroup, leaveGroup} from 'react/app/design/actions';
import AppContext from 'react/app/design/context/app';
import {StateName as ItemStateName} from './types';
import Edit from './components/edit';
import Preview from './components/preview';

class GroupItem extends Component {

    constructor(props, context) {
        super(props, context);
        this.renderContent = this.renderContent.bind(this);
        this.docTitle = 'Learning Design Studio HE';
    }

    componentDidMount() {
        const {data} = this.props.item;
        document.title = `${data.name} - ${this.docTitle}`;
    }


    componentDidUpdate() {
        const {data} = this.props.item;
        document.title = `${data.name} - ${this.docTitle}`;
    }

    renderContent() {
        const {groupId} = this.props.initProps;
        const {app, item, isEditable} = this.props;
        const {name} = item.data;
        const {configureGroup, leaveGroup} = this.props;
        let props = {
            groupId,
            item,
            handleLeave: () => leaveGroup(groupId, app.user.id),
            configureGroup,
        };
        return (
            <div className="management">
                <div className="navbar-form">
                    <div className="row">
                        <div className="col-xs-6">
                            <h4>{name}</h4>
                        </div>
                        <div className="col-xs-6 btn-toolbar">
                            <div className="btn-group pull-right">
                                <Link to="/group">
                                    <button type="button" className="btn btn-sm btn-default">
                                        <i className="fa fa-chevron-left"></i> Back to My Groups
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
                <AppContext.Consumer>
                    {({getAlertify}) => isEditable ? <Edit {...props} getAlertify={getAlertify} /> : <Preview {...props} getAlertify={getAlertify}/>}
                </AppContext.Consumer>
            </div>
        );
    }

    render() {
        return this.renderContent();
    }
}

const mapStateToProps = state => ({
    app: Config.get(state, AppStateName.DESIGN_APP),
    item: Config.get(state, ItemStateName.GROUP_ITEM),
});

const mapDispatchToProps = dispatch => ({
    configureGroup: (id, data) => dispatch(configureGroup(id, data)),
    leaveGroup: (groupId, userId) => dispatch(leaveGroup(groupId, userId)),
});

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(GroupItem);
