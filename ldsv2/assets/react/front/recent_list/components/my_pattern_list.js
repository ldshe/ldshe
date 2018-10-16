import React, {Component} from 'react';

export default class MyPatternList extends Component {

    constructor(props, context) {
        super(props, context);
        this.renderLink = this.renderLink.bind(this);
        this.renderShowAll = this.renderShowAll.bind(this);
    }

    renderLink(id) {
        return `/ldsv2/design.php#/pattern/preview/${id}`;
    }

    renderShowAll() {
        return (
            <li className="list-group-item text-right">
                <small><a href="/ldsv2/design.php#/pattern">Show all</a></small>
            </li>
        );
    }

    render() {
        const {patterns} = this.props;
        return (
            <div className="panel panel-default">
                <div className="panel-heading">My Recent Patterns</div>
                <ul className="list-group">
                    {patterns.map(d => {
                        return (
                            <li key={d.id} className="list-group-item">
                                <a href={this.renderLink(d.id)}>{d.fullname}</a>
                            </li>
                        );
                    })}
                    {patterns.length > 0 ? this.renderShowAll() : null}
                </ul>
            </div>
        );
    }
}
