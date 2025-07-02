import { addNextAction } from '../store-next';
import { putDbUnsavedNote } from '../actions';
import {
  INCREASE_WEBVIEW_KEY_COUNT, INCREASE_SAVE_NOTE_COUNT, INCREASE_DISCARD_NOTE_COUNT,
  INCREASE_UPDATE_NOTE_ID_URL_HASH_COUNT, INCREASE_UPDATE_NOTE_ID_COUNT,
  INCREASE_CHANGE_LIST_NAME_COUNT, INCREASE_UPDATE_QUERY_STRING_COUNT,
  INCREASE_FOCUS_TITLE_COUNT, INCREASE_SET_INIT_DATA_COUNT, INCREASE_BLUR_COUNT,
  INCREASE_UPDATE_EDITOR_WIDTH_COUNT, INCREASE_UPDATE_BULK_EDIT_URL_HASH_COUNT,
  INCREASE_UPDATE_BULK_EDIT_COUNT, INCREASE_SHOW_NOTE_LIST_MENU_POPUP_COUNT,
  INCREASE_SHOW_NLIM_POPUP_COUNT, INCREASE_SHOW_UNE_POPUP_COUNT, DISCARD_NOTE,
  MOVE_NOTES_COMMIT, UPDATE_EDITOR_IS_UPLOADING, UPDATE_BULK_EDITING,
  UPDATE_EDITOR_SCROLL_ENABLED, UPDATE_NOTE_ID, UPDATE_EDITING_NOTE,
  UPDATE_UNSAVED_NOTE, DELETE_UNSAVED_NOTES, DELETE_ALL_DATA, RESET_STATE,
} from '../types/actionTypes';
import vars from '../vars';

const initialEditingNoteState = {
  editingNoteId: null,
  editingNoteTitle: '',
  editingNoteBody: '',
  editingNoteMedia: [],
};
const initialState = {
  webViewKeyCount: 0,
  checkToFocusCount: 0,
  saveNoteCount: 0,
  discardNoteCount: 0,
  updateNoteIdUrlHashCount: 0,
  updateNoteIdCount: 0,
  changeListNameCount: 0,
  updateQueryStringCount: 0,
  focusTitleCount: 0,
  setInitDataCount: 0,
  blurCount: 0,
  updateEditorWidthCount: 0,
  updateBulkEditUrlHashCount: 0,
  updateBulkEditCount: 0,
  showNoteListMenuPopupCount: 0,
  showNLIMPopupCount: 0,
  showUNEPopupCount: 0,
  isUploading: false,
  isScrollEnabled: true,
  ...initialEditingNoteState,
};

const editorReducer = (state = initialState, action) => {

  if (action.type === INCREASE_WEBVIEW_KEY_COUNT) {
    return { ...state, webViewKeyCount: state.webViewKeyCount + 1 };
  }

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

  if (action.type === INCREASE_UPDATE_QUERY_STRING_COUNT) {
    return { ...state, updateQueryStringCount: state.updateQueryStringCount + 1 };
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

  if (action.type === INCREASE_UPDATE_BULK_EDIT_URL_HASH_COUNT) {
    return {
      ...state, updateBulkEditUrlHashCount: state.updateBulkEditUrlHashCount + 1,
    };
  }

  if (action.type === INCREASE_UPDATE_BULK_EDIT_COUNT) {
    return {
      ...state, updateBulkEditCount: state.updateBulkEditCount + 1,
    };
  }

  if (action.type === INCREASE_SHOW_NOTE_LIST_MENU_POPUP_COUNT) {
    return {
      ...state, showNoteListMenuPopupCount: state.showNoteListMenuPopupCount + 1,
    };
  }

  if (action.type === INCREASE_SHOW_NLIM_POPUP_COUNT) {
    return {
      ...state, showNLIMPopupCount: state.showNLIMPopupCount + 1,
    };
  }

  if (action.type === INCREASE_SHOW_UNE_POPUP_COUNT) {
    return {
      ...state, showUNEPopupCount: state.showUNEPopupCount + 1,
    };
  }

  if (action.type === DISCARD_NOTE) {
    return { ...state, setInitDataCount: state.setInitDataCount + 1 };
  }

  if (action.type === MOVE_NOTES_COMMIT) {
    if (!action.payload.didRetry) return state;
    return { ...state, checkToFocusCount: state.checkToFocusCount + 1 };
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
    let newState = state;
    if (action.payload) {
      newState = { ...state, isScrollEnabled: true };
      if (!vars.editorReducer.didIncreaseBlurCount) newState.checkToFocusCount += 1;
    }
    vars.editorReducer.didIncreaseBlurCount = false;
    return newState;
  }

  if (action.type === UPDATE_EDITING_NOTE) {
    const { id, title, body, media, savedTitle, savedBody, savedMedia } = action.payload;

    const newState = {
      ...state,
      editingNoteId: id,
      editingNoteTitle: title,
      editingNoteBody: body,
      editingNoteMedia: media,
    };

    addNextAction(
      putDbUnsavedNote(id, title, body, media, savedTitle, savedBody, savedMedia)
    );
    return newState;
  }

  if (action.type === UPDATE_UNSAVED_NOTE) {
    // In case multiple calls i.e. update noteId to null and NoteEditor is unmounted,
    //   reset so no need to do it again.
    const { id } = action.payload;
    if (id !== state.editingNoteId && !vars.editorReducer.didClickEditUnsaved) {
      return state;
    }

    let newState = { ...state };
    if (id === state.editingNoteId) {
      newState = { ...newState, ...initialEditingNoteState };
    }
    if (vars.editorReducer.didClickEditUnsaved) {
      newState.checkToFocusCount = newState.checkToFocusCount + 1;
      vars.editorReducer.didClickEditUnsaved = false;
    }

    return newState;
  }

  if (action.type === DELETE_UNSAVED_NOTES) {
    const ids = action.payload;
    if (ids.includes(state.editingNoteId)) {
      return { ...state, ...initialEditingNoteState };
    }
    return state;
  }

  if (action.type === DELETE_ALL_DATA) {
    return {
      ...initialState,
      webViewKeyCount: state.webViewKeyCount,
      checkToFocusCount: state.checkToFocusCount,
      saveNoteCount: state.saveNoteCount,
      discardNoteCount: state.discardNoteCount,
      updateNoteIdUrlHashCount: state.updateNoteIdUrlHashCount,
      updateNoteIdCount: state.updateNoteIdCount,
      changeListNameCount: state.changeListNameCount,
      updateQueryStringCount: state.updateQueryStringCount,
      focusTitleCount: state.focusTitleCount,
      setInitDataCount: state.setInitDataCount,
      blurCount: state.blurCount,
      updateEditorWidthCount: state.updateEditorWidthCount,
      updateBulkEditUrlHashCount: state.updateBulkEditUrlHashCount,
      updateBulkEditCount: state.updateBulkEditCount,
      showNoteListMenuPopupCount: state.showNoteListMenuPopupCount,
      showNLIMPopupCount: state.showNLIMPopupCount,
      showUNEPopupCount: state.showUNEPopupCount,
    };
  }

  if (action.type === RESET_STATE) {
    return { ...initialState };
  }

  return state;
};

export default editorReducer;
