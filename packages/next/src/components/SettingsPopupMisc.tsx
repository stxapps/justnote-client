import React, { useRef } from 'react';

import { useSelector, useDispatch } from '../store';
import { updatePopup } from '../actions';
import {
  updateDoSyncModeInput, updateDoDeleteOldNotesInTrash, updateSortOn,
  updateDoDescendingOrder, updateNoteDateShowingMode, updateNoteDateFormat,
  updateDoSectionNotesByMonth, updateDoMoreEditorFontSizes, updateDoUseLocalTheme,
  updateTheme,
} from '../actions/chunk';
import {
  DATE_FORMAT_MENU_POPUP, ADDED_DT, UPDATED_DT, NOTE_DATE_SHOWING_MODE_HIDE,
  NOTE_DATE_SHOWING_MODE_SHOW, NOTE_DATE_FORMATS, NOTE_DATE_FORMAT_TEXTS,
  NOTE_DATE_FORMAT_SYSTEM, WHT_MODE, BLK_MODE, SYSTEM_MODE, CUSTOM_MODE,
} from '../types/const';
import {
  getRawThemeMode, getRawThemeCustomOptions, getNoteDateExample,
} from '../selectors';

import { useTailwind } from '.';

const SettingsPopupMisc = (props) => {

  const { onSidebarOpenBtnClick } = props;
  const doSyncModeInput = useSelector(state => state.localSettings.doSyncModeInput);
  const doDeleteOldNotesInTrash = useSelector(
    state => state.settings.doDeleteOldNotesInTrash
  );
  const sortOn = useSelector(state => state.settings.sortOn);
  const doDescendingOrder = useSelector(state => state.settings.doDescendingOrder);
  const noteDateShowingMode = useSelector(state => state.settings.noteDateShowingMode);
  const noteDateFormat = useSelector(state => state.settings.noteDateFormat);
  const noteDateIsTwoDigit = useSelector(state => state.settings.noteDateIsTwoDigit);
  const noteDateIsCurrentYearShown = useSelector(
    state => state.settings.noteDateIsCurrentYearShown
  );
  const noteDateExample = useSelector(state => getNoteDateExample(state));
  const doSectionNotesByMonth = useSelector(
    state => state.settings.doSectionNotesByMonth
  );
  const doMoreEditorFontSizes = useSelector(
    state => state.settings.doMoreEditorFontSizes
  );
  const doUseLocalTheme = useSelector(state => state.localSettings.doUseLocalTheme);
  const themeMode = useSelector(state => getRawThemeMode(state));
  const customOptions = useSelector(state => getRawThemeCustomOptions(state));
  const whtTimeInput = useRef(null);
  const blkTimeInput = useRef(null);
  const dispatch = useDispatch();
  const tailwind = useTailwind();

  const onDoSyncModeBtnClick = () => {
    dispatch(updateDoSyncModeInput(!doSyncModeInput));
  };

  const onDoDeleteBtnClick = () => {
    dispatch(updateDoDeleteOldNotesInTrash(!doDeleteOldNotesInTrash));
  };

  const onSortOnInputChange = (value) => {
    dispatch(updateSortOn(value));
  };

  const onDoDescendingInputChange = (value) => {
    let doDescend;
    if (value === 'ascending') doDescend = false;
    else if (value === 'descending') doDescend = true;
    else throw new Error(`Invalid value: ${value}`);

    dispatch(updateDoDescendingOrder(doDescend));
  };

  const onDoShowDateBtnClick = () => {
    if (noteDateShowingMode === NOTE_DATE_SHOWING_MODE_HIDE) {
      dispatch(updateNoteDateShowingMode(NOTE_DATE_SHOWING_MODE_SHOW));
    } else if (noteDateShowingMode === NOTE_DATE_SHOWING_MODE_SHOW) {
      dispatch(updateNoteDateShowingMode(NOTE_DATE_SHOWING_MODE_HIDE));
    } else {
      console.log('Invalid noteDateShowingMode: ', noteDateShowingMode);
    }
  };

  const onDateFormatBtnClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    dispatch(updatePopup(DATE_FORMAT_MENU_POPUP, true, rect));
  };

  const onTwoDigitBtnClick = () => {
    dispatch(updateNoteDateFormat(null, !noteDateIsTwoDigit));
  };

  const onCurrentYearBtnClick = () => {
    dispatch(updateNoteDateFormat(null, null, !noteDateIsCurrentYearShown));
  };

  const onDoSectionBtnClick = () => {
    dispatch(updateDoSectionNotesByMonth(!doSectionNotesByMonth));
  };

  const onDoMoreFontSizesBtnClick = () => {
    dispatch(updateDoMoreEditorFontSizes(!doMoreEditorFontSizes));
  };

  const onDoUseLocalThemeBtnClick = (doUse) => {
    dispatch(updateDoUseLocalTheme(doUse));
  };

  const onThemeInputChange = (value) => {
    const _themeMode = value;
    const _customOptions = [
      { mode: WHT_MODE, startTime: whtTimeInput.current.value },
      { mode: BLK_MODE, startTime: blkTimeInput.current.value },
    ];
    dispatch(updateTheme(_themeMode, _customOptions));
  };

  const onTimeInputChange = () => {
    const _themeMode = CUSTOM_MODE;
    const _customOptions = [
      { mode: WHT_MODE, startTime: whtTimeInput.current.value },
      { mode: BLK_MODE, startTime: blkTimeInput.current.value },
    ];
    dispatch(updateTheme(_themeMode, _customOptions));
  };

  const onWhtTimeInputBlur = () => {
    if (whtTimeInput.current.value === '') {
      const _themeMode = CUSTOM_MODE;
      const _customOptions = [
        { mode: WHT_MODE, startTime: '06:00' },
        { mode: BLK_MODE, startTime: blkTimeInput.current.value },
      ];
      dispatch(updateTheme(_themeMode, _customOptions));
    }
  };

  const onBlkTimeInputBlur = () => {
    if (blkTimeInput.current.value === '') {
      const _themeMode = CUSTOM_MODE;
      const _customOptions = [
        { mode: WHT_MODE, startTime: whtTimeInput.current.value },
        { mode: BLK_MODE, startTime: '18:00' },
      ];
      dispatch(updateTheme(_themeMode, _customOptions));
    }
  };

  const doSyncModeBtnClassNames = doSyncModeInput ? 'bg-green-500 blk:bg-green-500' : 'bg-gray-200 blk:bg-gray-700';
  const doSyncModeBtnInnerClassNames = doSyncModeInput ? 'translate-x-5' : 'translate-x-0';

  const doDeleteBtnClassNames = doDeleteOldNotesInTrash ? 'bg-green-500 blk:bg-green-500' : 'bg-gray-200 blk:bg-gray-700';
  const doDeleteBtnInnerClassNames = doDeleteOldNotesInTrash ? 'translate-x-5' : 'translate-x-0';

  let addedDTBtnClassNames = sortOn === ADDED_DT ? 'bg-green-100 border-green-200 blk:bg-green-700 blk:border-green-800' : 'border-gray-200 blk:border-gray-700';
  if (sortOn === UPDATED_DT) addedDTBtnClassNames += ' border-b-0';
  const addedDTBtnInnerClassNames = sortOn === ADDED_DT ? 'text-green-800 blk:text-green-100' : 'text-gray-600 blk:text-gray-300';
  const addedDTRBtnClassNames = sortOn === ADDED_DT ? 'bg-green-600 group-focus:ring-green-600 group-focus:ring-offset-green-100 blk:bg-green-400 blk:group-focus:ring-gray-800 blk:group-focus:ring-offset-green-700' : 'border border-gray-500 bg-white group-focus:ring-green-600 group-focus:ring-offset-white blk:border-gray-500 blk:bg-gray-900 blk:group-focus:ring-green-600 blk:group-focus:ring-offset-gray-900';
  const addedDTRBtnInnerClassNames = sortOn === ADDED_DT ? 'bg-white' : 'bg-white blk:bg-gray-900';

  const updatedDTBtnClassNames = sortOn === UPDATED_DT ? 'bg-green-100 border-green-200 blk:bg-green-700 blk:border-green-800' : 'border-t-0 border-gray-200 blk:border-gray-700';
  const updatedDTBtnInnerClassNames = sortOn === UPDATED_DT ? 'text-green-800 blk:text-green-100' : 'text-gray-600 blk:text-gray-300';
  const updatedDTRBtnClassNames = sortOn === UPDATED_DT ? 'bg-green-600 group-focus:ring-green-600 group-focus:ring-offset-green-100 blk:bg-green-400 blk:group-focus:ring-gray-800 blk:group-focus:ring-offset-green-700' : 'border border-gray-500 bg-white group-focus:ring-green-600 group-focus:ring-offset-white blk:border-gray-500 blk:bg-gray-900 blk:group-focus:ring-green-600 blk:group-focus:ring-offset-gray-900';
  const updatedDTRBtnInnerClassNames = sortOn === UPDATED_DT ? 'bg-white' : 'bg-white blk:bg-gray-900';

  let ascendingBtnClassNames = !doDescendingOrder ? 'bg-green-100 border-green-200 blk:bg-green-700 blk:border-green-800' : 'border-gray-200 blk:border-gray-700';
  if (doDescendingOrder) ascendingBtnClassNames += ' border-b-0';
  const ascendingBtnInnerClassNames = !doDescendingOrder ? 'text-green-800 blk:text-green-100' : 'text-gray-600 blk:text-gray-300';
  const ascendingRBtnClassNames = !doDescendingOrder ? 'bg-green-600 group-focus:ring-green-600 group-focus:ring-offset-green-100 blk:bg-green-400 blk:group-focus:ring-gray-800 blk:group-focus:ring-offset-green-700' : 'border border-gray-500 bg-white group-focus:ring-green-600 group-focus:ring-offset-white blk:border-gray-500 blk:bg-gray-900 blk:group-focus:ring-green-600 blk:group-focus:ring-offset-gray-900';
  const ascendingRBtnInnerClassNames = !doDescendingOrder ? 'bg-white' : 'bg-white blk:bg-gray-900';

  const descendingBtnClassNames = doDescendingOrder ? 'bg-green-100 border-green-200 blk:bg-green-700 blk:border-green-800' : 'border-t-0 border-gray-200 blk:border-gray-700';
  const descendingBtnInnerClassNames = doDescendingOrder ? 'text-green-800 blk:text-green-100' : 'text-gray-600 blk:text-gray-300';
  const descendingRBtnClassNames = doDescendingOrder ? 'bg-green-600 group-focus:ring-green-600 group-focus:ring-offset-green-100 blk:bg-green-400 blk:group-focus:ring-gray-800 blk:group-focus:ring-offset-green-700' : 'border border-gray-500 bg-white group-focus:ring-green-600 group-focus:ring-offset-white blk:border-gray-500 blk:bg-gray-900 blk:group-focus:ring-green-600 blk:group-focus:ring-offset-gray-900';
  const descendingRBtnInnerClassNames = doDescendingOrder ? 'bg-white' : 'bg-white blk:bg-gray-900';

  const doShowDate = noteDateShowingMode === NOTE_DATE_SHOWING_MODE_SHOW;
  const doShowDateBtnClassNames = doShowDate ? 'bg-green-500 blk:bg-green-500' : 'bg-gray-200 blk:bg-gray-700';
  const doShowDateBtnInnerClassNames = doShowDate ? 'translate-x-5' : 'translate-x-0';

  const twoDigitBtnClassNames = noteDateFormat === NOTE_DATE_FORMAT_SYSTEM ? 'border-gray-300 bg-white text-green-300 blk:border-gray-500 blk:bg-gray-900 blk:text-green-700' : 'cursor-pointer border-gray-400 text-green-500 blk:border-gray-400 blk:bg-gray-900 blk:text-green-500 blk:checked:bg-green-500';
  const twoDigitLabelClassNames = noteDateFormat === NOTE_DATE_FORMAT_SYSTEM ? 'text-gray-400 blk:text-gray-500' : 'cursor-pointer text-gray-500 blk:text-gray-400';

  const currentYearBtnClassNames = noteDateFormat === NOTE_DATE_FORMAT_SYSTEM ? 'border-gray-300 bg-white text-green-300 blk:border-gray-500 blk:bg-gray-900 blk:text-green-700' : 'cursor-pointer border-gray-400 text-green-500 blk:border-gray-400 blk:bg-gray-900 blk:text-green-500 blk:checked:bg-green-500';
  const currentYearLabelClassNames = noteDateFormat === NOTE_DATE_FORMAT_SYSTEM ? 'text-gray-400 blk:text-gray-500' : 'cursor-pointer text-gray-500 blk:text-gray-400';

  const doSectionBtnClassNames = doSectionNotesByMonth ? 'bg-green-500 blk:bg-green-500' : 'bg-gray-200 blk:bg-gray-700';
  const doSectionBtnInnerClassNames = doSectionNotesByMonth ? 'translate-x-5' : 'translate-x-0';

  const doMoreFontSizesBtnClassNames = doMoreEditorFontSizes ? 'bg-green-500 blk:bg-green-500' : 'bg-gray-200 blk:bg-gray-700';
  const doMoreFontSizesBtnInnerClassNames = doMoreEditorFontSizes ? 'translate-x-5' : 'translate-x-0';

  const themeDefaultBtnClassNames = !doUseLocalTheme ? 'text-gray-700 blk:text-gray-200' : 'text-gray-500 blk:text-gray-400';
  const themeLocalBtnClassNames = doUseLocalTheme ? 'text-gray-700 blk:text-gray-200' : 'text-gray-500 blk:text-gray-400';

  let whtBtnClassNames = themeMode === WHT_MODE ? 'bg-green-100 border-green-200 blk:bg-green-700 blk:border-green-800' : 'border-gray-200 blk:border-gray-700';
  if (themeMode === BLK_MODE) whtBtnClassNames += ' border-b-0';
  const whtBtnInnerClassNames = themeMode === WHT_MODE ? 'text-green-800 blk:text-green-100' : 'text-gray-600 blk:text-gray-300';
  const whtRBtnClassNames = themeMode === WHT_MODE ? 'bg-green-600 group-focus:ring-green-600 group-focus:ring-offset-green-100 blk:bg-green-400 blk:group-focus:ring-gray-800 blk:group-focus:ring-offset-green-700' : 'border border-gray-500 bg-white group-focus:ring-green-600 group-focus:ring-offset-white blk:border-gray-500 blk:bg-gray-900 blk:group-focus:ring-green-600 blk:group-focus:ring-offset-gray-900';
  const whtRBtnInnerClassNames = themeMode === WHT_MODE ? 'bg-white' : 'bg-white blk:bg-gray-900';

  let blkBtnClassNames = themeMode === BLK_MODE ? 'bg-green-100 border-green-200 blk:bg-green-700 blk:border-green-800' : 'border-t-0 border-gray-200 blk:border-gray-700';
  if (themeMode === SYSTEM_MODE) blkBtnClassNames += ' border-b-0';
  const blkBtnInnerClassNames = themeMode === BLK_MODE ? 'text-green-800 blk:text-green-100' : 'text-gray-600 blk:text-gray-300';
  const blkRBtnClassNames = themeMode === BLK_MODE ? 'bg-green-600 group-focus:ring-green-600 group-focus:ring-offset-green-100 blk:bg-green-400 blk:group-focus:ring-gray-800 blk:group-focus:ring-offset-green-700' : 'border border-gray-500 bg-white group-focus:ring-green-600 group-focus:ring-offset-white blk:border-gray-500 blk:bg-gray-900 blk:group-focus:ring-green-600 blk:group-focus:ring-offset-gray-900';
  const blkRBtnInnerClassNames = themeMode === BLK_MODE ? 'bg-white' : 'bg-white blk:bg-gray-900';

  let systemBtnClassNames = themeMode === SYSTEM_MODE ? 'bg-green-100 border-green-200 blk:bg-green-700 blk:border-green-800' : 'border-t-0 border-gray-200 blk:border-gray-700';
  if (themeMode === CUSTOM_MODE) systemBtnClassNames += ' border-b-0';
  const systemBtnInnerClassNames = themeMode === SYSTEM_MODE ? 'text-green-800 blk:text-green-100' : 'text-gray-600 blk:text-gray-300';
  const systemRBtnClassNames = themeMode === SYSTEM_MODE ? 'bg-green-600 group-focus:ring-green-600 group-focus:ring-offset-green-100 blk:bg-green-400 blk:group-focus:ring-gray-800 blk:group-focus:ring-offset-green-700' : 'border border-gray-500 bg-white group-focus:ring-green-600 group-focus:ring-offset-white blk:border-gray-500 blk:bg-gray-900 blk:group-focus:ring-green-600 blk:group-focus:ring-offset-gray-900';
  const systemRBtnInnerClassNames = themeMode === SYSTEM_MODE ? 'bg-white' : 'bg-white blk:bg-gray-900';

  const customBtnClassNames = themeMode === CUSTOM_MODE ? 'bg-green-100 border-green-200 blk:bg-green-700 blk:border-green-800' : 'border-t-0 border-gray-200 blk:border-gray-700';
  const customBtnInnerClassNames = themeMode === CUSTOM_MODE ? 'text-green-800 blk:text-green-100' : 'text-gray-600 blk:text-gray-300';
  const customRBtnClassNames = themeMode === CUSTOM_MODE ? 'bg-green-600 group-focus:ring-green-600 group-focus:ring-offset-green-100 blk:bg-green-400 blk:group-focus:ring-gray-800 blk:group-focus:ring-offset-green-700' : 'border border-gray-500 bg-white group-focus:ring-green-600 group-focus:ring-offset-white blk:border-gray-500 blk:bg-gray-900 blk:group-focus:ring-green-600 blk:group-focus:ring-offset-gray-900';
  const customRBtnInnerClassNames = themeMode === CUSTOM_MODE ? 'bg-white' : 'bg-white blk:bg-gray-900';

  const customTextClassNames = themeMode === CUSTOM_MODE ? 'text-green-700 blk:text-green-200' : 'text-gray-500 blk:text-gray-500';
  const customInputClassNames = themeMode === CUSTOM_MODE ? 'cursor-pointer border-gray-300 bg-white text-gray-600 focus:border-gray-500 focus:ring-gray-500 blk:border-green-200 blk:bg-green-700 blk:text-green-100 focus:border-green-200 blk:focus:ring-green-200' : 'border-gray-300 bg-white text-gray-400 blk:border-gray-600 blk:bg-gray-900 blk:text-gray-500';

  let whtTime, blkTime;
  for (const option of customOptions) {
    if (option.mode === WHT_MODE) whtTime = option.startTime;
    if (option.mode === BLK_MODE) blkTime = option.startTime;
  }

  return (
    <div className={tailwind('relative p-4 md:p-6')}>
      <div className={tailwind('border-b border-gray-200 blk:border-gray-700 md:hidden')}>
        <button onClick={onSidebarOpenBtnClick} className={tailwind('group pb-1 focus:outline-none')}>
          <span className={tailwind('rounded-xs text-sm text-gray-500 group-focus:ring-2 group-focus:ring-gray-400 blk:text-gray-400 blk:group-focus:ring-gray-500')}>{'<'} <span className={tailwind('group-hover:underline')}>Settings</span></span>
        </button>
        <h3 className={tailwind('pb-2 text-xl font-medium leading-none text-gray-800 blk:text-gray-100')}>Misc.</h3>
      </div>
      <div className={tailwind('mt-6 flex flex-col md:mt-0')}>
        <h4 className={tailwind('text-base font-medium leading-none text-gray-800 blk:text-gray-100')}>Appearance</h4>
        <p className={tailwind('mt-2.5 text-base leading-relaxed text-gray-500 blk:text-gray-400')}>Choose appearance to be <span className={tailwind('font-semibold blk:text-gray-300')}>Light</span>, <span className={tailwind('font-semibold blk:text-gray-300')}>Dark</span>, <span className={tailwind('font-semibold blk:text-gray-300')}>System</span> (uses your device&apos;s setting), or <span className={tailwind('font-semibold blk:text-gray-300')}>Custom</span> (schedules times to change appearance automatically). For Sync, your choosing is synced across your devices. For Device, you can choose and use the setting for this device only.</p>
        <div className={tailwind('mx-auto mt-2.5 w-full max-w-sm rounded-md bg-white shadow-xs blk:bg-gray-900')}>
          <div className={tailwind('relative flex justify-evenly')}>
            <button onClick={() => onDoUseLocalThemeBtnClick(false)} className={tailwind(`relative flex-shrink flex-grow rounded-tl-md border border-b-0 border-gray-300 bg-white py-4 text-center text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-green-600 blk:border-gray-700 blk:bg-gray-900 ${themeDefaultBtnClassNames}`)} type="button">
              Sync
              {!doUseLocalTheme && <div className={tailwind('absolute inset-x-0 bottom-0 h-0.5 bg-green-600 blk:bg-green-500')} />}
            </button>
            <button onClick={() => onDoUseLocalThemeBtnClick(true)} className={tailwind(`relative flex-shrink flex-grow rounded-tr-md border border-l-0 border-b-0 border-gray-300 bg-white py-4 text-center text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-green-600 blk:border-gray-700 blk:bg-gray-900 ${themeLocalBtnClassNames}`)} type="button">
              Device
              {doUseLocalTheme && <div className={tailwind('absolute inset-x-0 bottom-0 h-0.5 bg-green-600 blk:bg-green-500')} />}
            </button>
          </div>
          <button onClick={() => onThemeInputChange(WHT_MODE)} className={tailwind(`group flex w-full border p-4 focus:outline-none ${whtBtnClassNames}`)}>
            <div className={tailwind('flex h-5 items-center')}>
              <div className={tailwind(`flex h-4 w-4 items-center justify-center rounded-full group-focus:ring-2 group-focus:ring-offset-2 ${whtRBtnClassNames}`)}>
                <div className={tailwind(`h-1.5 w-1.5 rounded-full ${whtRBtnInnerClassNames}`)} />
              </div>
            </div>
            <p className={tailwind(`ml-3 text-sm font-medium leading-5 ${whtBtnInnerClassNames}`)}>Light</p>
          </button>
          <button onClick={() => onThemeInputChange(BLK_MODE)} className={tailwind(`group flex w-full border p-4 focus:outline-none ${blkBtnClassNames}`)}>
            <div className={tailwind('flex h-5 items-center')}>
              <div className={tailwind(`flex h-4 w-4 items-center justify-center rounded-full group-focus:ring-2 group-focus:ring-offset-2 ${blkRBtnClassNames}`)}>
                <div className={tailwind(`h-1.5 w-1.5 rounded-full ${blkRBtnInnerClassNames}`)} />
              </div>
            </div>
            <p className={tailwind(`ml-3 text-sm font-medium leading-5 ${blkBtnInnerClassNames}`)}>Dark</p>
          </button>
          <button onClick={() => onThemeInputChange(SYSTEM_MODE)} className={tailwind(`group flex w-full border p-4 focus:outline-none ${systemBtnClassNames}`)}>
            <div className={tailwind('flex h-5 items-center')}>
              <div className={tailwind(`flex h-4 w-4 items-center justify-center rounded-full group-focus:ring-2 group-focus:ring-offset-2 ${systemRBtnClassNames}`)}>
                <div className={tailwind(`h-1.5 w-1.5 rounded-full ${systemRBtnInnerClassNames}`)} />
              </div>
            </div>
            <p className={tailwind(`ml-3 text-sm font-medium leading-5 ${systemBtnInnerClassNames}`)}>System</p>
          </button>
          <button onClick={() => onThemeInputChange(CUSTOM_MODE)} className={tailwind(`group flex w-full rounded-bl-md rounded-br-md border p-4 focus:outline-none ${customBtnClassNames}`)}>
            <div className={tailwind('flex h-5 items-center')}>
              <div className={tailwind(`flex h-4 w-4 items-center justify-center rounded-full group-focus:ring-2 group-focus:ring-offset-2 ${customRBtnClassNames}`)}>
                <div className={tailwind(`h-1.5 w-1.5 rounded-full ${customRBtnInnerClassNames}`)} />
              </div>
            </div>
            <div className={tailwind('ml-3 flex flex-col')}>
              <p className={tailwind(`text-left text-sm font-medium leading-5 ${customBtnInnerClassNames}`)}>Custom</p>
              <div className={tailwind('mt-1.5 sm:flex sm:items-center sm:justify-start')}>
                <div className={tailwind('flex items-center justify-start')}>
                  <span className={tailwind(`block w-10 text-sm ${customTextClassNames}`)}>Light:</span>
                  <input ref={whtTimeInput} onChange={onTimeInputChange} onBlur={onWhtTimeInputBlur} type="time" className={tailwind(`ml-1 rounded-md border py-1 pl-1 pr-0.5 text-sm leading-5 ${customInputClassNames}`)} placeholder="HH:mm" value={whtTime} disabled={themeMode !== CUSTOM_MODE} pattern="[0-9]{2}:[0-9]{2}" />
                </div>
                <div className={tailwind('mt-2 flex items-center justify-start sm:ml-4 sm:mt-0')}>
                  <span className={tailwind(`block w-10 text-sm ${customTextClassNames}`)}>Dark:</span>
                  <input ref={blkTimeInput} onChange={onTimeInputChange} onBlur={onBlkTimeInputBlur} type="time" className={tailwind(`ml-1 rounded-md border py-1 pl-1 pr-0.5 text-sm leading-5 ${customInputClassNames}`)} placeholder="HH:mm" value={blkTime} disabled={themeMode !== CUSTOM_MODE} pattern="[0-9]{2}:[0-9]{2}" />
                </div>
              </div>
            </div>
          </button>
        </div>
      </div>
      <div className={tailwind('mt-10 flex flex-col')}>
        <h4 className={tailwind('text-base font-medium leading-none text-gray-800 blk:text-gray-100')}>List Order On</h4>
        <div className={tailwind('sm:flex sm:items-start sm:justify-between sm:space-x-4')}>
          <p className={tailwind('mt-2.5 flex-shrink flex-grow text-base leading-relaxed text-gray-500 blk:text-gray-400')}>Choose whether your notes are sorted on the <span className={tailwind('font-semibold')}>added date</span> or <span className={tailwind('font-semibold')}>updated date</span> when you browse your notes.</p>
          <div className={tailwind('mx-auto mt-2.5 w-full max-w-48 rounded-md bg-white shadow-xs blk:bg-gray-900 sm:mt-1 sm:w-48 sm:max-w-none sm:flex-shrink-0 sm:flex-grow-0')}>
            <button onClick={() => onSortOnInputChange(ADDED_DT)} className={tailwind(`group flex w-full rounded-tl-md rounded-tr-md border p-4 focus:outline-none ${addedDTBtnClassNames}`)}>
              <div className={tailwind('flex h-5 items-center')}>
                <div className={tailwind(`flex h-4 w-4 items-center justify-center rounded-full group-focus:ring-2 group-focus:ring-offset-2 ${addedDTRBtnClassNames}`)}>
                  <div className={tailwind(`h-1.5 w-1.5 rounded-full ${addedDTRBtnInnerClassNames}`)} />
                </div>
              </div>
              <p className={tailwind(`ml-3 text-sm font-medium leading-5 ${addedDTBtnInnerClassNames}`)}>Added Date</p>
            </button>
            <button onClick={() => onSortOnInputChange(UPDATED_DT)} className={tailwind(`group flex w-full rounded-bl-md rounded-br-md border p-4 focus:outline-none ${updatedDTBtnClassNames}`)}>
              <div className={tailwind('flex h-5 items-center')}>
                <div className={tailwind(`flex h-4 w-4 items-center justify-center rounded-full group-focus:ring-2 group-focus:ring-offset-2 ${updatedDTRBtnClassNames}`)}>
                  <div className={tailwind(`h-1.5 w-1.5 rounded-full ${updatedDTRBtnInnerClassNames}`)} />
                </div>
              </div>
              <p className={tailwind(`ml-3 text-sm font-medium leading-5 ${updatedDTBtnInnerClassNames}`)}>Updated Date</p>
            </button>
          </div>
        </div>
      </div>
      <div className={tailwind('mt-10 flex flex-col')}>
        <h4 className={tailwind('text-base font-medium leading-none text-gray-800 blk:text-gray-100')}>List Order Direction</h4>
        <div className={tailwind('sm:flex sm:items-start sm:justify-between sm:space-x-4')}>
          <p className={tailwind('mt-2.5 flex-shrink flex-grow text-base leading-relaxed text-gray-500 blk:text-gray-400')}>Choose whether your notes are sorted in <span className={tailwind('font-semibold blk:text-gray-300')}>ascending order</span> (i.e. notes you create first appear first) or <span className={tailwind('font-semibold blk:text-gray-300')}>descending order</span> (i.e. notes you create last appear first) when you browse your notes.</p>
          <div className={tailwind('mx-auto mt-2.5 w-full max-w-48 rounded-md bg-white shadow-xs blk:bg-gray-900 sm:mt-1 sm:w-48 sm:max-w-none sm:flex-shrink-0 sm:flex-grow-0')}>
            <button onClick={() => onDoDescendingInputChange('ascending')} className={tailwind(`group flex w-full rounded-tl-md rounded-tr-md border p-4 focus:outline-none ${ascendingBtnClassNames}`)}>
              <div className={tailwind('flex h-5 items-center')}>
                <div className={tailwind(`flex h-4 w-4 items-center justify-center rounded-full group-focus:ring-2 group-focus:ring-offset-2 ${ascendingRBtnClassNames}`)}>
                  <div className={tailwind(`h-1.5 w-1.5 rounded-full ${ascendingRBtnInnerClassNames}`)} />
                </div>
              </div>
              <p className={tailwind(`ml-3 text-sm font-medium leading-5 ${ascendingBtnInnerClassNames}`)}>Ascending order</p>
            </button>
            <button onClick={() => onDoDescendingInputChange('descending')} className={tailwind(`group flex w-full rounded-bl-md rounded-br-md border p-4 focus:outline-none ${descendingBtnClassNames}`)}>
              <div className={tailwind('flex h-5 items-center')}>
                <div className={tailwind(`flex h-4 w-4 items-center justify-center rounded-full group-focus:ring-2 group-focus:ring-offset-2 ${descendingRBtnClassNames}`)}>
                  <div className={tailwind(`h-1.5 w-1.5 rounded-full ${descendingRBtnInnerClassNames}`)} />
                </div>
              </div>
              <p className={tailwind(`ml-3 text-sm font-medium leading-5 ${descendingBtnInnerClassNames}`)}>Descending order</p>
            </button>
          </div>
        </div>
      </div>
      <div className={tailwind('mt-10 flex items-center justify-between space-x-4')}>
        <div className={tailwind('flex flex-col')}>
          <h4 className={tailwind('text-base font-medium leading-none text-gray-800 blk:text-gray-100')}>Note Date Showing</h4>
          <p className={tailwind('mt-2.5 text-base leading-relaxed text-gray-500 blk:text-gray-400')}>Show notes&apos; added date or updated date when you browse your notes. It will appear on the top right of each note.</p>
        </div>
        <span onClick={onDoShowDateBtnClick} role="checkbox" tabIndex={0} aria-checked="true" aria-labelledby="note-date-option-label" aria-describedby="note-date-option-description" className={tailwind(`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 blk:focus:ring-offset-gray-900 ${doShowDateBtnClassNames}`)}>
          <span aria-hidden="true" className={tailwind(`inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out blk:bg-gray-300 ${doShowDateBtnInnerClassNames}`)} />
        </span>
      </div>
      <div className={tailwind('mt-10')}>
        <h4 className={tailwind('text-base font-medium leading-none text-gray-800 blk:text-gray-100')}>Note Date Formats</h4>
        <p className={tailwind('mt-2.5 text-base leading-relaxed text-gray-500 blk:text-gray-400')}>Choose a date format for your note dates.</p>
        <div className={tailwind('mx-auto mt-2.5 w-full max-w-sm rounded-md border border-gray-200 bg-white p-5 shadow-xs blk:border-gray-700 blk:bg-gray-900')}>
          <div className={tailwind('flex items-center')}>
            <label className={tailwind('mr-2 block flex-shrink-0 flex-grow-0 text-base text-gray-500 blk:text-gray-400')}>Date format:</label>
            <button onClick={onDateFormatBtnClick} className={tailwind('relative block flex-shrink flex-grow rounded-md border border-gray-300 bg-white py-1.5 pl-3 pr-10 text-left text-base text-gray-500 focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600 blk:border-gray-600 blk:bg-gray-900 blk:text-gray-400 sm:text-sm')}>
              <span className={tailwind('block truncate')}>{NOTE_DATE_FORMAT_TEXTS[NOTE_DATE_FORMATS.indexOf(noteDateFormat)]}</span>
              <span className={tailwind('absolute inset-y-0 right-0 flex items-center pr-2')}>
                <svg className={tailwind('h-5 w-5 text-gray-400')} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path d="M10 3a.75.75 0 01.55.24l3.25 3.5a.75.75 0 11-1.1 1.02L10 4.852 7.3 7.76a.75.75 0 01-1.1-1.02l3.25-3.5A.75.75 0 0110 3zm-3.76 9.2a.75.75 0 011.06.04l2.7 2.908 2.7-2.908a.75.75 0 111.1 1.02l-3.25 3.5a.75.75 0 01-1.1 0l-3.25-3.5a.75.75 0 01.04-1.06z" fillRule="evenodd" clipRule="evenodd" />
                </svg>
              </span>
            </button>
          </div>
          <div className={tailwind('mt-3.5 flex items-center')}>
            <input onChange={onTwoDigitBtnClick} checked={noteDateFormat === NOTE_DATE_FORMAT_SYSTEM ? false : noteDateIsTwoDigit} className={tailwind(`h-4 w-4 rounded transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 blk:focus:ring-offset-gray-900 ${twoDigitBtnClassNames}`)} id="two-digit-btn" name="two-digit-btn" type="checkbox" disabled={noteDateFormat === NOTE_DATE_FORMAT_SYSTEM} />
            <label htmlFor="two-digit-btn" className={tailwind(`ml-2 block text-base ${twoDigitLabelClassNames}`)}>Show date and month in 2 digits</label>
          </div>
          <div className={tailwind('mt-3.5 flex items-center')}>
            <input onChange={onCurrentYearBtnClick} checked={noteDateFormat === NOTE_DATE_FORMAT_SYSTEM ? false : noteDateIsCurrentYearShown} className={tailwind(`h-4 w-4 rounded transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 blk:focus:ring-offset-gray-900 ${currentYearBtnClassNames}`)} id="current-year-btn" name="current-year-btn" type="checkbox" disabled={noteDateFormat === NOTE_DATE_FORMAT_SYSTEM} />
            <label htmlFor="current-year-btn" className={tailwind(`ml-2 block text-base ${currentYearLabelClassNames}`)}>Show current year</label>
          </div>
          <p className={tailwind('mt-4 text-sm text-gray-500 blk:text-gray-400')}>Example: {noteDateExample}</p>
        </div>
      </div>
      <div className={tailwind('mt-10 flex items-center justify-between space-x-4')}>
        <div className={tailwind('flex flex-col')}>
          <h4 className={tailwind('text-base font-medium leading-none text-gray-800 blk:text-gray-100')}>Section By Month</h4>
          <p className={tailwind('mt-2.5 text-base leading-relaxed text-gray-500 blk:text-gray-400')}>Section your notes by month and show the month at the top of each section.</p>
        </div>
        <span onClick={onDoSectionBtnClick} role="checkbox" tabIndex={0} aria-checked="true" aria-labelledby="section-month-option-label" aria-describedby="section-month-option-description" className={tailwind(`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 blk:focus:ring-offset-gray-900 ${doSectionBtnClassNames}`)}>
          <span aria-hidden="true" className={tailwind(`inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out blk:bg-gray-300 ${doSectionBtnInnerClassNames}`)} />
        </span>
      </div>
      <div className={tailwind('mt-10 flex items-center justify-between space-x-4')}>
        <div className={tailwind('flex flex-col')}>
          <h4 className={tailwind('text-base font-medium leading-none text-gray-800 blk:text-gray-100')}>More Font Sizes</h4>
          <p className={tailwind('mt-2.5 text-base leading-relaxed text-gray-500 blk:text-gray-400')}>Enable more font size options in the note editor.</p>
        </div>
        <span onClick={onDoMoreFontSizesBtnClick} role="checkbox" tabIndex={0} aria-checked="true" aria-labelledby="font-size-option-label" aria-describedby="font-size-option-description" className={tailwind(`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 blk:focus:ring-offset-gray-900 ${doMoreFontSizesBtnClassNames}`)}>
          <span aria-hidden="true" className={tailwind(`inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out blk:bg-gray-300 ${doMoreFontSizesBtnInnerClassNames}`)} />
        </span>
      </div>
      <div className={tailwind('mt-10 flex items-center justify-between space-x-4')}>
        <div className={tailwind('flex flex-col')}>
          <h4 className={tailwind('text-base font-medium leading-none text-gray-800 blk:text-gray-100')}>Sync mode</h4>
          <p className={tailwind('mt-2.5 text-base leading-relaxed text-gray-500 blk:text-gray-400')}>Enable sync mode on this device. All notes will be downloaded and stored locally. And new changes will be synced to the server.</p>
        </div>
        <span onClick={onDoSyncModeBtnClick} role="checkbox" tabIndex={0} aria-checked="true" aria-labelledby="sync-mode-option-label" aria-describedby="sync-mode-option-description" className={tailwind(`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 blk:focus:ring-offset-gray-900 ${doSyncModeBtnClassNames}`)}>
          <span aria-hidden="true" className={tailwind(`inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out blk:bg-gray-300 ${doSyncModeBtnInnerClassNames}`)} />
        </span>
      </div>
      <div className={tailwind('mt-10 mb-4 flex items-center justify-between space-x-4')}>
        <div className={tailwind('flex flex-col')}>
          <h4 className={tailwind('text-base font-medium leading-none text-gray-800 blk:text-gray-100')}>Auto Cleanup</h4>
          <p className={tailwind('mt-2.5 text-base leading-relaxed text-gray-500 blk:text-gray-400')}>Allow old removed notes in Trash to be automatically deleted after 45 days.</p>
        </div>
        <span onClick={onDoDeleteBtnClick} role="checkbox" tabIndex={0} aria-checked="true" aria-labelledby="auto-cleanup-option-label" aria-describedby="auto-cleanup-option-description" className={tailwind(`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 blk:focus:ring-offset-gray-900 ${doDeleteBtnClassNames}`)}>
          <span aria-hidden="true" className={tailwind(`inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out blk:bg-gray-300 ${doDeleteBtnInnerClassNames}`)} />
        </span>
      </div>
    </div>
  );
};

export default React.memo(SettingsPopupMisc);
