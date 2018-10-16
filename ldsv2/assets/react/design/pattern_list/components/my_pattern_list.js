import classnames from 'classnames';
import React, {Component} from 'react';
import {Link, withRouter} from 'react-router-dom';
import DataList from 'react/components/data_list';
import {Pattern as Settings} from 'react/design/settings';
import {SortDir, ColumnMeta, ListType} from '../types';

export default class MyPatternList extends Component {

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
        this.onCopy = this.onCopy.bind(this);
        this.onDelete = this.onDelete.bind(this);
        this.onShowSettings = this.onShowSettings.bind(this);
        this.renderHeader = this.renderHeader.bind(this);
        this.renderItems = this.renderItems.bind(this);
        this.renderSettings = this.renderSettings.bind(this);
    }

    onSort(e, idx) {
        e.preventDefault();
        const {handleSort} = this.props;
        handleSort(idx);
    }

    onRefresh(e) {
        e.preventDefault();
        const {handleRefresh} = this.props;
        handleRefresh(ListType.MY);
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

    onCopy(e, id)  {
        e.preventDefault();
        const {handleCopy} = this.props;
        handleCopy(id);
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
            title: 'DELETE PATTERN',
            subTitle: 'This action cannot be undone.',
        });
    }

    onShowSettings(e, id)  {
        e.preventDefault();
        const {setEditCollection} = this.props;
        setEditCollection(id);
        setTimeout(() => this.settingsModal.show(), 0);
    }

    renderHeader() {
        const {currListType, sortCol, sortDir} = this.props.list;
        const {onSort} = this.props;
        let headerMeta = [
            {name: 'Name', className: 'col-name'},
            {name: 'Tags', className: 'col-tags'},
            {name: '', className: 'col-control'},
        ];
        let headers = headerMeta.map((m, i) => {
            let props;
            if(ColumnMeta[currListType][i].sortable) {
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
                    fullname: '　',
                    tags: [],
                });
            });
        }
        return (
            <tbody>{
                isEmpty ?
                <tr className="empty"><td colSpan="6">No pattern found</td></tr> :
                pagedData.map(i => {
                    let isDummy = i.id.toString().startsWith('dummy');
                    let trCls = classnames({
                        'dummy': isDummy,
                    });
                    let shareCls = classnames({
                        'share': true,
                        'active': i.shared,
                    });
                    let Name = withRouter(({history}) => <span><span className={shareCls} title="Shared"></span><a href={`#/pattern/edit/${i.id}`} title={i.fullname}>{i.fullname}</a></span>);
                    let Control = withRouter(({history}) => (
                        <div className="btn-toolbar pull-right">
                            <button type="button" className="btn btn-default btn-xs" title="Edit" onClick={() => {history.push(`/pattern/edit/${i.id}`)}}>
                                <i className="fa fa-pencil"></i>
                            </button>
                        </div>
                    ));
                    return <tr key={i.id} className={trCls}>
                               <td className="text col-name">{!isDummy ? <Name/> : <span>{i.fullname}</span>}</td>
                               <td className="text col-tags">{i.tags.map((t, j) => <span key={`${i}-${j}`} className="label label-primary">{t}</span>)}</td>
                               <td className="col-control">
                                   {
                                       !isDummy ?
                                       <div className="dropdown pull-right">
                                           <button className="btn btn-default btn-xs dropdown-toggle" type="button" title="Menu" id="extraDropDown" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
                                               <i className="fa fa-ellipsis-v"></i>
                                           </button>
                                           <ul className="dropdown-menu dropdown-menu-right" aria-labelledby="extraDropDown">
                                               <li><Link to={`/pattern/edit/${i.id}`}><i className="fa fa-pencil"></i> Edit</Link></li>
                                               <li><a href="#" onClick={e => this.onCopy(e, i.id)}><i className="fa fa-copy"></i> Copy</a></li>
                                               <li><a className="remove" href="#" onClick={e => this.onDelete(e, i.id)}><i className="fa fa-trash"></i> Remove</a></li>
                                               <li role="separator" className="divider"></li>
                                               <li><a href="#" onClick={e => this.onShowSettings(e, i.id)}><i className="fa fa-cogs"></i> Settings</a></li>
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
        const {configLoadedNum, groupLoadedNum, editCollectId, contribution, acls, groups, data} = this.props.list;
        const {loadPatternList, resetSettings, loadPatternConfig, loadGroupList, configurePattern, contributePattern, getAlertify} = this.props;
        let list = {
            configLoadedNum,
            groupLoadedNum,
            editId: editCollectId,
            contribution,
            acls,
            groups,
        };
        let collect = data.filter(d => d.id == editCollectId);
        const {fullname} = collect.length > 0 ? collect[0] : {};
        let props = {
            displayContribution: true,
            displayShareSelected: true,
            title: fullname,
            contributeTitle: 'Contribute my pattern to Public Patterns',
            list,
            refreshList: () => loadPatternList(ListType.MY),
            resetSettings,
            loadConfig: loadPatternConfig,
            loadGroup: loadGroupList,
            configure: configurePattern,
            contribute: contributePattern,
            getAlertify,
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
