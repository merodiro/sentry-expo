import { WarningAggregator } from '@expo/config-plugins';

import { modifyExistingXcodeBuildScript } from '../withSentryIOS';

const buildScriptWithoutSentry = {
  shellScript:
    '"export NODE_BINARY=node\\n../node_modules/react-native/scripts/react-native-xcode.sh"',
};

const buildScriptWithSentry = {
  shellScript:
    '"export SENTRY_PROPERTIES=sentry.properties\\nexport EXTRA_PACKAGER_ARGS=\\"--sourcemap-output $DERIVED_FILE_DIR/main.jsbundle.map\\"\\nexport NODE_BINARY=node\\n`node --print \\"require.resolve(\'@sentry/cli/package.json\').slice(0, -13) + \'/bin/sentry-cli\'\\"` react-native xcode --force-foreground ../node_modules/react-native/scripts/react-native-xcode.sh"',
};

const monorepoBuildScriptWithoutSentry = {
  shellScript:
    '"export NODE_BINARY=node\\n`node --print \\"require.resolve(\'react-native/package.json\').slice(0, -13) + \'/scripts/react-native-xcode.sh\'\\"`"',
};

const monorepoBuildScriptWithSentry = {
  shellScript:
    '"export SENTRY_PROPERTIES=sentry.properties\\nexport EXTRA_PACKAGER_ARGS=\\"--sourcemap-output $DERIVED_FILE_DIR/main.jsbundle.map\\"\\nexport NODE_BINARY=node\\n`node --print \\"require.resolve(\'@sentry/cli/package.json\').slice(0, -13) + \'/bin/sentry-cli\'\\"` react-native xcode --force-foreground `node --print \\"require.resolve(\'react-native/package.json\').slice(0, -13) + \'/scripts/react-native-xcode.sh\'\\"`"',
};

const buildScriptWeDontExpect = {
  shellScript: `
  `,
};

describe('Configures iOS native project correctly', () => {
  beforeAll(() => {
    WarningAggregator.flushWarningsIOS();
  });

  it(`Doesn't modify build script if Sentry's already configured`, () => {
    const script = Object.assign({}, buildScriptWithSentry);
    modifyExistingXcodeBuildScript(script);
    expect(script).toStrictEqual(buildScriptWithSentry);
  });

  it(`Add Sentry configuration to 'Bundle React Native Code' build script`, () => {
    const script = Object.assign({}, buildScriptWithoutSentry);
    modifyExistingXcodeBuildScript(script);
    expect(script).toStrictEqual(buildScriptWithSentry);
  });

  it(`Monorepo: doesn't modify build script if Sentry's already configured`, () => {
    const script = Object.assign({}, monorepoBuildScriptWithSentry);
    modifyExistingXcodeBuildScript(script);
    expect(script).toStrictEqual(monorepoBuildScriptWithSentry);
  });

  it(`Monorepo: add Sentry configuration to 'Bundle React Native Code' build script`, () => {
    const script = Object.assign({}, monorepoBuildScriptWithoutSentry);
    modifyExistingXcodeBuildScript(script);
    expect(script).toStrictEqual(monorepoBuildScriptWithSentry);
  });

  it(`Warns to file a bug report if build script isn't what we expect to find`, () => {
    modifyExistingXcodeBuildScript(buildScriptWeDontExpect);
    expect(WarningAggregator.hasWarningsIOS).toBeTruthy();
  });
});
