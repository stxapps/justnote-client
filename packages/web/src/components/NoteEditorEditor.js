import React, { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { updateEditorFocused, updateEditorContent } from '../actions';
import { NEW_NOTE, ADDED } from '../types/const';

const NoteEditorEditor = () => {

  const note = useSelector(state => {
    const { listName, noteId } = state.display;
    return noteId === NEW_NOTE ? null : state.notes[listName][noteId];
  });
  const isFocused = useSelector(state => state.display.isEditorFocused);
  const title = useSelector(state => state.display.noteTitle);
  const body = useSelector(state => state.display.noteBody);
  //const media = useSelector(state => state.display.noteMedia);
  const titleInput = useRef(null);
  const dispatch = useDispatch();

  const onTitleInputChange = (e) => {
    if (!isFocused) dispatch(updateEditorFocused(true));
    dispatch(updateEditorContent({ title: e.target.value }));
  }

  const onBodyInputChange = (e) => {
    if (!isFocused) dispatch(updateEditorFocused(true));
    dispatch(updateEditorContent({ body: e.target.value }));
  }

  useEffect(() => {
    if (note) {
      dispatch(updateEditorContent(
        { title: note.title, body: note.body, media: note.media }
      ));
    } else {
      dispatch(updateEditorContent({ title: '', body: '', media: [] }));
    }
  }, [note, dispatch]);

  useEffect(() => {
    if (!note) setTimeout(() => titleInput.current.focus(), 1);
  }, [note]);

  return (
    <div className="px-3 py-3 flex-1 flex flex-col">
      <input ref={titleInput} onChange={onTitleInputChange} type="text" name="title" id="title" className="focus:ring-green-600 focus:border-green-600 block w-full flex-grow-0 flex-shrink-0 text-sm py-2 px-3 border-gray-300 rounded-md placeholder-gray-500" placeholder="Note Title" value={title} disabled={note && note.status !== ADDED} />
      <div className="h-10 border-b border-gray-200 py-3 flex-grow-0 flex-shrink-0 flex items-center justify-between">
      </div>
      <textarea onChange={onBodyInputChange} id="body" name="body" className="block w-full flex-1 text-sm shadow-sm mt-3 py-2 px-3 placeholder-gray-500 focus:ring-green-600 focus:border-green-600 border-gray-300 rounded-md" placeholder="Start writing..." value={body} disabled={note && note.status !== ADDED}></textarea>
    </div>
  );
};

export default React.memo(NoteEditorEditor);
