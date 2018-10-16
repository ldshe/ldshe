import classnames from 'classnames';
import React, {Component} from 'react';
import {Link, withRouter} from 'react-router-dom';
import DataList from 'react/components/data_list';
import {SortDir, ColumnMeta} from '../types';
import Settings from './settings';

export default class List extends Component {

    constructor(props, context) {
        super(props, context);
        this.onSort = this.onSort.bind(this);
        this.onNext = this.onNext.bind(this);
        this.onBack = this.onBack.bind(this);
        this.onJumpTo = this.onJumpTo.bind(this);
        this.onSearch = this.onSearch.bind(this);
        this.onRefresh = this.onRefresh.bind(this);
        this.onFilter = this.onFilter.bind(this);
        this.onClearFilter = this.onClearFilter.bind(this);
        this.onChangeItemNum = this.onChangeItemNum.bind(this);
        this.onDelete = this.onDelete.bind(this);
        this.onShowSettings = this.onShowSettings.bind(this);
        this.renderHeader = this.renderHeader.bind(this);
        this.renderItems = this.renderItems.bind(this);
        this.renderSettings = this.renderSettings.bind(this);
        this.state = {
            groupId: null,
        }
        this.settingsModal = null;
    }

    onSort(e, idx) {
        e.preventDefault();
        const {handleSort} = this.props;
        handleSort(idx);
    }

    onRefresh(e) {
        e.preventDefault();
        const {handleRefresh} = this.props;
        handleRefresh();
    }

    onNext(e) {
        e.preventDefault();
        const {handleNext} = this.props;
        handleNext();
    }

    onBack(e) {
        e.preventDefault();
        const {handleBack} = this.props;
        handleBack();
    }

    onJumpTo(e, page) {
        e.preventDefault();
        const {handleJumpTo} = this.props;
        handleJumpTo(page);
    }

    onSearch(keywords) {
        const {handleSearch} = this.props;
        handleSearch(keywords);
    }

    onFilter(e, key) {
        e.preventDefault();
        const {handleFilter} = this.props;
        handleFilter(key, e.target.value);
    }

    onClearFilter(e)  {
        e.preventDefault();
        const {handleClearFilter} = this.props;
        handleClearFilter();
    }

    onChangeItemNum(itemNum) {
        const {handleChangeItemNum} = this.props;
        handleChangeItemNum(itemNum);
    }

    onDelete(e, id)  {
        e.preventDefault();
        const {handleDelete, getAlertify} = this.props;
        const alertify = getAlertify();
        alertify.confirm({
            okLabel: 'CONFIRM',
            cancelLabel: 'CANCEL',
            iconClass: 'fa-exclamation-triangle danger',
            confirmAction: () => handleDelete(id),
            title: 'DELETE GROUP',
            subTitle: 'This action cannot be undone.',
        });
    }

    onShowSettings(e, groupId) {
        e.preventDefault();
        this.setState({groupId});
        setTimeout(() => this.settingsModal.show(), 0);
    }

    renderHeader() {
        const {sortCol, sortDir} = this.props.list;
        const {onSort} = this.props;
        let headerMeta = [
            {name: 'Name', className: 'col-name'},
            {name: 'Owner', className: 'col-owner'},
            {name: 'Size', className: 'col-size'},
            {name: '', className: 'col-control'},
        ];
        let headers = headerMeta.map((m, i) => {
            let props;
            if(ColumnMeta[i].sortable) {
                props = {
                    key: i,
                    className: classnames({
                        [m.className]: true,
                        'sort': sortCol != i,
                        'sort-asc': sortCol == i && sortDir == SortDir.ASC,
                        'sort-desc': sortCol == i && sortDir == SortDir.DESC,
                    }),
                    onClick: e => this.onSort(e, i),
                }
            } else {
                props = {
                    key: i,
                    className: classnames({
                        [m.className]: true,
                    }),
                };
            }
            return <th {...props}>{m.name}</th>;
        });
        return <thead><tr>{headers}</tr></thead>;
    }

    renderItems() {
        const {itemNum} = this.props.list;
        let pagedData = JSON.parse(JSON.stringify(this.props.list.pagedData));
        let isEmpty = pagedData.length == 0;
        if(itemNum > pagedData.length) {
            [...Array(itemNum - pagedData.length)].forEach((_, i) => {
                pagedData.push({
                    id: 'dummy'+i,
                    name: ' ',
                    owner: ' ',
                    size: ' ',
                });
            });
        }
        return (
            <tbody>{
                isEmpty ?
                <tr className="empty"><td colSpan="4">No group found</td></tr> :
                pagedData.map(i => {
                    let isDummy = i.id.toString().startsWith('dummy');
                    let trCls = classnames({
                        'dummy': isDummy,
                    });
                    let Name = withRouter(({history}) => <span><a href={`#/group/preview/${i.id}`} title={i.name}>{i.name}</a></span>);
                    let Control = withRouter(({history}) => (
                        <div className="btn-toolbar pull-right">
                            <button type="button" className="btn btn-default btn-xs" title="Group" onClick={e => history.push(`/group/preview/${i.id}`)}>
                                <i className="fa fa-users"></i>
                            </button>
                            {
                                i.isEditable ?
                                <button type="button" className="btn btn-default btn-xs" title="Management" onClick={e => history.push(`/group/edit/${i.id}`)}>
                                    <i className="fa fa-tasks"></i>
                                </button> :
                                null
                            }
                        </div>
                    ));
                    return <tr key={i.id} className={trCls}>
                               <td className="text col-owner">{!isDummy ? <Name/> : null}</td>
                               <td className="text col-owner"><span>{i.owner}</span></td>
                               <td className="text col-size"><span>{i.size}</span></td>
                               <td className="col-control">
                                   {
                                       !isDummy ?
                                       <div className="dropdown pull-right">
                                           <button className="btn btn-default btn-xs dropdown-toggle" type="button" title="Menu" id="extraDropDown" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
                                               <i className="fa fa-ellipsis-v"></i>
                                           </button>
                                           <ul className="dropdown-menu dropdown-menu-right" aria-labelledby="extraDropDown">
                                               <li><Link to={`/group/preview/${i.id}`}><i className="fa fa-users"></i> Group</Link></li>
                                               {i.isEditable ? <li><Link to={`/group/edit/${i.id}`}><i className="fa fa-tasks"></i> Management</Link></li> : null}
                                               {i.isEditable ? <li><a className="remove" href="#" onClick={e => this.onDelete(e, i.id)}><i className="fa fa-trash"></i> Remove</a></li> : null}
                                               {/*
                                                   {i.isEditable ? <li role="separator" className="divider"></li> : null}
                                                   {i.isEditable ? <li><a href="#" onClick={e => this.onShowSettings(e, i.id)}><i className="fa fa-cogs"></i> Settings</a></li> : null}
                                               */}

                                          </ul>
                                       </div> :
                                       null
                                   }
                                   {!isDummy ? <Control/> : null}
                               </td>
                           </tr>;
                })
            }</tbody>
        );
    }

    renderSettings() {
        const {groupId} = this.state;
        if(!groupId) return null;

        const {data} = this.props.list;
        let group = data.filter(d => d.id == groupId);
        group = group.length > 0 ? group[0] : null;
        if(!group) return null;

        const {loadGroupList, resetSettings, configureGroup} = this.props;
        let props = {
            group,
            refreshList: () => loadGroupList(),
            configure: configureGroup,
        };
        return <Settings ref={modal => this.settingsModal = modal} {...props}/>;
    }

    render() {
        const {filterOpts, filterKey,  filterVal, searchVal, total, itemNum, page} = this.props.list;
        const props = {
            tableClassName: {'table-sm': true},
            header: this.renderHeader(),
            filterOpts,
            filterKey,
            filterVal,
            searchVal,
            itemNum,
            total,
            page,
            onNext: this.onNext,
            onBack: this.onBack,
            onJumpTo: this.onJumpTo,
            onSearch: this.onSearch,
            onRefresh: this.onRefresh,
            onFilter: this.onFilter,
            onClearFilter: this.onClearFilter,
            onChangeItemNum: this.onChangeItemNum,
        }
        return (
            <div>
                <DataList {...props}>
                    {this.renderItems()}
                </DataList>
                {this.renderSettings()}
            </div>
        );
    }
}
