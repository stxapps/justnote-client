import serverApi from './server';
import lsgApi from './localSg';
import ldbApi from './localDb';
import fileApi from './localFile';
import {
  NOTES, SETTINGS, INFO, PINS, TAGS, UNSAVED_NOTES_UNSAVED, UNSAVED_NOTES_SAVED, INDEX,
  DOT_JSON, CD_ROOT, N_NOTES, COLS_PANEL_STATE, LOCAL_SETTINGS_STATE,
  LOCK_SETTINGS_STATE,
} from '../types/const';
import {
  isObject, createNoteFPath, createDataFName, extractNoteFPath, createPinFPath,
  addFPath, getStaticFPath, getLastSettingsFPaths, excludeNotObjContents,
  batchGetFileWithRetry, batchPutFileWithRetry, batchDeleteFileWithRetry,
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

  const remainFPaths = [], fpaths = [], contents = [];
  for (const fpath of _fpaths) {
    if (fpath.includes(CD_ROOT + '/')) {
      fpaths.push(fpath);
      contents.push('');
      continue;
    }
    remainFPaths.push(fpath);
  }

  // No order guarantee btw remainFPaths and responses
  const { responses } = await getFiles(remainFPaths, true);
  for (const { fpath, content } of responses) {
    fpaths.push(fpath);
    contents.push(content);
  }

  const conflictedNotes = toConflictedNotes(conflictedMetas, fpaths, contents);
  const { listNames, notes } = toNotes(metas, fpaths, contents);

  await fetchServerStaticFiles(conflictedNotes, notes);

  const cfNtsPerId = {};
  for (const note of conflictedNotes) {
    cfNtsPerId[note.id] = note;
  }

  const ntsPerLn = {};
  for (let i = 0; i < listNames.length; i++) {
    const [listName, note] = [listNames[i], notes[i]];

    if (!isObject(ntsPerLn[listName])) ntsPerLn[listName] = {};
    ntsPerLn[listName][note.id] = note;
  }

  return { conflictedNotes: cfNtsPerId, notes: ntsPerLn };
};

const fetchServerStaticFiles = async (conflictedNotes, notes) => {
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

  const remainFPaths = [];
  for (let i = 0; i < files.fpaths.length; i++) {
    const [fpath, content] = [files.fpaths[i], files.contents[i]];
    if (content === undefined) remainFPaths.push(fpath);
  }

  const sFiles = await serverApi.getFiles(remainFPaths, true);
  for (let i = 0; i < sFiles.fpaths.length; i++) {
    if (sFiles.contents[i] === null) continue;
    await fileApi.putFile(sFiles.fpaths[i], sFiles.contents[i]);
  }
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

  const _successListNames = [], _successNoteIds = [];
  const successListNames = [], successNoteIds = [], successNotes = [];
  const errorListNames = [], errorNoteIds = [], errorNotes = [], errors = [];

  // Put static files and cdroot fpaths first, and index.json file last.
  // So if errors, can leave the added fpaths as is. They won't interfere.
  await putFiles(mediaFPaths, mediaContents);

  // Use dangerouslyIgnoreError=true to manage which succeeded/failed manually.
  const { responses } = await putFiles(fpaths, contents, !!manuallyManageError);
  for (const response of responses) {
    const { listName, id } = noteMap[response.fpath];
    if (response.success) {
      if (!_successNoteIds.includes(id)) {
        _successListNames.push(listName);
        _successNoteIds.push(id);
      }
    } else {
      if (!errorNoteIds.includes(id)) {
        errorListNames.push(listName);
        errorNoteIds.push(id);
        errors.push(response.error);
      }
    }
  }
  for (let i = 0; i < _successListNames.length; i++) {
    const [listName, id] = [_successListNames[i], _successNoteIds[i]];
    if (errorNoteIds.includes(id)) continue;
    successListNames.push(listName);
    successNoteIds.push(id);
  }

  const itnMap = {};
  for (const note of notes) itnMap[note.id] = note;

  for (const id of successNoteIds) successNotes.push(itnMap[id]);
  for (const id of errorNoteIds) errorNotes.push(itnMap[id]);

  return { successListNames, successNotes, errorListNames, errorNotes, errors };
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

const getFiles = async (fpaths, dangerouslyIgnoreError = false) => {
  // Bug alert: Do not support getting static files. Use serverApi or fileApi directly.
  const result = { responses: [], fpaths: [], contents: [] };

  const remainFPaths = [];
  if (syncMode.doSyncMode) {
    remainFPaths.push(...fpaths);
  } else {
    const files = await ldbApi.getFiles(fpaths, true);
    for (let i = 0; i < files.fpaths.length; i++) {
      const [fpath, content] = [files.fpaths[i], files.contents[i]];
      if (content === undefined) {
        remainFPaths.push(fpath);
        continue;
      }

      result.responses.push({ content, fpath, success: true });
      result.fpaths.push(fpath);
      result.contents.push(content);
    }
  }

  for (let i = 0, j = remainFPaths.length; i < j; i += N_NOTES) {
    const selectedFPaths = remainFPaths.slice(i, i + N_NOTES);
    const responses = await batchGetFileWithRetry(
      getApi().getFile, selectedFPaths, 0, dangerouslyIgnoreError
    );
    for (const response of responses) {
      result.responses.push(response);
      result.fpaths.push(response.fpath);
      result.contents.push(response.content);

      if (!syncMode.doSyncMode && response.success) {
        const { fpath, content } = response;
        if ([NOTES, SETTINGS, INFO, PINS, TAGS].some(el => fpath.startsWith(el))) {
          await ldbApi.putFile(fpath, content);
        }
      }
    }
  }

  return result;
};

const putFiles = async (fpaths, contents, dangerouslyIgnoreError = false) => {
  // Bug alert: Do not support putting static files. Use serverApi or fileApi directly.
  const result = { responses: [] };

  for (let i = 0, j = fpaths.length; i < j; i += N_NOTES) {
    const selectedFPaths = fpaths.slice(i, i + N_NOTES);
    const selectedContents = contents.slice(i, i + N_NOTES);
    const responses = await batchPutFileWithRetry(
      getApi().putFile, selectedFPaths, selectedContents, 0, dangerouslyIgnoreError
    );
    for (const response of responses) {
      result.responses.push(response);

      if (!syncMode.doSyncMode && response.success) {
        const { fpath, content } = response;
        if ([NOTES, SETTINGS, INFO, PINS, TAGS].some(el => fpath.startsWith(el))) {
          await ldbApi.putFile(fpath, content);
        }
      }
    }
  }

  return result;
};

const deleteFiles = async (fpaths) => {
  // Bug alert: Do not support deleting static files. Use serverApi or fileApi directly.
  for (let i = 0, j = fpaths.length; i < j; i += N_NOTES) {
    const selectedFPaths = fpaths.slice(i, i + N_NOTES);
    await batchDeleteFileWithRetry(getApi().deleteFile, selectedFPaths, 0);

    if (!syncMode.doSyncMode) {
      const ldbFPaths = selectedFPaths.filter(fpath => {
        return [NOTES, SETTINGS, INFO, PINS, TAGS].some(el => fpath.startsWith(el));
      });
      await ldbApi.deleteFiles(ldbFPaths);
    }
  }
};

const deleteServerFiles = async (fpaths) => {
  if (syncMode.doSyncMode) return;
  await serverApi.deleteFiles(fpaths);
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
  listFPaths, listServerFPaths, toNotes, fetchStgsAndInfo, fetchNotes, putNotes,
  putPins, deletePins, getFiles, putFiles, deleteFiles, deleteServerFiles,
  getLocalSettings, putLocalSettings, getUnsavedNotes, putUnsavedNote,
  deleteUnsavedNotes, deleteAllUnsavedNotes, deleteAllLocalFiles, getLockSettings,
  putLockSettings,
};

export default data;
