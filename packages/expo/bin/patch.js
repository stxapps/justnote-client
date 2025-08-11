const fs = require('fs');

const replaceMatchedLine = (fpath, actionObjs) => {
  const text = fs.readFileSync(fpath, 'utf-8');
  const lines = text.trim().split(/\r?\n/);

  const outs = [];
  for (const line of lines) {
    let didMatch = false;
    for (const actionObj of actionObjs) {
      const { match, repmt } = actionObj;
      if (line === match) {
        outs.push(repmt);
        didMatch = true;
        break;
      }
    }
    if (didMatch) continue;

    outs.push(line);
  }

  fs.writeFileSync(fpath, outs.join('\n') + '\n');
};

const patchMmkv = () => {
  const match = "    implementation 'com.tencent:mmkv-static:1.2.7'";
  const repmt = "    implementation 'com.tencent:mmkv-static:1.3.14'";
  replaceMatchedLine(
    'node_modules/react-native-mmkv-storage/android/build.gradle',
    [{ match, repmt }],
  );

  const match1 = "                  value:(BOOL *)value";
  const repmt1 = "                  value:(BOOL)value";
  const match2 = "                  isArray:(BOOL *)isArray";
  const repmt2 = "                  isArray:(BOOL)isArray";
  replaceMatchedLine(
    'node_modules/react-native-mmkv-storage/ios/MMKVStorage.m',
    [{ match: match1, repmt: repmt1 }, { match: match2, repmt: repmt2 }],
  );
};

const patchExpoShareIntent = () => {
  const match = '    if (project.pbxGroupByName(group).path)';
  const repmt = '    if (project.pbxGroupByName(group)&&project.pbxGroupByName(group).path)';

  replaceMatchedLine(
    'node_modules/xcode/lib/pbxProject.js',
    [{ match, repmt }],
  );
};

patchMmkv();
patchExpoShareIntent();
