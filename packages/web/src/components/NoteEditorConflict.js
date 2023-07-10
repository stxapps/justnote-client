import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ckeditor from '@ckeditor/ckeditor5-build-decoupled-document';
import { motion, AnimatePresence } from 'framer-motion';

import fileApi from '../apis/localFile';
import {
  updateNoteIdUrlHash, mergeNotes, handleUnsavedNote, deleteUnsavedNotes,
} from '../actions';
import {
  HASH_SUPPORT, MERGING, DIED_MERGING, LG_WIDTH, CD_ROOT, BLK_MODE,
} from '../types/const';
import { getListNameMap, getThemeMode } from '../selectors';
import {
  isString, getListNameDisplayName, getFormattedDT, isMobile as _isMobile,
} from '../utils';
import { isUint8Array, isBlob, convertDataUrlToBlob } from '../utils/index-web';
import { popupFMV } from '../types/animConfigs';
import vars from '../vars';

import { useSafeAreaFrame, useTailwind } from '.';

const _NoteEditorSavedConflict = (props) => {

  const { note: conflictedNote } = props;
  const { width: safeAreaWidth } = useSafeAreaFrame();
  const didClick = useRef(false);
  const tailwind = useTailwind();

  const onRightPanelCloseBtnClick = () => {
    if (didClick.current) return;
    updateNoteIdUrlHash(null);
    didClick.current = true;
  };

  const renderLoading = () => {
    if (!(conflictedNote.status === MERGING)) return null;

    return (
      <React.Fragment>
        <div className={tailwind('absolute inset-0 bg-white bg-opacity-25 blk:bg-gray-900 blk:bg-opacity-25')} />
        <div className={tailwind('absolute top-1/3 left-1/2 flex -translate-x-1/2 -translate-y-1/2 transform items-center justify-center')}>
          <div className={tailwind('ball-clip-rotate blk:ball-clip-rotate-blk')}>
            <div />
          </div>
        </div>
      </React.Fragment>
    );
  };

  const renderMergeError = () => {
    if (!(conflictedNote.status === DIED_MERGING)) return (
      <AnimatePresence key="AP_NEC_mergeError" />
    );

    return (
      <AnimatePresence key="AP_NEC_mergeError">
        <motion.div className={tailwind('absolute inset-x-0 top-10 flex items-start justify-center lg:top-0')} variants={popupFMV} initial="hidden" animate="visible" exit="hidden">
          <div className={tailwind('m-4 rounded-md bg-red-50 p-4 shadow-lg')}>
            <div className={tailwind('flex')}>
              <div className={tailwind('flex-shrink-0')}>
                <svg className={tailwind('h-6 w-6 text-red-400')} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className={tailwind('ml-3 lg:mt-0.5')}>
                <h3 className={tailwind('text-left text-base font-medium text-red-800 lg:text-sm')}>Oops..., something went wrong!</h3>
                <p className={tailwind('mt-2.5 text-sm text-red-700')}>Please wait a moment and try again.<br />If the problem persists, please <a className={tailwind('rounded-sm underline hover:text-red-800 focus:outline-none focus:ring-2 focus:ring-red-700')} href={'/' + HASH_SUPPORT} target="_blank" rel="noreferrer">contact us</a>.</p>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  };

  useEffect(() => {
    didClick.current = false;
  }, [conflictedNote]);

  const style = safeAreaWidth < LG_WIDTH ? {} : { minWidth: 442 };

  return (
    <div className={tailwind('relative h-full w-full overflow-auto bg-white blk:bg-gray-900')}>
      <div style={style} className={tailwind('relative px-4 pb-4 sm:px-6 sm:pb-6')}>
        <div className={tailwind('h-16 w-full')} />
        <h3 className={tailwind('pt-5 text-lg font-medium text-gray-800 blk:text-gray-200')}>{conflictedNote.notes.length} Versions found</h3>
        <p className={tailwind('text-sm font-normal text-gray-500 blk:text-gray-400')}>Please choose the correct version of this note.</p>
        {conflictedNote.notes.map((note, i) => <ConflictItem key={note.id} listName={conflictedNote.listNames[i]} note={note} status={conflictedNote.status} />)}
        <div className={tailwind('absolute top-0 left-0 lg:hidden')}>
          <button onClick={onRightPanelCloseBtnClick} type="button" className={tailwind('bg-white px-4 py-4 text-sm text-gray-500 hover:text-gray-700 focus:bg-gray-200 focus:text-gray-700 focus:outline-none blk:bg-gray-900 blk:text-gray-400 blk:hover:text-gray-200 blk:focus:bg-gray-700 blk:focus:text-gray-200')}>
            <svg className={tailwind('h-5 w-5')} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M7.70703 14.707C7.5195 14.8945 7.26519 14.9998 7.00003 14.9998C6.73487 14.9998 6.48056 14.8945 6.29303 14.707L2.29303 10.707C2.10556 10.5195 2.00024 10.2652 2.00024 10C2.00024 9.73488 2.10556 9.48057 2.29303 9.29304L6.29303 5.29304C6.48163 5.11088 6.73423 5.01009 6.99643 5.01237C7.25863 5.01465 7.50944 5.11981 7.69485 5.30522C7.88026 5.49063 7.98543 5.74144 7.9877 6.00364C7.98998 6.26584 7.88919 6.51844 7.70703 6.70704L5.41403 9.00004H17C17.2652 9.00004 17.5196 9.1054 17.7071 9.29293C17.8947 9.48047 18 9.73482 18 10C18 10.2653 17.8947 10.5196 17.7071 10.7071C17.5196 10.8947 17.2652 11 17 11H5.41403L7.70703 13.293C7.8945 13.4806 7.99982 13.7349 7.99982 14C7.99982 14.2652 7.8945 14.5195 7.70703 14.707Z" />
            </svg>
          </button>
        </div>
      </div>
      {renderLoading()}
      {renderMergeError()}
    </div>
  );
};

const _NoteEditorUnsavedConflict = (props) => {

  const { note, unsavedNote } = props;
  const { width: safeAreaWidth } = useSafeAreaFrame();
  const listName = useSelector(state => state.display.listName);
  const didClick = useRef(false);
  const dispatch = useDispatch();
  const tailwind = useTailwind();

  const onRightPanelCloseBtnClick = () => {
    if (didClick.current) return;
    updateNoteIdUrlHash(null);
    didClick.current = true;
  };

  const onDiscardBtnClick = () => {
    if (didClick.current) return;
    dispatch(deleteUnsavedNotes([unsavedNote.note.id]));
    didClick.current = true;
  };

  const onEditBtnClick = () => {
    if (didClick.current) return;

    const { id, title, body, media } = unsavedNote.note;
    vars.editorReducer.didClickEditUnsaved = true;
    dispatch(handleUnsavedNote(note.id, title, body, media));
    dispatch(deleteUnsavedNotes([id]));

    didClick.current = true;
  };

  useEffect(() => {
    didClick.current = false;
  }, [note, unsavedNote]);

  const style = safeAreaWidth < LG_WIDTH ? {} : { minWidth: 442 };

  return (
    <div className={tailwind('relative h-full w-full overflow-auto bg-white blk:bg-gray-900')}>
      <div style={style} className={tailwind('relative px-4 pb-4 sm:px-6 sm:pb-6')}>
        <div className={tailwind('h-16 w-full')} />
        <h3 className={tailwind('pt-5 text-lg font-medium text-gray-800 blk:text-gray-200')}>Found an unsaved version.</h3>
        <p className={tailwind('text-sm font-normal text-gray-500 blk:text-gray-400')}>Please choose to continue editing the unsaved version or discard it.</p>
        <div className={tailwind('flex items-center pt-6')}>
          <button onClick={onEditBtnClick} type="button" className={tailwind('group flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm text-gray-500 shadow-sm hover:border-gray-400 hover:text-gray-600 focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 blk:border-gray-600 blk:bg-gray-900 blk:text-gray-400 blk:hover:border-gray-500 blk:hover:text-gray-300 blk:focus:border-gray-500 blk:focus:ring-gray-500 blk:focus:ring-offset-gray-900')}>
            <svg className={tailwind('mr-1 h-5 w-5')} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M13.586 3.58601C13.7705 3.39499 13.9912 3.24262 14.2352 3.13781C14.4792 3.03299 14.7416 2.97782 15.0072 2.97551C15.2728 2.9732 15.5361 3.0238 15.7819 3.12437C16.0277 3.22493 16.251 3.37343 16.4388 3.56122C16.6266 3.74901 16.7751 3.97231 16.8756 4.2181C16.9762 4.46389 17.0268 4.72725 17.0245 4.99281C17.0222 5.25837 16.967 5.52081 16.8622 5.76482C16.7574 6.00883 16.605 6.22952 16.414 6.41401L15.621 7.20701L12.793 4.37901L13.586 3.58601ZM11.379 5.79301L3 14.172V17H5.828L14.208 8.62101L11.378 5.79301H11.379Z" />
            </svg>
            Edit
          </button>
          <button onClick={onDiscardBtnClick} className={tailwind('ml-2 rounded-md border border-white bg-white px-2 py-1.5 text-sm text-gray-500 hover:text-gray-700 focus:bg-gray-200 focus:text-gray-700 focus:outline-none blk:border-gray-900 blk:bg-gray-900 blk:text-gray-400 blk:hover:text-gray-200 blk:focus:bg-gray-700 blk:focus:text-gray-200')}>Discard</button>
        </div>
        <ConflictItem listName={listName} note={unsavedNote.note} status={note.status} isUnsaved={true} doHideChooseBtn={true} />
        <ConflictItem listName={listName} note={note} status={note.status} doHideChooseBtn={true} />
        <div className={tailwind('absolute top-0 left-0 lg:hidden')}>
          <button onClick={onRightPanelCloseBtnClick} type="button" className={tailwind('bg-white px-4 py-4 text-sm text-gray-500 hover:text-gray-700 focus:bg-gray-200 focus:text-gray-700 focus:outline-none blk:bg-gray-900 blk:text-gray-400 blk:hover:text-gray-200 blk:focus:bg-gray-700 blk:focus:text-gray-200')}>
            <svg className={tailwind('h-5 w-5')} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M7.70703 14.707C7.5195 14.8945 7.26519 14.9998 7.00003 14.9998C6.73487 14.9998 6.48056 14.8945 6.29303 14.707L2.29303 10.707C2.10556 10.5195 2.00024 10.2652 2.00024 10C2.00024 9.73488 2.10556 9.48057 2.29303 9.29304L6.29303 5.29304C6.48163 5.11088 6.73423 5.01009 6.99643 5.01237C7.25863 5.01465 7.50944 5.11981 7.69485 5.30522C7.88026 5.49063 7.98543 5.74144 7.9877 6.00364C7.98998 6.26584 7.88919 6.51844 7.70703 6.70704L5.41403 9.00004H17C17.2652 9.00004 17.5196 9.1054 17.7071 9.29293C17.8947 9.48047 18 9.73482 18 10C18 10.2653 17.8947 10.5196 17.7071 10.7071C17.5196 10.8947 17.2652 11 17 11H5.41403L7.70703 13.293C7.8945 13.4806 7.99982 13.7349 7.99982 14C7.99982 14.2652 7.8945 14.5195 7.70703 14.707Z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

const _ConflictItem = (props) => {

  const { listName, note, status, isUnsaved, doHideChooseBtn } = props;
  const listNameMap = useSelector(getListNameMap);
  const themeMode = useSelector(state => getThemeMode(state));
  const [isOpen, setIsOpen] = useState(false);
  const [didOpen, setDidOpen] = useState(false);
  const [isEditorReady, setEditorReady] = useState(false);
  const bodyEditor = useRef(null);
  const objectUrlContents = useRef({});
  const objectUrlFiles = useRef({});
  const objectUrlNames = useRef({});
  const didClick = useRef(false);
  const dispatch = useDispatch();
  const tailwind = useTailwind();

  const updatedDTStr = useMemo(() => getFormattedDT(note.updatedDT), [note.updatedDT]);
  const isMobile = useMemo(() => _isMobile(), []);

  const onOpenBtnClick = () => {
    const next = !isOpen;
    setIsOpen(next);
    if (next) setDidOpen(true);
  };

  const onChooseBtnClick = () => {
    if (didClick.current) return;
    dispatch(mergeNotes(note.id));
    didClick.current = true;
  };

  const clearNoteMedia = () => {
    for (const objectUrl in objectUrlContents.current) {
      URL.revokeObjectURL(objectUrl);
    }
    objectUrlContents.current = {};

    for (const objectUrl in objectUrlFiles.current) {
      URL.revokeObjectURL(objectUrl);
    }
    objectUrlFiles.current = {};

    objectUrlNames.current = {};
  };

  const replaceWithContents = useCallback(async (body, media) => {
    media = media.filter(({ content }) => {
      return isString(content) && content.startsWith('data:');
    });
    media = await Promise.all(media.map(async ({ name, content }) => {
      const blob = await convertDataUrlToBlob(content);
      return { name, content, blob };
    }));

    for (const { name, content, blob } of media) {
      const objectUrl = URL.createObjectURL(blob);

      objectUrlContents.current[objectUrl] = { fname: name, content };
      objectUrlNames.current[objectUrl] = name;

      body = body.replaceAll(name, objectUrl);
    }

    return body;
  }, []);

  const replaceWithFiles = useCallback(async (body, media) => {
    media = media.filter(({ name }) => {
      return isString(name) && name.startsWith(CD_ROOT + '/');
    });

    for (const { name, content } of media) {
      let file = await fileApi.getFile(name);
      if (isUint8Array(file)) file = new Blob([file]);
      if (!isBlob(file)) continue;

      const objectUrl = URL.createObjectURL(file);

      objectUrlFiles.current[objectUrl] = { fname: name, content };
      objectUrlNames.current[objectUrl] = name;

      body = body.replaceAll(name, objectUrl);
    }

    return body;
  }, []);

  const setInitData = useCallback(async () => {
    let [body, media] = [note.body, note.media];

    clearNoteMedia();

    body = await replaceWithContents(body, media);
    body = await replaceWithFiles(body, media);
    try {
      bodyEditor.current.setData(body);
    } catch (error) {
      // Got Uncaught TypeError: Cannot read properties of null (reading 'model')
      //   after dispatching UPDATE_NOTE_ROLLBACK
      //   guess because CKEditor.setData still working on updated version
      //   then suddenly got upmounted.
      // Also, in handleScreenRotation, calling updateNoteIdUrlHash(null)
      //   guess it's the same reason.
      console.log('NoteEditorEditor.setInitData: ckeditor.setData error ', error);
    }
  }, [note.body, note.media, replaceWithContents, replaceWithFiles]);

  const onReady = useCallback((editor) => {
    bodyEditor.current = editor;
    setEditorReady(true);
  }, [setEditorReady]);

  useEffect(() => {
    didClick.current = false;
  }, [status]);

  useEffect(() => {
    if (!isEditorReady) return;
    setInitData();
  }, [isEditorReady, setInitData]);

  useEffect(() => {
    // Need to place <link> of tailwind.css + ckeditor.css below <style> of CKEditor
    //   so that custom styles override default styles.
    const head = document.head || document.getElementsByTagName('head')[0];
    const last = head.lastElementChild;
    if (
      last.tagName.toLowerCase() === 'link' &&
      /* @ts-expect-error */
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
      fontSize: {
        options: [
          'tiny', 'small', 'default', 'big', 'huge',
          { title: '9', model: '0.5625em' },
          { title: '12', model: '0.75em' },
          { title: '14', model: '0.875em' },
          { title: '18', model: '1.125em' },
          { title: '24', model: '1.5em' },
          { title: '30', model: '1.875em' },
          { title: '36', model: '2.25em' },
          { title: '48', model: '3em' },
          { title: '60', model: '3.75em' },
        ],
      },
      fontColor: {
        colors: [
          { color: 'rgb(31, 41, 55)', label: 'Black', hasBorder: true },
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
        colorPicker: false,
      },
      fontBackgroundColor: {
        colors: [
          { color: 'rgb(31, 41, 55)', label: 'Black', hasBorder: true },
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
        colorPicker: false,
      },
      link: {
        addTargetToExternalLinks: true,
        defaultProtocol: 'http://',
      },
    };
  }, []);

  let arrowSvg;
  if (isOpen) {
    arrowSvg = (
      <svg className={tailwind('h-5 w-5 text-gray-500 blk:text-gray-300')} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" clipRule="evenodd" d="M5.29303 7.29302C5.48056 7.10555 5.73487 7.00023 6.00003 7.00023C6.26519 7.00023 6.5195 7.10555 6.70703 7.29302L10 10.586L13.293 7.29302C13.3853 7.19751 13.4956 7.12133 13.6176 7.06892C13.7396 7.01651 13.8709 6.98892 14.0036 6.98777C14.1364 6.98662 14.2681 7.01192 14.391 7.0622C14.5139 7.11248 14.6255 7.18673 14.7194 7.28062C14.8133 7.37452 14.8876 7.48617 14.9379 7.60907C14.9881 7.73196 15.0134 7.86364 15.0123 7.99642C15.0111 8.1292 14.9835 8.26042 14.9311 8.38242C14.8787 8.50443 14.8025 8.61477 14.707 8.70702L10.707 12.707C10.5195 12.8945 10.2652 12.9998 10 12.9998C9.73487 12.9998 9.48056 12.8945 9.29303 12.707L5.29303 8.70702C5.10556 8.51949 5.00024 8.26518 5.00024 8.00002C5.00024 7.73486 5.10556 7.48055 5.29303 7.29302V7.29302Z" />
      </svg>
    );
  } else {
    arrowSvg = (
      <svg className={tailwind('h-5 w-5 text-gray-500 blk:text-gray-300')} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" clipRule="evenodd" d="M7.29303 14.707C7.10556 14.5195 7.00024 14.2651 7.00024 14C7.00024 13.7348 7.10556 13.4805 7.29303 13.293L10.586 9.99998L7.29303 6.70698C7.11087 6.51838 7.01008 6.26578 7.01236 6.00358C7.01463 5.74138 7.1198 5.49057 7.30521 5.30516C7.49062 5.11975 7.74143 5.01458 8.00363 5.01231C8.26583 5.01003 8.51843 5.11082 8.70703 5.29298L12.707 9.29298C12.8945 9.48051 12.9998 9.73482 12.9998 9.99998C12.9998 10.2651 12.8945 10.5195 12.707 10.707L8.70703 14.707C8.5195 14.8945 8.26519 14.9998 8.00003 14.9998C7.73487 14.9998 7.48056 14.8945 7.29303 14.707Z" />
      </svg>
    );
  }

  return (
    <div className={tailwind('mt-6 overflow-hidden rounded-lg border border-gray-200 blk:border-gray-700')}>
      <div className={tailwind(`rounded-t-lg bg-gray-50 blk:bg-gray-800 sm:flex sm:items-start sm:justify-between ${!isOpen ? 'rounded-b-lg' : ''}`)}>
        <div className={tailwind('sm:flex-shrink sm:flex-grow')}>
          <button onClick={onOpenBtnClick} type="button" className={tailwind(`group flex w-full rounded-lg pt-3 pl-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-gray-400 blk:focus-visible:ring-gray-500 ${doHideChooseBtn ? 'pb-3' : ''}`)}>
            <div className={tailwind('mt-0.5 lg:mt-0')}>
              {arrowSvg}
            </div>
            <div className={tailwind('ml-1')}>
              <div className={tailwind('text-left text-base font-medium text-gray-800 group-hover:underline blk:text-gray-200 lg:text-sm')}>{isUnsaved ? 'Unsaved version' : `Last updated on ${updatedDTStr}`}</div>
              <div className={tailwind('mt-1 text-left text-sm text-gray-600 blk:text-gray-300')}>In {getListNameDisplayName(listName, listNameMap)}</div>
            </div>
          </button>
        </div>
        {!doHideChooseBtn && <div className={tailwind('py-3 pl-2.5 sm:flex-shrink-0 sm:flex-grow-0 sm:pl-6 sm:pr-4')}>
          <button onClick={onChooseBtnClick} type="button" className={tailwind('inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm text-gray-500 shadow-sm hover:border-gray-400 hover:text-gray-600 focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 blk:border-gray-500 blk:bg-gray-800 blk:text-gray-300 blk:hover:border-gray-400 blk:hover:text-gray-200 blk:focus:border-gray-400 blk:focus:ring-gray-500 blk:focus:ring-offset-gray-800')}>
            <svg className={tailwind('mr-1 h-5 w-5')} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M16.7069 5.29303C16.8944 5.48056 16.9997 5.73487 16.9997 6.00003C16.9997 6.26519 16.8944 6.5195 16.7069 6.70703L8.70692 14.707C8.51939 14.8945 8.26508 14.9998 7.99992 14.9998C7.73475 14.9998 7.48045 14.8945 7.29292 14.707L3.29292 10.707C3.11076 10.5184 3.00997 10.2658 3.01224 10.0036C3.01452 9.74143 3.11969 9.49062 3.3051 9.30521C3.49051 9.1198 3.74132 9.01464 4.00352 9.01236C4.26571 9.01008 4.51832 9.11087 4.70692 9.29303L7.99992 12.586L15.2929 5.29303C15.4804 5.10556 15.7348 5.00024 15.9999 5.00024C16.2651 5.00024 16.5194 5.10556 16.7069 5.29303Z" />
            </svg>
            Choose
          </button>
        </div>}
      </div>
      {didOpen && <div className={tailwind(`py-5 ${isMobile ? 'mobile' : 'not-mobile'} ${themeMode === BLK_MODE ? 'blk-mode' : 'wht-mode'} ${isOpen ? '' : 'fixed top-full left-full'}`)}>
        <h3 className={tailwind('px-4 text-lg font-medium text-gray-800 blk:text-gray-200')}>{note.title}</h3>
        <div className={tailwind('px-1.5 preview-mode')}>
          <CKEditor editor={ckeditor} config={editorConfig} disabled={true} onReady={onReady} />
        </div>
      </div>}
    </div>
  );
};

const ConflictItem = React.memo(_ConflictItem);

export const NoteEditorSavedConflict = React.memo(_NoteEditorSavedConflict);
export const NoteEditorUnsavedConflict = React.memo(_NoteEditorUnsavedConflict);
