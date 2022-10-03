import React, { useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import {
  updateDoDeleteOldNotesInTrash, updateSortOn, updateDoDescendingOrder,
  updateNoteDateShowingMode, updateTheme,
} from '../actions';
import {
  ADDED_DT, UPDATED_DT, NOTE_DATE_SHOWING_MODE_HIDE,
  NOTE_DATE_SHOWING_MODE_SHOW_DEFAULT, WHT_MODE, BLK_MODE, SYSTEM_MODE, CUSTOM_MODE,
} from '../types/const';
import { getDoEnableExtraFeatures } from '../selectors';

import { useTailwind } from '.';

const SettingsPopupMisc = (props) => {

  const { onSidebarOpenBtnClick } = props;
  const doDeleteOldNotesInTrash = useSelector(state => state.settings.doDeleteOldNotesInTrash);
  const sortOn = useSelector(state => state.settings.sortOn);
  const doDescendingOrder = useSelector(state => state.settings.doDescendingOrder);
  const noteDateShowingMode = useSelector(state => state.settings.noteDateShowingMode);
  const themeMode = useSelector(state => state.localSettings.themeMode);
  const customOptions = useSelector(
    state => state.localSettings.themeCustomOptions
  );
  const doEnableExtraFeatures = useSelector(state => getDoEnableExtraFeatures(state));
  const whtTimeInput = useRef(null);
  const blkTimeInput = useRef(null);
  const dispatch = useDispatch();
  const tailwind = useTailwind();

  const onDoDeleteBtnClick = () => {
    dispatch(updateDoDeleteOldNotesInTrash(!doDeleteOldNotesInTrash));
  };

  const onSortOnInputChange = (e) => {
    const sortOn = e.target.value;
    dispatch(updateSortOn(sortOn));
  };

  const onDoDescendingInputChange = (e) => {
    const value = e.target.value;

    let doDescend;
    if (value === 'ascending') doDescend = false;
    else if (value === 'descending') doDescend = true;
    else throw new Error(`Invalid value: ${value}`);

    dispatch(updateDoDescendingOrder(doDescend));
  };

  const onDoShowDateBtnClick = () => {
    if (noteDateShowingMode === NOTE_DATE_SHOWING_MODE_HIDE) {
      dispatch(updateNoteDateShowingMode(NOTE_DATE_SHOWING_MODE_SHOW_DEFAULT));
    } else if (noteDateShowingMode === NOTE_DATE_SHOWING_MODE_SHOW_DEFAULT) {
      dispatch(updateNoteDateShowingMode(NOTE_DATE_SHOWING_MODE_HIDE));
    } else {
      console.log('Invalid noteDateShowingMode: ', noteDateShowingMode);
    }
  };

  const onThemeInputChange = (e) => {
    const value = e.target.value;

    const _themeMode = parseInt(value, 10);
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

  const doDeleteBtnClassNames = doDeleteOldNotesInTrash ? 'bg-green-500 blk:bg-green-500' : 'bg-gray-200 blk:bg-gray-700';
  const doDeleteBtnInnerClassNames = doDeleteOldNotesInTrash ? 'translate-x-5' : 'translate-x-0';

  const addedDTBtnClassNames = sortOn === ADDED_DT ? 'bg-green-100 border-green-200 blk:bg-green-700 blk:border-green-800' : 'border-gray-200 blk:border-gray-700';
  const addedDTBtnInnerClassNames = sortOn === ADDED_DT ? 'text-green-800 blk:text-green-100' : 'text-gray-600 blk:text-gray-300';
  const addedDTRadioClassNames = sortOn === ADDED_DT ? 'focus:ring-offset-green-100 blk:focus:ring-gray-800 blk:focus:ring-offset-green-700' : 'blk:focus:ring-offset-gray-900';

  const updatedDTBtnClassNames = sortOn === UPDATED_DT ? 'bg-green-100 border-green-200 blk:bg-green-700 blk:border-green-800' : 'border-gray-200 blk:border-gray-700';
  const updatedDTBtnInnerClassNames = sortOn === UPDATED_DT ? 'text-green-800 blk:text-green-100' : 'text-gray-600 blk:text-gray-300';
  const updatedDTRadioClassNames = sortOn === UPDATED_DT ? 'focus:ring-offset-green-100 blk:focus:ring-gray-800 blk:focus:ring-offset-green-700' : 'blk:focus:ring-offset-gray-900';

  const ascendingBtnClassNames = !doDescendingOrder ? 'bg-green-100 border-green-200 blk:bg-green-700 blk:border-green-800' : 'border-gray-200 blk:border-gray-700';
  const ascendingBtnInnerClassNames = !doDescendingOrder ? 'text-green-800 blk:text-green-100' : 'text-gray-600 blk:text-gray-300';
  const ascendingRadioClassNames = !doDescendingOrder ? 'focus:ring-offset-green-100 blk:focus:ring-gray-800 blk:focus:ring-offset-green-700' : 'blk:focus:ring-offset-gray-900';

  const descendingBtnClassNames = doDescendingOrder ? 'bg-green-100 border-green-200 blk:bg-green-700 blk:border-green-800' : 'border-gray-200 blk:border-gray-700';
  const descendingBtnInnerClassNames = doDescendingOrder ? 'text-green-800 blk:text-green-100' : 'text-gray-600 blk:text-gray-300';
  const descendingRadioClassNames = doDescendingOrder ? 'focus:ring-offset-green-100 blk:focus:ring-gray-800 blk:focus:ring-offset-green-700' : 'blk:focus:ring-offset-gray-900';

  const doShowDate = noteDateShowingMode === NOTE_DATE_SHOWING_MODE_SHOW_DEFAULT;
  const doShowDateBtnClassNames = doShowDate ? 'bg-green-500 blk:bg-green-500' : 'bg-gray-200 blk:bg-gray-700';
  const doShowDateBtnInnerClassNames = doShowDate ? 'translate-x-5' : 'translate-x-0';

  const whtBtnClassNames = themeMode === WHT_MODE ? 'bg-green-100 border-green-200 blk:bg-green-700 blk:border-green-800' : 'border-gray-200 blk:border-gray-700';
  const whtBtnInnerClassNames = themeMode === WHT_MODE ? 'text-green-800 blk:text-green-100' : 'text-gray-600 blk:text-gray-300';
  const whtRadioClassNames = themeMode === WHT_MODE ? 'focus:ring-offset-green-100 blk:focus:ring-gray-800 blk:focus:ring-offset-green-700' : 'blk:focus:ring-offset-gray-900';
  const blkBtnClassNames = themeMode === BLK_MODE ? 'bg-green-100 border-green-200 blk:bg-green-700 blk:border-green-800' : 'border-gray-200 blk:border-gray-700';
  const blkBtnInnerClassNames = themeMode === BLK_MODE ? 'text-green-800 blk:text-green-100' : 'text-gray-600 blk:text-gray-300';
  const blkRadioClassNames = themeMode === BLK_MODE ? 'focus:ring-offset-green-100 blk:focus:ring-gray-800 blk:focus:ring-offset-green-700' : 'blk:focus:ring-offset-gray-900';
  const systemBtnClassNames = themeMode === SYSTEM_MODE ? 'bg-green-100 border-green-200 blk:bg-green-700 blk:border-green-800' : 'border-gray-200 blk:border-gray-700';
  const systemBtnInnerClassNames = themeMode === SYSTEM_MODE ? 'text-green-800 blk:text-green-100' : 'text-gray-600 blk:text-gray-300';
  const systemRadioClassNames = themeMode === SYSTEM_MODE ? 'focus:ring-offset-green-100 blk:focus:ring-gray-800 blk:focus:ring-offset-green-700' : 'blk:focus:ring-offset-gray-900';
  const customBtnClassNames = themeMode === CUSTOM_MODE ? 'bg-green-100 border-green-200 blk:bg-green-700 blk:border-green-800' : 'border-gray-200 blk:border-gray-700';
  const customBtnInnerClassNames = themeMode === CUSTOM_MODE ? 'text-green-800 blk:text-green-100' : 'text-gray-600 blk:text-gray-300';
  const customRadioClassNames = themeMode === CUSTOM_MODE ? 'focus:ring-offset-green-100 blk:focus:ring-gray-800 blk:focus:ring-offset-green-700' : 'blk:focus:ring-offset-gray-900';

  const customTextClassNames = themeMode === CUSTOM_MODE ? 'text-green-700 blk:text-green-200' : 'text-gray-500 blk:text-gray-500';
  const customInputClassNames = themeMode === CUSTOM_MODE ? 'border-gray-300 bg-white text-gray-600 focus:border-gray-500 focus:ring-gray-500 blk:border-green-200 blk:bg-green-700 blk:text-green-100 focus:border-green-200 blk:focus:ring-green-200' : 'border-gray-300 bg-white text-gray-400 blk:border-gray-600 blk:bg-gray-900 blk:text-gray-500';

  let whtTime, blkTime;
  for (const option of customOptions) {
    if (option.mode === WHT_MODE) whtTime = option.startTime;
    if (option.mode === BLK_MODE) blkTime = option.startTime;
  }

  return (
    <div className={tailwind('relative p-4 md:p-6')}>
      <div className={tailwind('border-b border-gray-200 blk:border-gray-700 md:hidden')}>
        <button onClick={onSidebarOpenBtnClick} className={tailwind('group pb-1 focus:outline-none')}>
          <span className={tailwind('rounded-sm text-sm text-gray-500 group-focus:ring-2 group-focus:ring-gray-400 blk:text-gray-400 blk:group-focus:ring-gray-500')}>{'<'} <span className={tailwind('group-hover:underline')}>Settings</span></span>
        </button>
        <h3 className={tailwind('pb-2 text-xl font-medium leading-none text-gray-800 blk:text-gray-100')}>Misc.</h3>
      </div>
      {doEnableExtraFeatures && <div className={tailwind('mt-6 flex flex-col md:mt-0')}>
        <h4 className={tailwind('text-base font-medium leading-none text-gray-800 blk:text-gray-100')}>Appearance</h4>
        <p className={tailwind('mt-2.5 text-base leading-relaxed text-gray-500 blk:text-gray-400')}>Choose appearance to be <span className={tailwind('font-semibold blk:text-gray-300')}>Light</span>, <span className={tailwind('font-semibold blk:text-gray-300')}>Dark</span>, <span className={tailwind('font-semibold blk:text-gray-300')}>System</span> (uses your device's setting), or <span className={tailwind('font-semibold blk:text-gray-300')}>Custom</span> (schedule times to change appearance automatically). This setting is not synced so you can have a different appearance for each of your devices.</p>
        <div className={tailwind('mx-auto mt-2.5 w-full max-w-sm -space-y-px rounded-md bg-white shadow-sm blk:bg-gray-900')}>
          <div className={tailwind(`relative flex rounded-tl-md rounded-tr-md border p-4 ${whtBtnClassNames}`)}>
            <div className={tailwind('flex h-5 items-center')}>
              <input onChange={onThemeInputChange} id="theme-mode-option-1" name="theme-mode-option-1" type="radio" className={tailwind(`h-4 w-4 cursor-pointer bg-white text-green-600 transition duration-150 ease-in-out focus:ring-2 focus:ring-green-600 focus:ring-offset-2 blk:bg-gray-900 blk:text-green-400 ${whtRadioClassNames}`)} checked={themeMode === WHT_MODE} value={WHT_MODE} />
            </div>
            <label htmlFor="theme-mode-option-1" className={tailwind('ml-3 flex cursor-pointer flex-col')}>
              <span className={tailwind(`block text-sm font-medium leading-5 ${whtBtnInnerClassNames}`)}>Light</span>
            </label>
          </div>
          <div className={tailwind(`relative flex border p-4 ${blkBtnClassNames}`)}>
            <div className={tailwind('flex h-5 items-center')}>
              <input onChange={onThemeInputChange} id="theme-mode-option-2" name="theme-mode-option-2" type="radio" className={tailwind(`h-4 w-4 cursor-pointer bg-white text-green-600 transition duration-150 ease-in-out focus:ring-2 focus:ring-green-600 focus:ring-offset-2 blk:bg-gray-900 blk:text-green-400 ${blkRadioClassNames}`)} checked={themeMode === BLK_MODE} value={BLK_MODE} />
            </div>
            <label htmlFor="theme-mode-option-2" className={tailwind('ml-3 flex cursor-pointer flex-col')}>
              <span className={tailwind(`block text-sm font-medium leading-5 ${blkBtnInnerClassNames}`)}>Dark</span>
            </label>
          </div>
          <div className={tailwind(`relative flex border p-4 ${systemBtnClassNames}`)}>
            <div className={tailwind('flex h-5 items-center')}>
              <input onChange={onThemeInputChange} id="theme-mode-option-3" name="theme-mode-option-3" type="radio" className={tailwind(`h-4 w-4 cursor-pointer bg-white text-green-600 transition duration-150 ease-in-out focus:ring-2 focus:ring-green-600 focus:ring-offset-2 blk:bg-gray-900 blk:text-green-400 ${systemRadioClassNames}`)} checked={themeMode === SYSTEM_MODE} value={SYSTEM_MODE} />
            </div>
            <label htmlFor="theme-mode-option-3" className={tailwind('ml-3 flex cursor-pointer flex-col')}>
              <span className={tailwind(`block text-sm font-medium leading-5 ${systemBtnInnerClassNames}`)}>System</span>
            </label>
          </div>
          <div className={tailwind(`relative flex rounded-bl-md rounded-br-md border p-4 ${customBtnClassNames}`)}>
            <div className={tailwind('flex h-5 items-center')}>
              <input onChange={onThemeInputChange} id="theme-mode-option-4" name="theme-mode-option-4" type="radio" className={tailwind(`h-4 w-4 cursor-pointer bg-white text-green-600 transition duration-150 ease-in-out focus:ring-2 focus:ring-green-600 focus:ring-offset-2 blk:bg-gray-900 blk:text-green-400 ${customRadioClassNames}`)} checked={themeMode === CUSTOM_MODE} value={CUSTOM_MODE} />
            </div>
            <label htmlFor="theme-mode-option-4" className={tailwind('ml-3 flex cursor-pointer flex-col')}>
              <span className={tailwind(`block text-sm font-medium leading-5 ${customBtnInnerClassNames}`)}>Custom</span>
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
            </label>
          </div>
        </div>
      </div>}
      <div className={tailwind(`flex flex-col ${doEnableExtraFeatures ? 'mt-10' : 'mt-6 md:mt-0'}`)}>
        <h4 className={tailwind('text-base font-medium leading-none text-gray-800 blk:text-gray-100')}>List Order On</h4>
        <div className={tailwind('sm:flex sm:items-start sm:justify-between sm:space-x-4')}>
          <p className={tailwind('mt-2.5 flex-shrink flex-grow text-base leading-relaxed text-gray-500 blk:text-gray-400')}>Choose whether your notes are sorted on <span className={tailwind('font-semibold')}>added date</span> or <span className={tailwind('font-semibold')}>updated date</span> when you browse your notes.</p>
          <div className={tailwind('mx-auto mt-2.5 w-full max-w-48 -space-y-px rounded-md bg-white shadow-sm blk:bg-gray-900 sm:mt-1 sm:w-48 sm:max-w-none sm:flex-shrink-0 sm:flex-grow-0')}>
            <div className={tailwind(`relative flex rounded-tl-md rounded-tr-md border p-4 ${addedDTBtnClassNames}`)}>
              <div className={tailwind('flex h-5 items-center')}>
                <input onChange={onSortOnInputChange} id="list-order-on-option-1" name="list-order-on-option-1" type="radio" className={tailwind(`h-4 w-4 cursor-pointer bg-white text-green-600 transition duration-150 ease-in-out focus:ring-2 focus:ring-green-600 focus:ring-offset-2 blk:bg-gray-900 blk:text-green-400 ${addedDTRadioClassNames}`)} checked={sortOn === ADDED_DT} value={ADDED_DT} />
              </div>
              <label htmlFor="list-order-on-option-1" className={tailwind('ml-3 flex cursor-pointer flex-col')}>
                <span className={tailwind(`block text-sm font-medium leading-5 ${addedDTBtnInnerClassNames}`)}>Added Date</span>
              </label>
            </div>
            <div className={tailwind(`relative flex rounded-bl-md rounded-br-md border p-4 ${updatedDTBtnClassNames}`)}>
              <div className={tailwind('flex h-5 items-center')}>
                <input onChange={onSortOnInputChange} id="list-order-on-option-2" name="list-order-on-option-2" type="radio" className={tailwind(`h-4 w-4 cursor-pointer bg-white text-green-600 transition duration-150 ease-in-out focus:ring-2 focus:ring-green-600 focus:ring-offset-2 blk:bg-gray-900 blk:text-green-400 ${updatedDTRadioClassNames}`)} checked={sortOn === UPDATED_DT} value={UPDATED_DT} />
              </div>
              <label htmlFor="list-order-on-option-2" className={tailwind('ml-3 flex cursor-pointer flex-col')}>
                <span className={tailwind(`block text-sm font-medium leading-5 ${updatedDTBtnInnerClassNames}`)}>Updated Date</span>
              </label>
            </div>
          </div>
        </div>
      </div>
      <div className={tailwind('mt-10 flex flex-col')}>
        <h4 className={tailwind('text-base font-medium leading-none text-gray-800 blk:text-gray-100')}>List Order Direction</h4>
        <div className={tailwind('sm:flex sm:items-start sm:justify-between sm:space-x-4')}>
          <p className={tailwind('mt-2.5 flex-shrink flex-grow text-base leading-relaxed text-gray-500 blk:text-gray-400')}>Choose whether your notes are sorted in <span className={tailwind('font-semibold blk:text-gray-300')}>ascending order</span> (i.e. notes you create first appear first) or <span className={tailwind('font-semibold blk:text-gray-300')}>descending order</span> (i.e. notes you create last appear first) when you browse your notes.</p>
          <div className={tailwind('mx-auto mt-2.5 w-full max-w-48 -space-y-px rounded-md bg-white shadow-sm blk:bg-gray-900 sm:mt-1 sm:w-48 sm:max-w-none sm:flex-shrink-0 sm:flex-grow-0')}>
            <div className={tailwind(`relative flex rounded-tl-md rounded-tr-md border p-4 ${ascendingBtnClassNames}`)}>
              <div className={tailwind('flex h-5 items-center')}>
                <input onChange={onDoDescendingInputChange} id="list-order-direction-option-1" name="list-order-direction-option-1" type="radio" className={tailwind(`h-4 w-4 cursor-pointer bg-white text-green-600 transition duration-150 ease-in-out focus:ring-2 focus:ring-green-600 focus:ring-offset-2 blk:bg-gray-900 blk:text-green-400 ${ascendingRadioClassNames}`)} checked={!doDescendingOrder} value="ascending" />
              </div>
              <label htmlFor="list-order-direction-option-1" className={tailwind('ml-3 flex cursor-pointer flex-col')}>
                <span className={tailwind(`block text-sm font-medium leading-5 ${ascendingBtnInnerClassNames}`)}>Ascending order</span>
              </label>
            </div>
            <div className={tailwind(`relative flex rounded-bl-md rounded-br-md border p-4 ${descendingBtnClassNames}`)}>
              <div className={tailwind('flex h-5 items-center')}>
                <input onChange={onDoDescendingInputChange} id="list-order-direction-option-2" name="list-order-direction-option-2" type="radio" className={tailwind(`h-4 w-4 cursor-pointer bg-white text-green-600 transition duration-150 ease-in-out focus:ring-2 focus:ring-green-600 focus:ring-offset-2 blk:bg-gray-900 blk:text-green-400 ${descendingRadioClassNames}`)} checked={doDescendingOrder} value="descending" />
              </div>
              <label htmlFor="list-order-direction-option-2" className={tailwind('ml-3 flex cursor-pointer flex-col')}>
                <span className={tailwind(`block text-sm font-medium leading-5 ${descendingBtnInnerClassNames}`)}>Descending order</span>
              </label>
            </div>
          </div>
        </div>
      </div>
      <div className={tailwind('mt-10 flex items-center justify-between space-x-4')}>
        <div className={tailwind('flex flex-col')}>
          <h4 className={tailwind('text-base font-medium leading-none text-gray-800 blk:text-gray-100')}>Note Date Showing</h4>
          <p className={tailwind('mt-2.5 text-base leading-relaxed text-gray-500 blk:text-gray-400')}>Show note's added date or updated date when you browse your notes. It will appear on the top right of each note.</p>
        </div>
        <span onClick={onDoShowDateBtnClick} role="checkbox" tabIndex={0} aria-checked="true" aria-labelledby="note-date-option-label" aria-describedby="note-date-option-description" className={tailwind(`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 blk:focus:ring-offset-gray-900 ${doShowDateBtnClassNames}`)}>
          <span aria-hidden="true" className={tailwind(`inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out blk:bg-gray-300 ${doShowDateBtnInnerClassNames}`)} />
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
