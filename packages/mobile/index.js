import { AppRegistry } from 'react-native';

import Root, { ShareRoot } from './src';
import appJson from './app.json';

AppRegistry.registerComponent(appJson.projectName, () => Root);
AppRegistry.registerComponent(appJson.shareName, () => ShareRoot);
