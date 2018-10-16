import React, {Component} from 'react';
import 'jquery-bootstrap-scrolling-tabs';

export default class PatternSettings extends Component {

    constructor(props, context) {
        super(props, context);
        this.keepNavigationActive = this.keepNavigationActive.bind(this);
        this.setTabActive = this.setTabActive.bind(this);
        this.setNavigationActive = this.setNavigationActive.bind(this);
        this.setActivitySettingsActive = this.setActivitySettingsActive.bind(this);
        this.keepNavTab = false;
    }

    componentDidMount() {
        $('.settings.nav-tabs').scrollingTabs();
    }

    componentWillUnmount() {
        $('.settings.nav-tabs').scrollingTabs('destroy');
    }

    keepNavigationActive() {
        this.keepNavTab = true;
    }

    setTabActive(tab, pane) {
        $('a[id^="settings-tab-"]').parent().removeClass('active');
        $('.canvas-settings .tab-pane').removeClass('active');
        $(`#${tab}`).parent().addClass('active');
        $(`#${pane}`).addClass('active');
    }

    setNavigationActive() {
        this.setTabActive('settings-tab-navigation', 'settings-navigation');
    }

    setActivitySettingsActive() {
        if(this.keepNavTab) {
            this.keepNavTab = false;
            return;
        }
        this.setTabActive('settings-tab-activity', 'settings-activity');
    }

    render() {
        let navigationContent = null;
        if(this.props.navigationContent) {
            navigationContent = React.cloneElement(this.props.navigationContent, {
                keepNavigationActive: this.keepNavigationActive,
            });
        }

        let settingsContent = null;
        if(this.props.settingsContent) {
             settingsContent = React.cloneElement(this.props.settingsContent, {
                setNavigationActive: this.setNavigationActive,
                setActivitySettingsActive: this.setActivitySettingsActive,
            });
        }
        return (
            <div className="canvas-settings">
                <ul className="nav nav-tabs settings" role="tablist">
                    <li role="presentation" className="active">
                        <a id="settings-tab-navigation" href="#settings-navigation" role="tab" data-toggle="tab">Navigation</a>
                    </li>
                    <li role="presentation">
                        <a id="settings-tab-activity" href="#settings-activity" role="tab" data-toggle="tab">Task Settings</a>
                    </li>
                </ul>
                <div className="tab-content">
                    <div role="tabpanel" className="navigation tab-pane" id="settings-navigation">{navigationContent}</div>
                    <div role="tabpanel" className="activity tab-pane" id="settings-activity">{settingsContent}</div>
                </div>
            </div>
        );
    }
}
