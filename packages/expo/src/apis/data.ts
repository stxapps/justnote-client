import serverApi from './server';
import ldbApi from './localDb';
import fileApi from './localFile';
import {
  NOTES, SSLTS, SETTINGS, INFO, PINS, TAGS, INDEX, DOT_JSON, CD_ROOT, N_NOTES, PUT_FILE,
  DELETE_FILE,
} from '../types/const';
import {
  isObject, createNoteFPath, createDataFName, extractNoteFPath, createSsltFPath,
  createPinFPath, addFPath, getStaticFPath, getLastSettingsFPaths,
  excludeNotObjContents, batchGetFileWithRetry, batchPerformFilesInfos,
  batchPerformFilesIfEnough, getPerformFilesValueSize, getPerformFilesDataPerId,
  getPerformFilesResultsPerId, throwIfPerformFilesError,
} from '../utils';
import { syncMode } from '../vars';

const getApi = () => {
  // Beware arguments are not exactly the same!
  return syncMode.doSyncMode ? ldbApi : serverApi;
};

const _listFPaths = async (listFiles) => {
  const fpaths = {
    noteFPaths: [], ssltFPaths: [], staticFPaths: [], settingsFPaths: [],
    infoFPath: null, pinFPaths: [], tagFPaths: [],
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
      if (Array.isArray(note.media)) {
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
    if (Array.isArray(note.media)) {
      for (const { name } of note.media) {
        if (name.startsWith(CD_ROOT + '/')) {
          const staticFPath = getStaticFPath(name);
          if (!fpaths.includes(staticFPath)) fpaths.push(staticFPath);
        }
      }
    }
  }

  const remainFPaths = []; // Check if already exists locally
  for (const fpath of fpaths) {
    const content = await fileApi.getFile(fpath);
    if (content === undefined) remainFPaths.push(fpath);
  }

  for (let i = 0; i < remainFPaths.length; i += N_NOTES) {
    const sldFPaths = remainFPaths.slice(i, i + N_NOTES);
    const files = await serverApi.getFiles(sldFPaths, true);
    for (const { fpath, content } of files.responses) {
      if (content === null) continue;
      await fileApi.putFile(fpath, content);
    }
  }
};

const _putNotes = async (listNames, notes, staticFPaths, manuallyManageError) => {
  // Put static files and cdroot fpaths first, and index.json file last.
  // So if errors, can leave the added fpaths as is. They won't interfere.
  let sValues = [], eValues = [], cValues = [];
  if (!syncMode.doSyncMode && Array.isArray(staticFPaths)) {
    for (const fpath of staticFPaths) {
      const content = await fileApi.getFile(fpath);
      sValues.push({ id: fpath, type: PUT_FILE, path: fpath, content });

      [sValues, eValues] = await batchPerformFilesIfEnough(
        performFiles, sValues, eValues, [], []
      );
    }
  }
  for (let i = 0; i < listNames.length; i++) {
    const [listName, note] = [listNames[i], notes[i]];
    const fname = createDataFName(note.id, note.parentIds);

    if (Array.isArray(note.media)) {
      for (const { name, content } of note.media) {
        const fpath = createNoteFPath(listName, fname, name);
        eValues.push({ id: fpath, type: PUT_FILE, path: fpath, content });
      }
      [sValues, eValues] = await batchPerformFilesIfEnough(
        performFiles, sValues, eValues, [], []
      );
    }

    const fpath = createNoteFPath(listName, fname, INDEX + DOT_JSON);
    const content = { title: note.title, body: note.body };
    cValues.push({ id: note.id, type: PUT_FILE, path: fpath, content });
  }

  const minSize = batchPerformFilesInfos.cSize;
  const preSize = (
    batchPerformFilesInfos.sSize * sValues.length +
    batchPerformFilesInfos.eSize * eValues.length
  );
  let preValues = [...sValues, ...eValues], mainValues = [], totalSize = preSize;
  const allResults = [];
  for (const value of cValues) {
    const size = getPerformFilesValueSize(value, minSize);

    if (totalSize + size > batchPerformFilesInfos.maxSize) {
      if (preValues.length > 0) {
        const data = { values: preValues, isSequential: false, nItemsForNs: N_NOTES };
        const results = await performFiles(data);
        throwIfPerformFilesError(data, results);
        allResults.push(...results);
        [preValues, totalSize] = [[], totalSize - preSize];
      }
      if (totalSize + size > batchPerformFilesInfos.maxSize) {
        const data = { values: mainValues, isSequential: false, nItemsForNs: N_NOTES };
        const results = await performFiles(data);
        if (manuallyManageError !== true) throwIfPerformFilesError(data, results);
        allResults.push(...results);
        if (results.some(result => !result.success)) return allResults;
        [mainValues, totalSize] = [[], 0];
      }
    }

    mainValues.push(value);
    totalSize += size;
  }

  let data;
  if (preValues.length > 0) {
    const preData = { values: preValues, isSequential: false, nItemsForNs: N_NOTES };
    const mainData = { values: mainValues, isSequential: false, nItemsForNs: N_NOTES };
    data = {
      values: [preData, mainData], isSequential: true, nItemsForNs: N_NOTES,
    };
  } else {
    data = { values: mainValues, isSequential: false, nItemsForNs: N_NOTES };
  }
  const results = await performFiles(data);
  if (manuallyManageError !== true) throwIfPerformFilesError(data, results);
  allResults.push(...results);

  return allResults;
};

const putNotes = async (params) => {
  const { listNames, notes, staticFPaths, manuallyManageError } = params;

  const successListNames = [], successNotes = [];
  const errorListNames = [], errorNotes = [], errors = [];

  const results = await _putNotes(listNames, notes, staticFPaths, manuallyManageError);
  const resultsPerId = getPerformFilesResultsPerId(results);

  for (let i = 0; i < listNames.length; i++) {
    const [listName, note] = [listNames[i], notes[i]];

    const result = resultsPerId[note.id];
    if (isObject(result) && result.success) {
      successListNames.push(listName);
      successNotes.push(note);
    } else {
      let error = new Error('Error on previous dependent item');
      if (isObject(result)) error = new Error(result.error);

      errorListNames.push(listName);
      errorNotes.push(note);
      errors.push(error);
    }
  }

  return { successListNames, successNotes, errorListNames, errorNotes, errors };
};

const moveNotes = async (params) => {
  const { listNames, notes } = params;

  let now = Date.now();

  const values = [];
  for (let i = 0; i < listNames.length; i++) {
    const [listName, note] = [listNames[i], notes[i]];
    const fpath = createSsltFPath(listName, now, now, note.id);
    values.push({ id: note.id, type: PUT_FILE, path: fpath, content: {} });
    now += 1;
  }

  const successListNames = [], successNotes = [];
  const errorListNames = [], errorNotes = [], errors = [];

  const data = { values, isSequential: false, nItemsForNs: N_NOTES };
  const results = await performFiles(data);
  const resultsPerId = getPerformFilesResultsPerId(results);

  for (let i = 0; i < listNames.length; i++) {
    const [listName, note] = [listNames[i], notes[i]];

    const result = resultsPerId[note.id];
    if (isObject(result) && result.success) {
      successListNames.push(listName);
      successNotes.push(note);
    } else {
      let error = new Error('Error on previous dependent item');
      if (isObject(result)) error = new Error(result.error);

      errorListNames.push(listName);
      errorNotes.push(note);
      errors.push(error);
    }
  }

  return { successListNames, successNotes, errorListNames, errorNotes, errors };
};

const putSettings = async (params) => {
  const { settingsFPaths, settingsContents } = params;

  const values = [];
  for (let i = 0; i < settingsFPaths.length; i++) {
    const [fpath, content] = [settingsFPaths[i], settingsContents[i]];
    values.push({ id: fpath, type: PUT_FILE, path: fpath, content: content });
  }

  const data = { values, isSequential: false, nItemsForNs: N_NOTES };
  const results = await performFiles(data);
  throwIfPerformFilesError(data, results);
};

const putInfos = async (params) => {
  const { infoFPaths, infos } = params;

  const values = [];
  for (let i = 0; i < infoFPaths.length; i++) {
    const [fpath, content] = [infoFPaths[i], infos[i]];
    values.push({ id: fpath, type: PUT_FILE, path: fpath, content: content });
  }

  const data = { values, isSequential: false, nItemsForNs: N_NOTES };
  const results = await performFiles(data);
  throwIfPerformFilesError(data, results);
};

const deleteInfos = async (params) => {
  const { infoFPaths } = params;

  const values = [];
  for (const fpath of infoFPaths) {
    values.push(
      { id: fpath, type: DELETE_FILE, path: fpath, doIgnoreDoesNotExistError: true }
    );
  }

  const data = { values, isSequential: false, nItemsForNs: N_NOTES };
  const results = await performFiles(data);
  throwIfPerformFilesError(data, results);
};

const _putPins = async (values, pinsPerFPath) => {
  const data = { values, isSequential: false, nItemsForNs: N_NOTES };
  const results = await performFiles(data);
  const resultsPerId = getPerformFilesResultsPerId(results);

  const successPins = [], errorPins = [], errors = [];
  for (const fpath in pinsPerFPath) {
    const [pin, result] = [pinsPerFPath[fpath], resultsPerId[fpath]];
    if (isObject(result) && result.success) {
      successPins.push(pin);
    } else {
      let error = new Error('Error on previous dependent item');
      if (isObject(result)) error = new Error(result.error);

      errorPins.push(pin);
      errors.push(error);
    }
  }

  return { successPins, errorPins, errors };
};

const putPins = async (params) => {
  const { pins } = params;

  const values = [], pinsPerFPath = {};
  for (const pin of pins) {
    const fpath = createPinFPath(pin.rank, pin.updatedDT, pin.addedDT, pin.id);
    values.push({ id: fpath, type: PUT_FILE, path: fpath, content: {} });
    pinsPerFPath[fpath] = pin;
  }

  const result = await _putPins(values, pinsPerFPath);
  return result;
};

const deletePins = async (params) => {
  const { pins } = params;

  const values = [], pinsPerFPath = {};
  for (const pin of pins) {
    const fpath = createPinFPath(
      pin.rank, pin.updatedDT, pin.addedDT, `deleted${pin.id}`
    );
    values.push({ id: fpath, type: PUT_FILE, path: fpath, content: {} });
    pinsPerFPath[fpath] = pin;
  }

  const result = await _putPins(values, pinsPerFPath);
  return result;
};

const getFiles = async (fpaths, dangerouslyIgnoreError = false) => {
  const result = { responses: [], fpaths: [], contents: [] };

  const remainFPaths = [];
  if (syncMode.doSyncMode) {
    // Bug alert: Do not support static files. Use fileApi directly.
    remainFPaths.push(...fpaths);
  } else {
    for (const fpath of fpaths) {
      let content;
      if ([NOTES, SSLTS, SETTINGS, INFO, PINS, TAGS].some(el => fpath.startsWith(el))) {
        content = await ldbApi.getFile(fpath, true);
      }
      if (content === undefined) {
        remainFPaths.push(fpath);
        continue;
      }

      result.responses.push({ content, fpath, success: true });
      result.fpaths.push(fpath);
      result.contents.push(content);
    }
  }

  for (let i = 0; i < remainFPaths.length; i += N_NOTES) {
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
        if (
          [NOTES, SSLTS, SETTINGS, INFO, PINS, TAGS].some(el => fpath.startsWith(el))
        ) {
          await ldbApi.putFile(fpath, content);
        }
      }
    }
  }

  return result;
};

const performFiles = async (data) => {
  let results;
  if (syncMode.doSyncMode) {
    // Bug alert: Do not support static files. Use fileApi directly.
    results = await ldbApi.performFiles(data);
  } else {
    results = await serverApi.performFiles(data);

    const dataPerId = getPerformFilesDataPerId(data);
    for (const result of results) {
      if (!result.success) continue;

      const { type, path: fpath, content } = dataPerId[result.id];
      if (
        [NOTES, SSLTS, SETTINGS, INFO, PINS, TAGS].some(el => fpath.startsWith(el))
      ) {
        if (type === PUT_FILE) {
          await ldbApi.putFile(fpath, content);
        } else if (type === DELETE_FILE) {
          await ldbApi.deleteFile(fpath);
        } else {
          console.log('In blockstack.performFiles, invalid data:', data);
        }
      }
    }
  }

  return results;
};

const data = {
  listFPaths, listServerFPaths, toNotes, fetchStgsAndInfo, fetchNotes, putNotes,
  moveNotes, putSettings, putInfos, deleteInfos, putPins, deletePins, getFiles,
  performFiles,
};

export default data;
