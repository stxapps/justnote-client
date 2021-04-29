import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ckeditor from '@ckeditor/ckeditor5-build-classic';

import { updateEditorFocused, saveNote } from '../actions';
import { NEW_NOTE, ADDED } from '../types/const';

import '../stylesheets/ckeditor.css';

const NoteEditorEditor = (props) => {

  const { note } = props;
  const saveNoteCount = useSelector(state => state.editor.saveNoteCount);
  const resetNoteCount = useSelector(state => state.editor.resetNoteCount);
  const [isEditorReady, setEditorReady] = useState(false);
  const titleInput = useRef(null);
  const bodyEditor = useRef(null);
  const prevSaveNoteCount = useRef(saveNoteCount);
  const prevResetNoteCount = useRef(resetNoteCount);
  const dispatch = useDispatch();

  const setData = (title, body) => {
    titleInput.current.value = title;
    bodyEditor.current.setData(body);
  };

  const setInitData = useCallback(() => {
    if (note.id === NEW_NOTE) {
      setData('', '');
      focusTitleInput();
    } else setData(note.title, note.body);
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

    dispatch(saveNote(title, body, []));
  }, [dispatch]);

  const onReady = useCallback((editor) => {
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
    if (resetNoteCount !== prevResetNoteCount.current) {
      setInitData();
      prevResetNoteCount.current = resetNoteCount;
    }
  }, [isEditorReady, resetNoteCount, setInitData]);

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
