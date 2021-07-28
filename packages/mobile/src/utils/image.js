import ImageResizer from 'react-native-image-resizer';
import { Dirs, FileSystem } from 'react-native-file-access';

import { splitOnFirst } from './index';

export const resizeImage = async (name, base64Str, maxWidth = 1688, maxHeight = 1688) => {

  // react-native-image-resizer only supports png and jpg
  const ext = name.split('.').slice(-1)[0];
  if (!['png', 'jpg', 'jpeg', 'jfif', 'pjpeg', 'pjp'].includes(ext)) return base64Str;

  const compressFormat = ext === 'png' ? 'PNG' : 'JPEG';
  const base64Prefix = splitOnFirst(base64Str, ',')[0];

  try {
    const response = await ImageResizer.createResizedImage(
      base64Str,
      maxWidth, maxHeight, compressFormat, 92, 0, Dirs.CacheDir,
      false, { mode: 'contain', onlyScaleDown: true }
    );

    let resizedBase64Str = await FileSystem.readFile(response.path, 'base64');
    resizedBase64Str = base64Prefix + ',' + resizedBase64Str;

    return resizedBase64Str;
  } catch (e) {
    console.log('Unable to resize image. resizeImage throws error: ', e);
    return base64Str;
  }
};
