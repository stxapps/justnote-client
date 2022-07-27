import userSession from '../userSession';
import { INDEX, DOT_JSON, N_NOTES, MAX_TRY, TRASH, N_DAYS } from '../types/const';
import {
  createNoteFPath, createNoteFName, extractNoteFPath, createPinFPath,
  addFPath, deleteFPath, copyFPaths, getMainId, listNoteIds, sortWithPins,
} from '../utils';
import { cachedFPaths } from '../vars';

const _listFPaths = async () => {
  const fpaths = {
    noteFPaths: [], staticFPaths: [], settingsFPath: null, pinFPaths: [],
  };
  await userSession.listFiles((fpath) => {
    addFPath(fpaths, fpath);
    return true;
  });
  return fpaths;
};

const listFPaths = async (doForce = false) => {
  if (cachedFPaths.fpaths && !doForce) return copyFPaths(cachedFPaths.fpaths);
  cachedFPaths.fpaths = await _listFPaths();
  return copyFPaths(cachedFPaths.fpaths);
};

const batchGetFileWithRetry = async (
  fpaths, callCount, dangerouslyIgnoreError = false
) => {

  const responses = await Promise.all(
    fpaths.map(fpath =>
      userSession.getFile(fpath)
        .then(content => ({ content, fpath, success: true }))
        .catch(error => ({ content: null, fpath, success: false, error }))
    )
  );

  const failedResponses = responses.filter(({ success }) => !success);
  const failedFPaths = failedResponses.map(({ fpath }) => fpath);

  if (failedResponses.length) {
    if (callCount + 1 >= MAX_TRY) {
      if (dangerouslyIgnoreError) {
        console.log('batchGetFileWithRetry error: ', failedResponses[0].error);
        return responses;
      }
      throw failedResponses[0].error;
    }

    return [
      ...responses.filter(({ success }) => success),
      ...(await batchGetFileWithRetry(
        failedFPaths, callCount + 1, dangerouslyIgnoreError
      )),
    ];
  }

  return responses;
};

const toNotes = (noteIds, fpaths, contents) => {

  const notes = [];
  for (const noteId of noteIds) {
    let title = '', body = '', media = [];
    for (const fpath of noteId.fpaths) {
      const content = contents[fpaths.indexOf(fpath)];

      const { subName } = extractNoteFPath(fpath);
      if (subName === INDEX + DOT_JSON) {
        title = content.title;
        body = content.body;
      } else {
        media.push({ name: subName, content: content });
      }
    }
    notes.push({
      parentIds: noteId.parentIds,
      id: noteId.id,
      title, body, media,
      addedDT: noteId.addedDT,
      updatedDT: noteId.updatedDT,
    });
  }

  return notes;
};

const toConflictedNotes = (noteIds, conflictWiths, fpaths, contents) => {

  const notes = toNotes(noteIds, fpaths, contents);

  const conflictedNotes = [];
  for (const conflictWith of conflictWiths) {
    const selectedNotes = notes.filter(note => conflictWith.includes(note.id));
    const sortedNotes = selectedNotes.sort((a, b) => a.updatedDT - b.updatedDT);
    const sortedListNames = sortedNotes.map(note => {
      return noteIds.find(noteId => noteId.id === note.id).listName;
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

  let { listName, sortOn, doDescendingOrder, doFetchSettings, pendingPins } = params;
  const { noteFPaths, settingsFPath, pinFPaths } = await listFPaths(doFetchSettings);

  let settings;
  if (settingsFPath && doFetchSettings) {
    settings = await userSession.getFile(settingsFPath);

    sortOn = settings.sortOn;
    doDescendingOrder = settings.doDescendingOrder;
  }

  const { noteIds, conflictedIds, conflictWiths, toRootIds } = listNoteIds(noteFPaths);

  const namedNoteIds = noteIds.filter(id => id.listName === listName);
  let sortedNoteIds = namedNoteIds.sort((a, b) => a[sortOn] - b[sortOn]);
  if (doDescendingOrder) sortedNoteIds.reverse();

  sortedNoteIds = sortWithPins(
    sortedNoteIds, pinFPaths, pendingPins, toRootIds,
    (noteId) => {
      return getMainId(noteId.id, toRootIds);
    }
  );
  const selectedNoteIds = sortedNoteIds.slice(0, N_NOTES);

  const namedConflictWiths = conflictWiths.filter(conflictWith => {
    for (const id of conflictWith) {
      const conflictedId = conflictedIds.find(noteId => noteId.id === id);
      if (conflictedId.listName === listName) return true;
    }
    return false;
  });
  const selectedConflictWiths = namedConflictWiths.slice(0, N_NOTES);
  const selectedConflictedIds = conflictedIds.filter(noteId => {
    return selectedConflictWiths.some(conflictWith => conflictWith.includes(noteId.id));
  });

  const _fpaths = [];
  for (const id of selectedNoteIds) _fpaths.push(...id.fpaths);
  for (const id of selectedConflictedIds) _fpaths.push(...id.fpaths);

  const responses = await batchGetFileWithRetry(_fpaths, 0, true);
  const fpaths = [], contents = []; // No order guarantee btw _fpaths and responses
  for (let { fpath, content } of responses) {
    fpaths.push(fpath);
    contents.push(content);
  }

  const notes = toNotes(selectedNoteIds, fpaths, contents);
  const hasMore = namedNoteIds.length > N_NOTES;
  const conflictedNotes = toConflictedNotes(
    selectedConflictedIds, selectedConflictWiths, fpaths, contents
  );

  // List names should be retrieve from settings
  //   but also retrive from file paths in case the settings is gone.
  let listNames = [];
  listNames.push(...noteIds.map(id => id.listName));
  listNames.push(...conflictedIds.map(id => id.listName));
  listNames = [...new Set(listNames)];

  return {
    notes, hasMore, conflictedNotes, listNames, settingsFPath, settings,
  };
};

const fetchMore = async (params) => {

  const { listName, ids, sortOn, doDescendingOrder, pendingPins } = params;

  const { noteFPaths, pinFPaths } = await listFPaths();
  const { noteIds, toRootIds } = listNoteIds(noteFPaths);

  const namedNoteIds = noteIds.filter(id => id.listName === listName);
  let sortedNoteIds = namedNoteIds.sort((a, b) => a[sortOn] - b[sortOn]);
  if (doDescendingOrder) sortedNoteIds.reverse();

  sortedNoteIds = sortWithPins(
    sortedNoteIds, pinFPaths, pendingPins, toRootIds,
    (noteId) => {
      return getMainId(noteId.id, toRootIds);
    }
  );

  // With pins, can't fetch further from the current point
  let filteredNoteIds = [], hasDisorder = false;
  for (let i = 0; i < sortedNoteIds.length; i++) {
    const noteId = sortedNoteIds[i];
    if (!ids.includes(noteId.id)) {
      if (i < ids.length) hasDisorder = true;
      filteredNoteIds.push(noteId);
    }
  }
  const selectedNoteIds = filteredNoteIds.slice(0, N_NOTES);

  const _fpaths = [];
  for (const id of selectedNoteIds) _fpaths.push(...id.fpaths);

  const responses = await batchGetFileWithRetry(_fpaths, 0, true);
  const fpaths = [], contents = []; // No order guarantee btw _fpaths and responses
  for (let { fpath, content } of responses) {
    fpaths.push(fpath);
    contents.push(content);
  }

  const notes = toNotes(selectedNoteIds, fpaths, contents);
  const hasMore = filteredNoteIds.length > N_NOTES;

  return { notes, hasMore, hasDisorder };
};

const batchPutFileWithRetry = async (fpaths, contents, callCount) => {

  const responses = await Promise.all(
    fpaths.map((fpath, i) =>
      userSession.putFile(fpath, contents[i])
        .then(publicUrl => {
          addFPath(cachedFPaths.fpaths, fpath);
          cachedFPaths.fpaths = copyFPaths(cachedFPaths.fpaths);
          return { publicUrl, fpath, success: true };
        })
        .catch(error => ({ error, fpath, content: contents[i], success: false }))
    )
  );

  const failedResponses = responses.filter(({ success }) => !success);
  const failedFPaths = failedResponses.map(({ fpath }) => fpath);
  const failedContents = failedResponses.map(({ content }) => content);

  if (failedResponses.length) {
    if (callCount + 1 >= MAX_TRY) throw failedResponses[0].error;

    return [
      ...responses.filter(({ success }) => success),
      ...(await batchPutFileWithRetry(failedFPaths, failedContents, callCount + 1)),
    ];
  }

  return responses;
};

const putNotes = async (params) => {
  const { listName, notes } = params;

  const fpaths = [], contents = [];
  for (const note of notes) {
    const fname = createNoteFName(note.id, note.parentIds);
    fpaths.push(createNoteFPath(listName, fname, INDEX + DOT_JSON));
    contents.push({ title: note.title, body: note.body });
    if (note.media) {
      for (const { name, content } of note.media) {
        fpaths.push(createNoteFPath(listName, fname, name));
        contents.push(content);
      }
    }
  }

  await batchPutFileWithRetry(fpaths, contents, 0);
};

export const batchDeleteFileWithRetry = async (fpaths, callCount) => {

  const responses = await Promise.all(
    fpaths.map((fpath) =>
      userSession.deleteFile(fpath)
        .then(() => {
          deleteFPath(cachedFPaths.fpaths, fpath);
          cachedFPaths.fpaths = copyFPaths(cachedFPaths.fpaths);
          return { fpath, success: true };
        })
        .catch(error => {
          // BUG ALERT
          // Treat not found error as not an error as local data might be out-dated.
          //   i.e. user tries to delete a not-existing file, it's ok.
          // Anyway, if the file should be there, this will hide the real error!
          if (error.message &&
            (error.message.includes('does_not_exist') ||
              error.message.includes('file_not_found'))) {
            return { fpath, success: true };
          }
          return { error, fpath, success: false };
        })
    )
  );

  const failedResponses = responses.filter(({ success }) => !success);
  const failedFPaths = failedResponses.map(({ fpath }) => fpath);

  if (failedResponses.length) {
    if (callCount + 1 >= MAX_TRY) throw failedResponses[0].error;

    return [
      ...responses.filter(({ success }) => success),
      ...(await batchDeleteFileWithRetry(failedFPaths, callCount + 1)),
    ];
  }

  return responses;
};

const getOldNotesInTrash = async () => {

  const { noteFPaths } = await listFPaths();
  const { noteIds } = listNoteIds(noteFPaths);

  const trashNoteIds = noteIds.filter(id => id.listName === TRASH);
  const oldNoteIds = trashNoteIds.filter(noteId => {
    const interval = Date.now() - noteId.updatedDT;
    const days = interval / 1000 / 60 / 60 / 24;

    return days > N_DAYS;
  });
  const selectedNoteIds = oldNoteIds.slice(0, N_NOTES);

  const fpaths = [];
  for (const id of selectedNoteIds) fpaths.push(...id.fpaths);

  // Dummy contents are enough and good for performance
  const contents = [];
  for (let i = 0; i < fpaths.length; i++) {
    if (fpaths[i].endsWith(INDEX + DOT_JSON)) contents.push({ title: '', body: '' });
    else contents.push('');
  }

  return toNotes(selectedNoteIds, fpaths, contents);
};

const canDeleteListNames = async (listNames) => {

  const { noteFPaths } = await listFPaths();
  const { noteIds, conflictedIds } = listNoteIds(noteFPaths);

  const inUseListNames = new Set();
  for (const noteId of [...noteIds, ...conflictedIds]) {
    for (const fpath of noteId.fpaths) {
      inUseListNames.add(extractNoteFPath(fpath).listName);
    }
  }

  const canDeletes = [];
  for (const listName of listNames) canDeletes.push(!inUseListNames.has(listName));

  return canDeletes;
};

const getFiles = async (_fpaths, dangerouslyIgnoreError = false) => {

  const fpaths = [], contents = []; // No order guarantee btw _fpaths and responses
  for (let i = 0, j = _fpaths.length; i < j; i += N_NOTES) {
    const selectedFPaths = _fpaths.slice(i, i + N_NOTES);
    const responses = await batchGetFileWithRetry(
      selectedFPaths, 0, dangerouslyIgnoreError
    );
    fpaths.push(...responses.map(({ fpath }) => fpath));
    contents.push(...responses.map(({ content }) => content));
  }

  return { fpaths, contents };
};

const putFiles = async (fpaths, contents) => {
  for (let i = 0, j = fpaths.length; i < j; i += N_NOTES) {
    const _fpaths = fpaths.slice(i, i + N_NOTES);
    const _contents = contents.slice(i, i + N_NOTES);
    await batchPutFileWithRetry(_fpaths, _contents, 0);
  }
};

const deleteFiles = async (fpaths) => {
  for (let i = 0, j = fpaths.length; i < j; i += N_NOTES) {
    const _fpaths = fpaths.slice(i, i + N_NOTES);
    await batchDeleteFileWithRetry(_fpaths, 0);
  }
};

const putPins = async (params) => {
  const { pins } = params;

  const fpaths = [], contents = [];
  for (const pin of pins) {
    fpaths.push(createPinFPath(pin.rank, pin.updatedDT, pin.addedDT, pin.id));
    contents.push({});
  }

  await batchPutFileWithRetry(fpaths, contents, 0);
  return { pins };
};

const deletePins = async (params) => {

  const { pins } = params;
  const pinFPaths = pins.map(pin => {
    return createPinFPath(pin.rank, pin.updatedDT, pin.addedDT, pin.id);
  });
  await batchDeleteFileWithRetry(pinFPaths, 0);

  return { pins };
};

const data = {
  listFPaths, batchGetFileWithRetry, toNotes, fetch, fetchMore,
  batchPutFileWithRetry, putNotes, getOldNotesInTrash, canDeleteListNames, getFiles,
  putFiles, deleteFiles, putPins, deletePins,
};

export default data;
