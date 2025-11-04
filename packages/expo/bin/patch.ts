import fs from 'fs';

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

const patchMmkvGet = () => {
  const match1 = '                        Bundle bundle = kv.decodeParcelable(key, Bundle.class);';
  const repmt1 = '                        try { Bundle bundle = kv.decodeParcelable(key, Bundle.class);';
  const match2 = '                        callback.invoke(null, map != null ? map : null);';
  const repmt2 = '                        callback.invoke(null, map != null ? map : null); } catch (Exception e) { callback.invoke("Failed to decode parcelable for key " + key, null); }';

  replaceMatchedLine(
    'node_modules/react-native-mmkv-storage/android/src/main/java/com/ammarahmed/mmkv/StorageGetters.java',
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

const patchLexoRank = () => {
  const fpath = 'node_modules/@wewatch/lexorank/package.json';
  const text = fs.readFileSync(fpath, 'utf-8');

  let outs = text.trim().split(/\r?\n/);

  const match = '      "types": "./dist/types/index.d.ts",';
  const anchor = '      "require": "./dist/cjs/index.js",';
  if (outs.includes(match)) return;

  const i = outs.indexOf(anchor);
  if (i < 0) {
    console.log('In patchLexoRank, invalid i:', i);
    return;
  }

  outs = [...outs.slice(0, i), match, ...outs.slice(i)];
  fs.writeFileSync(fpath, outs.join('\n') + '\n');
};

patchMmkv();
patchMmkvGet();
patchExpoShareIntent();
patchLexoRank();
