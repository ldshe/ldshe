import classnames from 'classnames';
import React, {Component} from 'react';
import ReactDOM from 'react-dom';

export default class AutoSuggest extends Component {

    static getDerivedStateFromProps(nextProps, prevState) {
        if(prevState.propsValue != nextProps.value) {
            return {
                propsValueChanged: true,
                propsValue: nextProps.value,
            };
        }
        return null;
    }

    constructor(props, context) {
        super(props, context);
        this.matchFirst = this.matchFirst.bind(this);
        this.onSuggestSelect = this.onSuggestSelect.bind(this);
        this.onSuggestBlur = this.onSuggestBlur.bind(this);
        this.onInputFocus = this.onInputFocus.bind(this);
        this.onInputChange = this.onInputChange.bind(this);
        this.onDropdownClick = this.onDropdownClick.bind(this);
        this.onSuggestChange = this.onSuggestChange.bind(this);
        this.onSuggestHover = this.onSuggestHover.bind(this);
        this.cancelSuggest = this.cancelSuggest.bind(this);
        this.scrollToActiveItem = this.scrollToActiveItem.bind(this);
        this.iterSuggest = this.iterSuggest.bind(this);
        this.onInputKeyDown = this.onInputKeyDown.bind(this);
        this.onBtnKeyDown = this.onBtnKeyDown.bind(this);
        this.renderSuggests = this.renderSuggests.bind(this);
        this.state = {
            value: props.defaultValue || props.value || '',
            suggests: props.suggests &&
                      props.suggests.length > 0 ? props.suggests.sort((a, b) => {
                                                    let uA = a.toUpperCase();
                                                    var uB = b.toUpperCase();
                                                    if (uA < uB) return -1;
                                                    if (uA > uB) return 1;
                                                    return 0;
                                                  }) : [],
            showSuggest: false,
            selectFromDropdown: false,
            isSuggestHover: false,
            arrowdownCount: 0,
            propsValueChanged: false,
            propsValue: null,
        };
    }

    componentDidUpdate() {
        const {propsValueChanged, propsValue} = this.state;
        const {readOnly} = this.props;
        if(readOnly && propsValueChanged) {
            this.setState({
                value: propsValue,
                propsValueChanged: false,
            });
        };
    }

    componentWillUnmount() {
        clearTimeout(this.blurTimeout);
    }

    matchFirst(value) {
        const {suggests} = this.props;
        let regex = new RegExp(value.escapeRegExp(), 'i');
        return suggests.reduce((c, s, i) => (c == -1) ? (s.search(regex) != -1 ? i : -1) : c, -1);
    }

    onInputFocus(e) {
        this.setState({
            isSuggestHover: false,
            selectFromDropdown: false,
        });
    }

    onInputChange(e) {
        const {readOnly} = this.props;
        if(readOnly) {
            this.input.value = this.state.value;
            return;
        }

        const {onFieldChange} = this.props;
        const {selectFromDropdown} = this.state;
        let name = e.target.name;
        let value = e.target.value;
        let regex = new RegExp(value.escapeRegExp(), 'i');
        let suggests = this.props.suggests.filter(s => s.search(regex) != -1)
        let showSuggest = suggests.length > 0 && value && !selectFromDropdown;

        this.setState({
            value,
            suggests,
            showSuggest,
            selectFromDropdown: false,
        });

        setTimeout(() => {
            onFieldChange(name, value);
        }, 100);
    }

    onSuggestChange(name, data) {
        const {readOnly} = this.props;
        if(readOnly) {
            this.input.value = this.state.value;
            return;
        }

        const {onFieldChange} = this.props;
        this.setState(data);
        setTimeout(() => {
            onFieldChange(name, data.value);
        }, 100);
    }

    cancelSuggest(e) {
        //esc
        if (e.keyCode === 27) {
            this.setState({
                showSuggest: false,
                arrowdownCount: 0,
            });
        }
    }

    scrollToActiveItem() {
        setTimeout(() => {
            let cont = ReactDOM.findDOMNode(this.container);
            let $item = $(cont).find('.item.active');
            if($item.length > 0) {
                let $cont = $(cont);
                let $menu = $(cont).find('.menu');
                let contHeight = $cont.outerHeight(true);
                let menuHeight = $menu.height();
                let contBtm = $cont.offset().top + contHeight;
                let itemTop = $item.offset().top;
                if(itemTop > contBtm + menuHeight || itemTop < contBtm) {
                    // $item.get(0).scrollIntoView(false);
                    $item.get(0).parentNode.scrollTop = $item.get(0).offsetTop;
                }
            }
        }, 100);

        setTimeout(() => {
            this.input.selectionStart = this.input.selectionEnd = 10000;
        }, 0);
    }

    iterSuggest(e) {
        const {showSuggest, suggests} = this.state;
        const {name, value} = this.input;
        let {arrowdownCount} = this.state;
        if(suggests.length > 0) {
            //up
            if (e.keyCode === 38) {
                arrowdownCount = (arrowdownCount - 1 < 0) ? suggests.length -1 : arrowdownCount - 1;
                this.setState({
                    arrowdownCount,
                });
                this.scrollToActiveItem();
            }

            //down
            if (e.keyCode === 40) {
                if(!showSuggest)
                    arrowdownCount = this.matchFirst(value);
                else
                    arrowdownCount += 1;

                this.setState({
                    arrowdownCount,
                    showSuggest: suggests.length > 0,
                });
                this.scrollToActiveItem();
            }

            //home
            if (e.keyCode === 36 && !(e.ctrlKey || e.shiftKey || e.altKey)) {
                if(showSuggest) {
                    this.setState({
                        arrowdownCount: 0,
                    });
                    this.scrollToActiveItem();
                }
            }

            //end
            if (e.keyCode === 35 && !(e.ctrlKey || e.shiftKey || e.altKey)) {
                if(showSuggest) {
                    this.setState({
                        arrowdownCount: suggests.length - 1,
                    });
                    this.scrollToActiveItem();
                }
            }
        }
    }

    enterSuggest(e) {
        //enter
        if (e.keyCode === 13) {
            const {showSuggest, arrowdownCount, suggests} = this.state;
            if(showSuggest) {
                const {name} = this.input;
                let value = suggests[arrowdownCount % suggests.length];
                this.onSuggestChange(name, {
                    value,
                    showSuggest: false,
                    arrowdownCount: 0,
                });
            }
        }
    }

    onInputKeyDown(e) {
        this.cancelSuggest(e);
        this.iterSuggest(e);
        this.enterSuggest(e);
    }

    onBtnKeyDown(e) {
        e.preventDefault();
        this.cancelSuggest(e);
        this.iterSuggest(e);
        this.enterSuggest(e);
    }

    onDropdownClick(e) {
        clearTimeout(this.blurTimeout);
        const {suggests} = this.props;
        const {value} = this.input;

        this.setState({
            suggests,
            showSuggest: true,
            isSuggestHover: false,
            arrowdownCount: this.matchFirst(value),
        });
        this.scrollToActiveItem();
    }

    onSuggestSelect(e, value) {
        e.preventDefault();
        const {suggests} = this.props;
        const {name} = this.input;
        this.onSuggestChange(name, {
            value,
            showSuggest: false,
            arrowdownCount: 0,
            selectFromDropdown: true,
            suggests,
        });
    }

    onSuggestBlur(e) {
        const {suggests} = this.props;
        this.blurTimeout = setTimeout(() => this.setState({
            showSuggest: false,
            arrowdownCount: 0,
            suggests,
        }), 200);
    }

    onSuggestHover(e, over) {
        if(over) {
            this.setState({
                isSuggestHover: true,
            });
        } else {
            this.setState({
                isSuggestHover: false,
            });
        }
    }

    renderSuggests() {
        const {inputSize} = this.props;
        const {showSuggest, suggests, arrowdownCount, isSuggestHover} = this.state;
        let menuCls = classnames({
            menu: true,
            ['menu-'+inputSize]: inputSize,
        });
        let itemClses = suggests.map((_, i) => classnames({
            item: true,
            active: arrowdownCount % suggests.length == i && !isSuggestHover,
        }));
        return (
            showSuggest ?
            <div className={menuCls}>
                {
                    suggests.map((s, i) => <div key={i} className={itemClses[i]}>
                                               <a href="#"
                                                  onClick={e => this.onSuggestSelect(e, s)}
                                                  onMouseOver={e => this.onSuggestHover(e, true)}
                                                  onMouseOut={e => this.onSuggestHover(e, false)}>
                                                  {s}</a>
                                           </div>)
                }
            </div> :
            null
        );
    }

    render() {
        const {inputSize, inputProps} = this.props;
        const {value, selectFromDropdown} = this.state;
        let grpCls = classnames({
            'input-group': true,
            'auto-suggest': true,
            ['input-group-'+inputSize]: inputSize,
        });
        return (
            <div ref={container => this.container = container} className={grpCls}>
                <input ref={input => this.input = input} className="form-control" {...inputProps} value={value} onChange={this.onInputChange} onFocus={this.onInputFocus} onBlur={this.onSuggestBlur} onKeyDown={this.onInputKeyDown}/>
                <span className="input-group-btn">
                    <button tabIndex="-1" className="btn btn-secondary" type="button" onClick={this.onDropdownClick}  onBlur={this.onSuggestBlur} onKeyDown={this.onBtnKeyDown}>
                        <i className="caret"/>
                    </button>
                </span>
                {this.renderSuggests()}
            </div>
        );
    }
}
