import classnames from 'classnames';
import React, {Component} from 'react';

export default class Datalist extends Component {

    static get defaultProps() {
        return {
            //ensure we have at least n continuous numbers around cuurent page
            pageRangeDisplayed: 3,
            //ensure we have at least n numbers for head or tail
            marginPagesDisplayed: 1,
        }
    }

    constructor(props, context) {
        super(props, context);
        this.handleSearch = this.handleSearch.bind(this);
        this.renderFilter = this.renderFilter.bind(this);
        this.renderControl = this.renderControl.bind(this);
        this.renderPageBtns = this.renderPageBtns.bind(this);
        this.renderPagination = this.renderPagination.bind(this);
    }

    handleSearch(e, keywords) {
        e.preventDefault();
        const {onSearch} = this.props;
        onSearch(keywords);
    }

    renderFilter() {
        const {filterOpts, filterKey, filterVal} = this.props;
        const {onFilter, onClearFilter, customFilterValue} = this.props;
        const filterOptKeys = Object.keys(filterOpts);
        return(
            <div className="col-xs-12 col-sm-6">
            <form className="navbar-form filter pull-left" onSubmit={e => this.handleSearch(e, e.target.search.value)}>
                {filterOptKeys.length > 0 ? <label className="control-label-sm">Filter By:</label> : null}
                {
                    (filterKey && filterVal) ?
                    <span className="label label-primary" onClick={ e => onClearFilter(e)}>
                        {customFilterValue ? customFilterValue(filterVal) : filterVal}
                        <i className="fa fa-times"></i>
                    </span> :
                    filterOptKeys.map((k, i) => {
                        return (
                              <select key={i} className="form-control input-sm" onChange={e => onFilter(e, k)} defaultValue="">
                                  <option value="" disabled>{k.capitalize()}</option>
                                  {filterOpts[k].map((f, j) => <option key={j} value={f}>{customFilterValue ? customFilterValue(f) : f}</option>)}
                              </select>
                          );
                      })
                }
            </form>
            </div>
        );
    }

    renderControl() {
        const {itemNum, searchVal} = this.props;
        const {onChangeItemNum, onRefresh} = this.props;
        return(
            <div className="col-xs-12 col-sm-6">
                <form className="navbar-form search pull-right" onSubmit={e => this.handleSearch(e, e.target.search.value)} autoComplete="off">
                    <select className="form-control input-sm" name="item" defaultValue={itemNum} onChange={e => onChangeItemNum(e.target.value)}>
                        <option value="10">10 entries</option>
                        <option value="25">25 entries</option>
                        <option value="50">50 entries</option>
                        <option value="100">100 entries</option>
                    </select>
                    <div className="input-group input-group-sm">
                        <span className="input-group-addon">
                            <i className="glyphicon glyphicon-search"></i>
                        </span>
                        <input className="form-control" placeholder="Search" name="search" type="text" value={searchVal} onChange={e => this.handleSearch(e, e.target.value)}/>
                        <span className="input-group-btn">
                            <button type="button" className="btn btn-defalut btn-sm" title="Refresh" onClick={onRefresh}>
                                <i className="glyphicon glyphicon-refresh"></i>
                            </button>
                        </span>
                    </div>
                </form>
            </div>
        );
    }

    renderPageBtns() {
        const {page, total, itemNum} = this.props;
        const {onNext, onBack, onJumpTo} = this.props;

        const {pageRangeDisplayed, marginPagesDisplayed} = Datalist.defaultProps;

        let pageNum = Math.ceil(total / itemNum);
        let pageBtns = [];
        let prevClsName = classnames({
            'page-item': true,
            'disabled': page == 1,
        });
        let prevBtn = <li key="prev" className={prevClsName}>
                          <a className="page-link" href="#" onClick={onBack}>
                            <span aria-hidden="true">&laquo;</span>
                          </a>
                      </li>;
        pageBtns.push(prevBtn);

        if (pageNum <= pageRangeDisplayed) {
            [...Array(pageNum)].forEach((_, i) => {
                let p = i + 1;
                let clsNames = classnames({
                    'page-item': true,
                    'active': p == page,
                });
                pageBtns.push(
                    <li key={i} className={clsNames}>
                        <a className="page-link" href="#" onClick={e => onJumpTo(e, p)}>{p}</a>
                    </li>
                );
            })
        } else {
            let leftSide  = (pageRangeDisplayed / 2);
            let rightSide = (pageRangeDisplayed - leftSide);

            if (page > pageNum - pageRangeDisplayed / 2) {
                rightSide = pageNum - page;
                leftSide  = pageRangeDisplayed - rightSide;
            } else if (page < pageRangeDisplayed / 2) {
                leftSide = page;
                rightSide = pageRangeDisplayed - leftSide;
            }

            leftSide = Math.floor(leftSide);
            rightSide = Math.floor(rightSide);

            let pg = [];
            let isBreakSet = false;
            [...Array(pageNum)].forEach((_, i) => {
                let p = i + 1;
                let clsNames = classnames({
                    'page-item': true,
                    'active': p == page,
                });

                let pageBtn = <li key={i} className={clsNames}>
                                  <a className="page-link" href="#" onClick={e => onJumpTo(e, p)}>{p}</a>
                              </li>;

                if (p <= marginPagesDisplayed) {
                    pageBtns.push(pageBtn);
                    pg.push(p);
                    return;
                }

                if(pg.pop()) {
                    isBreakSet = false;
                } else {
                    if(!isBreakSet) {
                        let clsNames = classnames({
                            'page-item': true,
                            'disabled': true,
                        });
                        let breakBtn = <li key={'break-'+i} className={clsNames}><a className="page-link" href="#"><strong>...</strong></a></li>;
                        pageBtns.push(breakBtn);
                        isBreakSet = true;
                    }
                }

                if ((p >= page - leftSide) && (p <= page + rightSide)) {
                    pageBtns.push(pageBtn);
                    pg.push(p);
                    return;
                }

                if (p > pageNum - marginPagesDisplayed) {
                    pageBtns.push(pageBtn);
                    pg.push(p);
                    return;
                }
            });
        }

        let nextClsName = classnames({
            'page-item': true,
            'disabled': page == pageNum,
        });
        let nextBtn = <li key="back" className={nextClsName}>
                          <a className="page-link" href="#" onClick={onNext}>
                            <span aria-hidden="true">&raquo;</span>
                          </a>
                      </li>;
        pageBtns.push(nextBtn);

        return pageBtns;
    }

    renderPagination() {
        const {total} = this.props;
        return (total > 0) ?
            <nav><ul className="pagination pagination-sm pull-right">{this.renderPageBtns()}</ul></nav> :
            null;
    }

    render() {
        const {header, children, className, tableClassName} = this.props;
        const clsName = classnames(Object.assign({}, className || {}, {'data-list': true}));
        const tabClsName = classnames(Object.assign({}, tableClassName || {}, {'table': true, 'table-condensed': true}));
        return (
            <div className={clsName}>
                <div className="row">
                    {this.renderFilter()}
                    {this.renderControl()}
                </div>
                <table className={tabClsName}>
                    {header}
                    {children}
                </table>
                {this.renderPagination()}
            </div>
        );
    }
}
