import React, {Component} from 'react';

export default class UnitFilter extends Component {

    constructor(props, context) {
        super(props, context);
        this.onDropdownClick = this.onDropdownClick.bind(this);
        this.onFilterCheck = this.onFilterCheck.bind(this);
        this.renderFilterMenu = this.renderFilterMenu.bind(this);
    }

    onDropdownClick(e) {
        e.stopPropagation();
    }

    onFilterCheck(e) {
        e.stopPropagation();
        const {updateFilter} = this.props;
        updateFilter(e.target.value, e.target.checked);
    }

    componentDidMount() {
        const {filter} = this.props;
        $(document).on('click', '.filter-menu .dropdown-menu', this.onDropdownClick);
    }

    componentWillUnmount() {
        $(document).off('click', this.onDropdownClick);
    }

    renderFilterMenu() {
        const {roots, filter} = this.props;
        return (
            <div className="btn-group filter-menu">
                <span className="filter dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" title="Filter"></span>
                <ul className="dropdown-menu">
                    <li>
                        <form className="form-inline">
                            <div className="form-group">
                                <div className="row">
                                    <input className="col-xs-2 form-control input-sm" id="selectAllDesigns" type="checkbox" defaultValue="all" checked={filter.all != undefined} onChange={this.onFilterCheck}/>
                                    <label className="col-xs-10" htmlFor="selectAllDesigns">{filter.all == undefined ? 'Select All' : 'Deselect All'}</label>
                                </div>
                            </div>
                        </form>
                    </li>
                    {roots.map(root => {
                        const {id, fullname, subType} = root.model;
                        let name = fullname ? fullname : subType;
                        return (
                            <li key={id}>
                                <form className="form-inline">
                                    <div className="form-group">
                                        <div className="row">
                                            <input className="col-xs-2 form-control input-sm" id={id} type="checkbox" value={id} checked={filter.all != undefined || filter[id] != undefined} onChange={this.onFilterCheck}/>
                                            <label className="col-xs-10" htmlFor={id} title={name}>{name}</label>
                                        </div>
                                    </div>
                                </form>
                            </li>
                        );
                    })}
                </ul>
            </div>
        );
    }

    render() {
        return (
            <div className="sidebar-title">
                {'Strategic Components '}
                {this.renderFilterMenu()}
            </div>
        );
    }
}
