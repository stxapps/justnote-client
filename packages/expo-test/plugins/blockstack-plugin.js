const { withPodfile } = require('@expo/config-plugins');

module.exports = function withBlockstack(config) {
  return withPodfile(config, (config) => {
    const lines = config.modResults.contents.split('\n');

    const newLines = [];
    for (const line of lines) {
      newLines.push(line);
      if (line.startsWith('target ')) {
        newLines.push("  pod 'Blockstack', :git => 'https://github.com/bracedotto/blockstack-ios.git', :commit => '5b4ffc1'");
      }
    }

    config.modResults.contents = newLines.join('\n');
    return config;
  });
}
