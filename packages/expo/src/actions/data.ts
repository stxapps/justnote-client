import { Platform, Alert, PermissionsAndroid } from 'react-native';
import { FileSystem, Dirs, Util } from 'react-native-file-access';
import Share from 'react-native-share';
import { zip, unzip } from 'react-native-zip-archive';
import * as DocumentPicker from 'expo-document-picker';
import { parseDocument, DomUtils } from 'htmlparser2';
import { ImageManipulator } from 'expo-image-manipulator';

import dataApi from '../apis/data';
import serverApi from '../apis/server';
import fileApi from '../apis/localFile';
import { sync, syncAndWait } from '../actions/chunk';
import {
  UPDATE_IMPORT_ALL_DATA_PROGRESS, UPDATE_EXPORT_ALL_DATA_PROGRESS,
  UPDATE_DELETE_ALL_DATA_PROGRESS, UPDATE_DELETE_SYNC_DATA_PROGRESS, DELETE_ALL_DATA,
} from '../types/actionTypes';
import {
  SETTINGS_POPUP, MY_NOTES, TRASH, ARCHIVE, ADDED_DT, UPDATED_DT, N_NOTES, CD_ROOT,
  NOTES, SSLTS, IMAGES, SETTINGS, INFO, PINS, TAGS, INDEX, DOT_JSON,
  NOTE_DATE_SHOWING_MODE_HIDE, NOTE_DATE_SHOWING_MODE_SHOW, NOTE_DATE_FORMATS,
  IMAGE_FILE_EXTS, HTML_FILE_EXTS, PUT_FILE, DELETE_FILE, UTF8,
} from '../types/const';
import {
  isEqual, isObject, isString, isNumber, randomString, getStaticFPath, getMainId,
  isListNameObjsValid, isTagNameObjsValid, indexOfClosingTag, createNoteFPath,
  createDataFName, extractNoteFPath, extractDataFName, extractDataId, listNoteMetas,
  listSettingsMetas, createSettingsFPath, getSettingsFPaths, getLastSettingsFPaths,
  extractPinFPath, getPins, extractFPath, copyListNameObjs,
  copyListNameObjsWithExactExclude, getAllListNames, getFormattedTimeStamp,
  getDataParentIds, createPinFPath, extractTagFPath, getTags, createTagFPath,
  stripHtml, createSsltFPath, extractSsltFPath, getNoteMainIds,
  batchPerformFilesIfEnough, throwIfPerformFilesError, copyTagNameObjs,
} from '../utils';
import { initialSettingsState, initialInfoState } from '../types/initialStates';
import vars from '../vars';

import { updatePopupUrlHash, increaseUpdateStatusBarStyleCount } from '.';

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

const _getImageType = (fext) => {
  if (fext.toLowerCase() === 'png') return 'png';
  return 'jpeg';
};

const _resizeImage = async (srcFPath, imageType, maxWidth = 1688, maxHeight = 1688) => {
  const srcUri = (new URL('file://' + srcFPath)).href;
  const cxt = ImageManipulator.manipulate(srcUri);
  const { width, height } = await cxt.renderAsync();

  let outUri = srcUri;
  if (width > maxWidth || height > maxHeight) {
    let newWidth, newHeight;

    const aspectRatio = width / height;
    if (width / maxWidth > height / maxHeight) {
      newWidth = maxWidth;
      newHeight = maxWidth / aspectRatio;
    } else {
      newHeight = maxHeight;
      newWidth = maxHeight * aspectRatio;
    }

    const ref = await cxt.resize({ width: newWidth, height: newHeight }).renderAsync();
    const res = await ref.saveAsync({ compress: 0.92, format: imageType });
    outUri = res.uri;
  }

  // Not convert uri to path here as escape char pitfall and FileSystem supports uri
  return outUri;
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

  let sValues = [], eValues = [], cValues = [], now = Date.now();
  const idMap = {};
  for (let i = 0; i < imgEntries.length; i += N_NOTES) {
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

      let srcFPath = `${importDPath}/${entry.filename}`;
      const { size } = await FileSystem.stat(srcFPath);
      if (size > 360 * 1000) {
        const imageType = _getImageType(fext);
        srcFPath = await _resizeImage(srcFPath, imageType);
      }

      await FileSystem.cp(srcFPath, destFPath);
    }

    progress.done += selectedEntries.length;
    dispatch(updateImportAllDataProgress(progress));
  }

  const listName = MY_NOTES;
  for (let i = 0; i < htmlEntries.length; i += N_NOTES) {
    const selectedEntries = htmlEntries.slice(i, i + N_NOTES);

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

          const eFPath = `${dpath}/cdroot/${imgFPath}`;
          const eContent = '';
          eValues.push({ id: eFPath, type: PUT_FILE, path: eFPath, content: eContent });
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
          const elem: any = dom.firstChild;
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
          const elem: any = dom.firstChild;
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
          const elem: any = dom.firstChild;
          for (const node of elem.childNodes) {
            lines.push(DomUtils.textContent(node));
          }

          if (lines.length > 0) {
            let codeHtml = '<pre><code>';
            codeHtml += lines.join('<br>');
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
        const cFPath = `${dpath}/index.json`;
        const cContent = { title, body };
        cValues.push({ id: cFPath, type: PUT_FILE, path: cFPath, content: cContent });
      }
    }

    const doForce = !(i + N_NOTES < htmlEntries.length);
    [sValues, eValues, cValues] = await batchPerformFilesIfEnough(
      dataApi.performFiles, sValues, eValues, cValues, [], 1, doForce
    );

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

  let sValues = [], eValues = [], cValues = [], now = Date.now();
  const labelIdMap = {};
  if (labelsEntries.length > 0) {
    await syncAndWait(true, 2)(dispatch, getState);

    let settings = { ...initialSettingsState };
    const settingsFPaths = getSettingsFPaths(getState());
    const lsfpsResult = getLastSettingsFPaths(settingsFPaths);
    if (lsfpsResult.fpaths.length > 0) {
      const { contents } = await dataApi.getFiles(lsfpsResult.fpaths, true);
      for (const content of contents) {
        if (isObject(content)) settings = { ...content };
      }
    }
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

    const fname = createDataFName(`${now}${randomString(4)}`, lsfpsResult.ids);
    const fpath = createSettingsFPath(fname);
    now += 1;

    cValues.push({ id: fpath, type: PUT_FILE, path: fpath, content: settings });

    progress.done += labelsEntries.length;
    dispatch(updateImportAllDataProgress(progress));
  }

  const imgIdMap = {};
  for (let i = 0; i < imgEntries.length; i += N_NOTES) {
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

      let srcFPath = `${importDPath}/${entry.filename}`;
      const { size } = await FileSystem.stat(srcFPath);
      if (size > 360 * 1000) {
        const imageType = _getImageType(fext);
        srcFPath = await _resizeImage(srcFPath, imageType);
      }

      await FileSystem.cp(srcFPath, destFPath);
    }

    progress.done += selectedEntries.length;
    dispatch(updateImportAllDataProgress(progress));
  }

  for (let i = 0; i < jsonEntries.length; i += N_NOTES) {
    const selectedEntries = jsonEntries.slice(i, i + N_NOTES);

    for (const entry of selectedEntries) {
      let content: any = await FileSystem.readFile(
        `${importDPath}/${entry.filename}`, UTF8
      );
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
        body = '<p>' + content.textContent.replace(/\r?\n/g, '<br>') + '</p>';
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

            const eFPath = `${dpath}/cdroot/${imgFPath}`;
            const eContent = '';
            eValues.push(
              { id: eFPath, type: PUT_FILE, path: eFPath, content: eContent }
            );
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
        const cFPath = `${dpath}/index.json`;
        const cContent = { title, body };
        cValues.push({ id: cFPath, type: PUT_FILE, path: cFPath, content: cContent });
      }
    }

    const doForce = !(i + N_NOTES < jsonEntries.length);
    [sValues, eValues, cValues] = await batchPerformFilesIfEnough(
      dataApi.performFiles, sValues, eValues, cValues, [], 1, doForce
    );

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

    const listNameObj: any = { listName: id, displayName: key };
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

  let sValues = [], eValues = [], cValues = [], now = Date.now();
  const idMap = {};
  if (!isDirMapEmpty) {
    await syncAndWait(true, 2)(dispatch, getState);

    let settings = { ...initialSettingsState };
    const settingsFPaths = getSettingsFPaths(getState());
    const lsfpsResult = getLastSettingsFPaths(settingsFPaths);
    if (lsfpsResult.fpaths.length > 0) {
      const { contents } = await dataApi.getFiles(lsfpsResult.fpaths, true);
      for (const content of contents) {
        if (isObject(content)) settings = { ...content };
      }
    }
    settings.listNameMap = copyListNameObjs(settings.listNameMap);

    const nowObj = { now };
    _addListNameObj(settings.listNameMap, dirMap, idMap, nowObj);
    now = nowObj.now;

    const fname = createDataFName(`${now}${randomString(4)}`, lsfpsResult.ids);
    const fpath = createSettingsFPath(fname);
    now += 1;

    cValues.push({ id: fpath, type: PUT_FILE, path: fpath, content: settings });

    progress.done += 1;
    dispatch(updateImportAllDataProgress(progress));
  }

  for (let i = 0; i < rawEntries.length; i += N_NOTES) {
    const selectedEntries = rawEntries.slice(i, i + N_NOTES);

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
        body = '<p>' + content.replace(/\r?\n/g, '<br>') + '</p>';
      } else if (HTML_FILE_EXTS.includes(fext.toLowerCase())) {
        const bMatch = content.match(/<body[^>]*>([\s\S]+?)<\/body>/i);
        if (bMatch) body = bMatch[1].trim().replace(/\r?\n/g, '');
      }

      if (title || body) {
        const cFPath = `${dpath}/index.json`;
        const cContent = { title, body };
        cValues.push({ id: cFPath, type: PUT_FILE, path: cFPath, content: cContent });
      }
    }

    const doForce = !(i + N_NOTES < rawEntries.length);
    [sValues, eValues, cValues] = await batchPerformFilesIfEnough(
      dataApi.performFiles, sValues, eValues, cValues, [], 1, doForce
    );

    progress.done += selectedEntries.length;
    dispatch(updateImportAllDataProgress(progress));
  }
};

const _combineListNameMap = (settings, content) => {
  if (!isObject(settings) || !Array.isArray(settings.listNameMap)) return;
  if (!isObject(content) || !Array.isArray(content.listNameMap)) return;

  settings.listNameMap = copyListNameObjs(settings.listNameMap);

  const excludedListNames = getAllListNames(settings.listNameMap);
  const objs = copyListNameObjsWithExactExclude(content.listNameMap, excludedListNames);
  settings.listNameMap.push(...objs);
};

const _combineTagNameMap = (settings, content) => {
  if (!isObject(settings) || !Array.isArray(settings.tagNameMap)) return;
  if (!isObject(content) || !Array.isArray(content.tagNameMap)) return;

  settings.tagNameMap = copyTagNameObjs(settings.tagNameMap);

  const excludedTagNames = settings.tagNameMap.map(tagNameObj => tagNameObj.tagName);
  const objs = copyTagNameObjs(content.tagNameMap, excludedTagNames);
  settings.tagNameMap.push(...objs);
};

const _parseJustnoteSettings = async (getState, importDPath, settingsEntries) => {
  const settingsParts = [];
  for (const entry of settingsEntries) {
    const { fpath } = extractFPath(entry.filename);
    if (!fpath.endsWith(DOT_JSON)) continue;

    let dt = parseInt(fpath.slice(SETTINGS.length, -1 * DOT_JSON.length), 10);
    if (!isNumber(dt)) continue;

    let content: any = await FileSystem.readFile(
      `${importDPath}/${entry.filename}`, UTF8
    );
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

  let latestDt, latestSettings;
  for (const settingsPart of settingsParts) {
    if (!isNumber(latestDt) || !isObject(latestSettings)) {
      [latestDt, latestSettings] = [settingsPart.dt, settingsPart.content];
      continue;
    }
    if (settingsPart.dt <= latestDt) continue;
    [latestDt, latestSettings] = [settingsPart.dt, settingsPart.content];
  }
  if (!isObject(latestSettings)) return;

  const settingsFPaths = getSettingsFPaths(getState());
  const lsfpsResult = getLastSettingsFPaths(settingsFPaths);
  if (lsfpsResult.fpaths.length > 0) {
    const { contents } = await dataApi.getFiles(lsfpsResult.fpaths, true);
    for (const content of contents) {
      if (isEqual(latestSettings, content)) return;

      _combineListNameMap(latestSettings, content);
      _combineTagNameMap(latestSettings, content);
    }
  }

  let now = Date.now();
  const fname = createDataFName(`${now}${randomString(4)}`, lsfpsResult.ids);
  const fpath = createSettingsFPath(fname);
  now += 1;

  const values = [
    { id: fpath, type: PUT_FILE, path: fpath, content: latestSettings },
  ];

  const data = { values, isSequential: false, nItemsForNs: 1 };
  const results = await dataApi.performFiles(data);
  throwIfPerformFilesError(data, results);
};

const parseJustnoteSettings = async (
  dispatch, getState, importDPath, settingsEntries, progress
) => {
  await _parseJustnoteSettings(getState, importDPath, settingsEntries);
  progress.done += settingsEntries.length;
  if (settingsEntries.length > 0) {
    dispatch(updateImportAllDataProgress(progress));
  }
};

const parseJustnoteImages = async (
  dispatch, existFPaths, importDPath, imgEntries, progress
) => {
  for (let i = 0; i < imgEntries.length; i += N_NOTES) {
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

const _pushSsltValue = (
  ssltInfos, idMap, psInfos, fpathParts, id, parentId, eValues, existSslts
) => {
  const mId = idMap[id] ? idMap[id] : id;
  if (existSslts.includes(mId)) return;

  const psInfo = psInfos[id];
  const listName = isObject(psInfo) ? psInfo.listName : fpathParts[1];

  let doPut = false;
  if (idMap[id]) {
    if (fpathParts[1] !== listName) doPut = true;
  } else {
    const ssltInfo = ssltInfos[parentId] || ssltInfos[id];

    if (isObject(ssltInfo) && isObject(psInfo)) {
      if (ssltInfo.listName !== listName) doPut = true;
    } else if (isObject(ssltInfo) && !isObject(psInfo)) {
      if (ssltInfo.listName !== listName) doPut = true;
    } else if (!isObject(ssltInfo) && isObject(psInfo)) {
      if (fpathParts[1] !== listName) doPut = true;
    }
  }
  if (listName === TRASH) doPut = true;
  if (doPut) {
    const now = Date.now();
    const ssltFPath = createSsltFPath(listName, now, now, mId);
    eValues.push({ id: ssltFPath, type: PUT_FILE, path: ssltFPath, content: {} });
  }

  existSslts.push(mId);
};

const parseJustnoteNotes = async (
  dispatch, existFPaths, toParents, leafIds, ssltInfos, importDPath, noteEntries,
  ssltEntries, idMap, progress
) => {
  const psInfos = {}, existSslts = [];
  for (const entry of ssltEntries) {
    const { fpath, fpathParts, fnameParts } = extractFPath(entry.filename);
    if (fpathParts.length !== 5 || fpathParts[0] !== SSLTS) continue;
    if (fnameParts.length !== 2) continue;

    const listName = fpathParts[1];
    if (listName.length === 0) continue;

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
      console.log('JSON.parse sslt content error: ', error);
      continue;
    }

    const id = fnameParts[0], pdUpdatedDT = parseInt(updatedDT, 10);
    if (isObject(psInfos[id]) && psInfos[id].updatedDT > pdUpdatedDT) continue;

    psInfos[id] = { updatedDT: pdUpdatedDT, listName, fpath };
  }
  progress.done += ssltEntries.length;
  if (ssltEntries.length > 0) {
    dispatch(updateImportAllDataProgress(progress));
  }

  let sValues = [], eValues = [], cValues = [];
  for (let i = 0; i < noteEntries.length; i += N_NOTES) {
    const selectedEntries = noteEntries.slice(i, i + N_NOTES);

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
            const rootFPath = rootFPathParts.join('/');
            const rootContent = { title: '', body: '' };
            eValues.push(
              { id: rootFPath, type: PUT_FILE, path: rootFPath, content: rootContent }
            );
          }

          let newId = id;
          const { dt } = extractDataId(newId);
          while (newId === id) newId = `${dt}${randomString(4)}`;

          let newFName = rootId ? `${newId}_${rootId}` : newId;
          idMap[fpathParts[2]] = newFName;
          idMap[id] = newId;
        }
        fpathParts[2] = idMap[fpathParts[2]];

        const newFPath = fpathParts.join('/');
        cValues.push({ id: newFPath, type: PUT_FILE, path: newFPath, content });

        _pushSsltValue(
          ssltInfos, idMap, psInfos, fpathParts, id, parentId, eValues, existSslts
        );

        continue;
      }

      // Exist and leaf, skip.
      // Can't just check id
      //   as might be error from previous imports, some files still missing.
      // If leaf but diff parents (i.e. export and then import), can be sure not
      //   from imports, can just skip.
      if (leafIds.includes(id)) {
        if (parentId && !Array.isArray(toParents[id])) continue;
        if (!parentId && Array.isArray(toParents[id])) continue;
        if (parentId && Array.isArray(toParents[id])) {
          if (!toParents[id].includes(parentId)) continue;
        }
      }

      // If already exist, skip. So if errors, can continue where it left off.
      // Or if no exist, add as is.
      // Need to check per file as error can happen on any files.
      if (parentId && !(parentId in toParents)) {
        const rootFPathParts = [...fpathParts.slice(0, 4)];
        rootFPathParts[2] = parentId;
        rootFPathParts[3] = INDEX + DOT_JSON;
        const rootFPath = rootFPathParts.join('/');

        // Can't just check with existFPaths (need to check with toParents above)
        //  as listName might be different between rootFPath and leafFPath.
        if (!existFPaths.includes(rootFPath) && !idMap[rootFPath]) {
          // If there's a parent, add a parent id with empty note content.
          const rootContent = { title: '', body: '' };
          eValues.push(
            { id: rootFPath, type: PUT_FILE, path: rootFPath, content: rootContent }
          );
          idMap[rootFPath] = parentId; // Just for checking already added the parent.
        }
      }
      if (!existFPaths.includes(fpath)) {
        cValues.push({ id: fpath, type: PUT_FILE, path: fpath, content });
      }

      _pushSsltValue(
        ssltInfos, idMap, psInfos, fpathParts, id, parentId, eValues, existSslts
      );
    }

    const doForce = !(i + N_NOTES < noteEntries.length);
    [sValues, eValues, cValues] = await batchPerformFilesIfEnough(
      dataApi.performFiles, sValues, eValues, cValues, [], 1, doForce
    );

    progress.done += selectedEntries.length;
    dispatch(updateImportAllDataProgress(progress));
  }
};

const parseJustnotePins = async (
  dispatch, toRootIds, pins, importDPath, pinEntries, idMap, progress
) => {
  let sValues = [], eValues = [], now = Date.now();
  for (let i = 0; i < pinEntries.length; i += N_NOTES) {
    const selectedEntries = pinEntries.slice(i, i + N_NOTES);

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

        const newFPath = fpathParts.join('/');
        eValues.push({ id: newFPath, type: PUT_FILE, path: newFPath, content });
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

      const newFPath = fpathParts.join('/');
      eValues.push({ id: newFPath, type: PUT_FILE, path: newFPath, content });
    }

    const doForce = !(i + N_NOTES < pinEntries.length);
    [sValues, eValues] = await batchPerformFilesIfEnough(
      dataApi.performFiles, sValues, eValues, [], [], 1, doForce
    );

    progress.done += selectedEntries.length;
    dispatch(updateImportAllDataProgress(progress));
  }
};

const parseJustnoteTags = async (
  dispatch, toRootIds, tags, importDPath, tagEntries, idMap, progress
) => {
  let sValues = [], eValues = [], now = Date.now();
  for (let i = 0; i < tagEntries.length; i += N_NOTES) {
    const selectedEntries = tagEntries.slice(i, i + N_NOTES);

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

        const newFPath = fpathParts.join('/');
        eValues.push({ id: newFPath, type: PUT_FILE, path: newFPath, content });
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

      const newFPath = fpathParts.join('/');
      eValues.push({ id: newFPath, type: PUT_FILE, path: newFPath, content });
    }

    const doForce = !(i + N_NOTES < tagEntries.length);
    [sValues, eValues] = await batchPerformFilesIfEnough(
      dataApi.performFiles, sValues, eValues, [], [], 1, doForce
    );

    progress.done += selectedEntries.length;
    dispatch(updateImportAllDataProgress(progress));
  }
};

const parseJustnoteImportedFile = async (dispatch, getState, importDPath, entries) => {

  await syncAndWait(true, 2)(dispatch, getState);

  const fpaths = await dataApi.listFPaths(true);
  if (vars.syncMode.doSyncMode) fpaths.staticFPaths = await fileApi.getStaticFPaths();

  let existFPaths = [], leafIds = [];
  existFPaths.push(...fpaths.noteFPaths);
  existFPaths.push(...fpaths.ssltFPaths);
  existFPaths.push(...fpaths.pinFPaths);
  existFPaths.push(...fpaths.tagFPaths);
  existFPaths.push(...fpaths.staticFPaths);
  existFPaths.push(...fpaths.settingsFPaths);

  const {
    noteMetas, conflictedMetas, toRootIds, toParents, ssltInfos,
  } = listNoteMetas(fpaths.noteFPaths, fpaths.ssltFPaths, {});
  for (const meta of [...noteMetas, ...conflictedMetas]) {
    leafIds.push(meta.id);
  }

  const pins = getPins(fpaths.pinFPaths, {}, false, toRootIds);
  const tags = getTags(fpaths.tagFPaths, {}, toRootIds);

  const noteEntries = [], ssltEntries = [], pinEntries = [], tagEntries = [];
  const imgEntries = [], settingsEntries = [];
  for (const entry of entries) {
    if (entry.directory) continue;

    const { fpath } = extractFPath(entry.filename);

    if (fpath.startsWith(NOTES)) {
      noteEntries.push(entry);
      continue;
    }
    if (fpath.startsWith(SSLTS)) {
      ssltEntries.push(entry);
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
    noteEntries.length + ssltEntries.length + pinEntries.length + tagEntries.length +
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
    dispatch, existFPaths, toParents, leafIds, ssltInfos, importDPath, noteEntries,
    ssltEntries, idMap, progress
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
    const gResult = await DocumentPicker.getDocumentAsync({
      type: 'application/zip',
      copyToCacheDirectory: true,
    });
    dispatch(increaseUpdateStatusBarStyleCount());

    if (gResult.canceled) {
      dispatch(updateImportAllDataProgress(null));
      return;
    }

    const result = gResult.assets[0]
    if (!isObject(result) || !isString(result.uri)) {
      dispatch(updateImportAllDataProgress(null));
      Alert.alert('Read file failed!', 'Could not read the content in the file. Please recheck your file.');
      return;
    }

    const importDPath = `${Dirs.CacheDir}/import-data`;
    const doExist = await FileSystem.exists(importDPath);
    if (doExist) await FileSystem.unlink(importDPath);

    // unzip requires file path, not uri, use stat to convert/decode it.
    const { path: fileCopyPath } = await FileSystem.stat(result.uri);
    await unzip(fileCopyPath, importDPath);
    await parseImportedFile(dispatch, getState, importDPath);
  } catch (error) {
    dispatch(increaseUpdateStatusBarStyleCount());
    dispatch(updateImportAllDataProgress(null));
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

export const saveAs = async (dispatch, filePath, fileName) => {
  if (Platform.OS === 'ios') {
    try {
      await Share.open({ url: (new URL('file://' + filePath)).href });
      dispatch(increaseUpdateStatusBarStyleCount());
    } catch (error) {
      dispatch(increaseUpdateStatusBarStyleCount());

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
    if (Platform.Version <= 28) {
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

  let lfpRst;
  try {
    lfpRst = await dataApi.listFPaths();
  } catch (error) {
    dispatch(updateExportAllDataProgress({ total: -1, done: -1, error: `${error}` }));
    return;
  }

  const {
    noteMetas, conflictedMetas, toRootIds, ssltInfos,
  } = listNoteMetas(lfpRst.noteFPaths, lfpRst.ssltFPaths, {});
  const pins = getPins(lfpRst.pinFPaths, {}, false, toRootIds);
  const tags = getTags(lfpRst.tagFPaths, {}, toRootIds);

  const fpaths = [], fileFPaths = [], noteMainIds = [];
  const ssltObjs = [], pinObjs = [], tagObjs = [];

  for (const meta of [...noteMetas, ...conflictedMetas]) {
    if (!_canExport(meta, lockSettings, toRootIds)) continue;

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
    noteMainIds.push(getMainId(meta.id, toRootIds));
  }

  for (const mainId in ssltInfos) {
    if (!noteMainIds.includes(mainId)) continue;
    ssltObjs.push(ssltInfos[mainId]);
  }
  for (const mainId in pins) {
    if (!noteMainIds.includes(mainId)) continue;
    pinObjs.push(pins[mainId]);
  }
  for (const mainId in tags) {
    if (!noteMainIds.includes(mainId)) continue;
    tagObjs.push(tags[mainId]);
  }

  const lsfpsResult = getLastSettingsFPaths(lfpRst.settingsFPaths);
  if (lsfpsResult.fpaths.length > 0) {
    const lastSettingsFPath = lsfpsResult.fpaths[0];
    const { contents } = await dataApi.getFiles([lastSettingsFPath], true);
    if (!isEqual(initialSettingsState, contents[0])) {
      fpaths.push(lastSettingsFPath);
    }
  }

  const total = (
    fpaths.length + fileFPaths.length + ssltObjs.length + pinObjs.length +
    tagObjs.length
  );
  const progress = { total, done: 0, error: '' };
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

          let newFName = fname;
          if (parentIds && toRootIds[id]) {
            newFName = createDataFName(id, [toRootIds[id]]);
          }
          fpath = createNoteFPath(listName, newFName, subName);
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

    for (let i = 0; i < fileFPaths.length; i += N_NOTES) {
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
    for (let i = 0; i < ssltObjs.length; i += N_NOTES) {
      const sldSsltObjs = ssltObjs.slice(i, i + N_NOTES);

      for (const { listName, updatedDT, addedDT, id } of sldSsltObjs) {
        let mappedId = id;
        if (idMap[toRootIds[id]]) mappedId = idMap[toRootIds[id]];

        const fpath = createSsltFPath(listName, updatedDT, addedDT, mappedId);
        const content = JSON.stringify({});

        const dpath = Util.dirname(`${exportDPath}/${fpath}`);
        const doExist = await FileSystem.exists(dpath);
        if (!doExist) await FileSystem.mkdir(dpath);

        await FileSystem.writeFile(`${exportDPath}/${fpath}`, content, UTF8);
      }

      progress.done += sldSsltObjs.length;
      if (progress.done < progress.total) {
        dispatch(updateExportAllDataProgress(progress));
      }
    }
    for (let i = 0; i < pinObjs.length; i += N_NOTES) {
      const sldPinObjs = pinObjs.slice(i, i + N_NOTES);

      for (const { rank, updatedDT, addedDT, id } of sldPinObjs) {
        let mappedId = id;
        if (idMap[toRootIds[id]]) mappedId = idMap[toRootIds[id]];

        const fpath = createPinFPath(rank, updatedDT, addedDT, mappedId);
        const content = JSON.stringify({});

        const dpath = Util.dirname(`${exportDPath}/${fpath}`);
        const doExist = await FileSystem.exists(dpath);
        if (!doExist) await FileSystem.mkdir(dpath);

        await FileSystem.writeFile(`${exportDPath}/${fpath}`, content, UTF8);
      }

      progress.done += sldPinObjs.length;
      if (progress.done < progress.total) {
        dispatch(updateExportAllDataProgress(progress));
      }
    }
    for (let i = 0; i < tagObjs.length; i += N_NOTES) {
      const sldTagObjs = tagObjs.slice(i, i + N_NOTES);

      for (const { values } of sldTagObjs) {
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

      progress.done += sldTagObjs.length;
      if (progress.done < progress.total) {
        dispatch(updateExportAllDataProgress(progress));
      }
    }

    const fileName = `Justnote data ${getFormattedTimeStamp(new Date())}.zip`;
    const filePath = `${Dirs.CacheDir}/${fileName}`;
    const doFileExist = await FileSystem.exists(filePath);
    if (doFileExist) await FileSystem.unlink(filePath);

    await zip(exportDPath, filePath);
    await saveAs(dispatch, filePath, fileName);

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

const deleteAllDataIfEnough = async (values, pValues, doForce = false) => {
  const nNotes = 30;
  if (!doForce && values.length < nNotes && pValues.length < nNotes) {
    return [values, pValues];
  }

  for (let i = 0; i < values.length; i += nNotes) {
    const sldValues = values.slice(i, i + nNotes);
    const data = { values: sldValues, isSequential: false, nItemsForNs: 1 };
    const results = await dataApi.performFiles(data);
    throwIfPerformFilesError(data, results);
  }

  const rpValues = [];
  for (let i = 0; i < pValues.length; i += nNotes) {
    const sldValues = pValues.slice(i, i + nNotes);
    if (!doForce && sldValues.length < nNotes) {
      rpValues.push(...sldValues);
      continue;
    }
    try {
      const data = { values: sldValues, isSequential: false, nItemsForNs: 1 };
      await dataApi.performFiles(data);
    } catch (error) {
      console.log('deleteAllNotes error: ', error);
      // error in this step should be fine
    }
  }

  return [[], rpValues];
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

  let allNoteMetas, settingsFPaths, settingsIds, infoFPath, staticFPaths, toFPaths;
  const otherFPaths = [];
  try {
    const lfpRst = await dataApi.listFPaths(true);
    if (vars.syncMode.doSyncMode) lfpRst.staticFPaths = await fileApi.getStaticFPaths();

    const nmRst = listNoteMetas(lfpRst.noteFPaths, lfpRst.ssltFPaths, {});

    allNoteMetas = [...nmRst.noteMetas, ...nmRst.conflictedMetas];
    [settingsFPaths, infoFPath] = [lfpRst.settingsFPaths, lfpRst.infoFPath];
    staticFPaths = lfpRst.staticFPaths;
    otherFPaths.push(...lfpRst.ssltFPaths);
    otherFPaths.push(...lfpRst.pinFPaths);
    otherFPaths.push(...lfpRst.tagFPaths);

    toFPaths = nmRst.toFPaths;
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
    allNoteMetas.length + settingsFPaths.length + (infoFPath ? 1 : 0) +
    staticFPaths.length + otherFPaths.length
  );
  const progress = { total, done: 0 };
  dispatch(updateDeleteAllDataProgress(progress));

  if (progress.total === 0) return;

  try {
    let values = [], pValues = [], addedDT = Date.now();
    for (let i = 0; i < allNoteMetas.length; i += N_NOTES) {
      const sldNoteMetas = allNoteMetas.slice(i, i + N_NOTES);
      for (const meta of sldNoteMetas) {
        const fromId = meta.id;
        const toId = `deleted${addedDT}${randomString(4)}`;
        const toFName = createDataFName(toId, [fromId]);
        const toFPath = createNoteFPath(meta.listName, toFName, INDEX + DOT_JSON);
        const toContent = { title: '', body: '' };
        values.push({ id: toFPath, type: PUT_FILE, path: toFPath, content: toContent });
        addedDT += 1;

        if (Array.isArray(toFPaths[fromId])) {
          for (const fpath of toFPaths[fromId]) {
            if (fpath.includes(CD_ROOT + '/')) continue; // Already empty string

            if (fpath.endsWith(INDEX + DOT_JSON)) {
              const content = { title: '', body: '' };
              pValues.push({ id: fpath, type: PUT_FILE, path: fpath, content });
            } else {
              pValues.push({ id: fpath, type: PUT_FILE, path: fpath, content: '' });
            }
          }
        }
      }

      [values, pValues] = await deleteAllDataIfEnough(values, pValues);

      progress.done += sldNoteMetas.length;
      if (progress.done < progress.total) {
        dispatch(updateDeleteAllDataProgress(progress));
      }
    }

    if (settingsFPaths.length > 0) {
      const toFName = createDataFName(`${addedDT}${randomString(4)}`, settingsIds);
      const toFPath = createSettingsFPath(toFName);
      const toContent = { ...initialSettingsState };
      values.push({ id: toFPath, type: PUT_FILE, path: toFPath, content: toContent });
      addedDT += 1;

      for (const fpath of settingsFPaths) {
        pValues.push({ id: fpath, type: PUT_FILE, path: fpath, content: {} });
      }

      [values, pValues] = await deleteAllDataIfEnough(values, pValues);

      progress.done += settingsFPaths.length;
      if (progress.done < progress.total) {
        dispatch(updateDeleteAllDataProgress(progress));
      }
    }
    if (infoFPath) {
      const toFPath = `${INFO}${addedDT}${DOT_JSON}`;
      const toContent = { ...initialInfoState };
      values.push({ id: toFPath, type: PUT_FILE, path: toFPath, content: toContent });
      addedDT += 1;

      const pValue = {
        id: infoFPath, type: DELETE_FILE, path: infoFPath,
        doIgnoreDoesNotExistError: true,
      };
      pValues.push(pValue);

      [values, pValues] = await deleteAllDataIfEnough(values, pValues);

      progress.done += 1;
      if (progress.done < progress.total) {
        dispatch(updateDeleteAllDataProgress(progress));
      }
    }

    for (let i = 0; i < staticFPaths.length; i += N_NOTES) {
      const sldFPaths = staticFPaths.slice(i, i + N_NOTES);
      if (!vars.syncMode.doSyncMode) {
        for (const fpath of sldFPaths) {
          const pValue = {
            id: fpath, type: DELETE_FILE, path: fpath,
            doIgnoreDoesNotExistError: true,
          };
          pValues.push(pValue);
        }

        [values, pValues] = await deleteAllDataIfEnough(values, pValues);
      }

      progress.done += sldFPaths.length;
      if (progress.done < progress.total) {
        dispatch(updateDeleteAllDataProgress(progress));
      }
    }
    for (let i = 0; i < otherFPaths.length; i += N_NOTES) {
      const sldFPaths = otherFPaths.slice(i, i + N_NOTES);
      for (const fpath of sldFPaths) {
        const pValue = {
          id: fpath, type: DELETE_FILE, path: fpath,
          doIgnoreDoesNotExistError: true,
        };
        pValues.push(pValue);
      }

      [values, pValues] = await deleteAllDataIfEnough(values, pValues);

      progress.done += sldFPaths.length;
      if (progress.done < progress.total) {
        dispatch(updateDeleteAllDataProgress(progress));
      }
    }

    [values, pValues] = await deleteAllDataIfEnough(values, pValues, true);
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

const getUpdatedNoteSyncData = (id, nmRst, sslts, pins, tags) => {
  const transitId = nmRst.toParents[id][0];
  const rootId = nmRst.toRootIds[id];
  const mainId = getMainId(id, nmRst.toRootIds);

  const sslt = sslts[mainId], values = [];
  if (isObject(sslt) && ![id, transitId, rootId].includes(sslt.id)) {
    const { listName, updatedDT, addedDT } = extractSsltFPath(sslt.fpath);
    const fpath = createSsltFPath(listName, updatedDT, addedDT, id);
    values.push({ id: fpath, type: PUT_FILE, path: fpath, content: {} });

    for (const dFPath of sslt.fpaths) {
      const value = {
        id: dFPath, type: DELETE_FILE, path: dFPath,
        doIgnoreDoesNotExistError: true,
      };
      values.push(value);
    }
  }

  const pin = pins[mainId];
  if (
    isObject(pin) &&
    !pin.id.startsWith('deleted') &&
    ![id, transitId, rootId].includes(pin.id)
  ) {
    const { rank, updatedDT, addedDT } = extractPinFPath(pin.fpath);
    const fpath = createPinFPath(rank, updatedDT, addedDT, id);
    values.push({ id: fpath, type: PUT_FILE, path: fpath, content: {} });

    for (const dFPath of pin.fpaths) {
      const value = {
        id: dFPath, type: DELETE_FILE, path: dFPath,
        doIgnoreDoesNotExistError: true,
      };
      values.push(value);
    }
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
        values.push({ id: fpath, type: PUT_FILE, path: fpath, content: {} });

        for (const dFPath of tag.fpaths) {
          const value = {
            id: dFPath, type: DELETE_FILE, path: dFPath,
            doIgnoreDoesNotExistError: true,
          };
          values.push(value);
        }
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
  values.push({ id: fpath, type: PUT_FILE, path: fpath, content });

  const parentIds = getDataParentIds(id, nmRst.toParents);

  for (let i = parentIds.length - 1; i >= 0; i--) {
    const parentId = parentIds[i];
    if (parentId === rootId) continue;

    fpaths = nmRst.toFPaths[parentId];
    if (!Array.isArray(fpaths)) continue;

    fpaths = fpaths.filter(fp => fp !== fpath);
    for (const dFPath of fpaths) {
      values.push(
        { id: dFPath, type: DELETE_FILE, path: dFPath, doIgnoreDoesNotExistError: true }
      );
    }
  }

  return values;
};

const getUpdatedSettingsSyncData = (id, smRst) => {
  const transitId = smRst.toParents[id][0];
  const rootId = smRst.toRootIds[id];

  const values = [];
  const fname = createDataFName(transitId, [rootId]);
  const fpath = createSettingsFPath(fname);
  values.push({ id: fpath, type: PUT_FILE, path: fpath, content: {} });

  const parentIds = getDataParentIds(id, smRst.toParents);

  for (let i = parentIds.length - 1; i >= 0; i--) {
    const parentId = parentIds[i];
    if (parentId === rootId) continue;

    let fpaths = smRst.toFPaths[parentId];
    if (!Array.isArray(fpaths)) continue;

    fpaths = fpaths.filter(fp => fp !== fpath);
    for (const dFPath of fpaths) {
      values.push(
        { id: dFPath, type: DELETE_FILE, path: dFPath, doIgnoreDoesNotExistError: true }
      );
    }
  }

  return values;
};

const getDeletedNoteSyncData = (id, nmRst) => {
  const parentIds = getDataParentIds(id, nmRst.toParents);

  const values = [];
  for (let i = parentIds.length - 1; i >= 0; i--) {
    const parentId = parentIds[i];
    const fpaths = nmRst.toFPaths[parentId];
    if (!Array.isArray(fpaths)) continue;

    for (const fpath of fpaths) {
      values.push(
        { id: fpath, type: DELETE_FILE, path: fpath, doIgnoreDoesNotExistError: true }
      );
    }
  }

  const fpaths = nmRst.toFPaths[id];
  if (Array.isArray(fpaths)) {
    for (const fpath of fpaths) {
      values.push(
        { id: fpath, type: DELETE_FILE, path: fpath, doIgnoreDoesNotExistError: true }
      );
    }
  }

  return values;
};

const getDeletedPinSyncData = (id, pins) => {
  const lastFPath = pins[id].fpath;
  const fpaths = pins[id].fpaths.filter(fp => fp !== lastFPath);

  const values = [];
  for (const fpath of [...fpaths, lastFPath]) {
    values.push(
      { id: fpath, type: DELETE_FILE, path: fpath, doIgnoreDoesNotExistError: true }
    );
  }
  return values;
};

const getDeletedTagSyncData = (tagName, id, tags) => {
  const lastFPath = tags[id][tagName].fpath;
  const fpaths = tags[id][tagName].fpaths.filter(fp => fp !== lastFPath);

  const values = [];
  for (const fpath of [...fpaths, lastFPath]) {
    values.push(
      { id: fpath, type: DELETE_FILE, path: fpath, doIgnoreDoesNotExistError: true }
    );
  }
  return values;
};

const _deleteSyncDataIfEnough = async (arrOfVls, dValues) => {
  const values = [];
  for (const eValues of arrOfVls) {
    if (eValues.length === 0) continue;
    const data = { values: eValues, isSequential: true, nItemsForNs: 1 };
    values.push(data);
  }
  values.push(...dValues);

  const data = { values, isSequential: false, nItemsForNs: 1 };
  if (vars.syncMode.doSyncMode) {
    const results = await serverApi.performFiles(data);
    throwIfPerformFilesError(data, results);
  }
  const results = await dataApi.performFiles(data);
  throwIfPerformFilesError(data, results);
};

const deleteSyncDataIfEnough = async (arrOfVls, dValues, doForce = false) => {
  const nNotes = 30;

  let colLen = 0;
  for (const values of arrOfVls) {
    if (colLen < values.length) colLen = values.length;
  }

  let actArrOfVls = [], actDValues = [], actCount = 0;
  for (let col = 0; col < colLen; col++) {
    for (let row = 0; row < arrOfVls.length; row++) {
      const values = arrOfVls[row];
      if (col >= values.length) continue;

      const value = values[col];
      if (actCount + 1 > nNotes) {
        await _deleteSyncDataIfEnough(actArrOfVls, actDValues);
        [actArrOfVls, actDValues, actCount] = [[], [], 0];
      }

      while (actArrOfVls.length <= row) actArrOfVls.push([]);
      actArrOfVls[row].push(value);
      actCount += 1;
    }
  }
  for (const value of dValues) {
    if (actCount + 1 > nNotes) {
      await _deleteSyncDataIfEnough(actArrOfVls, actDValues);
      [actArrOfVls, actDValues, actCount] = [[], [], 0];
    }
    actDValues.push(value);
    actCount += 1;
  }

  if (doForce) {
    await _deleteSyncDataIfEnough(actArrOfVls, actDValues);
    [actArrOfVls, actDValues, actCount] = [[], [], 0];
  }

  actArrOfVls = actArrOfVls.filter(values => values.length > 0);
  return [actArrOfVls, actDValues];
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

  let nmRst, smRst;
  const sslts = {}, pins = {}, tags = {}, unusedFPaths = [];
  try {
    const lfpRst = await dataApi.listFPaths(true);
    nmRst = listNoteMetas(lfpRst.noteFPaths, lfpRst.ssltFPaths, {});
    smRst = listSettingsMetas(lfpRst.settingsFPaths);
    const noteMainIds = getNoteMainIds(
      nmRst.noteMetas, nmRst.conflictedMetas, nmRst.toRootIds
    );

    for (const fpath of lfpRst.ssltFPaths) {
      const { updatedDT, id } = extractSsltFPath(fpath);

      const ssltMainId = getMainId(id, nmRst.toRootIds);
      if (!isString(ssltMainId) || !noteMainIds.includes(ssltMainId)) {
        unusedFPaths.push(fpath);
        continue;
      }

      if (!isObject(sslts[ssltMainId])) {
        sslts[ssltMainId] = { id: null, updatedDT: 0, fpath: null, fpaths: [] };
      }
      if (!sslts[ssltMainId].fpaths.includes(fpath)) {
        sslts[ssltMainId].fpaths.push(fpath);
      }

      if (sslts[ssltMainId].updatedDT > updatedDT) continue;
      sslts[ssltMainId].updatedDT = updatedDT;
      sslts[ssltMainId].id = id;
      sslts[ssltMainId].fpath = fpath;
    }
    for (const fpath of lfpRst.pinFPaths) {
      const { updatedDT, id } = extractPinFPath(fpath);

      const _id = id.startsWith('deleted') ? id.slice(7) : id;
      const pinMainId = getMainId(_id, nmRst.toRootIds);
      if (!isString(pinMainId) || !noteMainIds.includes(pinMainId)) {
        unusedFPaths.push(fpath);
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
    for (const fpath of lfpRst.tagFPaths) {
      const { tagName, updatedDT, id } = extractTagFPath(fpath);

      const _id = id.startsWith('deleted') ? id.slice(7) : id;
      const mainId = getMainId(_id, nmRst.toRootIds);
      if (!isString(mainId) || !noteMainIds.includes(mainId)) {
        unusedFPaths.push(fpath);
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

  const nUpdatedIds = [], sUpdatedIds = [];
  const nDeletedIds = [], pDeletedIds = [], tDeletedInfos = [];
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
  for (const id of nmRst.allIds) {
    if (!id.startsWith('deleted')) continue;
    nDeletedIds.push(id);
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
    nUpdatedIds.length + sUpdatedIds.length + nDeletedIds.length +
    pDeletedIds.length + tDeletedInfos.length + unusedFPaths.length
  );
  const progress = { total, done: 0 };
  dispatch(updateDeleteSyncDataProgress(progress));

  if (progress.total === 0) return;

  try {
    let arrOfVls = [], dValues = [];
    for (let i = 0; i < nUpdatedIds.length; i += N_NOTES) {
      const _nUpdatedIds = nUpdatedIds.slice(i, i + N_NOTES);
      for (const id of _nUpdatedIds) {
        const values = getUpdatedNoteSyncData(id, nmRst, sslts, pins, tags);
        arrOfVls.push(values);
      }
      [arrOfVls, dValues] = await deleteSyncDataIfEnough(arrOfVls, dValues);

      progress.done += _nUpdatedIds.length;
      if (progress.done < progress.total) {
        dispatch(updateDeleteSyncDataProgress(progress));
      }
    }
    for (let i = 0; i < sUpdatedIds.length; i += N_NOTES) {
      const _sUpdatedIds = sUpdatedIds.slice(i, i + N_NOTES);
      for (const id of _sUpdatedIds) {
        const values = getUpdatedSettingsSyncData(id, smRst);
        arrOfVls.push(values);
      }
      [arrOfVls, dValues] = await deleteSyncDataIfEnough(arrOfVls, dValues);

      progress.done += _sUpdatedIds.length;
      if (progress.done < progress.total) {
        dispatch(updateDeleteSyncDataProgress(progress));
      }
    }
    for (let i = 0; i < nDeletedIds.length; i += N_NOTES) {
      const _nDeletedIds = nDeletedIds.slice(i, i + N_NOTES);
      for (const id of _nDeletedIds) {
        const values = getDeletedNoteSyncData(id, nmRst);
        arrOfVls.push(values);
      }
      [arrOfVls, dValues] = await deleteSyncDataIfEnough(arrOfVls, dValues);

      progress.done += _nDeletedIds.length;
      if (progress.done < progress.total) {
        dispatch(updateDeleteSyncDataProgress(progress));
      }
    }
    for (let i = 0; i < pDeletedIds.length; i += N_NOTES) {
      const _pDeletedIds = pDeletedIds.slice(i, i + N_NOTES);
      for (const id of _pDeletedIds) {
        const values = getDeletedPinSyncData(id, pins);
        arrOfVls.push(values);
      }
      [arrOfVls, dValues] = await deleteSyncDataIfEnough(arrOfVls, dValues);

      progress.done += _pDeletedIds.length;
      if (progress.done < progress.total) {
        dispatch(updateDeleteSyncDataProgress(progress));
      }
    }
    for (let i = 0; i < tDeletedInfos.length; i += N_NOTES) {
      const _tDeletedInfos = tDeletedInfos.slice(i, i + N_NOTES);
      for (const info of _tDeletedInfos) {
        const values = getDeletedTagSyncData(info.tagName, info.mainId, tags);
        arrOfVls.push(values);
      }
      [arrOfVls, dValues] = await deleteSyncDataIfEnough(arrOfVls, dValues);

      progress.done += _tDeletedInfos.length;
      if (progress.done < progress.total) {
        dispatch(updateDeleteSyncDataProgress(progress));
      }
    }
    for (let i = 0; i < unusedFPaths.length; i += N_NOTES) {
      const _unusedFPaths = unusedFPaths.slice(i, i + N_NOTES);
      for (const fpath of _unusedFPaths) {
        dValues.push(
          { id: fpath, type: DELETE_FILE, path: fpath, doIgnoreDoesNotExistError: true }
        );
      }
      [arrOfVls, dValues] = await deleteSyncDataIfEnough(arrOfVls, dValues);

      progress.done += _unusedFPaths.length;
      if (progress.done < progress.total) {
        dispatch(updateDeleteSyncDataProgress(progress));
      }
    }

    [arrOfVls, dValues] = await deleteSyncDataIfEnough(arrOfVls, dValues, true);
    dispatch(updateDeleteSyncDataProgress(progress));
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
