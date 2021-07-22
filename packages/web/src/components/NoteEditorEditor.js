import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ckeditor from '@ckeditor/ckeditor5-build-decoupled-document';

import {
  updatePopupUrlHash, updateEditorFocused, saveNote, updateDiscardAction,
  updateNoteIdUrlHash, updateNoteId, changeListName,
} from '../actions';
import {
  CONFIRM_DISCARD_POPUP, DISCARD_ACTION_CANCEL_EDIT,
  DISCARD_ACTION_UPDATE_NOTE_ID_URL_HASH, DISCARD_ACTION_UPDATE_NOTE_ID,
  DISCARD_ACTION_CHANGE_LIST_NAME, NEW_NOTE, ADDED,
} from '../types/const';
import {
  isNoteBodyEqual, isMobile as _isMobile, replaceObjectUrls, base64ToFile,
} from '../utils';

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
  const bodyTopToolbar = useRef(null);
  const bodyBottomToolbar = useRef(null);
  const prevSaveNoteCount = useRef(saveNoteCount);
  const prevDiscardNoteCount = useRef(discardNoteCount);
  const prevConfirmDiscardNoteCount = useRef(confirmDiscardNoteCount);
  const prevUpdateNoteIdUrlHashCount = useRef(updateNoteIdUrlHashCount);
  const prevUpdateNoteIdCount = useRef(updateNoteIdCount);
  const prevChangeListNameCount = useRef(changeListNameCount);
  const prevUpdateEditorWidthCount = useRef(updateEditorWidthCount);
  const objectUrlNames = useRef({});
  const dispatch = useDispatch();

  const isMobile = useMemo(() => _isMobile(), []);

  const setInitData = useCallback(async () => {
    titleInput.current.value = note.title;

    if (window.CKEditorObjectUrlContents) {
      for (const objectUrl in window.CKEditorObjectUrlContents) {
        URL.revokeObjectURL(objectUrl);
      }
    }
    window.CKEditorObjectUrlContents = {};
    objectUrlNames.current = {};

    const media = await Promise.all(note.media.map(async ({ name, content }) => {
      const file = await base64ToFile(name, content);
      return { name, content, file };
    }));

    let body = note.body;
    for (const { name, content, file } of media) {
      const objectUrl = URL.createObjectURL(file);

      window.CKEditorObjectUrlContents[objectUrl] = { fname: name, content };
      objectUrlNames.current[objectUrl] = name;

      body = body.replaceAll(name, objectUrl);
    }
    bodyEditor.current.setData(body);

    if (note.id === NEW_NOTE) focusTitleInput();
  }, [note.id, note.title, note.body, note.media]);

  const focusTitleInput = () => {
    titleInput.current.blur();
    setTimeout(() => titleInput.current.focus(), 1);
  };

  const onFocus = useCallback(() => {
    dispatch(updateEditorFocused(true));
  }, [dispatch]);

  const onSaveNote = useCallback(() => {
    const title = titleInput.current.value;
    const { body, media } = replaceObjectUrls(
      bodyEditor.current.getData(),
      window.CKEditorObjectUrlContents,
      objectUrlNames.current
    );

    if (title === '' && body === '') {
      dispatch(updateEditorFocused(false));
      setTimeout(() => {
        dispatch(updateEditorFocused(true));
        focusTitleInput();
      }, 1);
      return;
    }

    if (note.title === title && isNoteBodyEqual(note.body, body)) {
      dispatch(updateEditorFocused(false));
      return;
    }

    dispatch(saveNote(title, body, media));
  }, [note.title, note.body, dispatch]);

  const onDiscardNote = useCallback((doCheckEditing) => {
    if (doCheckEditing) {
      const title = titleInput.current.value;
      const { body } = replaceObjectUrls(
        bodyEditor.current.getData(),
        window.CKEditorObjectUrlContents,
        objectUrlNames.current
      );

      if (note.title !== title || !isNoteBodyEqual(note.body, body)) {
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
    const { body } = replaceObjectUrls(
      bodyEditor.current.getData(),
      window.CKEditorObjectUrlContents,
      objectUrlNames.current
    );

    if (note.title !== title || !isNoteBodyEqual(note.body, body)) {
      dispatch(updateDiscardAction(DISCARD_ACTION_UPDATE_NOTE_ID_URL_HASH));
      updatePopupUrlHash(CONFIRM_DISCARD_POPUP, true);
      return;
    }

    dispatch(updateNoteIdUrlHash(null, true, false));
  }, [note.title, note.body, dispatch]);

  const onUpdateNoteId = useCallback(() => {
    const title = titleInput.current.value;
    const { body } = replaceObjectUrls(
      bodyEditor.current.getData(),
      window.CKEditorObjectUrlContents,
      objectUrlNames.current
    );

    if (note.title !== title || !isNoteBodyEqual(note.body, body)) {
      dispatch(updateDiscardAction(DISCARD_ACTION_UPDATE_NOTE_ID));
      updatePopupUrlHash(CONFIRM_DISCARD_POPUP, true);
      return;
    }

    dispatch(updateNoteId(null, true, false));
  }, [note.title, note.body, dispatch]);

  const onChangeListName = useCallback(() => {
    const title = titleInput.current.value;
    const { body } = replaceObjectUrls(
      bodyEditor.current.getData(),
      window.CKEditorObjectUrlContents,
      objectUrlNames.current
    );

    if (note.title !== title || !isNoteBodyEqual(note.body, body)) {
      dispatch(updateDiscardAction(DISCARD_ACTION_CHANGE_LIST_NAME));
      updatePopupUrlHash(CONFIRM_DISCARD_POPUP, true);
      return;
    }

    dispatch(changeListName(null, false));
  }, [note.title, note.body, dispatch]);

  const onReady = useCallback((editor) => {
    if (isMobile) {
      bodyBottomToolbar.current.appendChild(editor.ui.view.toolbar.element);

      const groupedItemsDropdown = editor.ui.view.toolbar._behavior.groupedItemsDropdown;
      if (groupedItemsDropdown) groupedItemsDropdown.panelPosition = 'nw';

      const toolbarItems = editor.ui.view.toolbar.items;
      toolbarItems.get(3).panelPosition = 'nme';
      toolbarItems.get(4).panelPosition = 'nme';
      toolbarItems.get(5).panelPosition = 'nmw';
    } else {
      bodyTopToolbar.current.appendChild(editor.ui.view.toolbar.element);
      document.documentElement.style.setProperty('--ck-font-size-base', '13px');
    }

    bodyEditor.current = editor;
    setEditorReady(true);
  }, [isMobile, setEditorReady]);

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
      const { body } = replaceObjectUrls(
        bodyEditor.current.getData(),
        window.CKEditorObjectUrlContents,
        objectUrlNames.current
      );
      if (note.title !== title || !isNoteBodyEqual(note.body, body)) {
        e.preventDefault();
        return e.returnValue = 'It looks like your note hasn\'t been saved. Do you want to leave this site and discard your changes?';
      }
    };

    window.addEventListener('beforeunload', beforeUnloadListener, { capture: true });
    return () => {
      window.removeEventListener('beforeunload', beforeUnloadListener, { capture: true });
    };
  }, [isEditorReady, note.title, note.body]);

  useEffect(() => {
    // Need to place <link> of tailwind.css + ckeditor.css below <style> of CKEditor
    //   so that custom styles override default styles.
    const head = document.head || document.getElementsByTagName('head')[0];
    const last = head.lastElementChild;
    if (
      last.tagName.toLowerCase() === 'link' &&
      /* @ts-ignore */
      last.href && last.href.includes('/static/css/') && last.href.endsWith('.css')
    ) {
      return;
    }

    const hrefs = [];
    for (const link of head.getElementsByTagName('link')) {
      if (
        link.href && link.href.includes('/static/css/') && link.href.endsWith('.css')
      ) {
        hrefs.push(link.href);
      }
    }

    for (const href of hrefs) {
      const link = document.createElement('link');
      link.href = href;
      link.rel = 'stylesheet';
      head.appendChild(link);
    }
  }, []);

  const editorConfig = useMemo(() => {
    return {
      placeholder: 'Start writing...',
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
        documentColors: 0,
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
        documentColors: 0,
      },
    };
  }, []);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-grow flex-shrink overflow-x-hidden overflow-y-auto z-0">
        <div className={`px-1.5 py-1.5 ${isMobile ? 'border-b border-gray-200' : ''}`}>
          <input ref={titleInput} onFocus={onFocus} type="text" name="titleInput" id="titleInput" className="block w-full text-xl font-normal text-gray-800 px-1.5 py-1.5 placeholder-gray-500 border-0 focus:outline-none focus:ring-0 lg:text-lg" placeholder="Note Title" disabled={note.id !== NEW_NOTE && note.status !== ADDED} />
        </div>
        <div ref={bodyTopToolbar} className="sticky -top-px z-10"></div>
        <CKEditor editor={ckeditor} config={editorConfig} disabled={note.id !== NEW_NOTE && note.status !== ADDED} onReady={onReady} onFocus={onFocus} />
        <div className="h-28"></div>
      </div>
      <div ref={bodyBottomToolbar} className="flex-grow-0 flex-shrink-0"></div>
    </div>
  );
};

export default React.memo(NoteEditorEditor);
