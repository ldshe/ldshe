import classnames from 'classnames';
import React, {Component} from 'react';
import {Link} from 'react-router-dom';
import DataList from 'react/components/data_list';
import UserFinder from 'react/design/user_finder';
import {Panel} from '../../panel/types';
import {SortDir, ColumnMeta, StatusType, StatusMap} from '../types';

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
        this.onCreate = this.onCreate.bind(this);
        this.onDelete = this.onDelete.bind(this);
        this.renderControl =  this.renderControl.bind(this);
        this.renderAddMemberPanel = this.renderAddMemberPanel.bind(this);
        this.renderLoading = this.renderLoading.bind(this);
        this.renderHeader = this.renderHeader.bind(this);
        this.renderItems = this.renderItems.bind(this);
        this.renderList = this.renderList.bind(this);
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

    onCreate(e) {
        e.preventDefault();
        const {handleCreate} = this.props;
        let userId = this.userFinder.value;
        handleCreate(userId);
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
            title: 'DELETE MEMBER',
            subTitle: 'This action cannot be undone.',
        });
    }

    renderControl() {
        const {groupId} = this.props;
        return (
            <div className="management">
                <div className="navbar-form">
                    <div className="row">
                        <div className="col-xs-6">
                            <h4>{name}</h4>
                        </div>
                        <div className="col-xs-6 btn-toolbar">
                            <div className="btn-group pull-right">
                                <Link to={`/group/edit/${groupId}`}>
                                    <button type="button" className="btn btn-sm btn-default">
                                        <i className="fa fa-chevron-left"></i> Back to Group Management
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    renderAddMemberPanel() {
        return (
            <div className="panel panel-default">
                <div className="panel-heading">Add Member</div>
                    <div className="panel-body">
                        <form className="form-horizontal" autoComplete="off">
                            <div className="form-group">
                                <label className="col-xs-2 control-label-sm">New Member</label>
                                <div className="col-xs-5">
                                    <UserFinder ref={finder => this.userFinder = finder}/>
                                </div>
                                <div className="col-xs-5">
                                    <button className="btn btn-sm btn-primary" onClick={this.onCreate}>
                                        <i className="fa fa-fw fa-envelope-o"></i> Send Invitation
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
            </div>
        );
    }

    renderLoading() {
        return (
            <div className="loading">
                <i className="fa fa-spinner fa-spin fa-2x fa-fw"></i>
            </div>
        );
    }

    renderHeader() {
        const {listType} = this.props;
        const {sortCol, sortDir} = this.props.list;
        const {onSort} = this.props;
        let headerMeta = [
            {name: 'User', className: 'col-user'},
            {name: 'Email', className: 'col-email'},
            {name: 'Status', className: 'col-status'},
            {name: '', className: 'col-control'},
        ];
        let headers = headerMeta.map((m, i) => {
            let props;
            if(ColumnMeta[listType][i].sortable) {
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
                    username: ' ',
                    fullname: ' ',
                    email: ' ',
                    status: ' ',
                });
            });
        }
        return (
            <tbody>{
                isEmpty ?
                <tr className="empty"><td colSpan="4">No member found</td></tr> :
                pagedData.map(i => {
                    let isDummy = i.id.toString().startsWith('dummy');
                    let trCls = classnames({
                        'dummy': isDummy,
                    });
                    return <tr key={i.id} className={trCls}>
                               <td className="text col-user"><span>{i.username}{i.isOwner ? <small>{' (Owner)'}</small> : null}</span></td>
                               <td className="text col-email"><span>{isDummy ? ' ' : <a href={`mailto:${i.fullname}<${i.email}>`}>{`${i.fullname} <${i.email}>`}</a>}</span></td>
                               <td className="text col-status"><span>{
                                   isDummy ?
                                   ' ' :
                                   (() => {
                                       switch(i.status) {
                                           case StatusType.ACTIVE:
                                               return <span className="label label-success">{StatusMap[i.status]}</span> ;
                                           case StatusType.INVITING:
                                               return <span className="label label-default">{StatusMap[i.status]}</span> ;
                                           default:
                                               return <span className="label label-warning">{StatusMap[i.status]}</span> ;
                                       }
                                   })()
                               }</span></td>
                               <td className="col-control">
                                   {
                                       !isDummy && !i.isOwner ?
                                       <div className="dropdown pull-right">
                                           <button className="btn btn-default btn-xs dropdown-toggle" type="button" title="Menu" id="extraDropDown" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
                                               <i className="fa fa-ellipsis-v"></i>
                                           </button>
                                           <ul className="dropdown-menu dropdown-menu-right" aria-labelledby="extraDropDown">
                                               <li><a className="remove" href="#" onClick={e => this.onDelete(e, i.id)}><i className="fa fa-trash"></i> Remove</a></li>
                                          </ul>
                                       </div> :
                                       null
                                   }
                                   {
                                       !isDummy && !i.isOwner ?
                                       <div className="btn-toolbar pull-right">
                                           <button type="button" className="btn btn-default btn-xs" title="Remove" onClick={e => this.onDelete(e, i.id)}>
                                               <i className="fa fa-trash"></i>
                                           </button>
                                       </div> :
                                       null
                                   }
                               </td>
                           </tr>;
                })
            }</tbody>
        );
    }

    renderList() {
        const {isLoading} = this.props;
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
            customFilterValue: v => StatusMap[v],
        }
        return (
            <div className="panel panel-default">
                <div className="panel-heading">Existing Members</div>
                <div className="panel-body">
                    {
                        isLoading ?
                        this.renderLoading() :
                        <DataList {...props}>
                            {this.renderItems()}
                        </DataList>
                    }
                </div>
            </div>
        );
    }

    render() {
        return (
            <div>
                {this.renderControl()}
                {this.renderAddMemberPanel()}
                {this.renderList()}
            </div>
        );
    }
}
