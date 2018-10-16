import classnames from 'classnames';
import React, {Component} from 'react';
import {Link, withRouter} from 'react-router-dom';
import DataList from 'react/components/data_list';
import {SortDir, ColumnMeta, ListType} from '../types';

export default class SharedDesignList extends Component {

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
        this.onImport = this.onImport.bind(this);
        this.renderHeader = this.renderHeader.bind(this);
        this.renderItems = this.renderItems.bind(this);
    }

    onSort(e, idx) {
        e.preventDefault();
        const {handleSort} = this.props;
        handleSort(idx);
    }

    onRefresh(e) {
        e.preventDefault();
        const {list} = this.props;
        const {handleRefresh} = this.props;
        handleRefresh(list.currListType);
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

    onImport(e, id)  {
        e.preventDefault();
        const {handleImport} = this.props;
        handleImport(id);
    }

    renderHeader() {
        const {currListType, sortCol, sortDir} = this.props.list;
        const {onSort} = this.props;
        let headerMeta = [
            {name: 'Name', className: 'col-name'},
            {name: 'Tags', className: 'col-tags'},
            {name: currListType == ListType.PUBLIC ? 'Contributed By' : 'Shared By', className: 'col-shared-by'},
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
                    owner: ' ',
                    permission: null,
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
                    let permission = i.permission;
                    let Name = withRouter(({history}) => (
                        <span>
                            <a href={(permission && permission.edit) ? `#/pattern/edit/${i.id}` : `#/pattern/preview/${i.id}`} title={i.fullname}>
                                {i.fullname}
                            </a>
                        </span>
                    ));
                    let Control = withRouter(({history}) => (
                        <div className="btn-toolbar pull-right">
                            <button type="button" className="btn btn-default btn-xs" title="Preview" onClick={() => {history.push(`/pattern/preview/${i.id}`)}}>
                                <i className="fa fa-eye"></i>
                            </button>
                            {
                                permission && permission.import ?
                                <button type="button" className="btn btn-default btn-xs" title="Save to My Patterns" onClick={e => this.onImport(e, i.id)}>
                                    <i className="fa fa-save"></i>
                                </button> :
                                null
                            }
                            {
                                permission && permission.edit ?
                                <button type="button" className="btn btn-default btn-xs" title="Edit" onClick={() => {history.push(`/pattern/edit/${i.id}`)}}>
                                    <i className="fa fa-pencil"></i>
                                </button> :
                                null
                            }
                        </div>
                    ));
                    return (
                        <tr key={i.id} className={trCls}>
                           <td className="text col-name">{!isDummy ? <Name/> : <span>{i.fullname}</span>}</td>
                           <td className="text col-tags">{i.tags.map((t, j) => <span key={`${i}-${j}`} className="label label-primary">{t}</span>)}</td>
                           <td className="text col-shared-by">{i.owner}</td>
                           <td className="col-control">
                                {!isDummy ?
                                <div className="dropdown pull-right">
                                  <button className="btn btn-default btn-xs dropdown-toggle" type="button" title="Menu" id="extraDropDown" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
                                      <i className="fa fa-ellipsis-v"></i>
                                  </button>
                                  <ul className="dropdown-menu dropdown-menu-right" aria-labelledby="extraDropDown">
                                      <li><Link to={`/pattern/preview/${i.id}`}><i className="fa fa-eye"></i> Preview</Link></li>
                                      {
                                          permission && permission.import ?
                                          <li><a href="#" onClick={e => this.onImport(e, i.id)}><i className="fa fa-save"></i> Save to My Patterns</a></li> :
                                          null
                                      }
                                      {
                                          permission && permission.edit ?
                                          <li><Link to={`/pattern/edit/${i.id}`}><i className="fa fa-pencil"></i> Edit</Link></li> :
                                          null
                                      }
                                 </ul>
                                </div> :
                                null}
                                {!isDummy ? <Control/> : null}
                           </td>
                        </tr>
                    );
                })
            }</tbody>
        );
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
            </div>
        );
    }
}
