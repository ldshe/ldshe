import classnames from 'classnames';
import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import Textcomplete from 'textcomplete';
import Textarea from 'textcomplete/lib/textarea';

export default class TextareaComplete extends Component {

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
        this.onInputChange = this.onInputChange.bind(this);
        this.state = {
            propsValueChanged: false,
            propsValue: null,
        };
    }

    componentDidMount() {
        const {defaultValue, suggests} = this.props;
        this.input.value = this.props.defaultValue || this.props.value || '';
        this.textarea = new Textarea(ReactDOM.findDOMNode(this.input));
        this.textcomplete = new Textcomplete(this.textarea);
        this.textcomplete.register([
            {
                match: /(^|\B)\?([\-+\w]*)$/,
                search: (term, callback) => callback(suggests.filter(s => s.toUpperCase().startsWith(term && term.toUpperCase()))),
                replace: value => '$1' + value + ', ',
                template: value => value,
            }
        ]);
        this.textarea.on('change', this.onInputChange);
    }

    componentDidUpdate(nextProps) {
        const {propsValueChanged, propsValue} = this.state;
        if(propsValueChanged) {
            const {name} = this.input;
            this.input.value = propsValue;
        }
    }

    componentWillUnmount() {
        this.textarea.off('change', this.onInputChange);
        this.textcomplete.destroy();
    }

    onInputChange(e) {
        const {readOnly} = this.props;
        if(readOnly) {
            this.input.value = this.props.value;
            return;
        }

        const {name, value} = this.input;
        const {onFieldChange} = this.props;
        setTimeout(() => onFieldChange(name, value), 0);
    }

    render() {
        const {inputSize, inputProps} = this.props;
        let textCls = classnames({
            'form-control': true,
            'enchanced': true,
            ['input-'+inputSize]: inputSize,
        });
        return (
            <div ref={container => this.container = container} className="textarea-complete">
                <textarea
                    ref={input => this.input = input}
                    className={textCls}
                    {...inputProps}/>
            </div>
        );
    }
}
