import React from 'react';
import ReactDOM from 'react-dom';
import createApp from './app/front';
import {getProps} from 'js/util';

const selector = '#front';

$(() => {
    const $mnt = $(selector);
    const props = getProps(selector);
    ReactDOM.render(createApp(props), $mnt.get(0));
});
