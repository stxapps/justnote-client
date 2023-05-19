import { Platform, Alert, PermissionsAndroid } from 'react-native';
import { FileSystem, Dirs, Util } from 'react-native-file-access';
import Share from 'react-native-share';
import { zip, unzip } from 'react-native-zip-archive';
import DocumentPicker, {
  types as DocumentPickerTypes,
} from 'react-native-document-picker';
import { parseDocument } from 'htmlparser2';

import dataApi from '../apis/data';
import fileApi from '../apis/localFile';
import { updatePopupUrlHash, sync } from '../actions';
import {
  UPDATE_IMPORT_ALL_DATA_PROGRESS, UPDATE_EXPORT_ALL_DATA_PROGRESS,
  UPDATE_DELETE_ALL_DATA_PROGRESS, DELETE_ALL_DATA,
} from '../types/actionTypes';
import {
  SETTINGS_POPUP, MY_NOTES, TRASH, ARCHIVE, ADDED_DT, UPDATED_DT, N_NOTES, CD_ROOT,
  NOTES, IMAGES, SETTINGS, INFO, PINS, INDEX, DOT_JSON, NOTE_DATE_SHOWING_MODE_HIDE,
  NOTE_DATE_SHOWING_MODE_SHOW, NOTE_DATE_FORMATS, IMAGE_FILE_EXTS, HTML_FILE_EXTS,
  UTF8,
} from '../types/const';
import {
  isEqual, isObject, isString, isNumber, sleep, randomString, clearNoteData,
  getStaticFPath, getMainId, isListNameObjsValid, indexOfClosingTag, createNoteFPath,
  createDataFName, extractNoteFPath, extractDataFName, extractDataId, listNoteIds,
  createSettingsFPath, getSettingsFPaths, getLastSettingsFPaths, extractPinFPath,
  getPins, batchGetFileWithRetry, extractFPath, copyListNameObjs,
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

const parseEvernoteImportedFile = async (dispatch, getState, importDPath, entries) => {

  const htmlEntries = [], imgEntries = [];
  for (const entry of entries) {
    const { fpath, fext } = extractFPath(entry);

    if (fpath.endsWith('Evernote_index.html')) continue;
    if (HTML_FILE_EXTS.includes(fext.toLowerCase())) {
      htmlEntries.push(entry);
      continue;
    }
    if (IMAGE_FILE_EXTS.includes(fext.toLowerCase())) {
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
      const { fpathParts, fnameParts, fext } = extractFPath(entry);

      const fpath = `${IMAGES}/${randomString(4)}-${randomString(4)}-${randomString(4)}-${randomString(4)}.${fext}`;

      // Also includes dir name to be matched with src in the html
      if (fpathParts.length < 2) continue;
      const dir = fpathParts[fpathParts.length - 2] + '/';
      idMap[dir + fnameParts.slice(0, -1).join('.')] = fpath;

      const destFPath = `${Dirs.DocumentDir}/${fpath}`;
      const destDPath = Util.dirname(destFPath);
      const doExist = await FileSystem.exists(destDPath);
      if (!doExist) await FileSystem.mkdir(destDPath);
      await FileSystem.cp(`${importDPath}/${entry}`, destFPath);
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
      const content = await FileSystem.readFile(`${importDPath}/${entry}`, UTF8);
      if (!content) continue;

      let dt, dtMatch = content.match(/<meta itemprop="created" content="(.+)">/i);
      if (!dtMatch) {
        dtMatch = content.match(/<meta itemprop="updated" content="(.+)">/i);
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
      const tMatch = content.match(/<h1[^>]*>([^<]+)<\/h1>/i);
      if (tMatch) title = tMatch[1].trim();
      if (title === 'Untitled') title = '';

      let body = '';
      const bMatch = content.match(/<en-note[^>]*>([\s\S]+?)<\/en-note>/i);
      if (bMatch) body = bMatch[1].trim();

      // img tags
      for (const match of body.matchAll(/<img[^>]+?src="([^"]+)"[^>]*>/gi)) {
        const { fpath, fpathParts, fnameParts } = extractFPath(match[1]);

        if (fpathParts.length < 2 || fnameParts.length < 2) continue;

        const dir = fpathParts[fpathParts.length - 2] + '/';
        const imgFPath = idMap[dir + fnameParts.slice(0, -1).join('.')];
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
          const elem = dom.firstChild;
          /*for (const node of elem.children) {
            let isCompleted = false;
            if (node instanceof HTMLElement && node.dataset && node.dataset.completed) {
              isCompleted = node.dataset.completed === 'true';
            }

            const text = node.firstChild.firstChild.lastChild.firstChild.textContent;
            taskObjs.push({ text: text.trim(), isCompleted });
          }*/

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
          const elem = dom.firstChild;
          /*for (const node of elem.children) {
            let isCompleted = false;
            if (node instanceof HTMLElement && node.dataset && node.dataset.checked) {
              isCompleted = node.dataset.checked === 'true';
            }

            const text = node.lastChild.firstChild.textContent;
            todoObjs.push({ text: text.trim(), isCompleted });
          }*/

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
          const elem = dom.firstChild;
          /*for (const node of elem.children) {
            lines.push(node.textContent);
          }*/

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
    const { fname, fext } = extractFPath(entry);

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
      const content = await FileSystem.readFile(`${importDPath}/${labelsEntry}`, UTF8);
      if (!isString(content)) continue;

      for (const label of content.split('\n')) {
        if (!label || label in labelIdMap) continue;

        const id = `${now}-${randomString(4)}`;
        settings.listNameMap.push({ listName: id, displayName: label });
        labelIdMap[label] = id;
        now += 1;
      }
    }

    await sync(true, 2)(dispatch, getState);

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
      const { fnameParts, fext } = extractFPath(entry);
      if (fnameParts.length < 2) continue;

      const fpath = `${IMAGES}/${randomString(4)}-${randomString(4)}-${randomString(4)}-${randomString(4)}.${fext}`;

      // As file name can be .jpg but attachment in note.json can be .jpeg
      //   so need to ignore the ext.
      imgIdMap[fnameParts.slice(0, -1).join('.')] = fpath;

      const destFPath = `${Dirs.DocumentDir}/${fpath}`;
      const destDPath = Util.dirname(destFPath);
      const doExist = await FileSystem.exists(destDPath);
      if (!doExist) await FileSystem.mkdir(destDPath);
      await FileSystem.cp(`${importDPath}/${entry}`, destFPath);
    }

    progress.done += selectedEntries.length;
    dispatch(updateImportAllDataProgress(progress));
  }

  for (let i = 0, j = jsonEntries.length; i < j; i += N_NOTES) {
    const selectedEntries = jsonEntries.slice(i, i + N_NOTES);

    const fpaths = [], contents = [];
    for (const entry of selectedEntries) {
      /** @type {any} */
      let content = await FileSystem.readFile(`${importDPath}/${entry}`, UTF8);
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
    const { fpath, fext } = extractFPath(entry);

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

    await sync(true, 2)(dispatch, getState);

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
      const { fpathParts, fnameParts, fext } = extractFPath(entry);

      let content = await FileSystem.readFile(`${importDPath}/${entry}`, UTF8);
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
        if (bMatch) body = bMatch[1].trim();
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
    const { fpath } = extractFPath(entry);
    if (!fpath.endsWith(DOT_JSON)) continue;

    let dt = parseInt(fpath.slice(SETTINGS.length, -1 * DOT_JSON.length), 10);
    if (!isNumber(dt)) continue;

    /** @type {any} */
    let content = await FileSystem.readFile(`${importDPath}/${entry}`, UTF8);
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
      if ('listNameMap' in content && isListNameObjsValid(content.listNameMap)) {
        settings.listNameMap = content.listNameMap;
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
  const lastSettingsFPaths = getLastSettingsFPaths(settingsFPaths);
  if (lastSettingsFPaths.fpaths.length > 0) {
    const lastSettingsFPath = lastSettingsFPaths.fpaths[0];
    const { contents } = await dataApi.getFiles([lastSettingsFPath], true);
    if (isEqual(latestSettingsPart.content, contents[0])) {
      return;
    }
  }

  let now = Date.now();
  const fname = createDataFName(`${now}${randomString(4)}`, lastSettingsFPaths.ids);
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
      const { fpath, fpathParts, fnameParts } = extractFPath(entry);
      if (fpathParts.length !== 2 || fpathParts[0] !== IMAGES) continue;
      if (fnameParts.length !== 2) continue;

      if (existFPaths.includes(fpath)) continue;

      const destFPath = `${Dirs.DocumentDir}/${fpath}`;
      const destDPath = Util.dirname(destFPath);
      const doExist = await FileSystem.exists(destDPath);
      if (!doExist) await FileSystem.mkdir(destDPath);
      await FileSystem.cp(`${importDPath}/${entry}`, destFPath);
    }

    progress.done += selectedEntries.length;
    dispatch(updateImportAllDataProgress(progress));
  }
};

const parseJustnoteNotes = async (
  dispatch, existFPaths, toRootIds, leafIds, importDPath, noteEntries, idMap, progress
) => {
  for (let i = 0, j = noteEntries.length; i < j; i += N_NOTES) {
    const selectedEntries = noteEntries.slice(i, i + N_NOTES);

    const fpaths = [], contents = [];
    for (const entry of selectedEntries) {
      const { fpath, fpathParts } = extractFPath(entry);
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
        content = await FileSystem.readFile(`${importDPath}/${entry}`, UTF8);
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
      //   2. updated (no leaf) | new id | Check id in toRootIds
      //   3. deleted (no leaf) | new id | Check id in toRootIds (deleted inc.!)
      //   4. never store | same id | Not found
      //   5. clean up on updated | new id | Check id in toRootIds
      //   6. clean up on deleted | same id | Not found

      // There are id level and file level!
      // If new id and fails, can't continue? Ask to clean up first.

      // Exist but not leaf, new id.
      if (id in toRootIds && !leafIds.includes(id)) {
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

      const updatedDT = fpathParts[2], addedDT = fpathParts[3], fname = fpathParts[4];
      if (!(/^\d+$/.test(updatedDT))) continue;
      if (!(/^\d+$/.test(addedDT))) continue;
      if (!fname.endsWith('.json')) continue;

      let content = await FileSystem.readFile(`${importDPath}/${entry}`, UTF8);
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
        fpathParts[fpathParts.length - 1] = idMap[id] + '.json';

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

const parseJustnoteImportedFile = async (dispatch, getState, importDPath, entries) => {

  // Need to manually call it to wait for it properly!
  await sync(true, 2)(dispatch, getState);

  let existFPaths = [], toRootIds, leafIds = [];

  const fpaths = await dataApi.listFPaths(true);
  existFPaths.push(...fpaths.noteFPaths);
  existFPaths.push(...fpaths.pinFPaths);
  existFPaths.push(...fpaths.staticFPaths);
  existFPaths.push(...fpaths.settingsFPaths);

  const noteIds = listNoteIds(fpaths.noteFPaths);
  toRootIds = noteIds.toRootIds;
  for (const noteId of [...noteIds.noteIds, ...noteIds.conflictedIds]) {
    leafIds.push(noteId.id);
  }

  const pins = getPins(fpaths.pinFPaths, {}, false, toRootIds);

  const noteEntries = [], pinEntries = [], imgEntries = [], settingsEntries = [];
  for (const entry of entries) {
    const { fpath } = extractFPath(entry);

    if (fpath.startsWith(NOTES)) {
      noteEntries.push(entry);
      continue;
    }
    if (fpath.startsWith(PINS)) {
      pinEntries.push(entry);
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
    noteEntries.length + pinEntries.length + imgEntries.length + settingsEntries.length
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
    dispatch, existFPaths, toRootIds, leafIds, importDPath, noteEntries, idMap, progress
  );
  await parseJustnotePins(
    dispatch, toRootIds, pins, importDPath, pinEntries, idMap, progress
  );
};

const parseImportedFile = async (dispatch, getState, importDPath) => {
  try {
    let isEvernote = false, isGKeep = false, isTxt = false, isHtml = false;
    const entries = await FileSystem.ls(importDPath);
    for (const entry of entries) {
      const { fpath, fext } = extractFPath(entry);

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
  } catch (error) {
    dispatch(updateImportAllDataProgress({
      total: -1,
      done: -1,
      error: `${error}`,
    }));
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
      const error = result.copyError || '';
      Alert.alert('Read file failed!', `Could not read content in the file. Please recheck your file.\n\n${error}`);
      return;
    }

    const importDPath = `${Dirs.CacheDir}/import-data`;
    const doExist = await FileSystem.exists(importDPath);
    if (doExist) await FileSystem.unlink(importDPath);

    await unzip(result.fileCopyUri, importDPath);
    await parseImportedFile(dispatch, getState, importDPath);
  } catch (error) {
    dispatch(updateImportAllDataProgress(null));
    if (DocumentPicker.isCancel(error)) return;

    Alert.alert('Read file failed!', `Could not read content in the file. Please recheck your file.\n\n${error}`);
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

export const saveAs = async (fileName, filePath) => {
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

  // Need to manually call it to wait for it properly!
  await sync(true, 2)(dispatch, getState);

  let fpaths = [], rootIds = {}, toRootIds;
  try {
    const { noteFPaths, settingsFPaths, pinFPaths } = await dataApi.listFPaths(true);
    const { noteIds, conflictedIds, toRootIds: _toRootIds } = listNoteIds(noteFPaths);

    for (const noteId of [...noteIds, ...conflictedIds]) {
      for (const fpath of noteId.fpaths) {
        fpaths.push(fpath);
        if (fpath.includes(CD_ROOT + '/')) fpaths.push(getStaticFPath(fpath));
      }
      rootIds[noteId.id] = `${noteId.addedDT}${randomString(4)}`;
    }

    const lastSettingsFPaths = getLastSettingsFPaths(settingsFPaths);
    if (lastSettingsFPaths.fpaths.length > 0) {
      const lastSettingsFPath = lastSettingsFPaths.fpaths[0];
      const { contents } = await dataApi.getFiles([lastSettingsFPath], true);
      if (!isEqual(initialSettingsState, contents[0])) {
        fpaths.push(lastSettingsFPath);
      }
    }

    const pins = {};
    for (const fpath of pinFPaths) {
      const { id, updatedDT } = extractPinFPath(fpath);

      const _id = id.startsWith('deleted') ? id.slice(7) : id;
      const pinMainId = getMainId(_id, _toRootIds);

      // duplicate id, choose the latest updatedDT
      if (pinMainId in pins && pins[pinMainId].updatedDT > updatedDT) continue;
      pins[pinMainId] = { updatedDT, id, fpath };
    }
    for (const pinMainId in pins) {
      if (pins[pinMainId].id.startsWith('deleted')) continue;
      fpaths.push(pins[pinMainId].fpath);
    }

    fpaths = [...new Set(fpaths)];
    toRootIds = _toRootIds;
  } catch (error) {
    dispatch(updateExportAllDataProgress({
      total: -1,
      done: -1,
      error: `${error}`,
    }));
    return;
  }

  const progress = { total: fpaths.length, done: 0 };
  dispatch(updateExportAllDataProgress(progress));

  if (progress.total === 0) return;

  try {
    const exportDPath = `${Dirs.CacheDir}/justnote-data`;
    const doEdpExist = await FileSystem.exists(exportDPath);
    if (doEdpExist) await FileSystem.unlink(exportDPath);

    // Only support sync mode for now!
    const fileFPaths = [], dbFPaths = [];
    for (const fpath of fpaths) {
      if (fpath.endsWith(DOT_JSON) || fpath.includes(CD_ROOT + '/')) {
        dbFPaths.push(fpath);
      } else {
        fileFPaths.push(fpath);
      }
    }
    fpaths = dbFPaths;

    const errorResponses = [], pinFPaths = [], pinContents = [], idMap = {};
    for (let i = 0; i < fpaths.length; i += N_NOTES) {
      const successResponses = [];
      const selectedFPaths = fpaths.slice(i, i + N_NOTES);
      const responses = await batchGetFileWithRetry(
        dataApi.getApi().getFile, selectedFPaths, 0, true
      );
      for (const response of responses) {
        if (response.success) successResponses.push(response);
        else errorResponses.push(response);
      }

      const filteredResponses = [];
      for (let { fpath, content } of successResponses) {
        if (fpath.startsWith(PINS)) {
          pinFPaths.push(fpath);
          pinContents.push(content);
          continue;
        }

        if (fpath.startsWith(NOTES)) {
          const { listName, fname, subName } = extractNoteFPath(fpath);
          const { id, parentIds } = extractDataFName(fname);
          if (parentIds && rootIds[id]) {
            const newFName = createDataFName(id, [rootIds[id]]);
            fpath = createNoteFPath(listName, newFName, subName);
          }
          idMap[toRootIds[id]] = id;
        }

        filteredResponses.push({ fpath, content });
      }

      for (let { fpath, content } of filteredResponses) {
        if (fpath.endsWith(DOT_JSON)) content = JSON.stringify(content);

        const dpath = Util.dirname(`${exportDPath}/${fpath}`);
        const doExist = await FileSystem.exists(dpath);
        if (!doExist) await FileSystem.mkdir(dpath);

        await FileSystem.writeFile(`${exportDPath}/${fpath}`, content, UTF8);
      }

      progress.done += filteredResponses.length;
      if (progress.done < progress.total || errorResponses.length === 0) {
        dispatch(updateExportAllDataProgress(progress));
      }
    }

    // Need idMap to be all populated before mapping pinId to a new id.
    for (let i = 0; i < pinFPaths.length; i++) {
      let fpath = pinFPaths[i];
      let content = pinContents[i];

      const fpathParts = fpath.split('/');
      const id = fpathParts[fpathParts.length - 1].split('.')[0];

      if (idMap[toRootIds[id]]) {
        // If conflicts, only one will get pinned but it should be fine
        //   as conflicted notes are exported separately as not conflicted.
        fpathParts[fpathParts.length - 1] = idMap[toRootIds[id]] + '.json';
        fpath = fpathParts.join('/');
      }
      content = JSON.stringify(content);

      const dpath = Util.dirname(`${exportDPath}/${fpath}`);
      const doExist = await FileSystem.exists(dpath);
      if (!doExist) await FileSystem.mkdir(dpath);

      await FileSystem.writeFile(`${exportDPath}/${fpath}`, content, UTF8);

      progress.done += 1;
      if (progress.done < progress.total || errorResponses.length === 0) {
        dispatch(updateExportAllDataProgress(progress));
      }
    }

    for (const fpath of fileFPaths) {
      const dpath = Util.dirname(`${exportDPath}/${fpath}`);
      const doExist = await FileSystem.exists(dpath);
      if (!doExist) await FileSystem.mkdir(dpath);

      await FileSystem.cp(`${Dirs.DocumentDir}/${fpath}`, `${exportDPath}/${fpath}`);

      progress.done += 1;
      if (progress.done < progress.total || errorResponses.length === 0) {
        dispatch(updateExportAllDataProgress(progress));
      }
    }

    const fileName = 'justnote-data.zip';
    const filePath = `${Dirs.CacheDir}/${fileName}`;
    await zip(exportDPath, filePath);
    await saveAs(fileName, filePath);

    if (errorResponses.length > 0) {
      dispatch(updateExportAllDataProgress({
        total: -1,
        done: -1,
        error: 'Some download requests failed. Data might be missing in the exported file.',
      }));
    }
  } catch (error) {
    dispatch(updateExportAllDataProgress({
      total: -1,
      done: -1,
      error: `${error}`,
    }));
    return;
  }
};

export const updateExportAllDataProgress = (progress) => {
  return {
    type: UPDATE_EXPORT_ALL_DATA_PROGRESS,
    payload: progress,
  };
};

const deleteAllNotes = async (dispatch, noteIds, progress) => {
  for (let i = 0, j = noteIds.length; i < j; i += N_NOTES) {
    const selectedNoteIds = noteIds.slice(i, i + N_NOTES);

    const fpaths = [];
    for (const id of selectedNoteIds) fpaths.push(...id.fpaths);

    const contents = [];
    for (let k = 0; k < fpaths.length; k++) {
      if (fpaths[k].endsWith(INDEX + DOT_JSON)) contents.push({ title: '', body: '' });
      else contents.push('');
    }

    const selectedNotes = dataApi.toNotes(selectedNoteIds, fpaths, contents);

    let now = Date.now();
    const toNotes = {}, fromNotes = {};
    for (let k = 0; k < selectedNoteIds.length; k++) {
      const noteId = selectedNoteIds[k];
      const note = selectedNotes[k];

      if (!toNotes[noteId.listName]) toNotes[noteId.listName] = [];
      toNotes[noteId.listName].push({
        ...note,
        parentIds: [note.id],
        id: `deleted${now}${randomString(4)}`,
        title: '', body: '', media: [],
        updatedDT: now,
      });
      now += 1;

      if (!fromNotes[noteId.listName]) fromNotes[noteId.listName] = [];
      fromNotes[noteId.listName].push(clearNoteData(note));
    }

    for (const [_listName, _notes] of Object.entries(toNotes)) {
      await dataApi.putNotes({ listName: _listName, notes: _notes });
    }

    try {
      for (const [_listName, _notes] of Object.entries(fromNotes)) {
        await dataApi.putNotes({ listName: _listName, notes: _notes });
      }
    } catch (error) {
      console.log('deleteAllNotes error: ', error);
      // error in this step should be fine
    }

    progress.done += selectedNoteIds.length;
    dispatch(updateDeleteAllDataProgress(progress));
  }
};

const deleteAllPins = async (dispatch, pins, progress) => {
  let now = Date.now();
  for (let i = 0; i < pins.length; i += N_NOTES) {
    const _pins = pins.slice(i, i + N_NOTES);

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

    progress.done += toPins.length;
    dispatch(updateDeleteAllDataProgress(progress));
  }
};

export const deleteAllData = () => async (dispatch, getState) => {
  dispatch(updateDeleteAllDataProgress({ total: 'calculating...', done: 0 }));

  // Need to manually call it to wait for it properly!
  await sync(true, 2)(dispatch, getState);

  let allNoteIds, staticFPaths, settingsFPaths, settingsIds, infoFPath, pins;
  try {
    const fpaths = await dataApi.listFPaths(true);
    const noteIds = listNoteIds(fpaths.noteFPaths);

    allNoteIds = [...noteIds.noteIds, ...noteIds.conflictedIds];
    staticFPaths = fpaths.staticFPaths;
    settingsFPaths = fpaths.settingsFPaths;
    infoFPath = fpaths.infoFPath;
    pins = getPins(fpaths.pinFPaths, {}, false, noteIds.toRootIds);
    pins = Object.values(pins);
  } catch (error) {
    dispatch(updateDeleteAllDataProgress({
      total: -1,
      done: -1,
      error: `${error}`,
    }));
    return;
  }

  const lastSettingsFPaths = getLastSettingsFPaths(settingsFPaths);
  [settingsFPaths, settingsIds] = [lastSettingsFPaths.fpaths, lastSettingsFPaths.ids];
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
    allNoteIds.length + staticFPaths.length + settingsFPaths.length +
    (infoFPath ? 1 : 0) + pins.length
  );
  const progress = { total, done: 0 };
  dispatch(updateDeleteAllDataProgress(progress));

  if (progress.total === 0) return;

  try {
    await deleteAllNotes(dispatch, allNoteIds, progress);

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
    await fileApi.deleteFiles(staticFPaths);

    // Need to close the settings popup to update the url hash,
    //   as DELETE_ALL_DATA will set isSettingsPopupShown to false.
    if (getState().display.isSettingsPopupShown) {
      vars.updateSettingsPopup.didCall = true;
      updatePopupUrlHash(SETTINGS_POPUP, false);
    }
    dispatch({ type: DELETE_ALL_DATA });

    await sync(false, 1)(dispatch, getState);
  } catch (error) {
    dispatch(updateDeleteAllDataProgress({
      total: -1,
      done: -1,
      error: `${error}`,
    }));
    return;
  }
};

export const updateDeleteAllDataProgress = (progress) => {
  return {
    type: UPDATE_DELETE_ALL_DATA_PROGRESS,
    payload: progress,
  };
};
