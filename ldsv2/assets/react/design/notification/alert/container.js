import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Config} from 'js/util';
import {StateName as AppStateName} from 'react/app/design/types';
import {loadNotificationList, dismissNotification, joinGroup} from 'react/app/design/actions';
import {StateName as NotificationStateName} from './types';
import {reset} from './actions';
import NavbarMenu from './components/navbar_menu';
import Popup from './components/popup';

class Alert extends Component {

    constructor(props, context) {
        super(props, context);
        this.initEcho = this.initEcho.bind(this);
        this.relEcho = this.relEcho.bind(this);
        this.showDetails = this.showDetails.bind(this);
    }

    componentDidMount() {
        this.initEcho();
        const {loadNotification} = this.props;
        loadNotification();
    }

    componentWillUnmount() {
        this.relEcho();
        const {reset} = this.props;
        reset();
    }

    initEcho() {
        const userId = this.props.app.user.id;
        const {loadNotification} = this.props;
        setTimeout(() => {
            window.echo.private(`notify.user.${userId}`)
                .listen('NewUserNotification', (e) => {
                    loadNotification();
                });
        }, 0);
    }

    relEcho() {
        const userId = this.props.app.user.id
        if(window.echo) window.echo.leave(`notify.user.${userId}`);
    }

    showDetails(id) {
        this.popup.show(id);
    }

    render() {
        const {list} = this.props;
        const {dismissNotification, joinGroup} = this.props;
        let popUpProps = {
            list,
            dismiss: dismissNotification,
            joinGroup,
        };
        let menuProps = {
            list,
            showDetails: this.showDetails,
        };
        return (
            <div>
                <Popup ref={popup => this.popup = popup} {...popUpProps}/>
                <NavbarMenu {...menuProps}/>
            </div>
        );
    }
}

const mapStateToProps = state => ({
    app: Config.get(state, AppStateName.DESIGN_APP),
    list: Config.get(state, NotificationStateName.NOTIFICATION),
});

const mapDispatchToProps = dispatch => ({
    reset: () => dispatch(reset()),
    loadNotification: () => dispatch(loadNotificationList()),
    dismissNotification: id => dispatch(dismissNotification(id)),
    joinGroup: (groupId, userId, isAccept) => dispatch(joinGroup(groupId, userId, isAccept)),
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Alert);
