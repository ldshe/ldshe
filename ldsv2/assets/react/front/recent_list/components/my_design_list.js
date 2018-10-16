import React, {Component} from 'react';

export default class MyDesignList extends Component {

    constructor(props, context) {
        super(props, context);
        this.renderLink = this.renderLink.bind(this);
        this.renderShowAll = this.renderShowAll.bind(this);
    }

    renderLink(id) {
        return `/ldsv2/design.php#/preview/${id}`;
    }

    renderShowAll() {
        return (
            <li className="list-group-item text-right">
                <small><a href="/ldsv2/design.php">Show all</a></small>
            </li>
        );
    }

    render() {
        const {designs} = this.props;
        return (
            <div className="panel panel-default">
                <div className="panel-heading">My Recent Designs</div>
                <ul className="list-group">
                    {designs.map(d => {
                        return (
                            <li key={d.id} className="list-group-item">
                                <a href={this.renderLink(d.id)}>{d.title}</a>
                            </li>
                        );
                    })}
                    {designs.length > 0 ? this.renderShowAll() : null}
                </ul>
            </div>
        );
    }
}
