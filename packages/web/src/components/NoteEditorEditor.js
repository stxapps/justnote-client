import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ckeditor from '@ckeditor/ckeditor5-build-classic';

import {
  updatePopupUrlHash, updateEditorFocused, saveNote, updateDiscardAction,
  updateNoteIdUrlHash, updateNoteId, changeListName,
} from '../actions';
import {
  CONFIRM_DISCARD_POPUP, DISCARD_ACTION_CANCEL_EDIT,
  DISCARD_ACTION_UPDATE_NOTE_ID_URL_HASH, DISCARD_ACTION_UPDATE_NOTE_ID,
  DISCARD_ACTION_CHANGE_LIST_NAME, NEW_NOTE, ADDED,
} from '../types/const';

import '../stylesheets/ckeditor.css';

const NoteEditorEditor = (props) => {

  const { note } = props;
  const saveNoteCount = useSelector(state => state.editor.saveNoteCount);
  const discardNoteCount = useSelector(state => state.editor.discardNoteCount);
  const confirmDiscardNoteCount = useSelector(
    state => state.editor.confirmDiscardNoteCount
  );
  const updateNoteIdUrlHashCount = useSelector(
    state => state.editor.updateNoteIdUrlHashCount
  );
  const updateNoteIdCount = useSelector(state => state.editor.updateNoteIdCount);
  const changeListNameCount = useSelector(state => state.editor.changeListNameCount);
  const updateEditorWidthCount = useSelector(
    state => state.editor.updateEditorWidthCount
  );
  const [isEditorReady, setEditorReady] = useState(false);
  const titleInput = useRef(null);
  const bodyEditor = useRef(null);
  const prevSaveNoteCount = useRef(saveNoteCount);
  const prevDiscardNoteCount = useRef(discardNoteCount);
  const prevConfirmDiscardNoteCount = useRef(confirmDiscardNoteCount);
  const prevUpdateNoteIdUrlHashCount = useRef(updateNoteIdUrlHashCount);
  const prevUpdateNoteIdCount = useRef(updateNoteIdCount);
  const prevChangeListNameCount = useRef(changeListNameCount);
  const prevUpdateEditorWidthCount = useRef(updateEditorWidthCount);
  const dispatch = useDispatch();

  const setInitData = useCallback(() => {
    titleInput.current.value = note.title;
    bodyEditor.current.setData(note.body);
    if (note.id === NEW_NOTE) focusTitleInput();
  }, [note.id, note.title, note.body]);

  const focusTitleInput = () => {
    setTimeout(() => titleInput.current.focus(), 1);
  };

  const onFocus = useCallback(() => {
    dispatch(updateEditorFocused(true));
  }, [dispatch]);

  const onSaveNote = useCallback(() => {
    const title = titleInput.current.value;
    const body = bodyEditor.current.getData();

    if (title === '' && body === '') {
      dispatch(updateEditorFocused(false));
      setTimeout(() => {
        dispatch(updateEditorFocused(true));
        focusTitleInput();
      }, 1);
      return;
    }

    dispatch(saveNote(title, body, []));
  }, [dispatch]);

  const onDiscardNote = useCallback((doCheckEditing) => {
    if (doCheckEditing) {
      const title = titleInput.current.value;
      const body = bodyEditor.current.getData();

      if (note.title !== title || note.body !== body) {
        dispatch(updateDiscardAction(DISCARD_ACTION_CANCEL_EDIT));
        updatePopupUrlHash(CONFIRM_DISCARD_POPUP, true);
        return;
      }
    }

    dispatch(updateEditorFocused(false));
    setInitData();
  }, [note.title, note.body, setInitData, dispatch]);

  const onUpdateNoteIdUrlHash = useCallback(() => {
    const title = titleInput.current.value;
    const body = bodyEditor.current.getData();

    if (note.title !== title || note.body !== body) {
      dispatch(updateDiscardAction(DISCARD_ACTION_UPDATE_NOTE_ID_URL_HASH));
      updatePopupUrlHash(CONFIRM_DISCARD_POPUP, true);
      return;
    }

    dispatch(updateNoteIdUrlHash(null, true, false));
  }, [note.title, note.body, dispatch]);

  const onUpdateNoteId = useCallback(() => {
    const title = titleInput.current.value;
    const body = bodyEditor.current.getData();

    if (note.title !== title || note.body !== body) {
      dispatch(updateDiscardAction(DISCARD_ACTION_UPDATE_NOTE_ID));
      updatePopupUrlHash(CONFIRM_DISCARD_POPUP, true);
      return;
    }

    dispatch(updateNoteId(null, true, false));
  }, [note.title, note.body, dispatch]);

  const onChangeListName = useCallback(() => {
    const title = titleInput.current.value;
    const body = bodyEditor.current.getData();

    if (note.title !== title || note.body !== body) {
      dispatch(updateDiscardAction(DISCARD_ACTION_CHANGE_LIST_NAME));
      updatePopupUrlHash(CONFIRM_DISCARD_POPUP, true);
      return;
    }

    dispatch(changeListName(null, false));
  }, [note.title, note.body, dispatch]);

  const onReady = useCallback((editor) => {
    window.editor = editor;
    bodyEditor.current = editor;
    setEditorReady(true);
  }, [setEditorReady]);

  useEffect(() => {
    if (!isEditorReady) return;
    setInitData();
  }, [isEditorReady, setInitData]);

  useEffect(() => {
    if (!isEditorReady) return;
    if (saveNoteCount !== prevSaveNoteCount.current) {
      onSaveNote();
      prevSaveNoteCount.current = saveNoteCount;
    }
  }, [isEditorReady, saveNoteCount, onSaveNote]);

  useEffect(() => {
    if (!isEditorReady) return;
    if (discardNoteCount !== prevDiscardNoteCount.current) {
      onDiscardNote(true);
      prevDiscardNoteCount.current = discardNoteCount;
    }
  }, [isEditorReady, discardNoteCount, onDiscardNote]);

  useEffect(() => {
    if (!isEditorReady) return;
    if (confirmDiscardNoteCount !== prevConfirmDiscardNoteCount.current) {
      onDiscardNote(false);
      prevConfirmDiscardNoteCount.current = confirmDiscardNoteCount;
    }
  }, [isEditorReady, confirmDiscardNoteCount, onDiscardNote]);

  useEffect(() => {
    if (!isEditorReady) return;
    if (updateNoteIdUrlHashCount !== prevUpdateNoteIdUrlHashCount.current) {
      onUpdateNoteIdUrlHash();
      prevUpdateNoteIdUrlHashCount.current = updateNoteIdUrlHashCount;
    }
  }, [isEditorReady, updateNoteIdUrlHashCount, onUpdateNoteIdUrlHash]);

  useEffect(() => {
    if (!isEditorReady) return;
    if (updateNoteIdCount !== prevUpdateNoteIdCount.current) {
      onUpdateNoteId();
      prevUpdateNoteIdCount.current = updateNoteIdCount;
    }
  }, [isEditorReady, updateNoteIdCount, onUpdateNoteId]);

  useEffect(() => {
    if (!isEditorReady) return;
    if (changeListNameCount !== prevChangeListNameCount.current) {
      onChangeListName();
      prevChangeListNameCount.current = changeListNameCount;
    }
  }, [isEditorReady, changeListNameCount, onChangeListName]);

  useEffect(() => {
    if (!isEditorReady) return;
    if (updateEditorWidthCount !== prevUpdateEditorWidthCount.current) {
      bodyEditor.current.ui.view.toolbar.maxWidth = '9999px';
      bodyEditor.current.ui.view.toolbar.maxWidth = 'auto';
      prevUpdateEditorWidthCount.current = updateEditorWidthCount;
    }
  }, [isEditorReady, updateEditorWidthCount]);

  useEffect(() => {
    const beforeUnloadListener = (e) => {
      if (!isEditorReady) return;

      const title = titleInput.current.value;
      const body = bodyEditor.current.getData();
      if (note.title !== title || note.body !== body) {
        e.preventDefault();
        return e.returnValue = 'It looks like your note hasn\'t been saved. Do you want to leave this site and discard your changes?';
      }
    };

    window.addEventListener('beforeunload', beforeUnloadListener, { capture: true });
    return () => {
      window.removeEventListener('beforeunload', beforeUnloadListener, { capture: true });
    };
  }, [isEditorReady, note.title, note.body]);

  const editorConfig = useMemo(() => {
    return {
      removePlugins: ['Autoformat'],
      fontColor: {
        colors: [
          { color: 'rgb(31, 41, 55)', label: 'Black' },
          { color: 'rgb(107, 114, 128)', label: 'Gray' },
          { color: 'rgb(185, 28, 28)', label: 'Red' },
          { color: 'rgb(252, 211, 77)', label: 'Yellow' },
          { color: 'rgb(217, 119, 6)', label: 'Orange' },
          { color: 'rgb(120, 53, 15)', label: 'Brown' },
          { color: 'rgb(21, 128, 61)', label: 'Green' },
          { color: 'rgb(29, 78, 216)', label: 'Blue' },
          { color: 'rgb(91, 33, 182)', label: 'Purple' },
          { color: 'rgb(219, 39, 119)', label: 'Pink' },
          { color: 'rgb(229, 231, 235)', label: 'Light gray' },
          { color: 'rgb(255, 255, 255)', label: 'White', hasBorder: true },
        ],
        columns: 6,
      },
      fontBackgroundColor: {
        colors: [
          { color: 'rgb(31, 41, 55)', label: 'Black' },
          { color: 'rgb(107, 114, 128)', label: 'Gray' },
          { color: 'rgb(239, 68, 68)', label: 'Red' },
          { color: 'rgb(252, 211, 77)', label: 'Yellow' },
          { color: 'rgb(245, 158, 11)', label: 'Orange' },
          { color: 'rgb(180, 83, 9)', label: 'Brown' },
          { color: 'rgb(74, 222, 128)', label: 'Green' },
          { color: 'rgb(147, 197, 253)', label: 'Blue' },
          { color: 'rgb(196, 181, 253)', label: 'Purple' },
          { color: 'rgb(251, 207, 232)', label: 'Pink' },
          { color: 'rgb(229, 231, 235)', label: 'Light gray' },
          { color: 'rgb(255, 255, 255)', label: 'White', hasBorder: true },
        ],
        columns: 6,
      },
      placeholder: 'Start writing...',
    };
  }, []);

  return (
    <div className="flex-1 overflow-x-hidden">
      <div className="px-1.5 py-1.5">
        <input ref={titleInput} onFocus={onFocus} type="text" name="titleInput" id="titleInput" className="block w-full text-lg text-gray-800 font-normal px-1.5 py-1.5 placeholder-gray-500 border-0 focus:outline-none focus:ring-0" placeholder="Note Title" autoComplete="off" disabled={note.id !== NEW_NOTE && note.status !== ADDED} />
      </div>
      <CKEditor editor={ckeditor} config={editorConfig} disabled={note.id !== NEW_NOTE && note.status !== ADDED} onReady={onReady} onFocus={onFocus} />
    </div>
  );
};

export default React.memo(NoteEditorEditor);
