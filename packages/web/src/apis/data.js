import serverApi from './server';
import lsgApi from './localSg';
import ldbApi from './localDb';
import fileApi from './localFile';
import {
  UNSAVED_NOTES_UNSAVED, UNSAVED_NOTES_SAVED, INDEX, DOT_JSON, CD_ROOT, N_NOTES, TRASH,
  N_DAYS, COLS_PANEL_STATE, LOCAL_SETTINGS_STATE, LOCK_SETTINGS_STATE,
} from '../types/const';
import {
  isObject, createNoteFPath, createDataFName, extractNoteFPath, createPinFPath,
  addFPath, getMainId, listNoteMetas, sortWithPins, getStaticFPath,
  getLastSettingsFPaths, excludeNotObjContents, batchGetFileWithRetry,
  batchPutFileWithRetry, batchDeleteFileWithRetry, getListNamesFromNoteMetas,
} from '../utils';
import { syncMode } from '../vars';
import {
  initialLocalSettingsState, initialLockSettingsState,
} from '../types/initialStates';

const getApi = () => {
  // Beware arguments are not exactly the same!
  return syncMode.doSyncMode ? ldbApi : serverApi;
};

const _listFPaths = async (listFiles) => {
  const fpaths = {
    noteFPaths: [], staticFPaths: [], settingsFPaths: [], infoFPath: null, pinFPaths: [],
  };
  await listFiles((fpath) => {
    addFPath(fpaths, fpath);
    return true;
  });
  return fpaths;
};

const listFPaths = async (doForce = false) => {
  // Beware if ldbApi, staticFPaths will always be empty!
  if (isObject(getApi().cachedFPaths.fpaths) && !doForce) {
    return getApi().cachedFPaths.fpaths;
  }
  getApi().cachedFPaths.fpaths = await _listFPaths(getApi().listFiles);
  return getApi().cachedFPaths.fpaths;
};

const listServerFPaths = async (doForce = false) => {
  if (isObject(serverApi.cachedFPaths.fpaths) && !doForce) {
    return serverApi.cachedFPaths.fpaths;
  }
  serverApi.cachedFPaths.fpaths = await _listFPaths(serverApi.listFiles);
  return serverApi.cachedFPaths.fpaths;
};

const toNotes = (noteMetas, fpaths, contents) => {
  const notes = [];
  for (const meta of noteMetas) {
    let title = '', body = '', media = [];
    for (const fpath of meta.fpaths) {
      const content = contents[fpaths.indexOf(fpath)];

      const { subName } = extractNoteFPath(fpath);
      if (subName === INDEX + DOT_JSON) {
        // content can be null if dangerouslyIgnoreError is true.
        if (isObject(content)) [title, body] = [content.title, content.body];
      } else {
        media.push({ name: subName, content: content });
      }
    }
    notes.push({
      parentIds: meta.parentIds,
      id: meta.id,
      title, body, media,
      addedDT: meta.addedDT,
      updatedDT: meta.updatedDT,
    });
  }

  return notes;
};

const toConflictedNotes = (noteMetas, conflictWiths, fpaths, contents) => {

  const notes = toNotes(noteMetas, fpaths, contents);

  const conflictedNotes = [];
  for (const conflictWith of conflictWiths) {
    const selectedNotes = notes.filter(note => conflictWith.includes(note.id));
    const sortedNotes = selectedNotes.sort((a, b) => a.updatedDT - b.updatedDT);
    const sortedListNames = sortedNotes.map(note => {
      return noteMetas.find(meta => meta.id === note.id).listName;
    });

    conflictedNotes.push({
      id: 'conflict-' + sortedNotes.map(note => note.id).join('-'),
      listNames: sortedListNames,
      notes: sortedNotes,
      addedDT: Math.min(...sortedNotes.map(note => note.addedDT)),
      updatedDT: Math.max(...sortedNotes.map(note => note.updatedDT)),
    });
  }

  return conflictedNotes;
};

const fetch = async (params) => {
  if (syncMode.doSyncMode) {
    const canUse = await ldbApi.canUseSync();
    if (!canUse) throw new Error('Sync mode cannnot be used.');
  }

  let { listName, sortOn, doDescendingOrder, doFetchStgsAndInfo, pendingPins } = params;
  const {
    noteFPaths, settingsFPaths: _settingsFPaths, infoFPath, pinFPaths,
  } = await listFPaths(doFetchStgsAndInfo);

  let settings, conflictedSettings = [], info;
  if (doFetchStgsAndInfo) {
    const {
      fpaths: settingsFPaths, ids: settingsIds,
    } = getLastSettingsFPaths(_settingsFPaths);

    if (settingsFPaths.length > 0) {
      const files = await getFiles(settingsFPaths, true);

      // content can be null if dangerouslyIgnoreError is true.
      const { fpaths, contents } = excludeNotObjContents(files.fpaths, files.contents);
      for (let i = 0; i < fpaths.length; i++) {
        const [fpath, content] = [fpaths[i], contents[i]];
        if (fpaths.length === 1) {
          settings = content;
          [sortOn, doDescendingOrder] = [settings.sortOn, settings.doDescendingOrder];
          continue;
        }
        conflictedSettings.push({
          ...content, id: settingsIds[settingsFPaths.indexOf(fpath)], fpath,
        });
      }
    }

    if (infoFPath) {
      const { contents } = await getFiles([infoFPath], true);
      if (isObject(contents[0])) info = contents[0];
    }

    // Transition from purchases in settings to info.
    if (isObject(settings) && !isObject(info)) {
      if ('purchases' in settings) {
        info = { purchases: settings.purchases, checkPurchasesDT: null };
        if ('checkPurchasesDT' in settings) {
          info.checkPurchasesDT = settings.checkPurchasesDT;
        }
      }
    }
  }

  const {
    noteMetas, conflictedMetas, conflictWiths, toRootIds,
  } = listNoteMetas(noteFPaths);

  const namedNoteMetas = noteMetas.filter(meta => meta.listName === listName);
  let sortedNoteMetas = namedNoteMetas.sort((a, b) => a[sortOn] - b[sortOn]);
  if (doDescendingOrder) sortedNoteMetas.reverse();

  sortedNoteMetas = sortWithPins(
    sortedNoteMetas, pinFPaths, pendingPins, toRootIds,
    (meta) => {
      return getMainId(meta.id, toRootIds);
    }
  );
  const selectedNoteMetas = sortedNoteMetas.slice(0, N_NOTES);

  const namedConflictWiths = conflictWiths.filter(conflictWith => {
    for (const id of conflictWith) {
      const conflictedId = conflictedMetas.find(meta => meta.id === id);
      if (conflictedId.listName === listName) return true;
    }
    return false;
  });
  const selectedConflictWiths = namedConflictWiths.slice(0, N_NOTES);
  const selectedConflictedNoteMetas = conflictedMetas.filter(meta => {
    return selectedConflictWiths.some(conflictWith => conflictWith.includes(meta.id));
  });

  const _fpaths = [];
  for (const meta of selectedNoteMetas) _fpaths.push(...meta.fpaths);
  for (const meta of selectedConflictedNoteMetas) _fpaths.push(...meta.fpaths);

  const responses = await batchGetFileWithRetry(getApi().getFile, _fpaths, 0, true);
  const fpaths = [], contents = []; // No order guarantee btw _fpaths and responses
  for (const { fpath, content } of responses) {
    fpaths.push(fpath);
    contents.push(content);
  }

  const notes = toNotes(selectedNoteMetas, fpaths, contents);
  const hasMore = namedNoteMetas.length > N_NOTES;
  const conflictedNotes = toConflictedNotes(
    selectedConflictedNoteMetas, selectedConflictWiths, fpaths, contents
  );

  // List names should be retrieve from settings
  //   but also retrive from file paths in case the settings is gone.
  const listNames = getListNamesFromNoteMetas(noteMetas, conflictedMetas);

  await fetchStaticFiles(notes, conflictedNotes);

  return {
    notes, hasMore, conflictedNotes, listNames, settings, conflictedSettings, info,
  };
};

const fetchMore = async (params) => {

  const { listName, ids, sortOn, doDescendingOrder, pendingPins } = params;

  const { noteFPaths, pinFPaths } = await listFPaths();
  const { noteMetas, toRootIds } = listNoteMetas(noteFPaths);

  const namedNoteMetas = noteMetas.filter(meta => meta.listName === listName);
  let sortedNoteMetas = namedNoteMetas.sort((a, b) => a[sortOn] - b[sortOn]);
  if (doDescendingOrder) sortedNoteMetas.reverse();

  sortedNoteMetas = sortWithPins(
    sortedNoteMetas, pinFPaths, pendingPins, toRootIds,
    (meta) => {
      return getMainId(meta.id, toRootIds);
    }
  );

  // With pins, can't fetch further from the current point
  let filteredNoteMetas = [], hasDisorder = false;
  for (let i = 0; i < sortedNoteMetas.length; i++) {
    const meta = sortedNoteMetas[i];
    if (!ids.includes(meta.id)) {
      if (i < ids.length) hasDisorder = true;
      filteredNoteMetas.push(meta);
    }
  }
  const selectedNoteMetas = filteredNoteMetas.slice(0, N_NOTES);

  const _fpaths = [];
  for (const meta of selectedNoteMetas) _fpaths.push(...meta.fpaths);

  const responses = await batchGetFileWithRetry(getApi().getFile, _fpaths, 0, true);
  const fpaths = [], contents = []; // No order guarantee btw _fpaths and responses
  for (let { fpath, content } of responses) {
    fpaths.push(fpath);
    contents.push(content);
  }

  const notes = toNotes(selectedNoteMetas, fpaths, contents);
  const hasMore = filteredNoteMetas.length > N_NOTES;

  await fetchStaticFiles(notes, null);

  return { notes, hasMore, hasDisorder };
};

const fetchStaticFiles = async (notes, conflictedNotes) => {
  if (syncMode.doSyncMode) return;

  const fpaths = [];
  for (const note of notes) {
    if (note.media) {
      for (const { name } of note.media) {
        if (name.startsWith(CD_ROOT + '/')) fpaths.push(getStaticFPath(name));
      }
    }
  }
  if (conflictedNotes) {
    for (const conflictedNote of conflictedNotes) {
      for (const note of conflictedNote.notes) {
        if (note.media) {
          for (const { name } of note.media) {
            if (name.startsWith(CD_ROOT + '/')) fpaths.push(getStaticFPath(name));
          }
        }
      }
    }
  }

  const files = await fileApi.getFiles(fpaths); // Check if already exists locally

  const remainedFPaths = [];
  for (let i = 0; i < files.fpaths.length; i++) {
    const fpath = files.fpaths[i], content = files.contents[i];
    if (content === undefined) remainedFPaths.push(fpath);
  }

  await getServerFilesToLocal(remainedFPaths);
};

const putNotes = async (params) => {
  const { listNames, notes, staticFPaths, manuallyManageError } = params;

  const mediaFPaths = [], mediaContents = [];
  if (!syncMode.doSyncMode && Array.isArray(staticFPaths)) {
    const files = await fileApi.getFiles(staticFPaths);
    for (let i = 0; i < files.fpaths.length; i++) {
      mediaFPaths.push(files.fpaths[i]);
      mediaContents.push(files.contents[i]);
    }
  }

  const fpaths = [], contents = [], noteMap = {};
  for (let i = 0; i < listNames.length; i++) {
    const [listName, note] = [listNames[i], notes[i]];

    const fname = createDataFName(note.id, note.parentIds);
    const fpath = createNoteFPath(listName, fname, INDEX + DOT_JSON);

    fpaths.push(fpath);
    contents.push({ title: note.title, body: note.body });
    if (note.media) {
      for (const { name, content } of note.media) {
        mediaFPaths.push(createNoteFPath(listName, fname, name));
        mediaContents.push(content);
      }
    }
    noteMap[fpath] = { listName, note };
  }

  const successListNames = [], successNotes = [];
  const errorListNames = [], errorNotes = [], errors = [];

  // Put static files and cdroot fpaths first, and index.json file last.
  // So if errors, can leave the added fpaths as is. They won't interfere.
  await putFiles(mediaFPaths, mediaContents);

  // Beware size should be max at N_NOTES, so can call batchPutFileWithRetry directly.
  // Use dangerouslyIgnoreError=true to manage which succeeded/failed manually.
  const responses = await batchPutFileWithRetry(
    getApi().putFile, fpaths, contents, 0, !!manuallyManageError
  );
  for (const response of responses) {
    const { listName, note } = noteMap[response.fpath];
    if (response.success) {
      successListNames.push(listName);
      successNotes.push(note);
    } else {
      errorListNames.push(listName);
      errorNotes.push(note);
      errors.push(response.error);
    }
  }

  return { successListNames, successNotes, errorListNames, errorNotes, errors };
};

const canDeleteListNames = async (listNames) => {

  const { noteFPaths } = await listFPaths();
  const { noteMetas, conflictedMetas } = listNoteMetas(noteFPaths);

  const inUseListNames = new Set();
  for (const meta of [...noteMetas, ...conflictedMetas]) {
    for (const fpath of meta.fpaths) {
      inUseListNames.add(extractNoteFPath(fpath).listName);
    }
  }

  const canDeletes = [];
  for (const listName of listNames) canDeletes.push(!inUseListNames.has(listName));

  return canDeletes;
};

const putPins = async (params) => {
  const { pins } = params;

  const fpaths = [], contents = [];
  for (const pin of pins) {
    fpaths.push(createPinFPath(pin.rank, pin.updatedDT, pin.addedDT, pin.id));
    contents.push({});
  }
  // Use dangerouslyIgnoreError=true to manage which succeeded/failed manually.
  // Bug alert: if several pins and error, rollback is incorrect
  //   as some are successful but some aren't.
  await putFiles(fpaths, contents);

  return { pins };
};

const deletePins = async (params) => {
  const { pins } = params;

  const pinFPaths = pins.map(pin => {
    return createPinFPath(pin.rank, pin.updatedDT, pin.addedDT, pin.id);
  });
  await deleteFiles(pinFPaths);

  return { pins };
};

const getFiles = async (_fpaths, dangerouslyIgnoreError = false) => {

  const fpaths = [], contents = []; // No order guarantee btw _fpaths and responses
  for (let i = 0, j = _fpaths.length; i < j; i += N_NOTES) {
    const selectedFPaths = _fpaths.slice(i, i + N_NOTES);
    const responses = await batchGetFileWithRetry(
      getApi().getFile, selectedFPaths, 0, dangerouslyIgnoreError
    );
    fpaths.push(...responses.map(({ fpath }) => fpath));
    contents.push(...responses.map(({ content }) => content));
  }

  return { fpaths, contents };
};

const putFiles = async (fpaths, contents, dangerouslyIgnoreError = false) => {

  const responses = []; // No order guarantee btw fpaths and responses
  for (let i = 0, j = fpaths.length; i < j; i += N_NOTES) {
    const _fpaths = fpaths.slice(i, i + N_NOTES);
    const _contents = contents.slice(i, i + N_NOTES);
    const _responses = await batchPutFileWithRetry(
      getApi().putFile, _fpaths, _contents, 0, dangerouslyIgnoreError
    );
    responses.push(..._responses);
  }

  return responses;
};

const deleteFiles = async (fpaths) => {
  for (let i = 0, j = fpaths.length; i < j; i += N_NOTES) {
    const _fpaths = fpaths.slice(i, i + N_NOTES);
    await batchDeleteFileWithRetry(getApi().deleteFile, _fpaths, 0);
  }
};

const getServerFilesToLocal = async (_fpaths) => {
  if (syncMode.doSyncMode) return;
  const { fpaths, contents } = await getFiles(_fpaths, true);
  await fileApi.putFiles(fpaths, contents);
};

const putLocalFilesToServer = async (fpaths) => {
  if (syncMode.doSyncMode) return;
  const files = await fileApi.getFiles(fpaths);
  await putFiles(files.fpaths, files.contents);
};

const deleteServerFiles = async (fpaths) => {
  if (syncMode.doSyncMode) return;
  await deleteFiles(fpaths);
};

const getLocalSettings = async () => {
  const localSettings = { ...initialLocalSettingsState };
  try {
    const item = await lsgApi.getItem(LOCAL_SETTINGS_STATE);
    if (item) {
      const _localSettings = JSON.parse(item);
      for (const k in localSettings) {
        if (k in _localSettings) localSettings[k] = _localSettings[k];
      }
    }
  } catch (error) {
    console.log('Get or parse localSettings error: ', error);
  }

  return localSettings;
};

const putLocalSettings = async (localSettings) => {
  await lsgApi.setItem(LOCAL_SETTINGS_STATE, JSON.stringify(localSettings));
};

const getUnsavedNotes = async () => {
  const _fpaths = await ldbApi.getUnsavedNoteFPaths();
  const { fpaths, contents } = await ldbApi.getFiles(_fpaths, true);

  const unsavedArr = [], savedMap = {};
  for (let i = 0; i < fpaths.length; i++) {
    const fpath = fpaths[i], content = contents[i];

    if (fpath.startsWith(UNSAVED_NOTES_UNSAVED)) {
      const id = fpath.slice((UNSAVED_NOTES_UNSAVED + '/').length, -1 * DOT_JSON.length);
      unsavedArr.push({ id, content });
      continue;
    }

    if (fpath.startsWith(UNSAVED_NOTES_SAVED)) {
      const id = fpath.slice((UNSAVED_NOTES_SAVED + '/').length, -1 * DOT_JSON.length);
      savedMap[id] = content;
      continue;
    }
  }

  const unsavedNotes = {};
  for (const { id, content } of unsavedArr) {
    const unsavedNote = { title: '', body: '', media: [] };
    const savedNote = { savedTitle: '', savedBody: '', savedMedia: [] };

    try {
      for (const k in unsavedNote) {
        if (k in content) unsavedNote[k] = content[k];
      }
      const _savedNote = savedMap[id];
      for (const k in savedNote) {
        if (k in _savedNote) savedNote[k] = _savedNote[k];
      }

      unsavedNotes[id] = { id, ...unsavedNote, ...savedNote };
    } catch (error) {
      console.log('Parse unsaved note error: ', error);
    }
  }

  return unsavedNotes;
};

const putUnsavedNote = async (
  id, title, body, media, savedTitle, savedBody, savedMedia,
) => {
  const fpath = `${UNSAVED_NOTES_UNSAVED}/${id}${DOT_JSON}`;
  const content = { title, body, media };
  await ldbApi.putFile(fpath, content);

  const savedFPath = `${UNSAVED_NOTES_SAVED}/${id}${DOT_JSON}`;

  // For better performance, if already exists, no need to save again.
  const doExist = await ldbApi.exists(savedFPath);
  if (doExist) return;

  const savedContent = { savedTitle, savedBody, savedMedia };
  await ldbApi.putFile(savedFPath, savedContent);
};

const deleteUnsavedNotes = async (ids) => {
  const fpaths = [];
  for (const id of ids) {
    fpaths.push(`${UNSAVED_NOTES_UNSAVED}/${id}${DOT_JSON}`);
    fpaths.push(`${UNSAVED_NOTES_SAVED}/${id}${DOT_JSON}`);
  }
  await ldbApi.deleteFiles(fpaths);
};

const deleteAllUnsavedNotes = async () => {
  const fpaths = await ldbApi.getUnsavedNoteFPaths();
  await ldbApi.deleteFiles(fpaths);
};

const deleteAllLocalFiles = async () => {
  await lsgApi.removeItem(COLS_PANEL_STATE);
  await lsgApi.removeItem(LOCAL_SETTINGS_STATE);
  await lsgApi.removeItem(LOCK_SETTINGS_STATE);
  await ldbApi.deleteAllFiles();
  await fileApi.deleteAllFiles();
};

const deleteAllSyncedFiles = async () => {
  const fpaths = [];
  await ldbApi.listFiles(fpath => fpaths.push(fpath));
  await ldbApi.deleteFiles(fpaths);
};

const getLockSettings = async () => {
  // BUG Alert: new object, not ref to the object in initialLockSettingsState!
  const lockSettings = { ...initialLockSettingsState };
  try {
    const item = await lsgApi.getItem(LOCK_SETTINGS_STATE);
    if (item) {
      const _lockSettings = JSON.parse(item);
      for (const k1 in _lockSettings) {
        if (!(k1 in lockSettings)) continue;

        const v1 = {}, _v1 = _lockSettings[k1];
        for (const k2 in _v1) {
          const v2 = {}, _v2 = _v1[k2];
          for (const k3 in _v2) {
            if (k3 === 'unlockedDT') continue;
            v2[k3] = _v2[k3];
          }
          v1[k2] = v2;
        }
        lockSettings[k1] = v1;
      }
    }
  } catch (error) {
    console.log('Get or parse lockSettings error: ', error);
  }

  return lockSettings;
};

const putLockSettings = async (lockSettings) => {
  await lsgApi.setItem(LOCK_SETTINGS_STATE, JSON.stringify(lockSettings));
};

const data = {
  getApi, listFPaths, listServerFPaths, toNotes, fetch, fetchMore,
  putNotes, canDeleteListNames, putPins, deletePins, getFiles,
  putFiles, deleteFiles, getServerFilesToLocal, putLocalFilesToServer, deleteServerFiles,
  getLocalSettings, putLocalSettings, getUnsavedNotes, putUnsavedNote,
  deleteUnsavedNotes, deleteAllUnsavedNotes, deleteAllLocalFiles, deleteAllSyncedFiles,
  getLockSettings, putLockSettings,
};

export default data;
