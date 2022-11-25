import { createSelector } from 'reselect';
import Url from 'url-parse';

import {
  HASH_FRAGMENT_IDENTIFIER, HTTP, MAX_CHARS, CD_ROOT, STATUS, NOTES, IMAGES, SETTINGS,
  PINS, DOT_JSON, ADDED, ADDING, UPDATING, MOVING, DELETING, MERGING,
  DIED_ADDING, DIED_UPDATING, DIED_MOVING, DIED_DELETING, DIED_MERGING,
  VALID_URL, NO_URL, ASK_CONFIRM_URL,
  VALID_LIST_NAME, NO_LIST_NAME, TOO_LONG_LIST_NAME, DUPLICATE_LIST_NAME,
  COM_JUSTNOTECC_SUPPORTER, ACTIVE, NO_RENEW, GRACE, ON_HOLD, PAUSED, UNKNOWN,
} from '../types/const';
import {
  PIN_NOTE, PIN_NOTE_ROLLBACK, UNPIN_NOTE, UNPIN_NOTE_ROLLBACK,
  MOVE_PINNED_NOTE, MOVE_PINNED_NOTE_ROLLBACK,
} from '../types/actionTypes';
import { _ } from './obj';

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
    hash: urlObj.hash,
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

export const debounce = (func, wait, immediate) => {
  let timeout;

  return function () {
    let context = this;
    let args = arguments;

    let later = function () {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };

    let callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);

    if (callNow) func.apply(context, args);
  };
};

export const sleep = ms => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const isObject = val => {
  return typeof val === 'object' && val !== null;
};

export const isString = val => {
  return typeof val === 'string' || val instanceof String;
};

export const isNumber = val => {
  return typeof val === 'number' && isFinite(val);
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
  const obj = { [HASH_FRAGMENT_IDENTIFIER]: '' };

  if (hash === null || hash === undefined || !isString(hash)) return obj;
  if (hash === '' || hash === '#' || hash === '#?') return obj;

  if (hash.startsWith('#')) hash = hash.slice(1);

  const qIndex = hash.indexOf('?');
  if (qIndex === -1) {
    if (hash.length > 0) obj[HASH_FRAGMENT_IDENTIFIER] = '#' + hash;
    return obj;
  }

  const hashId = hash.slice(0, qIndex);
  if (hashId.length > 0) obj[HASH_FRAGMENT_IDENTIFIER] = '#' + hashId;
  hash = hash.slice(qIndex + 1);

  const arr = hash.split('&');
  for (const el of arr) {
    const kv = el.split('=');
    if (kv.length === 2) obj[kv[0]] = kv[1];
  }

  return obj;
};

export const objToUrlHash = (obj) => {
  let h = '', s = '';
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined) throw new Error(`Invalid obj: ${obj}`);
    if (v === null) continue;

    if (k === HASH_FRAGMENT_IDENTIFIER) {
      h = obj[HASH_FRAGMENT_IDENTIFIER];
      continue;
    }

    if (s.length > 0) s += '&';
    s += k + '=' + v;
  }

  if (h.length !== 0 && s.length !== 0) return `${h}?${s}`;
  else if (h.length !== 0) return `${h}`;
  else if (s.length !== 0) return `#?${s}`;
  return '';
};

export const getListNameObj = (listName, listNameObjs, parent = null) => {
  if (!listName || !listNameObjs) return { listNameObj: null, parent: null };

  for (const listNameObj of listNameObjs) {
    if (listNameObj.listName === listName) return { listNameObj, parent };

    const res = getListNameObj(listName, listNameObj.children, listNameObj.listName);
    if (res.listNameObj) return res;
  }

  return { listNameObj: null, parent: null };
};

export const getListNameObjFromDisplayName = (
  displayName, listNameObjs, parent = null
) => {
  if (!displayName || !listNameObjs) return { listNameObj: null, parent: null };

  for (const listNameObj of listNameObjs) {
    if (listNameObj.displayName === displayName) return { listNameObj, parent };

    const res = getListNameObjFromDisplayName(
      displayName, listNameObj.children, listNameObj.listName
    );
    if (res.listNameObj) return res;
  }

  return { listNameObj: null, parent: null };
};

export const getListNameDisplayName = (listName, listNameMap) => {
  const { listNameObj } = getListNameObj(listName, listNameMap);
  if (listNameObj) return listNameObj.displayName;

  // Not throw an error because it can happen:
  //   - Delete a note
  //   - Delete a list name
  //   - Commit delete the note -> cause rerender without the list name!
  console.log(`getListNameDisplayName: invalid listName: ${listName} and listNameMap: ${listNameMap}`);
  return listName;
};

export const getLongestListNameDisplayName = (listNameObjs) => {
  let displayName = '';
  if (!listNameObjs) return displayName;

  for (const listNameObj of listNameObjs) {
    if (listNameObj.displayName.length > displayName.length) {
      displayName = listNameObj.displayName;
    }

    const childrenDisplayName = getLongestListNameDisplayName(listNameObj.children);
    if (childrenDisplayName.length > displayName.length) {
      displayName = childrenDisplayName;
    }
  }

  return displayName;
};

export const getMaxListNameChildrenSize = (listNameObjs) => {
  let size = 0;
  if (!listNameObjs) return size;

  size = listNameObjs.length;
  for (const listNameObj of listNameObjs) {
    const childrenSize = getMaxListNameChildrenSize(listNameObj.children);
    if (childrenSize > size) size = childrenSize;
  }

  return size;
};

export const doContainListName = (listName, listNameObjs) => {
  const { listNameObj } = getListNameObj(listName, listNameObjs);
  if (listNameObj) return true;

  return false;
};

export const doContainListNameDisplayName = (displayName, listNameObjs) => {
  const { listNameObj } = getListNameObjFromDisplayName(displayName, listNameObjs);
  if (listNameObj) return true;

  return false;
};

export const doDuplicateDisplayName = (listName, displayName, listNameMap) => {
  // Check duplicate only in the same level
  const { parent } = getListNameObj(listName, listNameMap);
  if (parent) {
    const { listNameObj: parentObj } = getListNameObj(parent, listNameMap);
    if (parentObj && parentObj.children) {
      for (const obj of parentObj.children) {
        if (obj.listName === listName) continue;
        if (obj.displayName === displayName) return true;
      }
    }
  } else {
    for (const obj of listNameMap) {
      if (obj.listName === listName) continue;
      if (obj.displayName === displayName) return true;
    }
  }

  return false;
};

export const validateListNameDisplayName = (listName, displayName, listNameMap) => {

  // Validate:
  //   1. Empty 2. Contain space at the begining or the end 3. Contain invalid characters
  //   4. Too long 5. Duplicate
  //
  // 2 and 3 are not the problem because this is display name!

  if (!displayName || !isString(displayName) || displayName === '') return NO_LIST_NAME;
  if (displayName.length > 256) return TOO_LONG_LIST_NAME;

  if (doDuplicateDisplayName(listName, displayName, listNameMap)) {
    return DUPLICATE_LIST_NAME;
  }

  return VALID_LIST_NAME;
};

export const copyListNameObjs = (listNameObjs, excludedListNames = []) => {
  const objs = listNameObjs.filter(listNameObj => {
    return !excludedListNames.includes(listNameObj.listName);
  }).map(listNameObj => {
    const obj = { ...listNameObj };
    if (STATUS in obj) delete obj[STATUS];
    if (obj.children) obj.children = copyListNameObjs(obj.children, excludedListNames);
    return obj;
  });
  return objs;
};

export const getAllListNames = (listNameObjs) => {
  const listNames = [];
  if (!listNameObjs) return listNames;

  for (const listNameObj of listNameObjs) {
    listNames.push(listNameObj.listName);
    listNames.push(...getAllListNames(listNameObj.children));
  }

  return listNames;
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
  let x = height - pt - pb - (textHeight * halfRatio);
  x = Math.floor(x / textHeight);

  return Math.round((textHeight * x) + (textHeight * halfRatio) + pt + pb);
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

export const getFormattedDate = (d) => {
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];

  const year = d.getFullYear();
  const month = months[d.getMonth()];
  const date = d.getDate();

  return `${date} ${month} ${year}`;
};

export const getFormattedShortDate = (d, doExcludeYear = false) => {
  const month = d.getMonth() + 1;
  const date = d.getDate();

  if (doExcludeYear) return `${month}/${date}`;

  const year = d.getFullYear().toString().slice(-2);
  return `${month}/${date}/${year}`;
};

export const getFormattedTimeStamp = (d) => {
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const date = d.getDate();
  const hour = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  const sec = String(d.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${date} ${hour}-${min}-${sec}`;
};

export const stripHtml = (s, doInsertNewLine = false) => {
  if (doInsertNewLine) {
    s = s.replace(/<\/p>/gi, '\n</p>');
    s = s.replace(/<\/li>/gi, '\n</li>');
    s = s.replace(/<\/ul>\n<\/li>/gi, '</ul></li>');

    for (const match of `${s}`.matchAll(/<li>([^(</li>)]+)<ul>/gi)) {
      const part = match[1];
      s = s.replace(part, `${part}\n`);
    }
  }

  const codeRe = /&(nbsp|amp|quot|lt|gt);/g;
  const codeMap = { 'nbsp': ' ', 'amp': '&', 'quot': '"', 'lt': '<', 'gt': '>' };

  if (doInsertNewLine) s = s.replace(/(<([^>]+)>)/gi, '');
  else s = s.replace(/(<([^>]+)>)/gi, ' ');

  s = s.replace(codeRe, (match, entity) => codeMap[entity]);

  if (doInsertNewLine) { /* do nothing here */ }
  else s = s.replace(/\s+/g, ' ');

  s = s.trim();
  return s;
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
  for (const match of body.matchAll(/<img[^>]+?src="([^"]+)"[^>]*>/gi)) {
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

export const getMineSubType = (fname) => {
  const ext = getFileExt(fname);
  if (isString(ext)) {
    if (ext === 'jpg') return 'jpeg';
    if (ext === 'svg') return 'svg+xml';
    if (ext === 'ico') return 'x-icon';
    if (ext === 'tif') return 'tiff';
    return ext;
  }
  return '*';
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
  } catch (error) {
    console.error('Fallback: Oops, unable to copy', error);
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

export const isListNameObjsValid = (listNameObjs) => {
  if (listNameObjs === undefined || listNameObjs === null) return true;
  if (!Array.isArray(listNameObjs)) return false;

  for (const listNameObj of listNameObjs) {
    if (!('listName' in listNameObj && 'displayName' in listNameObj)) return false;
    if (!(isString(listNameObj.listName) && isString(listNameObj.displayName))) {
      return false;
    }
    if ('children' in listNameObj) {
      if (!isListNameObjsValid(listNameObj.children)) return false;
    }
  }

  return true;
};

export const indexOfClosingTag = (html, tag = '<div', closingTag = '</div>') => {
  let openCount = 0;
  for (let i = closingTag.length; i <= html.length; i++) {
    if (html.slice(i - closingTag.length, i) === closingTag) {
      if (openCount === 0) return i;
      openCount -= 1;
      continue;
    }

    if (html.slice(i - tag.length, i) === tag) {
      openCount += 1;
      continue;
    }
  }

  return -1;
};

export const getOffsetTop = (element) => {
  if (!element) return 0;
  return getOffsetTop(element.offsetParent) + element.offsetTop;
};

export const deriveSettingsState = (listNames, settings, initialState) => {
  const state = settings ? { ...initialState, ...settings } : { ...initialState };
  state.listNameMap = copyListNameObjs(state.listNameMap);

  let i = 1;
  for (const listName of listNames) {
    if (!doContainListName(listName, state.listNameMap)) {
      state.listNameMap.push(
        { listName: listName, displayName: `<missing-name-${i}>` }
      );
      i += 1;
    }
  }

  return state;
};

export const getValidProduct = (products) => {
  if (!Array.isArray(products) || products.length === 0) return null;
  for (const product of products) {
    if (product.productId === COM_JUSTNOTECC_SUPPORTER) return product;
  }
  return null;
};

export const getLatestPurchase = (purchases) => {
  if (!Array.isArray(purchases) || purchases.length === 0) return null;

  const _purchases = [...purchases].sort((a, b) => {
    return (new Date(b.endDate)).getTime() - (new Date(a.endDate)).getTime();
  });

  for (const status of [ACTIVE, NO_RENEW, GRACE, ON_HOLD, PAUSED]) {
    const purchase = _purchases.find(p => p.status === status);
    if (purchase) return purchase;
  }

  return _purchases[0];
};

export const getValidPurchase = (purchases) => {
  const purchase = getLatestPurchase(purchases);

  if (!purchase) return null;
  if ([ACTIVE, NO_RENEW, GRACE, ON_HOLD, PAUSED].includes(purchase.status)) {
    return purchase;
  }
  return null;
};

export const doEnableExtraFeatures = (purchases) => {
  // If just purchased, enable extra features.
  // Can have pro features or premium features that not included here,
  //   just don't use this function to enable the features.
  const purchase = getLatestPurchase(purchases);

  if (!purchase) return false;
  if ([ACTIVE, NO_RENEW, GRACE].includes(purchase.status)) return true;
  if (purchase.status === UNKNOWN) return null;
  return false;
};

export const createNoteFPath = (listName, fname, subName) => {
  return `${NOTES}/${listName}/${fname}/${subName}`;
};

export const createNoteFName = (id, parentIds) => {
  if (parentIds) return `${id}_${parentIds.join('-')}`;
  return id;
};

export const extractNoteFPath = (fpath) => {
  const rest1 = splitOnFirst(fpath, '/')[1];
  const [listName, rest2] = splitOnFirst(rest1, '/');
  const [fname, subName] = splitOnFirst(rest2, '/');
  return { listName, fname, subName };
};

export const extractNoteFName = (fname) => {
  if (!fname.includes('_')) return { id: fname, parentIds: null };

  const [id, _parentIds] = fname.split('_');
  const parentIds = _parentIds.split('-');
  return { id, parentIds };
};

export const extractNoteId = (id) => {
  let i;
  for (i = id.length - 1; i <= 0; i--) {
    if (/\d/.test(id[i])) break;
  }

  return { dt: parseInt(id.slice(0, i + 1), 10) };
};

export const createPinFPath = (rank, updatedDT, addedDT, id) => {
  return `${PINS}/${rank}/${updatedDT}/${addedDT}/${id}${DOT_JSON}`;
};

export const extractPinFPath = (fpath) => {
  const [rank, updatedDTStr, addedDTStr, fname] = fpath.split('/').slice(1);

  const updatedDT = parseInt(updatedDTStr, 10);
  const addedDT = parseInt(addedDTStr, 10);

  const dotIndex = fname.lastIndexOf('.');
  const ext = fname.substring(dotIndex + 1);
  const id = fname.substring(0, dotIndex);

  return { rank, updatedDT, addedDT, id, ext };
};

export const addFPath = (fpaths, fpath) => {
  if (fpath.startsWith('file://')) fpath = fpath.slice('file://'.length);

  if (fpath.startsWith(NOTES)) {
    if (!fpaths.noteFPaths.includes(fpath)) fpaths.noteFPaths.push(fpath);
  } else if (fpath.startsWith(IMAGES)) {
    if (!fpaths.staticFPaths.includes(fpath)) fpaths.staticFPaths.push(fpath);
  } else if (fpath.startsWith(SETTINGS)) {
    if (!fpaths.settingsFPath) fpaths.settingsFPath = fpath;
    else {
      const dt = parseInt(
        fpaths.settingsFPath.slice(SETTINGS.length, -1 * DOT_JSON.length), 10
      );
      const _dt = parseInt(fpath.slice(SETTINGS.length, -1 * DOT_JSON.length), 10);
      if (isNumber(dt) && isNumber(_dt) && dt < _dt) fpaths.settingsFPath = fpath;
    }
  } else if (fpath.startsWith(PINS)) {
    if (!fpaths.pinFPaths.includes(fpath)) fpaths.pinFPaths.push(fpath);
  } else {
    console.log(`Invalid file path: ${fpath}`);
  }
};

export const deleteFPath = (fpaths, fpath) => {
  if (fpath.startsWith(NOTES)) {
    fpaths.noteFPaths = fpaths.noteFPaths.filter(el => el !== fpath);
  } else if (fpath.startsWith(IMAGES)) {
    fpaths.staticFPaths = fpaths.staticFPaths.filter(el => el !== fpath);
  } else if (fpath.startsWith(SETTINGS)) {
    if (fpaths.settingsFPath === fpath) fpaths.settingsFPath = null;
  } else if (fpath.startsWith(PINS)) {
    fpaths.pinFPaths = fpaths.pinFPaths.filter(el => el !== fpath);
  } else {
    console.log(`Invalid file path: ${fpath}`);
  }
};

export const copyFPaths = (fpaths) => {
  let newNoteFPaths = [];
  if (Array.isArray(fpaths.noteFPaths)) newNoteFPaths = [...fpaths.noteFPaths];

  let newStaticFPaths = [];
  if (Array.isArray(fpaths.staticFPaths)) newStaticFPaths = [...fpaths.staticFPaths];

  let newPinFPaths = [];
  if (Array.isArray(fpaths.pinFPaths)) newPinFPaths = [...fpaths.pinFPaths];

  return {
    ...fpaths,
    noteFPaths: newNoteFPaths,
    staticFPaths: newStaticFPaths,
    pinFPaths: newPinFPaths,
  };
};

export const getNoteFPaths = (state) => {
  if (
    isObject(state.cachedFPaths) &&
    isObject(state.cachedFPaths.fpaths) &&
    Array.isArray(state.cachedFPaths.fpaths.noteFPaths)
  ) {
    return state.cachedFPaths.fpaths.noteFPaths;
  }
  return [];
};

export const getSettingsFPath = (state) => {
  if (isObject(state.cachedFPaths) && isObject(state.cachedFPaths.fpaths)) {
    return state.cachedFPaths.fpaths.settingsFPath;
  }
  return null;
};

const getNoteRootIds = (leafId, toParents) => {
  const rootIds = [];

  let pendingIds = [leafId];
  while (pendingIds.length > 0) {
    let id = pendingIds[0];
    pendingIds = pendingIds.slice(1);

    while (toParents[id]) {
      const parents = toParents[id];
      id = parents[0];
      pendingIds.push(...parents.slice(1));
    }

    if (!rootIds.includes(id)) rootIds.push(id);
  }

  return rootIds;
};

const getNoteOldestRootId = (rootIds) => {
  let rootId, addedDT;
  for (const id of [...rootIds].sort()) {
    const { dt } = extractNoteId(id);
    if (!isNumber(addedDT) || dt < addedDT) {
      addedDT = dt;
      rootId = id;
    }
  }
  return rootId;
};

const _listNoteIds = (noteFPaths) => {

  const ids = [];
  const toFPaths = {};
  const toParents = {};
  const toChildren = {};
  for (const fpath of noteFPaths) {
    const { fname } = extractNoteFPath(fpath);
    const { id, parentIds } = extractNoteFName(fname);

    if (!toFPaths[id]) toFPaths[id] = [];
    toFPaths[id].push(fpath);

    if (ids.includes(id)) continue;
    ids.push(id);

    if (parentIds) {
      toParents[id] = parentIds;
      for (const pid of parentIds) {
        if (!toChildren[pid]) toChildren[pid] = [];
        toChildren[pid].push(id);
      }
    } else {
      toParents[id] = null;
    }
  }

  const leafIds = [];
  for (const id of ids) {
    if (!toChildren[id]) {
      if (id.startsWith('deleted')) continue;
      leafIds.push(id);
    }
  }

  const toRootIds = {};
  for (const id of ids) {
    const rootIds = getNoteRootIds(id, toParents);
    const rootId = getNoteOldestRootId(rootIds);
    toRootIds[id] = rootId;
  }

  const toLeafIds = {};
  for (const id of leafIds) {
    const rootId = toRootIds[id];

    if (!toLeafIds[rootId]) toLeafIds[rootId] = [];
    toLeafIds[rootId].push(id);
  }

  const noteIds = [];
  const conflictedIds = [];
  for (const id of leafIds) {
    const parentIds = toParents[id];

    const rootId = toRootIds[id];
    const { dt: addedDT } = extractNoteId(rootId);
    const { dt: updatedDT } = extractNoteId(id);

    const tIds = toLeafIds[rootId];
    const isConflicted = tIds.length > 1;
    const conflictWith = isConflicted ? tIds : null;

    const fpaths = toFPaths[id];
    const { listName } = extractNoteFPath(fpaths[0]);

    const noteId = {
      parentIds, id, addedDT, updatedDT, isConflicted, conflictWith, fpaths, listName,
    };

    if (isConflicted) conflictedIds.push(noteId);
    else noteIds.push(noteId);
  }

  const conflictWiths = Object.values(toLeafIds).filter(tIds => tIds.length > 1);

  return { noteIds, conflictedIds, conflictWiths, toRootIds };
};

export const listNoteIds = createSelector(
  noteFPaths => noteFPaths,
  _listNoteIds,
);

export const getMainId = (id, toRootIds) => {
  return toRootIds[id];
};

export const getPinFPaths = (state) => {
  if (
    isObject(state.cachedFPaths) &&
    isObject(state.cachedFPaths.fpaths) &&
    Array.isArray(state.cachedFPaths.fpaths.pinFPaths)
  ) {
    return state.cachedFPaths.fpaths.pinFPaths;
  }
  return [];
};

export const getRawPins = (pinFPaths, toRootIds) => {
  const pins = {};
  for (const fpath of pinFPaths) {
    const { rank, updatedDT, addedDT, id } = extractPinFPath(fpath);

    const _id = id.startsWith('deleted') ? id.slice(7) : id;
    const pinMainId = getMainId(_id, toRootIds);

    // duplicate id, choose the latest updatedDT
    if (pinMainId in pins && pins[pinMainId].updatedDT > updatedDT) continue;
    pins[pinMainId] = { rank, updatedDT, addedDT, id };
  }

  return pins;
};

const _getPins = (pinFPaths, pendingPins, doExcludeUnpinning, toRootIds) => {
  const pins = getRawPins(pinFPaths, toRootIds);

  for (const id in pendingPins) {
    const { status, rank, updatedDT, addedDT } = pendingPins[id];
    const pinMainId = getMainId(id, toRootIds);

    if ([PIN_NOTE, PIN_NOTE_ROLLBACK].includes(status)) {
      pins[pinMainId] = { status, rank, updatedDT, addedDT, id };
    } else if ([UNPIN_NOTE, UNPIN_NOTE_ROLLBACK].includes(status)) {
      if (doExcludeUnpinning) {
        delete pins[pinMainId];
      } else {
        // Can't delete just yet, need for showing loading.
        pins[pinMainId] = { status, rank, updatedDT, addedDT, id };
      }
    } else if ([
      MOVE_PINNED_NOTE, MOVE_PINNED_NOTE_ROLLBACK,
    ].includes(status)) {
      pins[pinMainId] = { status, rank, updatedDT, addedDT, id };
    } else {
      console.log('getPins: unsupport pin status: ', status);
    }
  }

  const filteredPins = {};
  for (const pinMainId in pins) {
    if (pins[pinMainId].id.startsWith('deleted')) continue;
    filteredPins[pinMainId] = pins[pinMainId];
  }

  return filteredPins;
};

/** @type {function(any, any, any, any): any} */
export const getPins = createSelector(
  (...args) => args[0],
  (...args) => args[1],
  (...args) => args[2],
  (...args) => args[3],
  _getPins,
);

export const separatePinnedValues = (
  sortedValues, pinFPaths, pendingPins, toRootIds, getValueMainId,
) => {
  const pins = getPins(pinFPaths, pendingPins, true, toRootIds);

  let values = [], pinnedValues = [];
  for (const value of sortedValues) {
    const valueMainId = getValueMainId(value);

    if (valueMainId in pins) {
      pinnedValues.push({ value, pin: pins[valueMainId] });
    } else {
      values.push(value);
    }
  }

  pinnedValues = pinnedValues.sort((pinnedValueA, pinnedValueB) => {
    if (pinnedValueA.pin.rank < pinnedValueB.pin.rank) return -1;
    if (pinnedValueA.pin.rank > pinnedValueB.pin.rank) return 1;
    return 0;
  });

  return [pinnedValues, values];
};

export const sortWithPins = (
  sortedValues, pinFPaths, pendingPins, toRootIds, getValueMainId
) => {
  let [pinnedValues, values] = separatePinnedValues(
    sortedValues, pinFPaths, pendingPins, toRootIds, getValueMainId,
  );
  pinnedValues = pinnedValues.map(pinnedValue => pinnedValue.value);

  const pinnedAndSortedValues = [...pinnedValues, ...values];
  return pinnedAndSortedValues;
};

export const isPinningStatus = (pinStatus) => {
  return [
    PIN_NOTE, PIN_NOTE_ROLLBACK, UNPIN_NOTE, UNPIN_NOTE_ROLLBACK,
    MOVE_PINNED_NOTE, MOVE_PINNED_NOTE_ROLLBACK,
  ].includes(pinStatus);
};

export const getFilteredNotes = (notes, listName) => {
  if (!notes || !notes[listName]) return null;

  const filteredNotes = _.select(
    notes[listName],
    STATUS,
    [
      ADDED, ADDING, UPDATING, MOVING, DIED_ADDING, DIED_UPDATING, DIED_MOVING,
      DIED_DELETING,
    ]
  );
  return filteredNotes;
};

export const sortNotes = (notes, sortOn, doDescendingOrder) => {
  const sortedNotes = [...notes].sort((a, b) => {
    return a[sortOn] - b[sortOn];
  });
  if (doDescendingOrder) sortedNotes.reverse();
  return sortedNotes;
};

export const sortFilteredNotes = (filteredNotes, sortOn, doDescendingOrder) => {
  return sortNotes(Object.values(filteredNotes), sortOn, doDescendingOrder);
};

export const getSortedNotes = (notes, listName, sortOn, doDescendingOrder) => {
  const filteredNotes = getFilteredNotes(notes, listName);
  if (!filteredNotes) return null;

  const sortedNotes = sortFilteredNotes(filteredNotes, sortOn, doDescendingOrder);
  return sortedNotes;
};

export const getFormattedTime = (timeStr, is24HFormat) => {
  const [hStr, mStr] = timeStr.trim().split(':');
  if (is24HFormat) return { time: timeStr, hour: hStr, minute: mStr, period: null };

  const hNum = parseInt(hStr, 10);
  const period = hNum < 12 ? 'AM' : 'PM';

  const newHNum = (hNum % 12) || 12;
  const newHStr = String(newHNum).padStart(2, '0');
  const newTimeStr = `${newHStr}:${mStr} ${period}`;

  return { time: newTimeStr, hour: newHStr, minute: mStr, period };
};

export const get24HFormattedTime = (hStr, mStr, period) => {
  let newHStr = hStr;
  if (['AM', 'PM'].includes(period)) {
    let hNum = parseInt(hStr, 10);
    if (period === 'PM' && hNum < 12) hNum += 12;
    else if (period === 'AM' && hNum === 12) hNum -= 12;

    newHStr = String(hNum).padStart(2, '0');
  }

  return `${newHStr}:${mStr}`;
};

export const doContainStaleNotes = (notes) => {
  for (const note of notes) {
    if (note.title === '' && note.body === '') return true;
  }
  return false;
};
