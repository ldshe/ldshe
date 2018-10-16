import classnames from 'classnames';
import moment from 'moment';
import React, {Component} from 'react';
import ReactDOM from 'react-dom';

export default class NavbarMenu extends Component {

    constructor(props, context) {
        super(props, context);
        this.onMsgClick = this.onMsgClick.bind(this);
        this.renderContent = this.renderContent.bind(this);
        this.state = {
            refreshNum: 0,
        };
        this.updateInterval = null;
    }

    componentDidMount() {
        this.updateInterval = setInterval(() => {
            const {data} = this.props.list;
            this.setState({refreshNum: this.state.refreshNum+=1});
        }, 60000);
    }

    componentWillUnmount() {
        clearInterval(this.updateInterval);
    }

    onMsgClick(e, id) {
        e.preventDefault();
        const {showDetails} = this.props;
        showDetails(id);
    }

    renderContent() {
        const {data} = this.props.list;
        let size = data.length;
        let bellCls = classnames('fa fa-fw fa-bell', {'empty': size == 0});
        return (
            <React.Fragment>
                <a className="dropdown-toggle" href="#" data-toggle="dropdown" aria-expanded="true">
                    <i className={bellCls}></i>
                    {size > 0 ? <span className="badge">{size}</span> : null}
                </a>
                <ul className="dropdown-menu">
                    <div className="drop-title">
                        <h6>{`Notifications (${size})`}</h6>
                    </div>
                    <div className="drop-content">{
                        data.map(d => {
                            const {data} = d;
                            return (
                                <li key={d.id}>
                                    <a href="#" className="item" onClick={e => this.onMsgClick(e, d.id)}>
                                        <p className="title">{`${data.title} from ${data.from}`}</p>
                                        <div className="time text-right">
                                            <small>{moment(d.createdAt).fromNow()}</small>
                                        </div>
                                    </a>
                                </li>
                            );
                        })
                    }</div>
                </ul>
            </React.Fragment>
        );
    }

    render() {
        let $target = $('.userspice-theme .navbar-fixed-top .dropdown.notification');
        return ReactDOM.createPortal(this.renderContent(), $target.get(0));
    }
}
