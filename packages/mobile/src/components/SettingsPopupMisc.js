import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, Switch, Platform } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import Svg, { Path } from 'react-native-svg';

import {
  updateDoDeleteOldNotesInTrash, updateSortOn, updateDoDescendingOrder,
  updateNoteDateShowingMode, updateNoteDateFormat, updateDoSectionNotesByMonth,
  updateDoMoreEditorFontSizes, updateDoUseLocalTheme, updateTheme,
  updateUpdatingThemeMode, updatePopup,
} from '../actions';
import {
  DATE_FORMAT_MENU_POPUP, ADDED_DT, UPDATED_DT, NOTE_DATE_SHOWING_MODE_HIDE,
  NOTE_DATE_SHOWING_MODE_SHOW, NOTE_DATE_FORMATS, NOTE_DATE_FORMAT_TEXTS,
  NOTE_DATE_FORMAT_SYSTEM, WHT_MODE, BLK_MODE, SYSTEM_MODE, CUSTOM_MODE,
  TIME_PICK_POPUP,
} from '../types/const';
import {
  getRawThemeMode, getRawThemeCustomOptions, getThemeMode, getNoteDateExample,
} from '../selectors';
import { getFormattedTime } from '../utils';

import { useTailwind } from '.';

const SettingsPopupMisc = (props) => {

  const { onSidebarOpenBtnClick } = props;
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
  const is24HFormat = useSelector(state => state.window.is24HFormat);
  const isUserSignedIn = useSelector(state => state.user.isUserSignedIn);
  const derivedThemeMode = useSelector(state => getThemeMode(state));
  const dateFormatBtn = useRef(null);
  const whtTimeBtn = useRef(null);
  const blkTimeBtn = useRef(null);
  const dispatch = useDispatch();
  const tailwind = useTailwind();

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

  const onDateFormatBtnClick = () => {
    dateFormatBtn.current.measure((_fx, _fy, width, height, x, y) => {
      const rect = {
        x, y, width, height, top: y, bottom: y + height, left: x, right: x + width,
      };
      dispatch(updatePopup(DATE_FORMAT_MENU_POPUP, true, rect));
    });
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
    const _customOptions = customOptions;
    dispatch(updateTheme(_themeMode, _customOptions));
  };

  const onWhtTimeBtnClick = () => {
    whtTimeBtn.current.measure((_fx, _fy, width, height, x, y) => {
      dispatch(updateUpdatingThemeMode(WHT_MODE));

      const rect = {
        x, y, width, height, top: y, right: x + width, bottom: y + height, left: x,
      };
      dispatch(updatePopup(TIME_PICK_POPUP, true, rect));
    });
  };

  const onBlkTimeBtnClick = () => {
    blkTimeBtn.current.measure((_fx, _fy, width, height, x, y) => {
      dispatch(updateUpdatingThemeMode(BLK_MODE));

      const rect = {
        x, y, width, height, top: y, right: x + width, bottom: y + height, left: x,
      };
      dispatch(updatePopup(TIME_PICK_POPUP, true, rect));
    });
  };

  const isSystemShown = (
    Platform.OS !== 'android' || (Platform.OS === 'android' && Platform.Version >= 29)
  );

  let doTwoDigitCheck = noteDateIsTwoDigit;
  if (noteDateFormat === NOTE_DATE_FORMAT_SYSTEM) doTwoDigitCheck = false;

  let doCurrentYearCheck = noteDateIsCurrentYearShown;
  if (noteDateFormat === NOTE_DATE_FORMAT_SYSTEM) doCurrentYearCheck = false;

  const switchThumbColorOn = 'rgb(34, 197, 94)';
  const switchThumbColorOff = 'rgb(243, 244, 246)';
  const switchTrackColorOn = Platform.OS === 'android' ? 'rgb(187, 247, 208)' : 'rgb(34, 197, 94)';
  const switchTrackColorOff = 'rgb(156, 163, 175)';
  const switchIosTrackColorOff = derivedThemeMode === BLK_MODE ? 'rgb(55, 65, 81)' : 'rgb(243, 244, 246)';

  let addedDTBtnClassNames = sortOn === ADDED_DT ? 'bg-green-100 border-green-200 blk:bg-green-700 blk:border-green-800' : 'border-gray-200 blk:border-gray-700';
  if (sortOn === UPDATED_DT) addedDTBtnClassNames += ' border-b-0';
  const addedDTBtnInnerClassNames = sortOn === ADDED_DT ? 'text-green-800 blk:text-green-100' : 'text-gray-600 blk:text-gray-300';
  const addedDTRBtnClassNames = sortOn === ADDED_DT ? 'bg-green-600 blk:bg-green-400' : 'border border-gray-500 bg-white blk:border-gray-500 blk:bg-gray-900';
  const addedDTRBtnInnerClassNames = sortOn === ADDED_DT ? 'bg-white' : 'bg-white blk:bg-gray-900';

  const updatedDTBtnClassNames = sortOn === UPDATED_DT ? 'bg-green-100 border-green-200 blk:bg-green-700 blk:border-green-800' : 'border-t-0 border-gray-200 blk:border-gray-700';
  const updatedDTBtnInnerClassNames = sortOn === UPDATED_DT ? 'text-green-800 blk:text-green-100' : 'text-gray-600 blk:text-gray-300';
  const updatedDTRBtnClassNames = sortOn === UPDATED_DT ? 'bg-green-600 blk:bg-green-400' : 'border border-gray-500 bg-white blk:border-gray-500 blk:bg-gray-900';
  const updatedDTRBtnInnerClassNames = sortOn === UPDATED_DT ? 'bg-white' : 'bg-white blk:bg-gray-900';

  let ascendingBtnClassNames = !doDescendingOrder ? 'bg-green-100 border-green-200 blk:bg-green-700 blk:border-green-800' : 'border-gray-200 blk:border-gray-700';
  if (doDescendingOrder) ascendingBtnClassNames += ' border-b-0';
  const ascendingBtnInnerClassNames = !doDescendingOrder ? 'text-green-800 blk:text-green-100' : 'text-gray-600 blk:text-gray-300';
  const ascendingRBtnClassNames = !doDescendingOrder ? 'bg-green-600 blk:bg-green-400' : 'border border-gray-500 bg-white blk:border-gray-500 blk:bg-gray-900';
  const ascendingRBtnInnerClassNames = !doDescendingOrder ? 'bg-white' : 'bg-white blk:bg-gray-900';

  const descendingBtnClassNames = doDescendingOrder ? 'bg-green-100 border-green-200 blk:bg-green-700 blk:border-green-800' : 'border-t-0 border-gray-200 blk:border-gray-700';
  const descendingBtnInnerClassNames = doDescendingOrder ? 'text-green-800 blk:text-green-100' : 'text-gray-600 blk:text-gray-300';
  const descendingRBtnClassNames = doDescendingOrder ? 'bg-green-600 blk:bg-green-400' : 'border border-gray-500 bg-white blk:border-gray-500 blk:bg-gray-900';
  const descendingRBtnInnerClassNames = doDescendingOrder ? 'bg-white' : 'bg-white blk:bg-gray-900';

  const doShowDate = noteDateShowingMode === NOTE_DATE_SHOWING_MODE_SHOW;

  let twoDigitBtnClassNames;
  if (noteDateFormat === NOTE_DATE_FORMAT_SYSTEM) {
    if (doTwoDigitCheck) twoDigitBtnClassNames = 'border-green-300 bg-green-300 blk:border-green-700 blk:bg-green-700';
    else twoDigitBtnClassNames = 'border-gray-300 bg-white blk:border-gray-500 blk:bg-gray-900';
  } else {
    if (doTwoDigitCheck) twoDigitBtnClassNames = 'border-green-500 bg-green-500 blk:border-green-500 blk:bg-green-500';
    else twoDigitBtnClassNames = 'border-gray-400 bg-white blk:border-gray-400 blk:bg-gray-900';
  }
  const twoDigitLabelClassNames = noteDateFormat === NOTE_DATE_FORMAT_SYSTEM ? 'text-gray-400 blk:text-gray-500' : 'text-gray-500 blk:text-gray-400';

  let currentYearBtnClassNames;
  if (noteDateFormat === NOTE_DATE_FORMAT_SYSTEM) {
    if (doCurrentYearCheck) currentYearBtnClassNames = 'border-green-300 bg-green-300 blk:border-green-700 blk:bg-green-700';
    else currentYearBtnClassNames = 'border-gray-300 bg-white blk:border-gray-500 blk:bg-gray-900';
  } else {
    if (doCurrentYearCheck) currentYearBtnClassNames = 'border-green-500 bg-green-500 blk:border-green-500 blk:bg-green-500';
    else currentYearBtnClassNames = 'border-gray-400 bg-white blk:border-gray-400 blk:bg-gray-900';
  }
  const currentYearLabelClassNames = noteDateFormat === NOTE_DATE_FORMAT_SYSTEM ? 'text-gray-400 blk:text-gray-500' : 'text-gray-500 blk:text-gray-400';

  const themeDefaultBtnClassNames = !doUseLocalTheme ? 'text-gray-700 blk:text-gray-200' : 'text-gray-500 blk:text-gray-400';
  const themeLocalBtnClassNames = doUseLocalTheme ? 'text-gray-700 blk:text-gray-200' : 'text-gray-500 blk:text-gray-400';

  let whtBtnClassNames = themeMode === WHT_MODE ? 'bg-green-100 border-green-200 blk:bg-green-700 blk:border-green-800' : 'border-gray-200 blk:border-gray-700';
  if (themeMode === BLK_MODE) whtBtnClassNames += ' border-b-0';
  const whtBtnInnerClassNames = themeMode === WHT_MODE ? 'text-green-800 blk:text-green-100' : 'text-gray-600 blk:text-gray-300';
  const whtRBtnClassNames = themeMode === WHT_MODE ? 'bg-green-600 blk:bg-green-400' : 'border border-gray-500 bg-white blk:border-gray-500 blk:bg-gray-900';
  const whtRBtnInnerClassNames = themeMode === WHT_MODE ? 'bg-white' : 'bg-white blk:bg-gray-900';

  let blkBtnClassNames = themeMode === BLK_MODE ? 'bg-green-100 border-green-200 blk:bg-green-700 blk:border-green-800' : 'border-t-0 border-gray-200 blk:border-gray-700';
  if (isSystemShown && themeMode === SYSTEM_MODE) blkBtnClassNames += ' border-b-0';
  const blkBtnInnerClassNames = themeMode === BLK_MODE ? 'text-green-800 blk:text-green-100' : 'text-gray-600 blk:text-gray-300';
  const blkRBtnClassNames = themeMode === BLK_MODE ? 'bg-green-600 blk:bg-green-400' : 'border border-gray-500 bg-white blk:border-gray-500 blk:bg-gray-900';
  const blkRBtnInnerClassNames = themeMode === BLK_MODE ? 'bg-white' : 'bg-white blk:bg-gray-900';

  let systemBtnClassNames = themeMode === SYSTEM_MODE ? 'bg-green-100 border-green-200 blk:bg-green-700 blk:border-green-800' : 'border-t-0 border-gray-200 blk:border-gray-700';
  if (themeMode === CUSTOM_MODE) systemBtnClassNames += ' border-b-0';
  const systemBtnInnerClassNames = themeMode === SYSTEM_MODE ? 'text-green-800 blk:text-green-100' : 'text-gray-600 blk:text-gray-300';
  const systemRBtnClassNames = themeMode === SYSTEM_MODE ? 'bg-green-600 blk:bg-green-400' : 'border border-gray-500 bg-white blk:border-gray-500 blk:bg-gray-900';
  const systemRBtnInnerClassNames = themeMode === SYSTEM_MODE ? 'bg-white' : 'bg-white blk:bg-gray-900';

  const customBtnClassNames = themeMode === CUSTOM_MODE ? 'bg-green-100 border-green-200 blk:bg-green-700 blk:border-green-800' : 'border-t-0 border-gray-200 blk:border-gray-700';
  const customBtnInnerClassNames = themeMode === CUSTOM_MODE ? 'text-green-800 blk:text-green-100' : 'text-gray-600 blk:text-gray-300';
  const customRBtnClassNames = themeMode === CUSTOM_MODE ? 'bg-green-600 blk:bg-green-400' : 'border border-gray-500 bg-white blk:border-gray-500 blk:bg-gray-900';
  const customRBtnInnerClassNames = themeMode === CUSTOM_MODE ? 'bg-white' : 'bg-white blk:bg-gray-900';

  const customTextClassNames = themeMode === CUSTOM_MODE ? 'text-green-700 blk:text-green-200' : 'text-gray-500 blk:text-gray-500';
  const customInputClassNames = themeMode === CUSTOM_MODE ? 'border-gray-300 bg-white blk:border-green-200 blk:bg-green-700' : 'border-gray-300 bg-white blk:border-gray-600 blk:bg-gray-900';
  const customInputInnerClassNames = themeMode === CUSTOM_MODE ? 'text-gray-400 blk:text-green-100' : 'text-gray-400 blk:text-gray-500';

  let whtTime, blkTime;
  for (const option of customOptions) {
    if (option.mode === WHT_MODE) whtTime = option.startTime;
    if (option.mode === BLK_MODE) blkTime = option.startTime;
  }
  whtTime = getFormattedTime(whtTime, is24HFormat).time;
  blkTime = getFormattedTime(blkTime, is24HFormat).time;

  let systemText = (
    <Text style={tailwind('mt-2.5 text-base font-normal leading-6.5 text-gray-500 blk:text-gray-400')}>Choose appearance to be <Text style={tailwind('text-base font-semibold leading-6.5 text-gray-500 blk:text-gray-300')}>Light</Text>, <Text style={tailwind('text-base font-semibold leading-6.5 text-gray-500 blk:text-gray-300')}>Dark</Text>, <Text style={tailwind('text-base font-semibold leading-6.5 text-gray-500 blk:text-gray-300')}>System</Text> (uses your device's setting), or <Text style={tailwind('text-base font-semibold leading-6.5 text-gray-500 blk:text-gray-300')}>Custom</Text> (schedules times to change appearance automatically). For Sync, your choosing is synced across your devices. For Device, you can choose and use the setting for this device only.</Text>
  );
  if (!isSystemShown) {
    systemText = (
      <Text style={tailwind('mt-2.5 text-base font-normal leading-6.5 text-gray-500 blk:text-gray-400')}>Choose appearance to be <Text style={tailwind('text-base font-semibold leading-6.5 text-gray-500 blk:text-gray-300')}>Light</Text>, <Text style={tailwind('text-base font-semibold leading-6.5 text-gray-500 blk:text-gray-300')}>Dark</Text>, or <Text style={tailwind('text-base font-semibold leading-6.5 text-gray-500 blk:text-gray-300')}>Custom</Text> (schedules times to change appearance automatically). For Sync, your choosing is synced across your devices. For Device, you can choose and use the setting for this device only.</Text>
    );
  }

  return (
    <View style={tailwind('relative p-4 md:p-6')}>
      <View style={tailwind('border-b border-gray-200 blk:border-gray-700 md:hidden')}>
        <TouchableOpacity onPress={onSidebarOpenBtnClick} style={tailwind('pb-1')}>
          <Text style={tailwind('text-sm font-normal text-gray-500 blk:text-gray-400')}>{'<'} <Text style={tailwind('text-sm font-normal text-gray-500 blk:text-gray-400')}>Settings</Text></Text>
        </TouchableOpacity>
        <Text style={tailwind('pb-2 text-xl font-medium leading-6 text-gray-800 blk:text-gray-100')}>Misc.</Text>
      </View>
      {isUserSignedIn && <View style={tailwind('mt-6 md:mt-0')}>
        <Text style={tailwind('text-base font-medium leading-5 text-gray-800 blk:text-gray-100')}>Appearance</Text>
        {systemText}
        <View style={tailwind('mt-2.5 w-full items-center justify-start')}>
          <View style={tailwind('w-full max-w-sm rounded-md bg-white shadow-sm blk:bg-gray-900')}>
            <View style={tailwind('flex-row justify-evenly')}>
              <TouchableOpacity onPress={() => onDoUseLocalThemeBtnClick(false)} style={tailwind('flex-shrink flex-grow rounded-tl-md border border-b-0 border-gray-300 bg-white py-4 blk:border-gray-700 blk:bg-gray-900')}>
                <Text style={tailwind(`text-center text-sm font-medium ${themeDefaultBtnClassNames}`)}>Sync</Text>
                {!doUseLocalTheme && <View style={tailwind('absolute inset-x-0 bottom-0 h-0.5 bg-green-600 blk:bg-green-500')} />}
              </TouchableOpacity>
              <TouchableOpacity onPress={() => onDoUseLocalThemeBtnClick(true)} style={tailwind('flex-shrink flex-grow rounded-tr-md border border-l-0 border-b-0 border-gray-300 bg-white py-4 blk:border-gray-700 blk:bg-gray-900')}>
                <Text style={tailwind(`text-center text-sm font-medium ${themeLocalBtnClassNames}`)}>Device</Text>
                {doUseLocalTheme && <View style={tailwind('absolute inset-x-0 bottom-0 h-0.5 bg-green-600 blk:bg-green-500')} />}
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={() => onThemeInputChange(WHT_MODE)}>
              <View style={tailwind(`flex-row border p-4 ${whtBtnClassNames}`)}>
                <View style={tailwind('h-5 flex-row items-center')}>
                  <View style={tailwind(`h-4 w-4 items-center justify-center rounded-full ${whtRBtnClassNames}`)}>
                    <View style={tailwind(`h-1.5 w-1.5 rounded-full ${whtRBtnInnerClassNames}`)} />
                  </View>
                </View>
                <Text style={tailwind(`ml-3 text-sm font-medium leading-5 ${whtBtnInnerClassNames}`)}>Light</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onThemeInputChange(BLK_MODE)}>
              <View style={tailwind(`flex-row border p-4 ${blkBtnClassNames}`)}>
                <View style={tailwind('h-5 flex-row items-center')}>
                  <View style={tailwind(`h-4 w-4 items-center justify-center rounded-full ${blkRBtnClassNames}`)}>
                    <View style={tailwind(`h-1.5 w-1.5 rounded-full ${blkRBtnInnerClassNames}`)} />
                  </View>
                </View>
                <Text style={tailwind(`ml-3 text-sm font-medium leading-5 ${blkBtnInnerClassNames}`)}>Dark</Text>
              </View>
            </TouchableOpacity>
            {isSystemShown && <TouchableOpacity onPress={() => onThemeInputChange(SYSTEM_MODE)}>
              <View style={tailwind(`flex-row border p-4 ${systemBtnClassNames}`)}>
                <View style={tailwind('h-5 flex-row items-center')}>
                  <View style={tailwind(`h-4 w-4 items-center justify-center rounded-full ${systemRBtnClassNames}`)}>
                    <View style={tailwind(`h-1.5 w-1.5 rounded-full ${systemRBtnInnerClassNames}`)} />
                  </View>
                </View>
                <Text style={tailwind(`ml-3 text-sm font-medium leading-5 ${systemBtnInnerClassNames}`)}>System</Text>
              </View>
            </TouchableOpacity>}
            <TouchableOpacity onPress={() => onThemeInputChange(CUSTOM_MODE)}>
              <View style={tailwind(`flex-row rounded-bl-md rounded-br-md border p-4 ${customBtnClassNames}`)}>
                <View style={tailwind('h-5 flex-row items-center')}>
                  <View style={tailwind(`h-4 w-4 items-center justify-center rounded-full ${customRBtnClassNames}`)}>
                    <View style={tailwind(`h-1.5 w-1.5 rounded-full ${customRBtnInnerClassNames}`)} />
                  </View>
                </View>
                <View style={tailwind('ml-3')}>
                  <Text style={tailwind(`text-sm font-medium leading-5 ${customBtnInnerClassNames}`)}>Custom</Text>
                  <View style={tailwind('mt-1.5 sm:flex-row sm:items-center sm:justify-start')}>
                    <View style={tailwind('flex-row items-center justify-start')}>
                      <View style={tailwind('w-10')}>
                        <Text style={tailwind(`text-sm font-normal ${customTextClassNames}`)}>Light:</Text>
                      </View>
                      <TouchableOpacity ref={whtTimeBtn} onPress={onWhtTimeBtnClick} style={tailwind(`ml-1 rounded-md border px-3 py-1.5 ${customInputClassNames}`)} disabled={themeMode !== CUSTOM_MODE}>
                        <Text style={tailwind(`text-base font-normal leading-5 ${customInputInnerClassNames}`)}>{whtTime}</Text>
                      </TouchableOpacity>
                    </View>
                    <View style={tailwind('mt-2 flex-row items-center justify-start sm:ml-4 sm:mt-0')}>
                      <View style={tailwind('w-10')}>
                        <Text style={tailwind(`text-sm font-normal ${customTextClassNames}`)}>Dark:</Text>
                      </View>
                      <TouchableOpacity ref={blkTimeBtn} onPress={onBlkTimeBtnClick} style={tailwind(`ml-1 rounded-md border px-3 py-1.5 ${customInputClassNames}`)} disabled={themeMode !== CUSTOM_MODE}>
                        <Text style={tailwind(`text-base font-normal leading-5 ${customInputInnerClassNames}`)}>{blkTime}</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>}
      <View style={tailwind(`${isUserSignedIn ? 'mt-10' : 'mt-6 md:mt-0'}`)}>
        <Text style={tailwind('text-base font-medium leading-6 text-gray-800 blk:text-gray-100')}>List Order On</Text>
        <View style={tailwind('sm:flex-row sm:items-start sm:justify-between')}>
          <View style={tailwind('mt-2.5 sm:flex-shrink sm:flex-grow')}>
            <Text style={tailwind('text-base font-normal leading-6.5 text-gray-500 blk:text-gray-400')}>Choose whether your notes are sorted on the <Text style={tailwind('text-base font-semibold text-gray-500 blk:text-gray-400')}>added date</Text> or <Text style={tailwind('text-base font-semibold text-gray-500 blk:text-gray-400')}>updated date</Text> when you browse your notes.</Text>
          </View>
          <View style={tailwind('mt-2.5 items-center sm:ml-4 sm:flex-shrink-0 sm:flex-grow-0')}>
            <View style={tailwind('w-full max-w-48 rounded-md bg-white shadow-sm blk:bg-gray-900 sm:w-48')}>
              <TouchableOpacity onPress={() => onSortOnInputChange(ADDED_DT)}>
                <View style={tailwind(`flex-row rounded-tl-md rounded-tr-md border p-4 ${addedDTBtnClassNames}`)}>
                  <View style={tailwind('h-5 flex-row items-center')}>
                    <View style={tailwind(`h-4 w-4 items-center justify-center rounded-full ${addedDTRBtnClassNames}`)}>
                      <View style={tailwind(`h-1.5 w-1.5 rounded-full ${addedDTRBtnInnerClassNames}`)} />
                    </View>
                  </View>
                  <Text style={tailwind(`ml-3 text-sm font-medium leading-5 ${addedDTBtnInnerClassNames}`)}>Added Date</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => onSortOnInputChange(UPDATED_DT)}>
                <View style={tailwind(`flex-row rounded-bl-md rounded-br-md border p-4 ${updatedDTBtnClassNames}`)}>
                  <View style={tailwind('h-5 flex-row items-center')}>
                    <View style={tailwind(`h-4 w-4 items-center justify-center rounded-full ${updatedDTRBtnClassNames}`)}>
                      <View style={tailwind(`h-1.5 w-1.5 rounded-full ${updatedDTRBtnInnerClassNames}`)} />
                    </View>
                  </View>
                  <Text style={tailwind(`ml-3 text-sm font-medium leading-5 ${updatedDTBtnInnerClassNames}`)}>Updated Date</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
      <View style={tailwind('mt-10')}>
        <Text style={tailwind('text-base font-medium leading-6 text-gray-800 blk:text-gray-100')}>List Order Direction</Text>
        <View style={tailwind('sm:flex-row sm:items-start sm:justify-between')}>
          <View style={tailwind('mt-2.5 sm:flex-shrink sm:flex-grow')}>
            <Text style={tailwind('text-base font-normal leading-6.5 text-gray-500 blk:text-gray-400')}>Choose whether your notes are sorted in <Text style={tailwind('text-base font-semibold leading-6.5 text-gray-500 blk:text-gray-300')}>ascending order</Text> (i.e. notes you create first appear first) or <Text style={tailwind('text-base font-semibold leading-6.5 text-gray-500 blk:text-gray-300')}>descending order</Text> (i.e. notes you create last appear first) when you browse your notes.</Text>
          </View>
          <View style={tailwind('mt-2.5 items-center sm:ml-4 sm:flex-shrink-0 sm:flex-grow-0')}>
            <View style={tailwind('w-full max-w-48 rounded-md bg-white shadow-sm blk:bg-gray-900 sm:w-48')}>
              <TouchableOpacity onPress={() => onDoDescendingInputChange('ascending')}>
                <View style={tailwind(`flex-row rounded-tl-md rounded-tr-md border p-4 ${ascendingBtnClassNames}`)}>
                  <View style={tailwind('h-5 flex-row items-center')}>
                    <View style={tailwind(`h-4 w-4 items-center justify-center rounded-full ${ascendingRBtnClassNames}`)}>
                      <View style={tailwind(`h-1.5 w-1.5 rounded-full ${ascendingRBtnInnerClassNames}`)} />
                    </View>
                  </View>
                  <Text style={tailwind(`ml-3 text-sm font-medium leading-5 ${ascendingBtnInnerClassNames}`)}>Ascending order</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => onDoDescendingInputChange('descending')}>
                <View style={tailwind(`flex-row rounded-bl-md rounded-br-md border p-4 ${descendingBtnClassNames}`)}>
                  <View style={tailwind('h-5 flex-row items-center')}>
                    <View style={tailwind(`h-4 w-4 items-center justify-center rounded-full ${descendingRBtnClassNames}`)}>
                      <View style={tailwind(`h-1.5 w-1.5 rounded-full ${descendingRBtnInnerClassNames}`)} />
                    </View>
                  </View>
                  <Text style={tailwind(`ml-3 text-sm font-medium leading-5 ${descendingBtnInnerClassNames}`)}>Descending order</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
      <View style={tailwind('mt-10 flex-row items-center justify-between')}>
        <View style={tailwind('flex-shrink flex-grow')}>
          <Text style={tailwind('text-base font-medium leading-5 text-gray-800 blk:text-gray-100')}>Note Date Showing</Text>
          <Text style={tailwind('mt-2.5 text-base font-normal leading-6.5 text-gray-500 blk:text-gray-400')}>Show notes' added date or updated date when you browse your notes. It will appear on the top right of each note.</Text>
        </View>
        <View style={tailwind('ml-4 h-6 w-11 flex-shrink-0 flex-grow-0')}>
          <Switch onValueChange={onDoShowDateBtnClick} value={doShowDate} thumbColor={Platform.OS === 'android' ? doShowDate ? switchThumbColorOn : switchThumbColorOff : ''} trackColor={{ true: switchTrackColorOn, false: switchTrackColorOff }} ios_backgroundColor={switchIosTrackColorOff} />
        </View>
      </View>
      {isUserSignedIn && <View style={tailwind('mt-10')}>
        <Text style={tailwind('text-base font-medium leading-5 text-gray-800 blk:text-gray-100')}>Note Date Formats</Text>
        <Text style={tailwind('mt-2.5 text-base font-normal leading-6.5 text-gray-500 blk:text-gray-400')}>Choose a date format for your note dates.</Text>
        <View style={tailwind('mt-2.5 w-full items-center justify-start')}>
          <View style={tailwind('w-full max-w-sm rounded-md border border-gray-200 bg-white p-5 shadow-sm blk:border-gray-700 blk:bg-gray-900')}>
            <View style={tailwind('flex-row items-center')}>
              <Text style={tailwind('mr-2 flex-shrink-0 flex-grow-0 text-base font-normal text-gray-500 blk:text-gray-400')}>Date format:</Text>
              <TouchableOpacity ref={dateFormatBtn} onPress={onDateFormatBtnClick} style={tailwind('flex-shrink flex-grow rounded-md border border-gray-300 bg-white py-1.5 pl-3 pr-10 blk:border-gray-600 blk:bg-gray-900')}>
                <Text style={tailwind('text-base font-normal text-gray-500 blk:text-gray-400 sm:text-sm')} numberOfLines={1} ellipsizeMode="tail">{NOTE_DATE_FORMAT_TEXTS[NOTE_DATE_FORMATS.indexOf(noteDateFormat)]}</Text>
                <View style={tailwind('absolute inset-y-0 right-0 flex-row items-center pr-2')}>
                  <Svg width={20} height={20} style={tailwind('font-normal text-gray-400')} viewBox="0 0 20 20" fill="currentColor">
                    <Path d="M10 3a.75.75 0 01.55.24l3.25 3.5a.75.75 0 11-1.1 1.02L10 4.852 7.3 7.76a.75.75 0 01-1.1-1.02l3.25-3.5A.75.75 0 0110 3zm-3.76 9.2a.75.75 0 011.06.04l2.7 2.908 2.7-2.908a.75.75 0 111.1 1.02l-3.25 3.5a.75.75 0 01-1.1 0l-3.25-3.5a.75.75 0 01.04-1.06z" fillRule="evenodd" clipRule="evenodd" />
                  </Svg>
                </View>
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={onTwoDigitBtnClick} style={tailwind('mt-3.5 flex-row items-center')} disabled={noteDateFormat === NOTE_DATE_FORMAT_SYSTEM}>
              <View style={tailwind(`h-4 w-4 items-center justify-center rounded border ${twoDigitBtnClassNames}`)}>
                {doTwoDigitCheck && <Svg width={8} height={6} style={tailwind('font-normal text-white')} viewBox="0 0 8 6" fill="currentColor">
                  <Path fillRule="evenodd" clipRule="evenodd" d="M7.70692 1.70698C7.88908 1.51838 7.98987 1.26578 7.98759 1.00358C7.98532 0.741383 7.88015 0.49057 7.69474 0.305162C7.50933 0.119754 7.25852 0.0145843 6.99632 0.0123059C6.73412 0.0100274 6.48152 0.110823 6.29292 0.292981L2.99992 3.58598L1.70692 2.29298C1.51832 2.11082 1.26571 2.01003 1.00352 2.01231C0.741321 2.01459 0.490509 2.11975 0.305101 2.30516C0.119693 2.49057 0.0145233 2.74138 0.0122448 3.00358C0.00996641 3.26578 0.110762 3.51838 0.29292 3.70698L2.29292 5.70698C2.48045 5.89445 2.73476 5.99977 2.99992 5.99977C3.26508 5.99977 3.51939 5.89445 3.70692 5.70698L7.70692 1.70698Z" />
                </Svg>}
              </View>
              <Text style={tailwind(`ml-2 text-base font-normal ${twoDigitLabelClassNames}`)}>Show date and month in 2 digits</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onCurrentYearBtnClick} style={tailwind('mt-3.5 flex-row items-center')} disabled={noteDateFormat === NOTE_DATE_FORMAT_SYSTEM}>
              <View style={tailwind(`h-4 w-4 items-center justify-center rounded border ${currentYearBtnClassNames}`)}>
                {doCurrentYearCheck && <Svg width={8} height={6} style={tailwind('font-normal text-white')} viewBox="0 0 8 6" fill="currentColor">
                  <Path fillRule="evenodd" clipRule="evenodd" d="M7.70692 1.70698C7.88908 1.51838 7.98987 1.26578 7.98759 1.00358C7.98532 0.741383 7.88015 0.49057 7.69474 0.305162C7.50933 0.119754 7.25852 0.0145843 6.99632 0.0123059C6.73412 0.0100274 6.48152 0.110823 6.29292 0.292981L2.99992 3.58598L1.70692 2.29298C1.51832 2.11082 1.26571 2.01003 1.00352 2.01231C0.741321 2.01459 0.490509 2.11975 0.305101 2.30516C0.119693 2.49057 0.0145233 2.74138 0.0122448 3.00358C0.00996641 3.26578 0.110762 3.51838 0.29292 3.70698L2.29292 5.70698C2.48045 5.89445 2.73476 5.99977 2.99992 5.99977C3.26508 5.99977 3.51939 5.89445 3.70692 5.70698L7.70692 1.70698Z" />
                </Svg>}
              </View>
              <Text style={tailwind(`ml-2 text-base font-normal ${currentYearLabelClassNames}`)}>Show current year</Text>
            </TouchableOpacity>
            <Text style={tailwind('mt-4 text-sm font-normal text-gray-500 blk:text-gray-400')}>Example: {noteDateExample}</Text>
          </View>
        </View>
      </View>}
      {isUserSignedIn && <View style={tailwind('mt-10 flex-row items-center justify-between')}>
        <View style={tailwind('flex-shrink flex-grow')}>
          <Text style={tailwind('text-base font-medium leading-5 text-gray-800 blk:text-gray-100')}>Section By Month</Text>
          <Text style={tailwind('mt-2.5 text-base font-normal leading-6.5 text-gray-500 blk:text-gray-400')}>Section your notes by month and show the month at the top of each section.</Text>
        </View>
        <View style={tailwind('ml-4 h-6 w-11 flex-shrink-0 flex-grow-0')}>
          <Switch onValueChange={onDoSectionBtnClick} value={doSectionNotesByMonth} thumbColor={Platform.OS === 'android' ? doSectionNotesByMonth ? switchThumbColorOn : switchThumbColorOff : ''} trackColor={{ true: switchTrackColorOn, false: switchTrackColorOff }} ios_backgroundColor={switchIosTrackColorOff} />
        </View>
      </View>}
      {isUserSignedIn && <View style={tailwind('mt-10 flex-row items-center justify-between')}>
        <View style={tailwind('flex-shrink flex-grow')}>
          <Text style={tailwind('text-base font-medium leading-5 text-gray-800 blk:text-gray-100')}>More Font Sizes</Text>
          <Text style={tailwind('mt-2.5 text-base font-normal leading-6.5 text-gray-500 blk:text-gray-400')}>Enable more font size options in the note editor.</Text>
        </View>
        <View style={tailwind('ml-4 h-6 w-11 flex-shrink-0 flex-grow-0')}>
          <Switch onValueChange={onDoMoreFontSizesBtnClick} value={doMoreEditorFontSizes} thumbColor={Platform.OS === 'android' ? doMoreEditorFontSizes ? switchThumbColorOn : switchThumbColorOff : ''} trackColor={{ true: switchTrackColorOn, false: switchTrackColorOff }} ios_backgroundColor={switchIosTrackColorOff} />
        </View>
      </View>}
      <View style={tailwind('mt-10 mb-4 flex-row items-center justify-between')}>
        <View style={tailwind('flex-shrink flex-grow')}>
          <Text style={tailwind('text-base font-medium leading-5 text-gray-800 blk:text-gray-100')}>Auto Cleanup</Text>
          <Text style={tailwind('mt-2.5 text-base font-normal leading-6.5 text-gray-500 blk:text-gray-400')}>Allow old removed notes in Trash to be automatically deleted after 45 days.</Text>
        </View>
        <View style={tailwind('ml-4 h-6 w-11 flex-shrink-0 flex-grow-0')}>
          <Switch onValueChange={onDoDeleteBtnClick} value={doDeleteOldNotesInTrash} thumbColor={Platform.OS === 'android' ? doDeleteOldNotesInTrash ? switchThumbColorOn : switchThumbColorOff : ''} trackColor={{ true: switchTrackColorOn, false: switchTrackColorOff }} ios_backgroundColor={switchIosTrackColorOff} />
        </View>
      </View>
    </View>
  );
};

export default React.memo(SettingsPopupMisc);
