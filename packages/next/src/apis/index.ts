import lsgApi from './localSg';
import ldbApi from './localDb';
import fileApi from './localFile';
import {
  UNSAVED_NOTES_UNSAVED, UNSAVED_NOTES_SAVED, DOT_JSON, COLS_PANEL_STATE,
  LOCAL_SETTINGS_STATE, LOCK_SETTINGS_STATE,
} from '../types/const';
import {
  initialLocalSettingsState, initialLockSettingsState,
} from '../types/initialStates';

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
  const fpaths = await ldbApi.getUnsavedNoteFPaths();

  const unsavedArr = [], savedMap = {};
  for (const fpath of fpaths) {
    const content = await ldbApi.getFile(fpath, true);

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

const index = {
  getLocalSettings, putLocalSettings, getUnsavedNotes, putUnsavedNote,
  deleteUnsavedNotes, deleteAllUnsavedNotes, deleteAllLocalFiles, getLockSettings,
  putLockSettings,
};

export default index;
