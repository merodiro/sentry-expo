"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSentryProperties = void 0;
const config_plugins_1 = require("@expo/config-plugins");
const withSentryAndroid_1 = require("./withSentryAndroid");
const withSentryIOS_1 = require("./withSentryIOS");
const pkg = require('../../package.json');
const withSentry = (config) => {
    const sentryProperties = getSentryProperties(config);
    if (sentryProperties !== null) {
        try {
            config = withSentryAndroid_1.withSentryAndroid(config, sentryProperties);
        }
        catch (e) {
            config_plugins_1.WarningAggregator.addWarningAndroid('sentry-expo', 'There was a problem configuring sentry-expo in your native Android project: ' + e);
        }
        try {
            config = withSentryIOS_1.withSentryIOS(config, sentryProperties);
        }
        catch (e) {
            config_plugins_1.WarningAggregator.addWarningIOS('sentry-expo', 'There was a problem configuring sentry-expo in your native iOS project: ' + e);
        }
    }
    return config;
};
const missingAuthTokenMessage = `# no auth.token found, falling back to SENTRY_AUTH_TOKEN environment variable`;
const missingProjectMessage = `# no project found, falling back to SENTRY_PROJECT environment variable`;
const missingOrgMessage = `# no org found, falling back to SENTRY_ORG environment variable`;
function getSentryProperties(config) {
    var _a, _b, _c, _d;
    const sentryHook = [
        ...((_b = (_a = config.hooks) === null || _a === void 0 ? void 0 : _a.postPublish) !== null && _b !== void 0 ? _b : []),
        ...((_d = (_c = config.hooks) === null || _c === void 0 ? void 0 : _c.postExport) !== null && _d !== void 0 ? _d : []),
    ].filter((hook) => hook.file === 'sentry-expo/upload-sourcemaps')[0];
    if (!sentryHook) {
        return null;
    }
    if (!sentryHook.config) {
        config_plugins_1.WarningAggregator.addWarningAndroid('sentry-expo', 'No Sentry config found in app.json, builds will fall back to environment variables. Refer to @sentry/react-native docs for how to configure this.');
        config_plugins_1.WarningAggregator.addWarningIOS('sentry-expo', 'No Sentry config found in app.json, builds will fall back to environment variables. Refer to @sentry/react-native docs for how to configure this.');
        return '';
    }
    return buildSentryPropertiesString(sentryHook.config);
}
exports.getSentryProperties = getSentryProperties;
function buildSentryPropertiesString(sentryHookConfig) {
    const { organization, project, authToken, url = 'https://sentry.io/' } = sentryHookConfig !== null && sentryHookConfig !== void 0 ? sentryHookConfig : {};
    const missingProperties = ['organization', 'project', 'authToken'].filter((each) => {
        if (!(sentryHookConfig === null || sentryHookConfig === void 0 ? void 0 : sentryHookConfig.hasOwnProperty(each))) {
            return true;
        }
        return false;
    });
    if (missingProperties.length) {
        const warningMessage = `Missing Sentry configuration properties: ${missingProperties.join(', ')} from app.json. Builds will fall back to environment variables. Refer to @sentry/react-native docs for how to configure this.`;
        config_plugins_1.WarningAggregator.addWarningAndroid('sentry-expo', warningMessage);
        config_plugins_1.WarningAggregator.addWarningIOS('sentry-expo', warningMessage);
    }
    return `defaults.url=${url}
${organization ? `defaults.org=${organization}` : missingOrgMessage}
${project ? `defaults.project=${project}` : missingProjectMessage}
${authToken ? `auth.token=${authToken}` : missingAuthTokenMessage}
`;
}
exports.default = config_plugins_1.createRunOncePlugin(withSentry, pkg.name, pkg.version);
