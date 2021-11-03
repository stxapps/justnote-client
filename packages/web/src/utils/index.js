import Url from 'url-parse';

import {
  HTTP, MAX_CHARS, CD_ROOT,
  ADDING, UPDATING, MOVING, DELETING, MERGING,
  DIED_ADDING, DIED_UPDATING, DIED_MOVING, DIED_DELETING, DIED_MERGING,
  VALID_URL, NO_URL, ASK_CONFIRM_URL,
  VALID_LIST_NAME, NO_LIST_NAME, TOO_LONG_LIST_NAME, DUPLICATE_LIST_NAME,
} from '../types/const';

export const containUrlProtocol = (url) => {
  const urlObj = new Url(url, {});
  return urlObj.protocol && urlObj.protocol !== '';
};

export const ensureContainUrlProtocol = (url) => {
  if (!containUrlProtocol(url)) return HTTP + url;
  return url;
};

export const ensureContainUrlSecureProtocol = (url) => {
  const urlObj = new Url(url, {});
  urlObj.set('protocol', 'https');
  return urlObj.toString();
};

export const extractUrl = (url) => {
  url = ensureContainUrlProtocol(url);
  const urlObj = new Url(url, {});
  return {
    host: urlObj.host,
    origin: urlObj.origin,
    pathname: urlObj.pathname,
  };
};

export const getUrlFirstChar = (url) => {
  url = ensureContainUrlProtocol(url);
  const urlObj = new Url(url, {});

  return urlObj.hostname.split('.').slice(-2)[0][0];
};

export const validateUrl = (url) => {

  if (!url) return NO_URL;
  if (/\s/g.test(url)) return ASK_CONFIRM_URL;

  url = ensureContainUrlProtocol(url);

  const urlObj = new Url(url, {});
  if (!urlObj.hostname.match(/^([-a-zA-Z0-9@:%_+~#=]{1,256}\.)+[a-z]{2,8}$/)) {
    return ASK_CONFIRM_URL;
  }

  return VALID_URL;
};

export const separateUrlAndParam = (url, paramKey) => {

  const doContain = containUrlProtocol(url);
  url = ensureContainUrlProtocol(url);

  const urlObj = new Url(url, {}, true);

  const newQuery = {}, param = {};
  for (const key in urlObj.query) {
    if (Array.isArray(paramKey)) {
      if (paramKey.includes(key)) {
        param[key] = urlObj.query[key];
      } else {
        newQuery[key] = urlObj.query[key];
      }
    } else {
      if (key === paramKey) {
        param[key] = urlObj.query[key];
      } else {
        newQuery[key] = urlObj.query[key];
      }
    }
  }

  urlObj.set('query', newQuery);

  let separatedUrl = urlObj.toString();
  if (!doContain) {
    separatedUrl = separatedUrl.substring(HTTP.length);
  }

  return { separatedUrl, param };
};

export const getUrlPathQueryHash = (url) => {

  const urlObj = new Url(url, {});

  let i;
  if (!urlObj.protocol || urlObj.protocol === '') i = 1;
  else if (!urlObj.slashes) i = 2;
  else i = 3;

  return url.split('/').slice(i).join('/');
};

export const getUserImageUrl = (userData) => {

  let userImage = null;
  if (userData && userData.profile) {
    if (userData.profile.image) userImage = userData.profile.image;
    else if (
      userData.profile.decodedToken &&
      userData.profile.decodedToken.payload &&
      userData.profile.decodedToken.payload.claim &&
      userData.profile.decodedToken.payload.claim.image
    ) userImage = userData.profile.decodedToken.payload.claim.image;
  }

  let userImageUrl = null;
  if (userImage) {
    if (Array.isArray(userImage) && userImage.length > 0) {
      userImageUrl = userImage[0].contentUrl || null;
    }
  }

  return userImageUrl;
};

export const throttle = (func, limit) => {
  let lastFunc;
  let lastRan;
  return function () {
    const context = this;
    const args = arguments;
    if (!lastRan) {
      func.apply(context, args);
      lastRan = Date.now();
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(function () {
        if ((Date.now() - lastRan) >= limit) {
          func.apply(context, args);
          lastRan = Date.now();
        }
      }, limit - (Date.now() - lastRan));
    }
  };
};

export const isObject = val => {
  return typeof val === 'object' && val !== null;
};

export const isString = val => {
  return typeof val === 'string' || val instanceof String;
};

export const isEqual = (x, y) => {
  if (x === y) return true;
  // if both x and y are null or undefined and exactly the same

  if (!(x instanceof Object) || !(y instanceof Object)) return false;
  // if they are not strictly equal, they both need to be Objects

  if (x.constructor !== y.constructor) return false;
  // they must have the exact same prototype chain, the closest we can do is
  // test there constructor.

  for (const p in x) {
    if (!x.hasOwnProperty(p)) continue;
    // other properties were tested using x.constructor === y.constructor

    if (!y.hasOwnProperty(p)) return false;
    // allows to compare x[ p ] and y[ p ] when set to undefined

    if (x[p] === y[p]) continue;
    // if they have the same strict value or identity then they are equal

    if (typeof (x[p]) !== 'object') return false;
    // Numbers, Strings, Functions, Booleans must be strictly equal

    if (!isEqual(x[p], y[p])) return false;
    // Objects and Arrays must be tested recursively
  }

  for (const p in y) {
    if (y.hasOwnProperty(p) && !x.hasOwnProperty(p)) return false;
    // allows x[ p ] to be set to undefined
  }
  return true;
};

export const isArrayEqual = (arr1, arr2) => {
  // if the other array is a falsy value, return
  if (!arr1 || !arr2) return false;

  // compare lengths - can save a lot of time
  if (arr1.length !== arr2.length) return false;

  for (let i = 0, l = arr1.length; i < l; i++) {
    // Check if we have nested arrays
    if (arr1[i] instanceof Array && arr2[i] instanceof Array) {
      // recurse into the nested arrays
      if (!isArrayEqual(arr1[i], arr2[i])) return false;
    } else if (arr1[i] !== arr2[i]) {
      // Warning - two different object instances will never be equal: {x:20} != {x:20}
      return false;
    }
  }

  return true;
};

export const urlHashToObj = (hash) => {

  if (hash === null || hash === undefined || !isString(hash)) {
    throw new Error(`Invalid hash: ${hash}`);
  }

  const obj = {};
  if (hash === '' || hash === '#' || hash === '#?') return obj;
  if (hash.startsWith('#')) hash = hash.slice(1);
  if (hash.startsWith('?')) hash = hash.slice(1);

  const arr = hash.split('&');
  for (const el of arr) {
    const kv = el.split('=');
    if (kv.length !== 2) throw new Error(`Invalid hash: ${hash}`);
    obj[kv[0]] = kv[1];
  }

  return obj;
};

export const objToUrlHash = (obj) => {

  let s = '';
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined) throw new Error(`Invalid obj: ${obj}`);
    if (v === null) continue;

    if (s.length > 0) s += '&';
    s += k + '=' + v;
  }

  return `#?${s}`;
};

export const getListNameDisplayName = (listName, listNameMap) => {
  for (const listNameObj of listNameMap) {
    if (listNameObj.listName === listName) return listNameObj.displayName;
  }

  // Not throw an error because it can happen:
  //   - Delete a note
  //   - Delete a list name
  //   - Commit delete the note -> cause rerender without the list name!
  console.log(`getListNameDisplayName: invalid listName: ${listName} and listNameMap: ${listNameMap}`);
  return listName;
};

export const doContainListName = (listName, listNameObjs) => {

  for (const listNameObj of listNameObjs) {
    if (listNameObj.listName === listName) return true;
  }

  return false;
};

export const doContainListNameDisplayName = (displayName, listNameObjs) => {

  for (const listNameObj of listNameObjs) {
    if (listNameObj.displayName === displayName) return true;
  }

  return false;
};

export const validateListNameDisplayName = (displayName, listNameMap) => {

  // Validate:
  //   1. Empty 2. Contain space at the begining or the end 3. Contain invalid characters
  //   4. Too long 5. Duplicate
  //
  // 2 and 3 are not the problem because this is display name!

  if (!displayName || !isString(displayName) || displayName === '') return NO_LIST_NAME;
  if (displayName.length > 256) return TOO_LONG_LIST_NAME;

  if (doContainListNameDisplayName(displayName, listNameMap)) return DUPLICATE_LIST_NAME;

  return VALID_LIST_NAME;
};

export const isDiedStatus = (status) => {
  return [
    DIED_ADDING, DIED_UPDATING, DIED_MOVING, DIED_DELETING, DIED_MERGING,
  ].includes(status);
};

export const isBusyStatus = (status) => {
  return [
    ADDING, UPDATING, MOVING, DELETING, MERGING,
  ].includes(status);
};

export const getLastHalfHeight = (height, textHeight, pt, pb, halfRatio = 0.6) => {
  const x = Math.floor((height - pt - pb) / textHeight) - 1;
  return Math.round((textHeight * x + textHeight * halfRatio) + pt + pb);
};

export const randInt = (max) => {
  return Math.floor(Math.random() * Math.floor(max));
};

export const sample = (arr) => {
  return arr[Math.floor(Math.random() * arr.length)];
};

export const randomString = (length) => {
  // Important - characters can't contain numbers
  //   as this random string might append to timestamp.
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  const charactersLength = characters.length;

  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

export const containUppercase = (letters) => {
  for (let i = 0; i < letters.length; i++) {
    if (letters[i] === letters[i].toUpperCase()
      && letters[i] !== letters[i].toLowerCase()) {
      return true;
    }
  }
  return false;
};

export const isStringIn = (note, searchString) => {

  let title = note.title.slice(0, MAX_CHARS);
  if (!containUppercase(searchString)) title = title.toLowerCase();

  let body = stripHtml(note.body).slice(0, MAX_CHARS);
  if (!containUppercase(searchString)) body = body.toLowerCase();

  const content = title + ' ' + body;
  const searchWords = searchString.split(' ');

  return searchWords.every(word => content.includes(word));
};

export const swapArrayElements = (a, x, y) => (a[x] && a[y] && [
  ...a.slice(0, x),
  a[y],
  ...a.slice(x + 1, y),
  a[x],
  ...a.slice(y + 1),
]) || a;

export const getInsertIndex = (listNameObj, oldListNameMap, newListNameMap) => {

  // listNameObj is in oldListNameMap and try to find where to insert into newListNameMap
  //   while preserving the order.

  const i = oldListNameMap.findIndex(obj => obj.listName === listNameObj.listName);
  if (i < 0) {
    console.log(`getInsertIndex: invalid listNameObj: ${listNameObj} and oldListNameMap: ${oldListNameMap}`);
    return -1;
  }

  let prev = i - 1;
  let next = i + 1;
  while (prev >= 0 || next < oldListNameMap.length) {
    if (prev >= 0) {
      const listName = oldListNameMap[prev].listName;
      const listNameIndex = newListNameMap.findIndex(obj => obj.listName === listName);
      if (listNameIndex >= 0) return listNameIndex + 1;
      prev -= 1;
    }
    if (next < oldListNameMap.length) {
      const listName = oldListNameMap[next].listName;
      const listNameIndex = newListNameMap.findIndex(obj => obj.listName === listName);
      if (listNameIndex >= 0) return listNameIndex;
      next += 1;
    }
  }

  return -1;
};

export const getFormattedDT = (dt) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const d = new Date(dt);

  const year = d.getFullYear() % 2000;
  const month = months[d.getMonth()];
  const date = d.getDate();
  const hour = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');

  return `${date} ${month} ${year} ${hour}:${min}`;
};

export const stripHtml = (s) => {
  const codeRe = /&(nbsp|amp|quot|lt|gt);/g;
  const codeMap = { 'nbsp': ' ', 'amp': '&', 'quot': '"', 'lt': '<', 'gt': '>' };

  return s
    .replace(/(<([^>]+)>)/gi, ' ')
    .replace(codeRe, (match, entity) => codeMap[entity])
    .replace(/\s\s+/g, ' ')
    .trim();
};

const sortClassNamesInBody = (body) => {
  const subs = [];
  for (const match of body.matchAll(/<[^\s]+\s+class="([^"]+)"[^>]*>/g)) {
    const from = match[1];
    const classNames = from.trim().replace(/\s\s+/g, ' ').split(' ').sort();
    const to = classNames.join(' ');
    subs.push({ from, to });
  }

  for (const { from, to } of subs) body = body.split(from).join(to);

  return body;
};

export const isNoteBodyEqual = (s1, s2) => {
  // Remove spaces in rgb(r, g, b)
  const pattern = /rgb\((\d+),\s*(\d+),\s*(\d+)\)/gi;
  const substitute = 'rgb($1,$2,$3)';
  s1 = s1.replace(pattern, substitute);
  s2 = s2.replace(pattern, substitute);

  // Sort class names before comparing
  s1 = sortClassNamesInBody(s1);
  s2 = sortClassNamesInBody(s2);

  return s1 === s2;
};

export const clearNoteData = (note) => {
  return {
    ...note,
    title: '', body: '',
    media: note.media ? note.media
      .filter(m => !m.name.startsWith(CD_ROOT + '/'))
      .map(m => ({ name: m.name, content: '' })) : null,
  };
};

export const isIPadIPhoneIPod = () => {
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua)) {
    return true;
  }
  if (/Mac OS X/.test(ua) && /Safari/.test(ua) && !/Chrome/.test(ua) && !/Firefox/.test(ua)) {
    return true;
  }
  return false;
};

export const isMobile = () => {
  const ua = navigator.userAgent;
  if (/android/i.test(ua)) {
    return true;
  }
  if (isIPadIPhoneIPod()) {
    return true;
  }
  if (/windows phone/i.test(ua)) {
    return true;
  }
  return false;
};

export const replaceObjectUrls = (
  body, objectUrlContents, objectUrlFiles, objectUrlNames
) => {
  const sources = [];
  for (const match of body.matchAll(/<img.+?src="([^"]*)"[^>]*>/g)) {
    const src = match[1];
    if (src.startsWith('blob:') || src.startsWith('file:')) sources.push(src);
  }

  const media = [];
  for (const src of sources) {
    let fname, content;
    if (objectUrlContents[src]) {
      ({ fname, content } = objectUrlContents[src]);
      if (!fname) {
        console.log(`replaceObjectUrls: Not found fname in objectUrlContents: ${objectUrlContents} with src: ${src}`);
        continue;
      }
      if (!isString(content)) {
        console.log(`replaceObjectUrls: Not found content in objectUrlContents: ${objectUrlContents} with src: ${src}`);
        continue;
      }
    } else if (objectUrlFiles[src]) {
      ({ fname, content } = objectUrlFiles[src]);
      if (!fname) {
        console.log(`replaceObjectUrls: Not found fname in objectUrlFiles: ${objectUrlFiles} with src: ${src}`);
        continue;
      }
      if (!isString(content)) {
        console.log(`replaceObjectUrls: Not found content in objectUrlFiles: ${objectUrlFiles} with src: ${src}`);
        continue;
      }
    } else {
      console.log(`replaceObjectUrls: Not found src: ${src} in both objectUrlContents: ${objectUrlContents} and objectUrlFiles: ${objectUrlFiles}`);
      continue;
    }

    let name = objectUrlNames[src];
    if (!name) {
      if (fname.startsWith(CD_ROOT + '/')) name = fname;
      else {
        name = `${randomString(4)}-${randomString(4)}-${randomString(4)}-${randomString(4)}`;

        const ext = getFileExt(fname);
        if (ext) name += `.${ext}`;
        else {
          console.log(`replaceObjectUrls: Not found ext from filename: ${fname} with src: ${src}`);
        }
      }
    }

    media.push({ name, content });
    body = body.split(src).join(name);
  }

  return { body, media };
};

export const splitOnFirst = (str, sep) => {
  const i = str.indexOf(sep);
  if (i < 0) return [str, ''];

  return [str.slice(0, i), str.slice(i + sep.length)];
};

export const escapeDoubleQuotes = (s) => {
  return s.trim().replace(/\\/g, '\\\\').replace(/"/g, '\\"');
};

export const getFileExt = (fname) => {
  if (fname.includes('.')) {
    const ext = fname.split('.').pop();
    if (ext.length <= 5) return ext.toLowerCase();
  }
  return null;
};

export const getStaticFPath = (fpath) => {
  fpath = fpath.slice(fpath.indexOf(CD_ROOT + '/'));
  fpath = fpath.slice((CD_ROOT + '/').length);
  return fpath;
};

export const deriveFPaths = (media, noteMedia, savingFPaths) => {
  const usedFPaths = [], serverUnusedFPaths = [], localUnusedFPaths = [];

  for (const { name } of media) {
    if (!name.startsWith(CD_ROOT + '/')) continue;
    if (noteMedia && noteMedia.some(m => m.name === name)) continue;
    usedFPaths.push(getStaticFPath(name));
  }

  if (noteMedia) {
    for (const { name } of noteMedia) {
      if (!name.startsWith(CD_ROOT + '/')) continue;
      if (media.some(m => m.name === name)) continue;

      const staticFPath = getStaticFPath(name);
      serverUnusedFPaths.push(staticFPath);
      localUnusedFPaths.push(staticFPath);
    }
  }

  if (savingFPaths) {
    for (const fpath of savingFPaths) {
      if (media.some(m => m.name === fpath)) continue;
      localUnusedFPaths.push(getStaticFPath(fpath));
    }
  }

  return { usedFPaths, serverUnusedFPaths, localUnusedFPaths };
};

const fallbackCopyTextToClipboard = (text) => {
  var textArea = document.createElement('textarea');
  textArea.value = text;

  // Avoid scrolling to bottom
  textArea.style.top = '0';
  textArea.style.left = '0';
  textArea.style.position = 'fixed';

  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    var successful = document.execCommand('copy');
    var msg = successful ? 'successful' : 'unsuccessful';
    console.log('Fallback: Copying text command was ' + msg);
  } catch (err) {
    console.error('Fallback: Oops, unable to copy', err);
  }

  document.body.removeChild(textArea);
};

export const copyTextToClipboard = (text) => {
  if (!navigator.clipboard) {
    fallbackCopyTextToClipboard(text);
    return;
  }
  navigator.clipboard.writeText(text).then(function () {
    console.log('Async: Copying to clipboard was successful!');
  }, function (err) {
    console.error('Async: Could not copy text: ', err);
  });
};
