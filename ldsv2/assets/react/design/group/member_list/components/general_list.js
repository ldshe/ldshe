import classnames from 'classnames';
import React, {Component} from 'react';
import {Link, withRouter} from 'react-router-dom';
import DataList from 'react/components/data_list';
import {Panel} from '../../panel/types';
import {SortDir, ColumnMeta} from '../types';

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
        this.renderLoading = this.renderLoading.bind(this);
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
                               <td className="text col-control"><span>{' '}</span></td>
                           </tr>;
                })
            }</tbody>
        );
    }

    render() {
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
        }
        return (
            <div>{
                isLoading ?
                this.renderLoading() :
                <DataList {...props}>
                    {this.renderItems()}
                </DataList>
            }</div>
        );
    }
}
