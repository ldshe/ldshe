import React, {Component} from 'react';

export default class MyGroupList extends Component {

    constructor(props, context) {
        super(props, context);
        this.renderLink = this.renderLink.bind(this);
        this.renderShowAll = this.renderShowAll.bind(this);
    }

    renderLink(id) {
        return `/ldsv2/design.php#/group/preview/${id}`;
    }

    renderShowAll() {
        return (
            <li className="list-group-item text-right">
                <small><a href="/ldsv2/design.php#/group">Show all</a></small>
            </li>
        );
    }

    render() {
        const {groups} = this.props;
        return (
            <div className="panel panel-default">
                <div className="panel-heading">My Groups</div>
                <ul className="list-group">
                    {groups.map(d => {
                        return (
                            <li key={d.id} className="list-group-item">
                                <a href={this.renderLink(d.id)}>{d.name}</a>
                            </li>
                        );
                    })}
                    {groups.length > 0 ? this.renderShowAll() : null}
                </ul>
            </div>
        );
    }
}
