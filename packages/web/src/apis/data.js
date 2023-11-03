import serverApi from './server';
import lsgApi from './localSg';
import ldbApi from './localDb';
import fileApi from './localFile';
import {
  UNSAVED_NOTES_UNSAVED, UNSAVED_NOTES_SAVED, INDEX, DOT_JSON, CD_ROOT, N_NOTES,
  COLS_PANEL_STATE, LOCAL_SETTINGS_STATE, LOCK_SETTINGS_STATE,
} from '../types/const';
import {
  isObject, createNoteFPath, createDataFName, extractNoteFPath, createPinFPath,
  addFPath, listNoteMetas, getStaticFPath, getLastSettingsFPaths, excludeNotObjContents,
  batchGetFileWithRetry, batchPutFileWithRetry, batchDeleteFileWithRetry,
  getInUseTagNames,
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
    noteFPaths: [], staticFPaths: [], settingsFPaths: [], infoFPath: null,
    pinFPaths: [], tagFPaths: [],
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

const toConflictedNotes = (conflictedMetas, fpaths, contents) => {
  const conflictedNotes = [];
  for (const conflictedMeta of conflictedMetas) {
    const { notes } = toNotes(conflictedMeta.metas, fpaths, contents);

    conflictedNotes.push({
      id: conflictedMeta.id,
      listNames: conflictedMeta.listNames,
      notes,
      addedDT: conflictedMeta.addedDT,
      updatedDT: conflictedMeta.updatedDT,
      isConflicted: conflictedMeta.isConflicted,
    });
  }
  return conflictedNotes;
};

const toNotes = (metas, fpaths, contents) => {
  const ftcMap = {};
  for (let i = 0; i < fpaths.length; i++) {
    const [fpath, content] = [fpaths[i], contents[i]];
    ftcMap[fpath] = content;
  }

  const listNames = [], notes = [];
  for (const meta of metas) {
    let title = '', body = '', media = [];
    for (const fpath of meta.fpaths) {
      const content = ftcMap[fpath];

      const { subName } = extractNoteFPath(fpath);
      if (subName === INDEX + DOT_JSON) {
        // content can be null if dangerouslyIgnoreError is true.
        if (isObject(content)) [title, body] = [content.title, content.body];
      } else {
        media.push({ name: subName, content: content });
      }
    }

    listNames.push(meta.listName);
    notes.push({
      parentIds: meta.parentIds,
      id: meta.id,
      title, body, media,
      addedDT: meta.addedDT,
      updatedDT: meta.updatedDT,
    });
  }

  return { listNames, notes };
};

const fetchStgsAndInfo = async (_settingsFPaths, infoFPath) => {
  if (syncMode.doSyncMode) {
    const canUse = await ldbApi.canUseSync();
    if (!canUse) throw new Error('Sync mode cannnot be used.');
  }

  let settings, conflictedSettings = [], info;
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
  if (isObject(settings)) {
    if ('purchases' in settings) settings.purchases = null;
    if ('checkPurchasesDT' in settings) settings.checkPurchasesDT = null;
  }
  for (const cSettings of conflictedSettings) {
    if ('purchases' in cSettings) cSettings.purchases = null;
    if ('checkPurchasesDT' in cSettings) cSettings.checkPurchasesDT = null;
  }

  return { settings, conflictedSettings, info };
};

const fetchNotes = async (noteMetas) => {
  const _fpaths = [], metas = [], conflictedMetas = [];
  for (const meta of noteMetas) {
    if (meta.isConflicted) {
      for (const cMeta of meta.metas) _fpaths.push(...cMeta.fpaths);
      conflictedMetas.push(meta);
    } else {
      _fpaths.push(...meta.fpaths);
      metas.push(meta);
    }
  }

  const responses = await batchGetFileWithRetry(getApi().getFile, _fpaths, 0, true);

  const fpaths = [], contents = []; // No order guarantee btw _fpaths and responses
  for (const { fpath, content } of responses) {
    fpaths.push(fpath);
    contents.push(content);
  }

  const conflictedNotes = toConflictedNotes(conflictedMetas, fpaths, contents);
  const { listNames, notes } = toNotes(metas, fpaths, contents);

  await fetchStaticFiles(conflictedNotes, notes);

  const notesPerLn = {};
  for (let i = 0; i < listNames.length; i++) {
    const [listName, note] = [listNames[i], notes[i]];

    if (!isObject(notesPerLn[listName])) notesPerLn[listName] = {};
    notesPerLn[listName][note.id] = note;
  }

  return { conflictedNotes, notes: notesPerLn };
};

const fetchStaticFiles = async (conflictedNotes, notes) => {
  if (syncMode.doSyncMode) return;

  const fpaths = [];
  for (const conflictedNote of conflictedNotes) {
    for (const note of conflictedNote.notes) {
      if (note.media) {
        for (const { name } of note.media) {
          if (name.startsWith(CD_ROOT + '/')) {
            const staticFPath = getStaticFPath(name);
            if (!fpaths.includes(staticFPath)) fpaths.push(staticFPath);
          }
        }
      }
    }
  }
  for (const note of notes) {
    if (note.media) {
      for (const { name } of note.media) {
        if (name.startsWith(CD_ROOT + '/')) {
          const staticFPath = getStaticFPath(name);
          if (!fpaths.includes(staticFPath)) fpaths.push(staticFPath);
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
    noteMap[fpath] = { listName, id: note.id };
  }

  const successListNames = [], successNoteIds = [], successNotes = [];
  const errorListNames = [], errorNoteIds = [], errorNotes = [], errors = [];

  // Put static files and cdroot fpaths first, and index.json file last.
  // So if errors, can leave the added fpaths as is. They won't interfere.
  await putFiles(mediaFPaths, mediaContents);

  // Beware size should be max at N_NOTES, so can call batchPutFileWithRetry directly.
  // Use dangerouslyIgnoreError=true to manage which succeeded/failed manually.
  const responses = await batchPutFileWithRetry(
    getApi().putFile, fpaths, contents, 0, !!manuallyManageError
  );
  for (const response of responses) {
    const { listName, id } = noteMap[response.fpath];
    if (response.success) {
      if (!successNoteIds.includes(id)) {
        successListNames.push(listName);
        successNoteIds.push(id);
      }
    } else {
      if (!errorNoteIds.includes(id)) {
        errorListNames.push(listName);
        errorNoteIds.push(id);
        errors.push(response.error);
      }
    }
  }

  const itnMap = {};
  for (const note of notes) itnMap[note.id] = note;

  for (const id of successNoteIds) successNotes.push(itnMap[id]);
  for (const id of errorNoteIds) errorNotes.push(itnMap[id]);

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

const canDeleteTagNames = async (tagNames) => {
  const { noteFPaths, tagFPaths } = await listFPaths();

  const inUseTagNames = getInUseTagNames(noteFPaths, tagFPaths);

  const canDeletes = [];
  for (const tagName of tagNames) {
    canDeletes.push(!inUseTagNames.includes(tagName));
  }

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
  getApi, listFPaths, listServerFPaths, toNotes, fetchStgsAndInfo, fetchNotes,
  putNotes, canDeleteListNames, canDeleteTagNames, putPins, deletePins, getFiles,
  putFiles, deleteFiles, getServerFilesToLocal, putLocalFilesToServer, deleteServerFiles,
  getLocalSettings, putLocalSettings, getUnsavedNotes, putUnsavedNote,
  deleteUnsavedNotes, deleteAllUnsavedNotes, deleteAllLocalFiles, deleteAllSyncedFiles,
  getLockSettings, putLockSettings,
};

export default data;
