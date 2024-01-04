import { Platform, Alert, PermissionsAndroid } from 'react-native';
import { FileSystem, Dirs, Util } from 'react-native-file-access';
import Share from 'react-native-share';
import { zip, unzip } from 'react-native-zip-archive';
import DocumentPicker, {
  types as DocumentPickerTypes,
} from 'react-native-document-picker';
import { parseDocument, DomUtils } from 'htmlparser2';

import dataApi from '../apis/data';
import serverApi from '../apis/server';
import fileApi from '../apis/localFile';
import { updatePopupUrlHash, sync, syncAndWait } from '../actions';
import {
  UPDATE_IMPORT_ALL_DATA_PROGRESS, UPDATE_EXPORT_ALL_DATA_PROGRESS,
  UPDATE_DELETE_ALL_DATA_PROGRESS, UPDATE_DELETE_SYNC_DATA_PROGRESS, DELETE_ALL_DATA,
} from '../types/actionTypes';
import {
  SETTINGS_POPUP, MY_NOTES, TRASH, ARCHIVE, ADDED_DT, UPDATED_DT, N_NOTES, CD_ROOT,
  NOTES, IMAGES, SETTINGS, INFO, PINS, TAGS, INDEX, DOT_JSON,
  NOTE_DATE_SHOWING_MODE_HIDE, NOTE_DATE_SHOWING_MODE_SHOW, NOTE_DATE_FORMATS,
  IMAGE_FILE_EXTS, HTML_FILE_EXTS, UTF8,
} from '../types/const';
import {
  isEqual, isObject, isString, isNumber, sleep, randomString, clearNoteData,
  getStaticFPath, getMainId, isListNameObjsValid, isTagNameObjsValid,
  indexOfClosingTag, createNoteFPath, createDataFName, extractNoteFPath,
  extractDataFName, extractDataId, listNoteMetas, listSettingsMetas,
  createSettingsFPath, getSettingsFPaths, getLastSettingsFPaths, extractPinFPath,
  getPins, extractFPath, copyListNameObjs, getFormattedTimeStamp, getDataParentIds,
  createPinFPath, extractTagFPath, getTags, createTagFPath, stripHtml,
} from '../utils';
import { initialSettingsState, initialInfoState } from '../types/initialStates';
import vars from '../vars';

const importAllDataLoop = async (fpaths, contents) => {
  // One at a time to not overwhelm the server
  const nNotes = vars.syncMode.doSyncMode ? N_NOTES : 1;
  for (let i = 0; i < fpaths.length; i += nNotes) {
    const _fpaths = fpaths.slice(i, i + nNotes);
    const _contents = contents.slice(i, i + nNotes);
    await dataApi.putFiles(_fpaths, _contents);

    await sleep(300);
  }
};

const _getBestMap = (fpath, idMap) => {
  // Export from Windows, path separator is \
  if (!fpath.includes('/') && fpath.includes('\\')) {
    fpath = fpath.replace('\\', '/');
  }
  if (!fpath.includes('/') && fpath.includes(':')) {
    fpath = fpath.replace(':', '/');
  }

  const { fpathParts } = extractFPath(fpath);
  const rParts = fpathParts.reverse();

  let bestLength = 0, bestKey = null;
  for (const key of Object.keys(idMap)) {
    const { fpathParts: keyFPathParts } = extractFPath(key);
    const rKeyParts = keyFPathParts.reverse();

    if (rParts[0] !== rKeyParts[0]) continue;

    let length = 1;
    const maxLength = Math.min(rParts.length, rKeyParts.length);
    for (let i = 1; i < maxLength; i++) {
      if (rParts[i] !== rKeyParts[i]) break;
      length += 1;
    }
    if (length > bestLength) {
      [bestLength, bestKey] = [length, key];
    }
  }

  return bestKey ? idMap[bestKey] : null;
};

const _populateListObj = (listElem, listObj) => {
  let listItemObj;
  for (const node of listElem.childNodes) {
    if (DomUtils.getName(node).toLowerCase() === 'ul') {
      let nestedListObj = listObj;
      if (isObject(listItemObj)) {
        nestedListObj = { tag: 'ul', items: [] };
        listItemObj.listObjs.push(nestedListObj);
      }
      _populateListObj(node, nestedListObj);
    } else if (DomUtils.getName(node).toLowerCase() === 'ol') {
      let nestedListObj = listObj;
      if (isObject(listItemObj)) {
        nestedListObj = { tag: 'ol', items: [] };
        listItemObj.listObjs.push(nestedListObj);
      }
      _populateListObj(node, nestedListObj);
    } else if (DomUtils.getName(node).toLowerCase() === 'li') {
      listItemObj = { texts: [], listObjs: [] };
      for (const cNode of node.childNodes) {
        if (!cNode.attribs || cNode.attribs['class'] !== 'list-content') continue;

        for (const tNode of cNode.childNodes) {
          if (DomUtils.getName(tNode).toLowerCase() === 'img') {
            const text = DomUtils.getOuterHTML(tNode, { encodeEntities: 'utf8' });
            listItemObj.texts.push(text);
          } else if (tNode.attribs && tNode.attribs['class'] === 'para') {
            const text = DomUtils.getInnerHTML(tNode, { encodeEntities: 'utf8' });
            listItemObj.texts.push(text);
          } else {
            throw new Error('Evernote invalid list content node');
          }
        }
      }
      if (listItemObj.texts.length === 0) {
        throw new Error('Evernote invalid list li node');
      }
      listObj.items.push(listItemObj);
    } else {
      throw new Error('Evernote invalid list node');
    }
  }
};

const _getListHtml = (listObj) => {
  let listHtml = listObj.tag === 'ol' ? '<ol>' : '<ul>';
  for (const item of listObj.items) {
    listHtml += '<li>';
    listHtml += item.texts.join('<br>');
    for (const nestedListObj of item.listObjs) {
      listHtml += _getListHtml(nestedListObj);
    }
    listHtml += '</li>';
  }
  listHtml += listObj.tag === 'ol' ? '</ol>' : '</ul>';
  return listHtml;
};

const parseEvernoteImportedFile = async (dispatch, getState, importDPath, entries) => {

  const htmlEntries = [], imgEntries = [];
  for (const entry of entries) {
    if (entry.directory) continue;

    const { fpath, fext } = extractFPath(entry.filename);

    if (fpath.endsWith('Evernote_index.html')) continue;
    if (HTML_FILE_EXTS.includes(fext.toLowerCase())) {
      htmlEntries.push(entry);
      continue;
    }
    if (IMAGE_FILE_EXTS.includes(fext.toLowerCase())) {
      imgEntries.push(entry);
      continue;
    }
    if (fext === '') { // possible some images have no extention
      imgEntries.push(entry);
      continue;
    }
  }

  const progress = { total: htmlEntries.length + imgEntries.length, done: 0 };
  dispatch(updateImportAllDataProgress(progress));

  if (progress.total === 0) return;

  const idMap = {};
  for (let i = 0, j = imgEntries.length; i < j; i += N_NOTES) {
    const selectedEntries = imgEntries.slice(i, i + N_NOTES);

    for (const entry of selectedEntries) {
      const { fext } = extractFPath(entry.filename);

      let fpath = `${IMAGES}/${randomString(4)}-${randomString(4)}-${randomString(4)}-${randomString(4)}`;
      if (fext) fpath += `.${fext}`;

      idMap[entry.filename] = fpath;

      const destFPath = `${Dirs.DocumentDir}/${fpath}`;
      const destDPath = Util.dirname(destFPath);
      const doExist = await FileSystem.exists(destDPath);
      if (!doExist) await FileSystem.mkdir(destDPath);
      await FileSystem.cp(`${importDPath}/${entry.filename}`, destFPath);
    }

    progress.done += selectedEntries.length;
    dispatch(updateImportAllDataProgress(progress));
  }

  let now = Date.now();
  const listName = MY_NOTES;
  for (let i = 0, j = htmlEntries.length; i < j; i += N_NOTES) {
    const selectedEntries = htmlEntries.slice(i, i + N_NOTES);

    const fpaths = [], contents = [];
    for (const entry of selectedEntries) {
      const htmlFPath = `${importDPath}/${entry.filename}`;
      const content = await FileSystem.readFile(htmlFPath, UTF8);
      if (!content) continue;

      let dt, dtMatch = content.match(/<meta itemprop="created" content="(.+?)">/i);
      if (!dtMatch) {
        dtMatch = content.match(/<meta itemprop="updated" content="(.+?)">/i);
      }
      if (dtMatch) {
        const s = dtMatch[1];
        if (s.length === 16) {
          const _dt = Date.parse(`${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 11)}:${s.slice(11, 13)}:${s.slice(13)}`);
          if (_dt && isNumber(_dt)) dt = _dt;
        }
      }
      if (!dt) {
        dt = now;
        now += 1;
      }

      const id = `${dt}${randomString(4)}`;
      const dpath = `${NOTES}/${listName}/${id}`;

      let title = '';
      const tMatch = content.match(/<h1[^>]*>([\s\S]+?)<\/h1>/i);
      if (tMatch) title = tMatch[1].trim().replace(/\r?\n/g, '');
      title = stripHtml(title, false, true);
      if (title === 'Untitled') title = '';

      let body = '';
      const bMatch = content.match(/<en-note[^>]*>([\s\S]+?)<\/en-note>/i);
      if (bMatch) body = bMatch[1].trim().replace(/\r?\n/g, '');

      // clean up
      body = body.replace(/<icons[^>]*>([\s\S]+?)<\/icons>/gi, '');
      body = body.replace(/<meta[^>]*>/gi, '');
      body = body.replace(/<note-attributes[^>]*>([\s\S]+?)<\/note-attributes>/gi, '');
      body = body.replace(/<h1[^>]*>([\s\S]+?)<\/h1>/gi, '');
      body = body.trim();

      // img tags
      for (const match of body.matchAll(/<img[^>]+?src="([^"]+)"[^>]*>/gi)) {
        const fpath = match[1];
        const imgFPath = _getBestMap(fpath, idMap);
        if (imgFPath) {
          body = body.split(fpath).join('cdroot/' + imgFPath);

          fpaths.push(`${dpath}/cdroot/${imgFPath}`);
          contents.push('');
        }
      }

      // task tags
      let pos = -1;
      while ((pos = body.indexOf('<div class="taskgroup">', pos + 1)) !== -1) {
        let html = body.slice(pos);

        const endIndex = indexOfClosingTag(html);
        if (endIndex < 0) continue;

        html = html.slice(0, endIndex).trim();

        try {
          const dom = parseDocument(html);

          const taskObjs = [];
          const elem = /** @type {any} */(dom.firstChild);
          for (const node of elem.childNodes) {
            let isCompleted = false;
            if (node.attribs && node.attribs['data-completed']) {
              isCompleted = node.attribs['data-completed'] === 'true';
            }

            const child = node.firstChild.firstChild.lastChild.firstChild;
            const text = DomUtils.textContent(child);
            taskObjs.push({ text: text.trim(), isCompleted });
          }

          if (taskObjs.length > 0) {
            let todoHtml = '<ul class="todo-list">';
            for (const { text, isCompleted } of taskObjs) {
              todoHtml += '<li><label class="todo-list__label"><input type="checkbox" disabled="disabled"';
              if (isCompleted) todoHtml += ' checked="checked"';
              todoHtml += ' /><span class="todo-list__label__description">';
              todoHtml += text;
              todoHtml += '</span></label></li>';
            }
            todoHtml += '</ul>';
            body = body.slice(0, pos) + todoHtml + body.slice(pos + endIndex);
          }
        } catch (error) {
          console.log('Evernote task tag error', error);
          continue;
        }
      }

      // todo tags
      for (const match of body.matchAll(/<ul[^>]+?class="en-todolist"[\s\S]+?<\/ul>/gi)) {
        const html = match[0];
        try {
          const dom = parseDocument(html);

          const todoObjs = [];
          const elem = /** @type {any} */(dom.firstChild);
          for (const node of elem.childNodes) {
            let isCompleted = false;
            if (node.attribs && node.attribs['data-checked']) {
              isCompleted = node.attribs['data-checked'] === 'true';
            }

            const text = DomUtils.textContent(node.lastChild.firstChild);
            todoObjs.push({ text: text.trim(), isCompleted });
          }

          if (todoObjs.length > 0) {
            let todoHtml = '<ul class="todo-list">';
            for (const { text, isCompleted } of todoObjs) {
              todoHtml += '<li><label class="todo-list__label"><input type="checkbox" disabled="disabled"';
              if (isCompleted) todoHtml += ' checked="checked"';
              todoHtml += ' /><span class="todo-list__label__description">';
              todoHtml += text;
              todoHtml += '</span></label></li>';
            }
            todoHtml += '</ul>';
            body = body.split(html).join(todoHtml);
          }
        } catch (error) {
          console.log('Evernote todo tag error', error);
          continue;
        }
      }

      // code block tags
      for (const match of body.matchAll(/<en-codeblock[^>]*?>[\s\S]+?<\/en-codeblock>/gi)) {
        const html = match[0];
        try {
          const dom = parseDocument(html);

          const lines = [];
          const elem = /** @type {any} */(dom.firstChild);
          for (const node of elem.childNodes) {
            lines.push(DomUtils.textContent(node));
          }

          if (lines.length > 0) {
            let codeHtml = '<pre><code>';
            codeHtml += lines.join('<br />');
            codeHtml += '</code></pre>';
            body = body.split(html).join(codeHtml);
          }
        } catch (error) {
          console.log('Evernote code block tag error', error);
          continue;
        }
      }

      // list tags
      pos = -1;
      while (true) {
        const uPos = body.indexOf('<ul role="list">', pos + 1);
        const oPos = body.indexOf('<ol role="list">', pos + 1);

        let tag, openTag, closeTag;
        if ((oPos >= 0 && uPos < 0) || (oPos >= 0 && uPos >= 0 && oPos < uPos)) {
          [pos, tag, openTag, closeTag] = [oPos, 'ol', '<ol', '</ol>'];
        } else {
          [pos, tag, openTag, closeTag] = [uPos, 'ul', '<ul', '</ul>'];
        }
        if (pos < 0) break;

        let html = body.slice(pos);

        const endIndex = indexOfClosingTag(html, openTag, closeTag);
        if (endIndex < 0) continue;

        html = html.slice(0, endIndex).trim();

        try {
          const dom = parseDocument(html);

          const listObj = { tag, items: [] };
          const elem = dom.firstChild;
          _populateListObj(elem, listObj);

          if (listObj.items.length > 0) {
            const listHtml = _getListHtml(listObj);
            body = body.slice(0, pos) + listHtml + body.slice(pos + endIndex);
          }
        } catch (error) {
          console.log('Evernote list tag error', error);
          continue;
        }
      }

      // Preserve empty lines from Evernote to CKEditor
      body = body.replace(/<div[^>]+class="para"[^>]*><br><\/div>/gi, '<p><br></p>');
      body = body.replace(/<div[^>]+class="para"[^>]*>&nbsp;<\/div>/gi, '<p><br></p>');

      if (title || body) {
        fpaths.push(`${dpath}/index.json`);
        contents.push({ title, body });
      }
    }

    await importAllDataLoop(fpaths, contents);

    progress.done += selectedEntries.length;
    dispatch(updateImportAllDataProgress(progress));
  }
};

const parseGKeepImportedFile = async (dispatch, getState, importDPath, entries) => {

  const jsonEntries = [], imgEntries = [], labelsEntries = [];
  for (const entry of entries) {
    if (entry.directory) continue;

    const { fname, fext } = extractFPath(entry.filename);

    if (fname === 'Labels.txt') {
      labelsEntries.push(entry);
      continue;
    }
    if (['json'].includes(fext.toLowerCase())) {
      jsonEntries.push(entry);
      continue;
    }
    if (IMAGE_FILE_EXTS.includes(fext.toLowerCase())) {
      imgEntries.push(entry);
      continue;
    }
  }

  const progress = {
    total: jsonEntries.length + imgEntries.length + labelsEntries.length,
    done: 0,
  };
  dispatch(updateImportAllDataProgress(progress));

  if (progress.total === 0) return;

  let now = Date.now();
  const labelIdMap = {};
  if (labelsEntries.length > 0) {
    const settings = { ...initialSettingsState };
    settings.listNameMap = copyListNameObjs(settings.listNameMap);

    for (const labelsEntry of labelsEntries) {
      const labelsFPath = `${importDPath}/${labelsEntry.filename}`;
      const content = await FileSystem.readFile(labelsFPath, UTF8);
      if (!isString(content)) continue;

      for (const label of content.split('\n')) {
        if (!label || label in labelIdMap) continue;

        const id = `${now}-${randomString(4)}`;
        settings.listNameMap.push({ listName: id, displayName: label });
        labelIdMap[label] = id;
        now += 1;
      }
    }

    await syncAndWait(true, 2)(dispatch, getState);

    const settingsFPaths = getSettingsFPaths(getState());
    const { ids: settingsParentIds } = getLastSettingsFPaths(settingsFPaths);

    const fname = createDataFName(`${now}${randomString(4)}`, settingsParentIds);
    const fpath = createSettingsFPath(fname);
    now += 1;

    await importAllDataLoop([fpath], [settings]);

    progress.done += labelsEntries.length;
    dispatch(updateImportAllDataProgress(progress));
  }

  const imgIdMap = {};
  for (let i = 0, j = imgEntries.length; i < j; i += N_NOTES) {
    const selectedEntries = imgEntries.slice(i, i + N_NOTES);

    for (const entry of selectedEntries) {
      const { fnameParts, fext } = extractFPath(entry.filename);
      if (fnameParts.length < 2) continue;

      let fpath = `${IMAGES}/${randomString(4)}-${randomString(4)}-${randomString(4)}-${randomString(4)}`;
      if (fext) fpath += `.${fext}`;

      // As file name can be .jpg but attachment in note.json can be .jpeg
      //   so need to ignore the ext.
      imgIdMap[fnameParts.slice(0, -1).join('.')] = fpath;

      const destFPath = `${Dirs.DocumentDir}/${fpath}`;
      const destDPath = Util.dirname(destFPath);
      const doExist = await FileSystem.exists(destDPath);
      if (!doExist) await FileSystem.mkdir(destDPath);
      await FileSystem.cp(`${importDPath}/${entry.filename}`, destFPath);
    }

    progress.done += selectedEntries.length;
    dispatch(updateImportAllDataProgress(progress));
  }

  for (let i = 0, j = jsonEntries.length; i < j; i += N_NOTES) {
    const selectedEntries = jsonEntries.slice(i, i + N_NOTES);

    const fpaths = [], contents = [];
    for (const entry of selectedEntries) {
      /** @type {any} */
      let content = await FileSystem.readFile(`${importDPath}/${entry.filename}`, UTF8);
      if (!content) continue;

      try {
        content = JSON.parse(content);
      } catch (error) {
        console.log('JSON.parse Keep content error: ', error);
        continue;
      }

      let listName = MY_NOTES;
      if (content.isTrashed) listName = TRASH;
      else if (content.isArchived) listName = ARCHIVE;
      else if (
        content.labels && Array.isArray(content.labels) && content.labels.length > 0
      ) {
        const label = content.labels[0];
        if (isObject(label) && labelIdMap[label.name]) {
          listName = labelIdMap[label.name];
        }
      }

      let dt;
      if (
        content.userEditedTimestampUsec &&
        isNumber(content.userEditedTimestampUsec)
      ) {
        dt = content.userEditedTimestampUsec;
        if (dt > 1000000000000000) dt = Math.round(dt / 1000);
      } else {
        dt = now;
        now += 1;
      }

      const id = `${dt}${randomString(4)}`;
      const dpath = `${NOTES}/${listName}/${id}`;

      const title = content.title || '';
      let body = '';
      if (content.textContent) {
        body = '<p>' + content.textContent.replace(/\r?\n/g, '<br />') + '</p>';
      }

      if (content.attachments && Array.isArray(content.attachments)) {
        for (const attachment of content.attachments) {
          if (
            !attachment.mimetype ||
            !isString(attachment.mimetype) ||
            !attachment.mimetype.startsWith('image/') ||
            !attachment.filePath ||
            !isString(attachment.filePath)
          ) continue;

          const fnameParts = attachment.filePath.split('.');
          if (fnameParts.length < 2) continue;

          const imgFPath = imgIdMap[fnameParts.slice(0, -1).join('.')];
          if (imgFPath) {
            let imgHtml = '<figure class="image"><img src="cdroot/';
            imgHtml += imgFPath;
            imgHtml += '" /></figure>';
            body += imgHtml;

            fpaths.push(`${dpath}/cdroot/${imgFPath}`);
            contents.push('');
          }
        }
      }

      if (
        content.listContent &&
        Array.isArray(content.listContent) &&
        content.listContent.length > 0
      ) {
        let listHtml = '<ul class="todo-list">';
        for (const listItem of content.listContent) {
          if (
            !isObject(listItem) || !listItem.text || !isString(listItem.text)
          ) continue;

          listHtml += '<li><label class="todo-list__label"><input type="checkbox" disabled="disabled"';
          if (listItem.isChecked) listHtml += ' checked="checked"';
          listHtml += ' /><span class="todo-list__label__description">';
          listHtml += listItem.text;
          listHtml += '</span></label></li>';
        }
        listHtml += '</ul>';
        body += listHtml;
      }

      if (title || body) {
        fpaths.push(`${dpath}/index.json`);
        contents.push({ title, body });
      }
    }

    await importAllDataLoop(fpaths, contents);

    progress.done += selectedEntries.length;
    dispatch(updateImportAllDataProgress(progress));
  }
};

const _addDirName = (dirObj, dirName) => {
  if (dirName in dirObj) return;
  dirObj[dirName] = {};
};

const _addListNameObj = (listNameObjs, dirObj, idMap, nowObj) => {
  for (const [key, value] of Object.entries(dirObj)) {
    const id = `${nowObj.now}-${randomString(4)}`;
    nowObj.now += 1;

    const listNameObj = { listName: id, displayName: key };
    listNameObjs.push(listNameObj);

    idMap[key] = id;

    if (!isEqual(value, {})) {
      listNameObj.children = [];
      _addListNameObj(listNameObj.children, value, idMap, nowObj);
    }
  }
};

const parseRawImportedFile = async (dispatch, getState, importDPath, entries) => {

  const rawFPaths = [], rawEntries = [];
  for (const entry of entries) {
    if (entry.directory) continue;

    const { fpath, fext } = extractFPath(entry.filename);

    if (
      ['txt'].includes(fext.toLowerCase()) ||
      HTML_FILE_EXTS.includes(fext.toLowerCase())
    ) {
      rawFPaths.push(fpath);
      rawEntries.push(entry);
      continue;
    }
  }

  const dirMap = {};
  for (const fpath of rawFPaths) {
    const fpathParts = fpath.split('/');
    if (fpathParts.length < 2) continue;

    let dirObj = dirMap;
    for (const dirName of fpathParts.slice(0, -1)) {
      _addDirName(dirObj, dirName);
      dirObj = dirObj[dirName];
    }
  }

  const isDirMapEmpty = isEqual(dirMap, {});
  const progress = {
    total: rawEntries.length + (!isDirMapEmpty ? 1 : 0),
    done: 0,
  };
  dispatch(updateImportAllDataProgress(progress));

  if (progress.total === 0) return;

  let now = Date.now();
  const idMap = {};
  if (!isDirMapEmpty) {
    const settings = { ...initialSettingsState };
    settings.listNameMap = copyListNameObjs(settings.listNameMap);

    const nowObj = { now };
    _addListNameObj(settings.listNameMap, dirMap, idMap, nowObj);
    now = nowObj.now;

    await syncAndWait(true, 2)(dispatch, getState);

    const settingsFPaths = getSettingsFPaths(getState());
    const { ids: settingsParentIds } = getLastSettingsFPaths(settingsFPaths);

    const fname = createDataFName(`${now}${randomString(4)}`, settingsParentIds);
    const fpath = createSettingsFPath(fname);
    now += 1;

    await importAllDataLoop([fpath], [settings]);

    progress.done += 1;
    dispatch(updateImportAllDataProgress(progress));
  }

  for (let i = 0, j = rawEntries.length; i < j; i += N_NOTES) {
    const selectedEntries = rawEntries.slice(i, i + N_NOTES);

    const fpaths = [], contents = [];
    for (const entry of selectedEntries) {
      const { fpathParts, fnameParts, fext } = extractFPath(entry.filename);

      let content = await FileSystem.readFile(`${importDPath}/${entry.filename}`, UTF8);
      if (!content) continue;

      let listName = MY_NOTES;
      if (fpathParts.length > 1) {
        const dirName = fpathParts[fpathParts.length - 2];
        if (dirName in idMap) listName = idMap[dirName];
      }

      const dt = now;
      now += 1;

      const id = `${dt}${randomString(4)}`;
      const dpath = `${NOTES}/${listName}/${id}`;

      const title = fnameParts.slice(0, -1).join('.') || '';
      let body = '';
      if (['txt'].includes(fext.toLowerCase())) {
        body = '<p>' + content.replace(/\r?\n/g, '<br />') + '</p>';
      } else if (HTML_FILE_EXTS.includes(fext.toLowerCase())) {
        const bMatch = content.match(/<body[^>]*>([\s\S]+?)<\/body>/i);
        if (bMatch) body = bMatch[1].trim().replace(/\r?\n/g, '');
      }

      if (title || body) {
        fpaths.push(`${dpath}/index.json`);
        contents.push({ title, body });
      }
    }

    await importAllDataLoop(fpaths, contents);

    progress.done += selectedEntries.length;
    dispatch(updateImportAllDataProgress(progress));
  }
};

const _parseJustnoteSettings = async (getState, importDPath, settingsEntries) => {
  const settingsParts = [];
  for (const entry of settingsEntries) {
    const { fpath } = extractFPath(entry.filename);
    if (!fpath.endsWith(DOT_JSON)) continue;

    let dt = parseInt(fpath.slice(SETTINGS.length, -1 * DOT_JSON.length), 10);
    if (!isNumber(dt)) continue;

    /** @type {any} */
    let content = await FileSystem.readFile(`${importDPath}/${entry.filename}`, UTF8);
    if (!content) continue;

    try {
      content = JSON.parse(content);

      const settings = { ...initialSettingsState };
      if ([true, false].includes(content.doDeleteOldNotesInTrash)) {
        settings.doDeleteOldNotesInTrash = content.doDeleteOldNotesInTrash;
      }
      if ([ADDED_DT, UPDATED_DT].includes(content.sortOn)) {
        settings.sortOn = content.sortOn;
      }
      if ([true, false].includes(content.doDescendingOrder)) {
        settings.doDescendingOrder = content.doDescendingOrder;
      }
      if ([true, false].includes(content.doAlertScreenRotation)) {
        settings.doAlertScreenRotation = content.doAlertScreenRotation;
      }
      if ([
        NOTE_DATE_SHOWING_MODE_HIDE, NOTE_DATE_SHOWING_MODE_SHOW,
      ].includes(content.noteDateShowingMode)) {
        settings.noteDateShowingMode = content.noteDateShowingMode;
      }
      if (NOTE_DATE_FORMATS.includes(content.noteDateFormat)) {
        settings.noteDateFormat = content.noteDateFormat;
      }
      if ([true, false].includes(content.noteDateIsTwoDigit)) {
        settings.noteDateIsTwoDigit = content.noteDateIsTwoDigit;
      }
      if ([true, false].includes(content.noteDateIsCurrentYearShown)) {
        settings.noteDateIsCurrentYearShown = content.noteDateIsCurrentYearShown;
      }
      if ([true, false].includes(content.doSectionNotesByMonth)) {
        settings.doSectionNotesByMonth = content.doSectionNotesByMonth;
      }
      if ([true, false].includes(content.doMoreEditorFontSizes)) {
        settings.doMoreEditorFontSizes = content.doMoreEditorFontSizes;
      }
      if (isListNameObjsValid(content.listNameMap)) {
        settings.listNameMap = content.listNameMap;
      }
      if (isTagNameObjsValid(content.tagNameMap)) {
        settings.tagNameMap = content.tagNameMap;
      }

      content = settings;
    } catch (error) {
      console.log('JSON.parse settings content error: ', error);
      continue;
    }

    // For choosing the latest one.
    settingsParts.push({ dt, content });
  }

  let latestSettingsPart;
  for (const settingsPart of settingsParts) {
    if (!isObject(latestSettingsPart)) {
      latestSettingsPart = settingsPart;
      continue;
    }
    if (latestSettingsPart.dt < settingsPart.dt) latestSettingsPart = settingsPart;
  }
  if (!isObject(latestSettingsPart)) return;

  const settingsFPaths = getSettingsFPaths(getState());
  const lsfpsResult = getLastSettingsFPaths(settingsFPaths);
  if (lsfpsResult.fpaths.length > 0) {
    const lastSettingsFPath = lsfpsResult.fpaths[0];
    const { contents } = await dataApi.getFiles([lastSettingsFPath], true);
    if (isEqual(latestSettingsPart.content, contents[0])) {
      return;
    }
  }

  let now = Date.now();
  const fname = createDataFName(`${now}${randomString(4)}`, lsfpsResult.ids);
  const fpath = createSettingsFPath(fname);
  now += 1;

  await importAllDataLoop([fpath], [latestSettingsPart.content]);
};

const parseJustnoteSettings = async (
  dispatch, getState, importDPath, settingsEntries, progress
) => {
  await _parseJustnoteSettings(getState, importDPath, settingsEntries);
  progress.done += settingsEntries.length;
  dispatch(updateImportAllDataProgress(progress));
};

const parseJustnoteImages = async (
  dispatch, existFPaths, importDPath, imgEntries, progress
) => {
  for (let i = 0, j = imgEntries.length; i < j; i += N_NOTES) {
    const selectedEntries = imgEntries.slice(i, i + N_NOTES);

    for (const entry of selectedEntries) {
      const { fpath, fpathParts, fnameParts } = extractFPath(entry.filename);
      if (fpathParts.length !== 2 || fpathParts[0] !== IMAGES) continue;
      if (fnameParts.length !== 2) continue;

      if (existFPaths.includes(fpath)) continue;

      const destFPath = `${Dirs.DocumentDir}/${fpath}`;
      const destDPath = Util.dirname(destFPath);
      const doExist = await FileSystem.exists(destDPath);
      if (!doExist) await FileSystem.mkdir(destDPath);
      await FileSystem.cp(`${importDPath}/${entry.filename}`, destFPath);
    }

    progress.done += selectedEntries.length;
    dispatch(updateImportAllDataProgress(progress));
  }
};

const parseJustnoteNotes = async (
  dispatch, existFPaths, toParents, leafIds, importDPath, noteEntries, idMap, progress
) => {
  for (let i = 0, j = noteEntries.length; i < j; i += N_NOTES) {
    const selectedEntries = noteEntries.slice(i, i + N_NOTES);

    const fpaths = [], contents = [];
    for (const entry of selectedEntries) {
      const { fpath, fpathParts } = extractFPath(entry.filename);
      if (fpath.includes(CD_ROOT + '/')) {
        if (fpathParts.length !== 6) continue;
      } else {
        if (fpathParts.length !== 4) continue;
      }
      if (fpathParts[0] !== NOTES) continue;

      const { id, parentIds } = extractDataFName(fpathParts[2]);
      if (!(/^\d+[A-Za-z]+$/.test(id))) continue;

      let parentId;
      if (parentIds) {
        if (!parentIds.every(_id => (/^\d+[A-Za-z]+$/.test(_id)))) continue;
        if (parentIds.length > 0) parentId = parentIds[0];
      }

      let content;
      if (fpath.endsWith(INDEX + DOT_JSON) || fpath.includes(CD_ROOT + '/')) {
        content = await FileSystem.readFile(`${importDPath}/${entry.filename}`, UTF8);
      } else {
        continue;
      }
      if (!fpath.includes(CD_ROOT + '/') && !content) continue;

      if (fpathParts[3] === INDEX + DOT_JSON) {
        try {
          content = JSON.parse(content);
          if (
            !('title' in content && 'body' in content)
          ) continue;
          if (!(isString(content.title) && isString(content.body))) continue;
        } catch (error) {
          console.log('JSON.parse note content error: ', error);
          continue;
        }
      } else if (fpathParts[3] === CD_ROOT) {
        if (fpathParts[4] !== IMAGES) continue;
      } else continue;

      // There are 6 states of a note:
      //   1. leaf | skip | check leafIds
      //   2. updated (not leaf) | new id | Check id in toParents
      //   3. deleted (not leaf) | new id | Check id in toParents (deleted inc.!)
      //   4. never store | same id | Not found
      //   5. clean up on updated | new id | Check parentId or id in toParents
      //   6. clean up on deleted | same id | Not found

      // There are id level and file level!
      // If new id and fails, can't continue? Ask to clean up first.

      // Exist but not leaf, new id.
      const parentIdOrId = parentId || id;
      if (parentIdOrId in toParents && !leafIds.includes(id)) {
        if (!idMap[fpathParts[2]]) {
          let rootId = null;
          if (parentId) {
            rootId = parentId;
            const { dt } = extractDataId(rootId);
            while (rootId === parentId) rootId = `${dt}${randomString(4)}`;

            const rootFPathParts = [...fpathParts.slice(0, 4)];
            rootFPathParts[2] = rootId;
            rootFPathParts[3] = INDEX + DOT_JSON;

            // If there's a parent, add a parent id with empty note content.
            fpaths.push(rootFPathParts.join('/'));
            contents.push({ title: '', body: '' });
          }

          let newId = id;
          const { dt } = extractDataId(newId);
          while (newId === id) newId = `${dt}${randomString(4)}`;

          let newFName = rootId ? `${newId}_${rootId}` : newId;
          idMap[fpathParts[2]] = newFName;
          idMap[id] = newId;
        }
        fpathParts[2] = idMap[fpathParts[2]];

        fpaths.push(fpathParts.join('/'));
        contents.push(content);
        continue;
      }

      // Leaf but diff parent, skip. Can happen if export and then import.
      if (leafIds.includes(id)) {
        if (parentId && !Array.isArray(toParents[id])) continue;
        if (!parentId && Array.isArray(toParents[id])) continue;
        if (parentId && Array.isArray(toParents[id])) {
          if (!toParents[id].includes(parentId)) continue;
        }
      }

      // If already exist, skip. So if errors, can continue where it left off.
      // Or if no exist, add as is.
      // Need to check per file too as error can happen on any files.
      if (parentId) {
        const rootFPathParts = [...fpathParts.slice(0, 4)];
        rootFPathParts[2] = parentId;
        rootFPathParts[3] = INDEX + DOT_JSON;
        const rootFPath = rootFPathParts.join('/');

        if (!existFPaths.includes(rootFPath) && !idMap[rootFPath]) {
          // If there's a parent, add a parent id with empty note content.
          fpaths.push(rootFPath);
          contents.push({ title: '', body: '' });
          idMap[rootFPath] = parentId; // Just for checking already added the parent.
        }
      }
      if (!existFPaths.includes(fpath)) {
        fpaths.push(fpath);
        contents.push(content);
      }
    }

    await importAllDataLoop(fpaths, contents);

    progress.done += selectedEntries.length;
    dispatch(updateImportAllDataProgress(progress));
  }
};

const parseJustnotePins = async (
  dispatch, toRootIds, pins, importDPath, pinEntries, idMap, progress
) => {
  let now = Date.now();
  for (let i = 0, j = pinEntries.length; i < j; i += N_NOTES) {
    const selectedEntries = pinEntries.slice(i, i + N_NOTES);

    const fpaths = [], contents = [];
    for (const entry of selectedEntries) {
      const { fpathParts, fnameParts } = extractFPath(entry.filename);
      if (fpathParts.length !== 5 || fpathParts[0] !== PINS) continue;
      if (fnameParts.length !== 2) continue;

      const rank = fpathParts[1];
      if (rank.length === 0) continue;

      const updatedDT = fpathParts[2], addedDT = fpathParts[3], fname = fpathParts[4];
      if (!(/^\d+$/.test(updatedDT))) continue;
      if (!(/^\d+$/.test(addedDT))) continue;
      if (!fname.endsWith(DOT_JSON)) continue;

      let content = await FileSystem.readFile(`${importDPath}/${entry.filename}`, UTF8);
      if (!content) continue;

      try {
        content = JSON.parse(content);
        if (!isEqual(content, {})) continue;
      } catch (error) {
        console.log('JSON.parse pin content error: ', error);
        continue;
      }

      const id = fnameParts[0];

      // Need idMap to be all populated before mapping pinId to a new id.
      if (idMap[id]) {
        fpathParts[fpathParts.length - 1] = idMap[id] + DOT_JSON;

        fpaths.push(fpathParts.join('/'));
        contents.push(content);
        continue;
      }

      // There are 6 states of a pin:
      //   1. leaf | skip | check pins with mainId
      //   2. updated (no leaf) | now dt | check pins with mainId
      //   3. deleted (no leaf) | now dt | check pins with mainId
      //   4. never store | now dt | check pins with mainId
      //   5. clean up on updated | skip | check pins with mainId
      //   6. clean up on deleted | now dt | check pins with mainId

      // Already exists, no need to add again.
      if (getMainId(id, toRootIds) in pins) continue;

      fpathParts[2] = `${now}`;
      now += 1;

      fpaths.push(fpathParts.join('/'));
      contents.push(content);
    }

    await importAllDataLoop(fpaths, contents);

    progress.done += selectedEntries.length;
    dispatch(updateImportAllDataProgress(progress));
  }
};

const parseJustnoteTags = async (
  dispatch, toRootIds, tags, importDPath, tagEntries, idMap, progress
) => {
  let now = Date.now();
  for (let i = 0, j = tagEntries.length; i < j; i += N_NOTES) {
    const selectedEntries = tagEntries.slice(i, i + N_NOTES);

    const fpaths = [], contents = [];
    for (const entry of selectedEntries) {
      const { fpathParts, fnameParts } = extractFPath(entry.filename);
      if (fpathParts.length !== 6 || fpathParts[0] !== TAGS) continue;
      if (fnameParts.length !== 2) continue;

      const tagName = fpathParts[1];
      if (tagName.length === 0) continue;

      const rank = fpathParts[2];
      if (rank.length === 0) continue;

      const updatedDT = fpathParts[3], addedDT = fpathParts[4], fname = fpathParts[5];
      if (!(/^\d+$/.test(updatedDT))) continue;
      if (!(/^\d+$/.test(addedDT))) continue;
      if (!fname.endsWith(DOT_JSON)) continue;

      let content = await FileSystem.readFile(`${importDPath}/${entry.filename}`, UTF8);
      if (!content) continue;

      try {
        content = JSON.parse(content);
        if (!isEqual(content, {})) continue;
      } catch (error) {
        console.log('JSON.parse tag content error: ', error);
        continue;
      }

      const id = fnameParts[0];

      // Need idMap to be all populated before mapping tagId to a new id.
      if (idMap[id]) {
        fpathParts[fpathParts.length - 1] = idMap[id] + DOT_JSON;

        fpaths.push(fpathParts.join('/'));
        contents.push(content);
        continue;
      }

      // Already exists, no need to add again.
      const mainId = getMainId(id, toRootIds);
      if (isObject(tags[mainId])) {
        const found = tags[mainId].values.some(value => value.tagName === tagName);
        if (found) continue;
      }

      fpathParts[3] = `${now}`;
      now += 1;

      fpaths.push(fpathParts.join('/'));
      contents.push(content);
    }

    await importAllDataLoop(fpaths, contents);

    progress.done += selectedEntries.length;
    dispatch(updateImportAllDataProgress(progress));
  }
};

const parseJustnoteImportedFile = async (dispatch, getState, importDPath, entries) => {

  await syncAndWait(true, 2)(dispatch, getState);

  let existFPaths = [], toRootIds, toParents, leafIds = [];

  const fpaths = await dataApi.listFPaths(true);
  if (vars.syncMode.doSyncMode) fpaths.staticFPaths = await fileApi.getStaticFPaths();

  existFPaths.push(...fpaths.noteFPaths);
  existFPaths.push(...fpaths.pinFPaths);
  existFPaths.push(...fpaths.tagFPaths);
  existFPaths.push(...fpaths.staticFPaths);
  existFPaths.push(...fpaths.settingsFPaths);

  const nmRst = listNoteMetas(fpaths.noteFPaths);
  toRootIds = nmRst.toRootIds;
  toParents = nmRst.toParents;
  for (const meta of [...nmRst.noteMetas, ...nmRst.conflictedMetas]) {
    leafIds.push(meta.id);
  }

  const pins = getPins(fpaths.pinFPaths, {}, false, toRootIds);
  const tags = getTags(fpaths.tagFPaths, {}, toRootIds);

  const noteEntries = [], pinEntries = [], tagEntries = [];
  const imgEntries = [], settingsEntries = [];
  for (const entry of entries) {
    if (entry.directory) continue;

    const { fpath } = extractFPath(entry.filename);

    if (fpath.startsWith(NOTES)) {
      noteEntries.push(entry);
      continue;
    }
    if (fpath.startsWith(PINS)) {
      pinEntries.push(entry);
      continue;
    }
    if (fpath.startsWith(TAGS)) {
      tagEntries.push(entry);
      continue;
    }
    if (fpath.startsWith(IMAGES)) {
      imgEntries.push(entry);
      continue;
    }
    if (fpath.startsWith(SETTINGS)) {
      settingsEntries.push(entry);
      continue;
    }
  }

  const total = (
    noteEntries.length + pinEntries.length + tagEntries.length +
    imgEntries.length + settingsEntries.length
  );
  const progress = { total, done: 0 };
  dispatch(updateImportAllDataProgress(progress));

  if (progress.total === 0) return;

  await parseJustnoteSettings(
    dispatch, getState, importDPath, settingsEntries, progress
  );
  await parseJustnoteImages(dispatch, existFPaths, importDPath, imgEntries, progress);

  const idMap = {};
  await parseJustnoteNotes(
    dispatch, existFPaths, toParents, leafIds, importDPath, noteEntries, idMap, progress
  );
  await parseJustnotePins(
    dispatch, toRootIds, pins, importDPath, pinEntries, idMap, progress
  );
  await parseJustnoteTags(
    dispatch, toRootIds, tags, importDPath, tagEntries, idMap, progress
  );
};

const parseImportedFile = async (dispatch, getState, importDPath) => {
  try {
    let isEvernote = false, isGKeep = false, isTxt = false, isHtml = false;
    const entries = await getFileEntries(importDPath);

    for (const entry of entries) {
      if (entry.directory) continue;

      const { fpath, fext } = extractFPath(entry.filename);

      if (fpath.endsWith('Evernote_index.html')) {
        isEvernote = true;
        continue;
      }
      if (fpath.startsWith('Takeout/Keep/')) {
        isGKeep = true;
        continue;
      }
      if (['txt'].includes(fext.toLowerCase())) {
        isTxt = true;
        continue;
      }
      if (HTML_FILE_EXTS.includes(fext.toLowerCase())) {
        isHtml = true;
        continue;
      }
    }

    if (isEvernote) {
      await parseEvernoteImportedFile(dispatch, getState, importDPath, entries);
    } else if (isGKeep) {
      await parseGKeepImportedFile(dispatch, getState, importDPath, entries);
    } else if (isTxt || isHtml) {
      await parseRawImportedFile(dispatch, getState, importDPath, entries);
    } else {
      await parseJustnoteImportedFile(dispatch, getState, importDPath, entries);
    }

    dispatch(sync());
  } catch (error) {
    dispatch(updateImportAllDataProgress({ total: -1, done: -1, error: `${error}` }));
    return;
  }
};

const _importAllData = async (dispatch, getState) => {
  dispatch(updateImportAllDataProgress({ total: 'calculating...', done: 0 }));

  try {
    const results = await DocumentPicker.pick({
      type: DocumentPickerTypes.zip,
      copyTo: 'cachesDirectory',
    });
    const result = results[0];
    if (!isObject(result) || !isString(result.fileCopyUri)) {
      dispatch(updateImportAllDataProgress(null));

      const error = result.copyError || '';
      Alert.alert('Read file failed!', `Could not read the content in the file. Please recheck your file.\n\n${error}`);
      return;
    }

    const importDPath = `${Dirs.CacheDir}/import-data`;
    const doExist = await FileSystem.exists(importDPath);
    if (doExist) await FileSystem.unlink(importDPath);

    // unzip requires file path, not uri, use stat to convert/decode it.
    const { path: fileCopyPath } = await FileSystem.stat(result.fileCopyUri);
    await unzip(fileCopyPath, importDPath);
    await parseImportedFile(dispatch, getState, importDPath);
  } catch (error) {
    dispatch(updateImportAllDataProgress(null));
    if (DocumentPicker.isCancel(error)) return;

    Alert.alert('Read file failed!', `Could not read the content in the file. Please recheck your file.\n\n${error}`);
  }
};

export const importAllData = () => async (dispatch, getState) => {
  if (vars.importAllData.didPick) return;
  vars.importAllData.didPick = true;
  await _importAllData(dispatch, getState);
  vars.importAllData.didPick = false;
};

export const updateImportAllDataProgress = (progress) => {
  return {
    type: UPDATE_IMPORT_ALL_DATA_PROGRESS,
    payload: progress,
  };
};

const _canExport = (noteMeta, lockSettings, toRootIds) => {
  // Possible e.g., force lock while settingsPopup is shown.
  let lockedList = lockSettings.lockedLists[MY_NOTES];
  if (isObject(lockedList)) {
    if (!isNumber(lockedList.unlockedDT)) {
      if (!lockedList.canChangeListNames) {
        if (!lockedList.canExport) return false;
      }
    }
  }

  lockedList = lockSettings.lockedLists[noteMeta.listName];
  if (isObject(lockedList)) {
    if (!isNumber(lockedList.unlockedDT)) {
      if (!lockedList.canExport) return false;
    }
  }

  const noteMainId = getMainId(noteMeta.id, toRootIds);
  const lockedNote = lockSettings.lockedNotes[noteMainId];
  if (isObject(lockedNote)) {
    if (!isNumber(lockedNote.unlockedDT)) {
      if (!lockedNote.canExport) return false;
    }
  }

  return true;
};

const _filterPins = (pins, noteMainIds) => {
  const filteredPins = [];
  for (const pinMainId in pins) {
    if (!noteMainIds.includes(pinMainId)) continue;
    filteredPins.push(pins[pinMainId]);
  }

  return filteredPins;
};

const _filterTags = (tags, noteMainIds) => {
  const filteredTags = [];
  for (const tagMainId in tags) {
    if (!noteMainIds.includes(tagMainId)) continue;
    filteredTags.push(tags[tagMainId]);
  }

  return filteredTags;
};

export const saveAs = async (filePath, fileName) => {
  if (Platform.OS === 'ios') {
    try {
      await Share.open({ url: 'file://' + filePath });
    } catch (error) {
      if (isObject(error)) {
        if (
          isObject(error.error) &&
          isString(error.error.message) &&
          error.error.message.includes('The operation was cancelled')
        ) return;
        if (
          isString(error.message) &&
          error.message.includes('User did not share')
        ) return;
      }

      Alert.alert('Exporting Data Error!', `Please wait a moment and try again. If the problem persists, please contact us.\n\n${error}`);
    }

    return;
  }

  if (Platform.OS === 'android') {
    if (Platform.Version < 33) {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        Alert.alert(
          'Permission denied',
          'We don\'t have permission to save the exported data file in Downloads.\n\nPlease grant this permission in Settings -> Apps -> Permissions.',
        );
        return;
      }
    }

    try {
      await FileSystem.cpExternal(filePath, fileName, 'downloads');
      Alert.alert(
        'Export completed',
        `The exported data file - ${fileName} - has been saved in Downloads.`,
      );
    } catch (error) {
      Alert.alert('Exporting Data Error!', `Please wait a moment and try again. If the problem persists, please contact us.\n\n${error}`);
    }

    return;
  }

  console.log('Invalid platform: ', Platform.OS);
};

export const exportAllData = () => async (dispatch, getState) => {
  dispatch(updateExportAllDataProgress({ total: 'calculating...', done: 0 }));

  const waitResult = await syncAndWait(true, 2)(dispatch, getState);
  if (!waitResult) {
    dispatch(updateExportAllDataProgress({
      total: -1, done: -1, error: 'Sync failed. Please wait a moment and try again.',
    }));
    return;
  }

  const lockSettings = getState().lockSettings;

  let fpaths = [], fileFPaths = [], pins, tags, toRootIds;
  try {
    const {
      noteFPaths, settingsFPaths, pinFPaths, tagFPaths,
    } = await dataApi.listFPaths(true);
    const nmRst = listNoteMetas(noteFPaths);
    toRootIds = nmRst.toRootIds;

    const noteMainIds = [];
    for (const meta of [...nmRst.noteMetas, ...nmRst.conflictedMetas]) {
      if (!_canExport(meta, lockSettings, toRootIds)) continue;
      noteMainIds.push(getMainId(meta.id, toRootIds));

      for (const fpath of meta.fpaths) {
        fpaths.push(fpath);
        if (fpath.includes(CD_ROOT + '/')) {
          const staticFPath = getStaticFPath(fpath);
          if (vars.syncMode.doSyncMode) {
            if (!fileFPaths.includes(staticFPath)) fileFPaths.push(staticFPath);
          } else {
            if (!fpaths.includes(staticFPath)) fpaths.push(staticFPath);
          }
        }
      }
    }

    const lsfpsResult = getLastSettingsFPaths(settingsFPaths);
    if (lsfpsResult.fpaths.length > 0) {
      const lastSettingsFPath = lsfpsResult.fpaths[0];
      const { contents } = await dataApi.getFiles([lastSettingsFPath], true);
      if (!isEqual(initialSettingsState, contents[0])) {
        fpaths.push(lastSettingsFPath);
      }
    }

    pins = getPins(pinFPaths, {}, false, toRootIds);
    pins = _filterPins(pins, noteMainIds);

    tags = getTags(tagFPaths, {}, toRootIds);
    tags = _filterTags(tags, noteMainIds);
  } catch (error) {
    dispatch(updateExportAllDataProgress({ total: -1, done: -1, error: `${error}` }));
    return;
  }

  const total = fpaths.length + fileFPaths.length + pins.length + tags.length;
  const progress = { total, done: 0 };
  dispatch(updateExportAllDataProgress(progress));

  if (progress.total === 0) return;

  try {
    const exportDPath = `${Dirs.CacheDir}/justnote-data`;
    const doEdpExist = await FileSystem.exists(exportDPath);
    if (doEdpExist) await FileSystem.unlink(exportDPath);

    const errorResponses = [], idMap = {};
    for (let i = 0; i < fpaths.length; i += N_NOTES) {
      const selectedFPaths = fpaths.slice(i, i + N_NOTES);

      const successResponses = [], remainFPaths = [];
      for (const fpath of selectedFPaths) {
        if (fpath.startsWith(NOTES) && fpath.includes(CD_ROOT + '/')) {
          successResponses.push({ content: '', fpath, success: true });
        } else {
          remainFPaths.push(fpath);
        }
      }

      const { responses } = await dataApi.getFiles(remainFPaths, true);
      for (const response of responses) {
        if (response.success) successResponses.push(response);
        else errorResponses.push(response);
      }

      for (let { fpath, content } of successResponses) {
        if (fpath.startsWith(NOTES)) {
          const { listName, fname, subName } = extractNoteFPath(fpath);
          const { id, parentIds } = extractDataFName(fname);
          if (parentIds && toRootIds[id]) {
            const newFName = createDataFName(id, [toRootIds[id]]);
            fpath = createNoteFPath(listName, newFName, subName);
          }
          idMap[toRootIds[id]] = id;
        }

        if (fpath.endsWith(DOT_JSON)) content = JSON.stringify(content);

        const dpath = Util.dirname(`${exportDPath}/${fpath}`);
        const doExist = await FileSystem.exists(dpath);
        if (!doExist) await FileSystem.mkdir(dpath);

        await FileSystem.writeFile(`${exportDPath}/${fpath}`, content, UTF8);
      }

      progress.done += successResponses.length;
      if (progress.done < progress.total) {
        dispatch(updateExportAllDataProgress(progress));
      }
    }

    for (let i = 0, j = fileFPaths.length; i < j; i += N_NOTES) {
      const selectedFPaths = fileFPaths.slice(i, i + N_NOTES);

      for (const fpath of selectedFPaths) {
        const srcFPath = `${Dirs.DocumentDir}/${fpath}`;
        let doExist = await FileSystem.exists(srcFPath);
        if (!doExist) continue;

        const destFPath = `${exportDPath}/${fpath}`;
        const destDPath = Util.dirname(destFPath);
        doExist = await FileSystem.exists(destDPath);
        if (!doExist) await FileSystem.mkdir(destDPath);

        await FileSystem.cp(srcFPath, destFPath);
      }

      progress.done += selectedFPaths.length;
      if (progress.done < progress.total) {
        dispatch(updateExportAllDataProgress(progress));
      }
    }

    // Need idMap to be all populated before mapping pinId to a new id.
    for (let i = 0, j = pins.length; i < j; i += N_NOTES) {
      const selectedPins = pins.slice(i, i + N_NOTES);

      for (const { rank, updatedDT, addedDT, id } of selectedPins) {
        let mappedId = id;
        if (idMap[toRootIds[id]]) mappedId = idMap[toRootIds[id]];

        const fpath = createPinFPath(rank, updatedDT, addedDT, mappedId);
        const content = JSON.stringify({});

        const dpath = Util.dirname(`${exportDPath}/${fpath}`);
        const doExist = await FileSystem.exists(dpath);
        if (!doExist) await FileSystem.mkdir(dpath);

        await FileSystem.writeFile(`${exportDPath}/${fpath}`, content, UTF8);
      }

      progress.done += selectedPins.length;
      if (progress.done < progress.total) {
        dispatch(updateExportAllDataProgress(progress));
      }
    }
    for (let i = 0, j = tags.length; i < j; i += N_NOTES) {
      const selectedTags = tags.slice(i, i + N_NOTES);

      for (const { values } of selectedTags) {
        for (const { tagName, rank, updatedDT, addedDT, id } of values) {
          let mappedId = id;
          if (idMap[toRootIds[id]]) mappedId = idMap[toRootIds[id]];

          const fpath = createTagFPath(tagName, rank, updatedDT, addedDT, mappedId);
          const content = JSON.stringify({});

          const dpath = Util.dirname(`${exportDPath}/${fpath}`);
          const doExist = await FileSystem.exists(dpath);
          if (!doExist) await FileSystem.mkdir(dpath);

          await FileSystem.writeFile(`${exportDPath}/${fpath}`, content, UTF8);
        }
      }

      progress.done += selectedTags.length;
      if (progress.done < progress.total) {
        dispatch(updateExportAllDataProgress(progress));
      }
    }

    const fileName = `Justnote data ${getFormattedTimeStamp(new Date())}.zip`;
    const filePath = `${Dirs.CacheDir}/${fileName}`;
    const doFileExist = await FileSystem.exists(filePath);
    if (doFileExist) await FileSystem.unlink(filePath);

    await zip(exportDPath, filePath);
    await saveAs(filePath, fileName);

    if (errorResponses.length > 0) {
      progress.total = -1;
      progress.done = -1;
      progress.error = 'Some download requests failed. Data might be missing in the exported file.';
    }
    dispatch(updateExportAllDataProgress(progress));
  } catch (error) {
    dispatch(updateExportAllDataProgress({ total: -1, done: -1, error: `${error}` }));
    return;
  }
};

export const updateExportAllDataProgress = (progress) => {
  return {
    type: UPDATE_EXPORT_ALL_DATA_PROGRESS,
    payload: progress,
  };
};

const deleteAllNotes = async (dispatch, noteMetas, progress) => {
  let addedDT = Date.now();

  // One at a time to not overwhelm the server
  const nNotes = vars.syncMode.doSyncMode ? N_NOTES : 1;
  for (let i = 0, j = noteMetas.length; i < j; i += nNotes) {
    const selectedNoteMetas = noteMetas.slice(i, i + nNotes);

    const fromListNames = [], emptyFromNotes = [], toListNames = [], toNotes = [];
    for (const meta of selectedNoteMetas) {
      // Dummy contents are enough and good for performance
      const media = [];
      for (const fpath of meta.fpaths) {
        const { subName } = extractNoteFPath(fpath);
        if (subName !== INDEX + DOT_JSON) {
          media.push({ name: subName, content: '' });
        }
      }

      const fromListName = meta.listName;
      const fromNote = {
        parentIds: meta.parentIds,
        id: meta.id,
        title: '', body: '', media,
        addedDT: meta.addedDT,
        updatedDT: meta.updatedDT,
      };
      const toNote = {
        ...fromNote,
        parentIds: [fromNote.id], id: `deleted${addedDT}${randomString(4)}`,
        title: '', body: '', media: [],
        updatedDT: addedDT,
      };
      addedDT += 1;

      fromListNames.push(fromListName);
      emptyFromNotes.push(clearNoteData(fromNote));
      toListNames.push(fromListName);
      toNotes.push(toNote);
    }

    await dataApi.putNotes({ listNames: toListNames, notes: toNotes });

    try {
      await dataApi.putNotes({ listNames: fromListNames, notes: emptyFromNotes });
    } catch (error) {
      console.log('deleteAllNotes error: ', error);
      // error in this step should be fine
    }

    progress.done += selectedNoteMetas.length;
    dispatch(updateDeleteAllDataProgress(progress));
  }
};

const deleteAllPins = async (dispatch, pins, progress) => {
  let now = Date.now();

  // One at a time to not overwhelm the server
  const nNotes = vars.syncMode.doSyncMode ? N_NOTES : 1;
  for (let i = 0; i < pins.length; i += nNotes) {
    const _pins = pins.slice(i, i + nNotes);

    const toPins = [], fromPins = [];
    for (const { rank, updatedDT, addedDT, id } of _pins) {
      toPins.push({ rank, updatedDT: now, addedDT, id: `deleted${id}` });
      fromPins.push({ rank, updatedDT, addedDT, id });

      now += 1;
    }

    await dataApi.putPins({ pins: toPins });

    try {
      dataApi.deletePins({ pins: fromPins });
    } catch (error) {
      console.log('deleteAllPins error: ', error);
      // error in this step should be fine
    }

    progress.done += _pins.length;
    dispatch(updateDeleteAllDataProgress(progress));
  }
};

const deleteAllTags = async (dispatch, tags, progress) => {
  let now = Date.now();

  // One at a time to not overwhelm the server
  const nNotes = vars.syncMode.doSyncMode ? N_NOTES : 1;
  for (let i = 0; i < tags.length; i += nNotes) {
    const _tags = tags.slice(i, i + nNotes);

    const toFPaths = [], fromFPaths = [];
    for (const { values } of _tags) {
      for (const { tagName, rank, updatedDT, addedDT, id } of values) {
        toFPaths.push(createTagFPath(tagName, rank, now, addedDT, `deleted${id}`));
        fromFPaths.push(createTagFPath(tagName, rank, updatedDT, addedDT, id));

        now += 1;
      }
    }

    await dataApi.putFiles(toFPaths, toFPaths.map(() => ({})));

    try {
      dataApi.deleteFiles(fromFPaths);
    } catch (error) {
      console.log('deleteAllTags error: ', error);
      // error in this step should be fine
    }

    progress.done += _tags.length;
    dispatch(updateDeleteAllDataProgress(progress));
  }
};

export const deleteAllData = () => async (dispatch, getState) => {
  dispatch(updateDeleteAllDataProgress({ total: 'calculating...', done: 0 }));

  const waitResult = await syncAndWait(true, 2)(dispatch, getState);
  if (!waitResult) {
    dispatch(updateDeleteAllDataProgress({
      total: -1, done: -1, error: 'Sync failed. Please wait a moment and try again.',
    }));
    return;
  }

  let allNoteMetas, staticFPaths, settingsFPaths, settingsIds, infoFPath, pins, tags;
  try {
    const fpaths = await dataApi.listFPaths(true);
    if (vars.syncMode.doSyncMode) fpaths.staticFPaths = await fileApi.getStaticFPaths();

    const nmRst = listNoteMetas(fpaths.noteFPaths);

    allNoteMetas = [...nmRst.noteMetas, ...nmRst.conflictedMetas];
    staticFPaths = fpaths.staticFPaths;
    settingsFPaths = fpaths.settingsFPaths;
    infoFPath = fpaths.infoFPath;
    pins = getPins(fpaths.pinFPaths, {}, false, nmRst.toRootIds);
    pins = Object.values(pins);
    tags = getTags(fpaths.tagFPaths, {}, nmRst.toRootIds);
    tags = Object.values(tags);
  } catch (error) {
    dispatch(updateDeleteAllDataProgress({ total: -1, done: -1, error: `${error}` }));
    return;
  }

  const lsfpsResult = getLastSettingsFPaths(settingsFPaths);
  [settingsFPaths, settingsIds] = [lsfpsResult.fpaths, lsfpsResult.ids];
  if (settingsFPaths.length === 1) {
    const { contents } = await dataApi.getFiles(settingsFPaths, true);
    if (isEqual(initialSettingsState, contents[0])) {
      [settingsFPaths, settingsIds] = [[], []];
    }
  }

  if (infoFPath) {
    const { contents } = await dataApi.getFiles([infoFPath], true);
    if (isEqual(initialInfoState, contents[0])) infoFPath = null;
  }

  const total = (
    allNoteMetas.length + staticFPaths.length + settingsFPaths.length +
    (infoFPath ? 1 : 0) + pins.length + tags.length
  );
  const progress = { total, done: 0 };
  dispatch(updateDeleteAllDataProgress(progress));

  if (progress.total === 0) return;

  try {
    await deleteAllNotes(dispatch, allNoteMetas, progress);

    if (staticFPaths.length > 0) {
      await dataApi.deleteServerFiles(staticFPaths);

      progress.done += staticFPaths.length;
      dispatch(updateDeleteAllDataProgress(progress));
    }
    if (settingsFPaths.length > 0) {
      const now = Date.now();
      const fname = createDataFName(`${now}${randomString(4)}`, settingsIds);
      const newSettingsFPath = createSettingsFPath(fname);

      await dataApi.putFiles([newSettingsFPath], [{ ...initialSettingsState }]);
      try {
        await dataApi.putFiles(settingsFPaths, settingsFPaths.map(() => ({})));
      } catch (error) {
        console.log('deleteAllData error: ', error);
        // error in this step should be fine
      }

      progress.done += settingsFPaths.length;
      dispatch(updateDeleteAllDataProgress(progress));
    }
    if (infoFPath) {
      const now = Date.now();
      const newInfoFPath = `${INFO}${now}${DOT_JSON}`;

      await dataApi.putFiles([newInfoFPath], [{ ...initialInfoState }]);
      try {
        await dataApi.deleteFiles([infoFPath]);
      } catch (error) {
        console.log('deleteAllData error: ', error);
        // error in this step should be fine
      }

      progress.done += 1;
      dispatch(updateDeleteAllDataProgress(progress));
    }

    await deleteAllPins(dispatch, pins, progress);
    await deleteAllTags(dispatch, tags, progress);
    await fileApi.deleteFiles(staticFPaths);

    // Need to close the settings popup to update the url hash,
    //   as DELETE_ALL_DATA will set isSettingsPopupShown to false.
    if (getState().display.isSettingsPopupShown) {
      vars.updateSettingsPopup.didCall = true;
      updatePopupUrlHash(SETTINGS_POPUP, false);
    }
    dispatch({ type: DELETE_ALL_DATA });

    dispatch(sync(false, 1));
  } catch (error) {
    dispatch(updateDeleteAllDataProgress({ total: -1, done: -1, error: `${error}` }));
    return;
  }
};

export const updateDeleteAllDataProgress = (progress) => {
  return {
    type: UPDATE_DELETE_ALL_DATA_PROGRESS,
    payload: progress,
  };
};

const _getFileEntries = async (dpath) => {
  const entries = [];

  const fnames = await FileSystem.ls(dpath);
  for (const fname of fnames) {
    const fpath = `${dpath}/${fname}`;
    const isDir = await FileSystem.isDir(fpath);

    // Use filename here so to be the same as zip library in web
    entries.push({ filename: fpath, directory: isDir });
    if (isDir) {
      const _entries = await _getFileEntries(fpath);
      entries.push(..._entries);
    }
  }

  return entries;
};

const getFileEntries = async (dpath) => {
  const _entries = await _getFileEntries(dpath);
  const entries = _entries.map(entry => {
    const filename = entry.filename.slice(dpath.length + 1);
    return { ...entry, filename };
  });
  return entries;
};

const deleteUpdatedNoteSyncData = async (id, nmRst, pins, tags) => {
  const transitId = nmRst.toParents[id][0];
  const rootId = nmRst.toRootIds[id];
  const mainId = getMainId(id, nmRst.toRootIds);

  const pin = pins[mainId];
  if (
    isObject(pin) &&
    !pin.id.startsWith('deleted') &&
    ![id, transitId, rootId].includes(pin.id)
  ) {
    const { rank, updatedDT, addedDT } = extractPinFPath(pin.fpath);
    const fpath = createPinFPath(rank, updatedDT, addedDT, id);
    const content = {};

    if (vars.syncMode.doSyncMode) await serverApi.putFiles([fpath], [content]);
    await dataApi.putFiles([fpath], [content]);

    if (vars.syncMode.doSyncMode) await serverApi.deleteFiles(pin.fpaths);
    await dataApi.deleteFiles(pin.fpaths);
  }

  if (isObject(tags[mainId])) {
    for (const tagName in tags[mainId]) {
      const tag = tags[mainId][tagName];
      if (
        isObject(tag) &&
        !tag.id.startsWith('deleted') &&
        ![id, transitId, rootId].includes(tag.id)
      ) {
        const eRst = extractTagFPath(tag.fpath);
        const fpath = createTagFPath(
          eRst.tagName, eRst.rank, eRst.updatedDT, eRst.addedDT, id
        );
        const content = {};

        if (vars.syncMode.doSyncMode) await serverApi.putFiles([fpath], [content]);
        await dataApi.putFiles([fpath], [content]);

        if (vars.syncMode.doSyncMode) await serverApi.deleteFiles(tag.fpaths);
        await dataApi.deleteFiles(tag.fpaths);
      }
    }
  }

  let listName = MY_NOTES;

  let fpaths = nmRst.toFPaths[transitId];
  if (Array.isArray(fpaths) && fpaths.length > 0) {
    listName = extractNoteFPath(fpaths[0]).listName;
  }

  const fname = createDataFName(transitId, [rootId]);
  const fpath = createNoteFPath(listName, fname, INDEX + DOT_JSON);
  const content = { title: '', body: '' };

  if (vars.syncMode.doSyncMode) await serverApi.putFiles([fpath], [content]);
  await dataApi.putFiles([fpath], [content]);

  const parentIds = getDataParentIds(id, nmRst.toParents);

  for (let i = parentIds.length - 1; i >= 0; i--) {
    const parentId = parentIds[i];
    if (parentId === rootId) continue;

    fpaths = nmRst.toFPaths[parentId];
    if (!Array.isArray(fpaths)) continue;

    fpaths = fpaths.filter(fp => fp !== fpath);

    if (vars.syncMode.doSyncMode) await serverApi.deleteFiles(fpaths);
    await dataApi.deleteFiles(fpaths);
  }
};

const deleteDeletedNoteSyncData = async (id, nmRst) => {
  const parentIds = getDataParentIds(id, nmRst.toParents);

  let fpaths;
  for (let i = parentIds.length - 1; i >= 0; i--) {
    const parentId = parentIds[i];

    fpaths = nmRst.toFPaths[parentId];
    if (!Array.isArray(fpaths)) continue;

    if (vars.syncMode.doSyncMode) await serverApi.deleteFiles(fpaths);
    await dataApi.deleteFiles(fpaths);
  }

  fpaths = nmRst.toFPaths[id];
  if (!Array.isArray(fpaths)) return;

  if (vars.syncMode.doSyncMode) await serverApi.deleteFiles(fpaths);
  await dataApi.deleteFiles(fpaths);
};

const deleteUpdatedSettingsSyncData = async (id, smRst) => {
  const transitId = smRst.toParents[id][0];
  const rootId = smRst.toRootIds[id];

  const fname = createDataFName(transitId, [rootId]);
  const fpath = createSettingsFPath(fname);
  const content = {};

  if (vars.syncMode.doSyncMode) await serverApi.putFiles([fpath], [content]);
  await dataApi.putFiles([fpath], [content]);

  const parentIds = getDataParentIds(id, smRst.toParents);

  let fpaths;
  for (let i = parentIds.length - 1; i >= 0; i--) {
    const parentId = parentIds[i];
    if (parentId === rootId) continue;

    fpaths = smRst.toFPaths[parentId];
    if (!Array.isArray(fpaths)) continue;

    fpaths = fpaths.filter(fp => fp !== fpath);

    if (vars.syncMode.doSyncMode) await serverApi.deleteFiles(fpaths);
    await dataApi.deleteFiles(fpaths);
  }
};

const deleteDeletedPinSyncData = async (id, pins) => {
  const fpath = pins[id].fpath;
  const fpaths = pins[id].fpaths.filter(fp => fp !== fpath);

  if (vars.syncMode.doSyncMode) await serverApi.deleteFiles(fpaths);
  await dataApi.deleteFiles(fpaths);

  if (vars.syncMode.doSyncMode) await serverApi.deleteFiles([fpath]);
  await dataApi.deleteFiles([fpath]);
};

const deleteDeletedTagSyncData = async (tagName, id, tags) => {
  const fpath = tags[id][tagName].fpath;
  const fpaths = tags[id][tagName].fpaths.filter(fp => fp !== fpath);

  if (vars.syncMode.doSyncMode) await serverApi.deleteFiles(fpaths);
  await dataApi.deleteFiles(fpaths);

  if (vars.syncMode.doSyncMode) await serverApi.deleteFiles([fpath]);
  await dataApi.deleteFiles([fpath]);
};

const _deleteSyncData = async (dispatch, getState) => {
  dispatch(updateDeleteSyncDataProgress({ total: 'calculating...', done: 0 }));

  const waitResult = await syncAndWait(true, 2)(dispatch, getState);
  if (!waitResult) {
    dispatch(updateDeleteSyncDataProgress({
      total: -1, done: -1, error: 'Sync failed. Please wait a moment and try again.',
    }));
    return;
  }

  vars.deleteSyncData.isDeleting = true;

  let nmRst, smRst, unusedPinFPaths = [], pins = {}, unusedTagFPaths = [], tags = {};
  try {
    const fpaths = await dataApi.listFPaths(true);
    nmRst = listNoteMetas(fpaths.noteFPaths);
    smRst = listSettingsMetas(fpaths.settingsFPaths);

    for (const fpath of fpaths.pinFPaths) {
      const { updatedDT, id } = extractPinFPath(fpath);

      const _id = id.startsWith('deleted') ? id.slice(7) : id;
      const pinMainId = getMainId(_id, nmRst.toRootIds);
      if (!isString(pinMainId)) {
        unusedPinFPaths.push(fpath);
        continue;
      }

      if (!isObject(pins[pinMainId])) {
        pins[pinMainId] = { id: null, updatedDT: 0, fpath: null, fpaths: [] };
      }
      if (!pins[pinMainId].fpaths.includes(fpath)) {
        pins[pinMainId].fpaths.push(fpath);
      }

      if (pins[pinMainId].updatedDT > updatedDT) continue;
      pins[pinMainId].updatedDT = updatedDT;
      pins[pinMainId].id = id;
      pins[pinMainId].fpath = fpath;
    }
    for (const fpath of fpaths.tagFPaths) {
      const { tagName, updatedDT, id } = extractTagFPath(fpath);

      const _id = id.startsWith('deleted') ? id.slice(7) : id;
      const mainId = getMainId(_id, nmRst.toRootIds);
      if (!isString(mainId)) {
        unusedTagFPaths.push(fpath);
        continue;
      }

      if (!isObject(tags[mainId])) tags[mainId] = {};
      if (!isObject(tags[mainId][tagName])) {
        tags[mainId][tagName] = { id: null, updatedDT: 0, fpath: null, fpaths: [] };
      }
      if (!tags[mainId][tagName].fpaths.includes(fpath)) {
        tags[mainId][tagName].fpaths.push(fpath);
      }

      if (tags[mainId][tagName].updatedDT > updatedDT) continue;
      tags[mainId][tagName].updatedDT = updatedDT;
      tags[mainId][tagName].id = id;
      tags[mainId][tagName].fpath = fpath;
    }
  } catch (error) {
    dispatch(updateDeleteSyncDataProgress({ total: -1, done: -1, error: `${error}` }));
    return;
  }

  const nUpdatedIds = [], nDeletedIds = [], sUpdatedIds = [];
  const pDeletedIds = [], tDeletedInfos = [];
  for (const meta of nmRst.noteMetas) {
    const { id } = meta;

    const fpIds = nmRst.toParents[id];
    if (!Array.isArray(fpIds) || fpIds.length === 0) continue;

    const rootId = nmRst.toRootIds[id];
    for (const fpId of fpIds) {
      const spIds = nmRst.toParents[fpId];
      if (!Array.isArray(spIds) || spIds.length === 0) continue;
      if (spIds.length === 1 && spIds.includes(rootId)) continue;

      nUpdatedIds.push(id);
      break;
    }
  }
  for (const id of nmRst.allIds) {
    if (!id.startsWith('deleted')) continue;
    nDeletedIds.push(id);
  }
  for (const meta of smRst.settingsMetas) {
    const { id } = meta;

    const fpIds = smRst.toParents[id];
    if (!Array.isArray(fpIds) || fpIds.length === 0) continue;

    const rootId = smRst.toRootIds[id];
    for (const fpId of fpIds) {
      const spIds = smRst.toParents[fpId];
      if (!Array.isArray(spIds) || spIds.length === 0) continue;
      if (spIds.length === 1 && spIds.includes(rootId)) continue;

      sUpdatedIds.push(id);
      break;
    }
  }
  for (const pinMainId in pins) {
    if (!pins[pinMainId].id.startsWith('deleted')) continue;
    pDeletedIds.push(pinMainId);
  }
  for (const mainId in tags) {
    for (const tagName in tags[mainId]) {
      if (!tags[mainId][tagName].id.startsWith('deleted')) continue;
      tDeletedInfos.push({ tagName, mainId });
    }
  }

  const total = (
    nUpdatedIds.length + nDeletedIds.length + sUpdatedIds.length +
    unusedPinFPaths.length + pDeletedIds.length +
    unusedTagFPaths.length + tDeletedInfos.length
  );
  const progress = { total, done: 0 };
  dispatch(updateDeleteSyncDataProgress(progress));

  if (progress.total === 0) return;

  try {
    const nItems = 1;
    for (let i = 0, j = nUpdatedIds.length; i < j; i += nItems) {
      const _nUpdatedIds = nUpdatedIds.slice(i, i + nItems);
      await Promise.all(_nUpdatedIds.map(id => {
        return deleteUpdatedNoteSyncData(id, nmRst, pins, tags);
      }));

      progress.done += _nUpdatedIds.length;
      dispatch(updateDeleteSyncDataProgress(progress));
    }
    for (let i = 0, j = nDeletedIds.length; i < j; i += nItems) {
      const _nDeletedIds = nDeletedIds.slice(i, i + nItems);
      await Promise.all(_nDeletedIds.map(id => {
        return deleteDeletedNoteSyncData(id, nmRst);
      }));

      progress.done += _nDeletedIds.length;
      dispatch(updateDeleteSyncDataProgress(progress));
    }
    for (let i = 0, j = sUpdatedIds.length; i < j; i += nItems) {
      const _sUpdatedIds = sUpdatedIds.slice(i, i + nItems);
      await Promise.all(_sUpdatedIds.map(id => {
        return deleteUpdatedSettingsSyncData(id, smRst);
      }));

      progress.done += _sUpdatedIds.length;
      dispatch(updateDeleteSyncDataProgress(progress));
    }
    for (let i = 0, j = unusedPinFPaths.length; i < j; i += nItems) {
      const _unusedPinFPaths = unusedPinFPaths.slice(i, i + nItems);
      if (vars.syncMode.doSyncMode) await serverApi.deleteFiles(_unusedPinFPaths);
      await dataApi.deleteFiles(_unusedPinFPaths);

      progress.done += _unusedPinFPaths.length;
      dispatch(updateDeleteSyncDataProgress(progress));
    }
    for (let i = 0, j = pDeletedIds.length; i < j; i += nItems) {
      const _pDeletedIds = pDeletedIds.slice(i, i + nItems);
      await Promise.all(_pDeletedIds.map(id => {
        return deleteDeletedPinSyncData(id, pins);
      }));

      progress.done += _pDeletedIds.length;
      dispatch(updateDeleteSyncDataProgress(progress));
    }
    for (let i = 0, j = unusedTagFPaths.length; i < j; i += nItems) {
      const _unusedTagFPaths = unusedTagFPaths.slice(i, i + nItems);
      if (vars.syncMode.doSyncMode) await serverApi.deleteFiles(_unusedTagFPaths);
      await dataApi.deleteFiles(_unusedTagFPaths);

      progress.done += _unusedTagFPaths.length;
      dispatch(updateDeleteSyncDataProgress(progress));
    }
    for (let i = 0, j = tDeletedInfos.length; i < j; i += nItems) {
      const _tDeletedInfos = tDeletedInfos.slice(i, i + nItems);
      await Promise.all(_tDeletedInfos.map(info => {
        return deleteDeletedTagSyncData(info.tagName, info.mainId, tags);
      }));

      progress.done += _tDeletedInfos.length;
      dispatch(updateDeleteSyncDataProgress(progress));
    }
  } catch (error) {
    dispatch(updateDeleteSyncDataProgress({ total: -1, done: -1, error: `${error}` }));
    return;
  }
};

export const deleteSyncData = () => async (dispatch, getState) => {
  await _deleteSyncData(dispatch, getState);
  vars.deleteSyncData.isDeleting = false;
};

export const updateDeleteSyncDataProgress = (progress) => {
  return {
    type: UPDATE_DELETE_SYNC_DATA_PROGRESS,
    payload: progress,
  };
};
