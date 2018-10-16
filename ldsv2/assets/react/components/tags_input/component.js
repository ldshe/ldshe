import classnames from 'classnames';
import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import 'selectize';

export default class TagsInput extends Component {

    static getDerivedStateFromProps(nextProps, prevState) {
        if(prevState.value && nextProps.value &&
            prevState.value.toString() != nextProps.value.toString()) {
                return {
                    value: nextProps.value,
                };
        }
        return null;
    }

    constructor(props, context) {
        super(props, context);
        this.initOptions = this.initOptions.bind(this);
        this.initItems = this.initItems.bind(this);
        this.onInputChange = this.onInputChange.bind(this);
        this.state = {
            value: props.defaultValue || props.value || [],
        };
    }

    getSnapshotBeforeUpdate(prevProps, prevState) {
        let propOptChange = false;
        let propItmChange = false;
        if(this.props.selectizeOptions && this.props.selectizeOptions.options) {
            if(!prevProps.selectizeOptions || !prevProps.selectizeOptions.options)
                propOptChange = true;
            else {
                if(prevProps.selectizeOptions.options.toString() != this.props.selectizeOptions.options.toString())
                    propOptChange = true;
            }
        }
        if(this.props.selectizeOptions && this.props.selectizeOptions.items) {
            if(!prevProps.selectizeOptions || !prevProps.selectizeOptions.items)
                propItmChange = true;
            else {
                if(prevProps.selectizeOptions.items.toString() != this.props.selectizeOptions.items.toString())
                    propItmChange = true;
            }
        }
        return {
            propOptChange,
            propItmChange,
        };
    }

    componentDidMount() {
        const {selectizeOptions} = this.props;
        let $input = $(ReactDOM.findDOMNode(this.input));
        let $selectize = selectizeOptions ?
            $input.selectize(selectizeOptions) :
            $input.selectize();
        this.initOptions($selectize);
        this.initItems($selectize);
        $selectize.on('change', this.onInputChange);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const {propOptChange, propItmChange} = snapshot;
        if(propOptChange || propItmChange) {
            let $input = $(ReactDOM.findDOMNode(this.input));
            let $selectize = $input.selectize();
            $selectize.off('change', this.onInputChange);
            if(propOptChange) this.initOptions($selectize, true);
            if(propItmChange) this.initItems($selectize, true);
            $selectize.on('change', this.onInputChange);
        }
    }

    componentWillUnmount() {
        let $input = $(ReactDOM.findDOMNode(this.input));
        let $selectize = $input.selectize();
        $selectize.off('change');
        $selectize[0].selectize.destroy();
    }

    initOptions($selectize, reset=false) {
        const {selectizeOptions} = this.props;
        let selectize = $selectize[0].selectize;

        if(reset) selectize.removeOptionGroup();

        if(selectizeOptions && selectizeOptions.options) {
            if(Array.isArray(selectizeOptions.options)) {
                selectizeOptions.options
                    .forEach(o => selectize.addOption({text: o, value: o}));
            } else {
                Object.keys(selectizeOptions.options)
                    .forEach(k => selectize.addOption({text: k, value: selectizeOptions.options[k]}));
            }
        }
    }

    initItems($selectize, reset=false) {
        const {selectizeOptions} = this.props;
        let selectize = $selectize[0].selectize;

        if(reset) selectize.clear(true);

        if(selectizeOptions && selectizeOptions.items) {
            selectizeOptions.items
                .forEach(i => selectize.addItem(i));
        }
    }

    onInputChange() {
        const {readOnly} = this.props;
        let $input = $(ReactDOM.findDOMNode(this.input));
        let $selectize = $input.selectize();
        if(readOnly) {
            $selectize[0].selectize.clear(true);
            this.state.value.forEach(v => $selectize[0].selectize.addItem(v, true));
        } else {
            const {onFieldChange} = this.props;
            let items = $selectize[0].selectize.items;
            this.setState({value: items});
            setTimeout(() => onFieldChange($input.attr('name'), items), 100);
        }
    }

    render() {
        const {value} = this.state;
        const {inputSize, options, inputProps} = this.props;
        let inputCls = classnames({
            'form-control': true,
            ['input-'+inputSize]: inputSize,
        });
        return options ?
            <select ref={input => this.input = input} className={inputCls} defaultValue={value} multiple={true} {...inputProps}>
                {Object.keys(options).map(o => <option key={o} value={options[o]}>{o}</option>)}
            </select> :
            <input ref={input => this.input = input} className={inputCls} type="text" {...inputProps}/>
    }
}
