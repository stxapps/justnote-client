import { AppRegistry } from 'react-native';

import Root from './src';
import appJson from './app.json';

AppRegistry.registerComponent(appJson.projectName, () => Root);
