import {
  INCREASE_SAVE_NOTE_COUNT, INCREASE_DISCARD_NOTE_COUNT,
  INCREASE_UPDATE_NOTE_ID_URL_HASH_COUNT, INCREASE_UPDATE_NOTE_ID_COUNT,
  INCREASE_CHANGE_LIST_NAME_COUNT, INCREASE_FOCUS_TITLE_COUNT,
  INCREASE_SET_INIT_DATA_COUNT, INCREASE_BLUR_COUNT, INCREASE_UPDATE_EDITOR_WIDTH_COUNT,
  CLEAR_SAVING_FPATHS, ADD_SAVING_FPATHS, ADD_NOTE_COMMIT, UPDATE_NOTE_COMMIT,
  UPDATE_EDITOR_IS_UPLOADING, UPDATE_BULK_EDITING, UPDATE_EDITOR_SCROLL_ENABLED,
  UPDATE_NOTE_ID, UPDATE_EDITING_NOTE, UPDATE_EDITOR_UNMOUNT, UPDATE_DID_DISCARD_EDITING,
  DELETE_ALL_DATA, RESET_STATE,
} from '../types/actionTypes';

const initialState = {
  saveNoteCount: 0,
  discardNoteCount: 0,
  updateNoteIdUrlHashCount: 0,
  updateNoteIdCount: 0,
  changeListNameCount: 0,
  focusTitleCount: 0,
  setInitDataCount: 0,
  blurCount: 0,
  updateEditorWidthCount: 0,
  savingFPaths: [],
  isUploading: false,
  isScrollEnabled: true,
  editingNoteId: null,
  editingNoteTitle: '',
  editingNoteBody: '',
  editingNoteMedia: [],
  didEditorUnmount: false,
  didDiscardEditing: false,
};

const editorReducer = (state = initialState, action) => {

  if (action.type === INCREASE_SAVE_NOTE_COUNT) {
    return { ...state, saveNoteCount: state.saveNoteCount + 1 };
  }

  if (action.type === INCREASE_DISCARD_NOTE_COUNT) {
    return { ...state, discardNoteCount: state.discardNoteCount + 1 };
  }

  if (action.type === INCREASE_UPDATE_NOTE_ID_URL_HASH_COUNT) {
    return { ...state, updateNoteIdUrlHashCount: state.updateNoteIdUrlHashCount + 1 };
  }

  if (action.type === INCREASE_UPDATE_NOTE_ID_COUNT) {
    return { ...state, updateNoteIdCount: state.updateNoteIdCount + 1 };
  }

  if (action.type === INCREASE_CHANGE_LIST_NAME_COUNT) {
    return { ...state, changeListNameCount: state.changeListNameCount + 1 };
  }

  if (action.type === INCREASE_FOCUS_TITLE_COUNT) {
    return { ...state, focusTitleCount: state.focusTitleCount + 1 };
  }

  if (action.type === INCREASE_SET_INIT_DATA_COUNT) {
    return { ...state, setInitDataCount: state.setInitDataCount + 1 };
  }

  if (action.type === INCREASE_BLUR_COUNT) {
    return { ...state, blurCount: state.blurCount + 1 };
  }

  if (action.type === INCREASE_UPDATE_EDITOR_WIDTH_COUNT) {
    return { ...state, updateEditorWidthCount: state.updateEditorWidthCount + 1 };
  }

  if (action.type === CLEAR_SAVING_FPATHS) {
    return { ...state, savingFPaths: [] };
  }

  if (action.type === ADD_SAVING_FPATHS) {
    return { ...state, savingFPaths: [...state.savingFPaths, ...action.payload] };
  }

  if (action.type === ADD_NOTE_COMMIT || action.type === UPDATE_NOTE_COMMIT) {
    return { ...state, savingFPaths: [] };
  }

  if (action.type === UPDATE_EDITOR_IS_UPLOADING) {
    return { ...state, isUploading: action.payload };
  }

  if (action.type === UPDATE_BULK_EDITING) {
    return { ...state, isUploading: false };
  }

  if (action.type === UPDATE_EDITOR_SCROLL_ENABLED) {
    return { ...state, isScrollEnabled: action.payload };
  }

  if (action.type === UPDATE_NOTE_ID) {
    if (action.payload) return { ...state, isScrollEnabled: true };
    return state;
  }

  if (action.type === UPDATE_EDITING_NOTE) {
    const { id, title, body, media } = action.payload;
    return {
      ...state,
      editingNoteId: id,
      editingNoteTitle: title,
      editingNoteBody: body,
      editingNoteMedia: media,
      didDiscardEditing: false,
    };
  }

  if (action.type === UPDATE_EDITOR_UNMOUNT) {
    return { ...state, didEditorUnmount: action.payload };
  }

  if (action.type === UPDATE_DID_DISCARD_EDITING) {
    return { ...state, didDiscardEditing: action.payload };
  }

  if (action.type === DELETE_ALL_DATA || action.type === RESET_STATE) {
    return { ...initialState };
  }

  return state;
};

export default editorReducer;
