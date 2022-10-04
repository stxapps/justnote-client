import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, Switch, Platform } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';

import {
  updateDoDeleteOldNotesInTrash, updateSortOn, updateDoDescendingOrder,
  updateNoteDateShowingMode, updateTheme, updateUpdatingThemeMode, updatePopup,
} from '../actions';
import {
  ADDED_DT, UPDATED_DT, NOTE_DATE_SHOWING_MODE_HIDE,
  NOTE_DATE_SHOWING_MODE_SHOW_DEFAULT, WHT_MODE, BLK_MODE, SYSTEM_MODE, CUSTOM_MODE,
  TIME_PICK_POPUP,
} from '../types/const';
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
  const themeMode = useSelector(state => state.localSettings.themeMode);
  const customOptions = useSelector(state => state.localSettings.themeCustomOptions);
  const is24HFormat = useSelector(state => state.window.is24HFormat);
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
      dispatch(updateNoteDateShowingMode(NOTE_DATE_SHOWING_MODE_SHOW_DEFAULT));
    } else if (noteDateShowingMode === NOTE_DATE_SHOWING_MODE_SHOW_DEFAULT) {
      dispatch(updateNoteDateShowingMode(NOTE_DATE_SHOWING_MODE_HIDE));
    } else {
      console.log('Invalid noteDateShowingMode: ', noteDateShowingMode);
    }
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

  const switchThumbColorOn = 'rgb(34, 197, 94)';
  const switchThumbColorOff = 'rgb(243, 244, 246)';
  const switchTrackColorOn = Platform.OS === 'android' ? 'rgb(187, 247, 208)' : 'rgb(34, 197, 94)';
  const switchTrackColorOff = 'rgb(156, 163, 175)';

  const addedDTBtnClassNames = sortOn === ADDED_DT ? 'bg-green-100 border-green-200 blk:bg-green-700 blk:border-green-800' : 'border-gray-200 blk:border-gray-700';
  const addedDTBtnInnerClassNames = sortOn === ADDED_DT ? 'text-green-800 blk:text-green-100' : 'text-gray-600 blk:text-gray-300';
  const addedDTRBtnClassNames = sortOn === ADDED_DT ? 'border-green-600 blk:border-green-400' : 'border-gray-200 blk:border-gray-600';
  const addedDTRBtnInnerClassNames = sortOn === ADDED_DT ? 'bg-green-600 blk:bg-green-400' : 'bg-gray-200 blk:bg-gray-900';

  const updatedDTBtnClassNames = sortOn === UPDATED_DT ? 'bg-green-100 border-green-200 blk:bg-green-700 blk:border-green-800' : 'border-gray-200 blk:border-gray-700';
  const updatedDTBtnInnerClassNames = sortOn === UPDATED_DT ? 'text-green-800 blk:text-green-100' : 'text-gray-600 blk:text-gray-300';
  const updatedDTRBtnClassNames = sortOn === UPDATED_DT ? 'border-green-600 blk:border-green-400' : 'border-gray-200 blk:border-gray-600';
  const updatedDTRBtnInnerClassNames = sortOn === UPDATED_DT ? 'bg-green-600 blk:bg-green-400' : 'bg-gray-200 blk:bg-gray-900';

  const ascendingBtnClassNames = !doDescendingOrder ? 'bg-green-100 border-green-200 blk:bg-green-700 blk:border-green-800' : 'border-gray-200 blk:border-gray-700';
  const ascendingBtnInnerClassNames = !doDescendingOrder ? 'text-green-800 blk:text-green-100' : 'text-gray-600 blk:text-gray-300';
  const ascendingRBtnClassNames = !doDescendingOrder ? 'border-green-600 blk:border-green-400' : 'border-gray-200 blk:border-gray-600';
  const ascendingRBtnInnerClassNames = !doDescendingOrder ? 'bg-green-600 blk:bg-green-400' : 'bg-gray-200 blk:bg-gray-900';

  const descendingBtnClassNames = doDescendingOrder ? 'bg-green-100 border-green-200 blk:bg-green-700 blk:border-green-800' : 'border-gray-200 blk:border-gray-700';
  const descendingBtnInnerClassNames = doDescendingOrder ? 'text-green-800 blk:text-green-100' : 'text-gray-600 blk:text-gray-300';
  const descendingRBtnClassNames = doDescendingOrder ? 'border-green-600 blk:border-green-400' : 'border-gray-200 blk:border-gray-600';
  const descendingRBtnInnerClassNames = doDescendingOrder ? 'bg-green-600 blk:bg-green-400' : 'bg-gray-200 blk:bg-gray-900';

  const doShowDate = noteDateShowingMode === NOTE_DATE_SHOWING_MODE_SHOW_DEFAULT;

  const whtBtnClassNames = themeMode === WHT_MODE ? 'bg-green-100 border-green-200 blk:bg-green-700 blk:border-green-800' : 'border-gray-200 blk:border-gray-700';
  const whtBtnInnerClassNames = themeMode === WHT_MODE ? 'text-green-800 blk:text-green-100' : 'text-gray-600 blk:text-gray-300';
  const whtRBtnClassNames = themeMode === WHT_MODE ? 'border-green-600 blk:border-green-400' : 'border-gray-200 blk:border-gray-600';
  const whtRBtnInnerClassNames = themeMode === WHT_MODE ? 'bg-green-600 blk:bg-green-400' : 'bg-gray-200 blk:bg-gray-900';
  const blkBtnClassNames = themeMode === BLK_MODE ? 'bg-green-100 border-green-200 blk:bg-green-700 blk:border-green-800' : 'border-gray-200 blk:border-gray-700';
  const blkBtnInnerClassNames = themeMode === BLK_MODE ? 'text-green-800 blk:text-green-100' : 'text-gray-600 blk:text-gray-300';
  const blkRBtnClassNames = themeMode === BLK_MODE ? 'border-green-600 blk:border-green-400' : 'border-gray-200 blk:border-gray-600';
  const blkRBtnInnerClassNames = themeMode === BLK_MODE ? 'bg-green-600 blk:bg-green-400' : 'bg-gray-200 blk:bg-gray-900';
  const systemBtnClassNames = themeMode === SYSTEM_MODE ? 'bg-green-100 border-green-200 blk:bg-green-700 blk:border-green-800' : 'border-gray-200 blk:border-gray-700';
  const systemBtnInnerClassNames = themeMode === SYSTEM_MODE ? 'text-green-800 blk:text-green-100' : 'text-gray-600 blk:text-gray-300';
  const systemRBtnClassNames = themeMode === SYSTEM_MODE ? 'border-green-600 blk:border-green-400' : 'border-gray-200 blk:border-gray-600';
  const systemRBtnInnerClassNames = themeMode === SYSTEM_MODE ? 'bg-green-600 blk:bg-green-400' : 'bg-gray-200 blk:bg-gray-900';
  const customBtnClassNames = themeMode === CUSTOM_MODE ? 'bg-green-100 border-green-200 blk:bg-green-700 blk:border-green-800' : 'border-gray-200 blk:border-gray-700';
  const customBtnInnerClassNames = themeMode === CUSTOM_MODE ? 'text-green-800 blk:text-green-100' : 'text-gray-600 blk:text-gray-300';
  const customRBtnClassNames = themeMode === CUSTOM_MODE ? 'border-green-600 blk:border-green-400' : 'border-gray-200 blk:border-gray-600';
  const customRBtnInnerClassNames = themeMode === CUSTOM_MODE ? 'bg-green-600 blk:bg-green-400' : 'bg-gray-200 blk:bg-gray-900';
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

  const isSystemShown = (
    Platform.OS !== 'android' || (Platform.OS === 'android' && Platform.Version >= 29)
  );

  let systemText = (
    <Text style={tailwind('mt-2.5 text-base font-normal leading-6.5 text-gray-500 blk:text-gray-400')}>Choose appearance to be <Text style={tailwind('text-base font-semibold leading-6.5 text-gray-500 blk:text-gray-300')}>Light</Text>, <Text style={tailwind('text-base font-semibold leading-6.5 text-gray-500 blk:text-gray-300')}>Dark</Text>, <Text style={tailwind('text-base font-semibold leading-6.5 text-gray-500 blk:text-gray-300')}>System</Text> (uses your device's setting), or <Text style={tailwind('text-base font-semibold leading-6.5 text-gray-500 blk:text-gray-300')}>Custom</Text> (schedule times to change appearance automatically). This setting is not synced so you can have a different appearance for each of your devices.</Text>
  );
  if (!isSystemShown) {
    systemText = (
      <Text style={tailwind('mt-2.5 text-base font-normal leading-6.5 text-gray-500 blk:text-gray-400')}>Choose appearance to be <Text style={tailwind('text-base font-semibold leading-6.5 text-gray-500 blk:text-gray-300')}>Light</Text>, <Text style={tailwind('text-base font-semibold leading-6.5 text-gray-500 blk:text-gray-300')}>Dark</Text>, or <Text style={tailwind('text-base font-semibold leading-6.5 text-gray-500 blk:text-gray-300')}>Custom</Text> (schedule times to change appearance automatically). This setting is not synced so you can have a different appearance for each of your devices.</Text>
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
      <View style={tailwind('mt-6 md:mt-0')}>
        <Text style={tailwind('text-base font-medium leading-5 text-gray-800 blk:text-gray-100')}>Appearance</Text>
        {systemText}
        <View style={tailwind('mt-2.5 w-full items-center justify-start')}>
          <View style={tailwind('w-full max-w-sm rounded-md bg-white shadow-sm blk:bg-gray-900')}>
            <TouchableOpacity onPress={() => onThemeInputChange(WHT_MODE)}>
              <View style={tailwind(`flex-row rounded-tl-md rounded-tr-md border p-4 ${whtBtnClassNames}`)}>
                <View style={tailwind('h-5 flex-row items-center')}>
                  <View style={tailwind(`h-4 w-4 items-center justify-center rounded-full border bg-transparent ${whtRBtnClassNames}`)}>
                    <View style={tailwind(`h-3 w-3 rounded-full ${whtRBtnInnerClassNames}`)} />
                  </View>
                </View>
                <Text style={tailwind(`ml-3 text-sm font-medium leading-5 ${whtBtnInnerClassNames}`)}>Light</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onThemeInputChange(BLK_MODE)}>
              <View style={tailwind(`flex-row border p-4 ${blkBtnClassNames}`)}>
                <View style={tailwind('h-5 flex-row items-center')}>
                  <View style={tailwind(`h-4 w-4 items-center justify-center rounded-full border bg-transparent ${blkRBtnClassNames}`)}>
                    <View style={tailwind(`h-3 w-3 rounded-full ${blkRBtnInnerClassNames}`)} />
                  </View>
                </View>
                <Text style={tailwind(`ml-3 text-sm font-medium leading-5 ${blkBtnInnerClassNames}`)}>Dark</Text>
              </View>
            </TouchableOpacity>
            {isSystemShown && <TouchableOpacity onPress={() => onThemeInputChange(SYSTEM_MODE)}>
              <View style={tailwind(`flex-row border p-4 ${systemBtnClassNames}`)}>
                <View style={tailwind('h-5 flex-row items-center')}>
                  <View style={tailwind(`h-4 w-4 items-center justify-center rounded-full border bg-transparent ${systemRBtnClassNames}`)}>
                    <View style={tailwind(`h-3 w-3 rounded-full ${systemRBtnInnerClassNames}`)} />
                  </View>
                </View>
                <Text style={tailwind(`ml-3 text-sm font-medium leading-5 ${systemBtnInnerClassNames}`)}>System</Text>
              </View>
            </TouchableOpacity>}
            <TouchableOpacity onPress={() => onThemeInputChange(CUSTOM_MODE)}>
              <View style={tailwind(`flex-row rounded-bl-md rounded-br-md border p-4 ${customBtnClassNames}`)}>
                <View style={tailwind('h-5 flex-row items-center')}>
                  <View style={tailwind(`h-4 w-4 items-center justify-center rounded-full border bg-transparent ${customRBtnClassNames}`)}>
                    <View style={tailwind(`h-3 w-3 rounded-full ${customRBtnInnerClassNames}`)} />
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
      </View>
      <View style={tailwind('mt-10')}>
        <Text style={tailwind('text-base font-medium leading-6 text-gray-800 blk:text-gray-100')}>List Order On</Text>
        <View style={tailwind('sm:flex-row sm:items-start sm:justify-between')}>
          <View style={tailwind('mt-2.5 sm:flex-shrink sm:flex-grow')}>
            <Text style={tailwind('text-base font-normal leading-6.5 text-gray-500 blk:text-gray-400')}>Choose whether your notes are sorted on <Text style={tailwind('text-base font-semibold text-gray-500')}>added date</Text> or <Text style={tailwind('text-base font-semibold text-gray-500')}>updated date</Text> when you browse your notes.</Text>
          </View>
          <View style={tailwind('mt-2.5 items-center sm:ml-4 sm:flex-shrink-0 sm:flex-grow-0')}>
            <View style={tailwind('w-full max-w-48 rounded-md bg-white shadow-sm blk:bg-gray-900 sm:w-48')}>
              <TouchableOpacity onPress={() => onSortOnInputChange(ADDED_DT)}>
                <View style={tailwind(`flex-row rounded-tl-md rounded-tr-md border p-4 ${addedDTBtnClassNames}`)}>
                  <View style={tailwind('h-5 flex-row items-center')}>
                    <View style={tailwind(`h-4 w-4 items-center justify-center rounded-full border bg-transparent ${addedDTRBtnClassNames}`)}>
                      <View style={tailwind(`h-3 w-3 rounded-full ${addedDTRBtnInnerClassNames}`)} />
                    </View>
                  </View>
                  <Text style={tailwind(`ml-3 text-sm font-medium leading-5 text-gray-500 ${addedDTBtnInnerClassNames}`)}>Added Date</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => onSortOnInputChange(UPDATED_DT)}>
                <View style={tailwind(`flex-row rounded-bl-md rounded-br-md border p-4 ${updatedDTBtnClassNames}`)}>
                  <View style={tailwind('h-5 flex-row items-center')}>
                    <View style={tailwind(`h-4 w-4 items-center justify-center rounded-full border bg-transparent ${updatedDTRBtnClassNames}`)}>
                      <View style={tailwind(`h-3 w-3 rounded-full ${updatedDTRBtnInnerClassNames}`)} />
                    </View>
                  </View>
                  <Text style={tailwind(`ml-3 text-sm font-medium leading-5 text-gray-500 ${updatedDTBtnInnerClassNames}`)}>Updated Date</Text>
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
                    <View style={tailwind(`h-4 w-4 items-center justify-center rounded-full border bg-transparent ${ascendingRBtnClassNames}`)}>
                      <View style={tailwind(`h-3 w-3 rounded-full ${ascendingRBtnInnerClassNames}`)} />
                    </View>
                  </View>
                  <Text style={tailwind(`ml-3 text-sm font-medium leading-5 text-gray-500 ${ascendingBtnInnerClassNames}`)}>Ascending order</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => onDoDescendingInputChange('descending')}>
                <View style={tailwind(`flex-row rounded-bl-md rounded-br-md border p-4 ${descendingBtnClassNames}`)}>
                  <View style={tailwind('h-5 flex-row items-center')}>
                    <View style={tailwind(`h-4 w-4 items-center justify-center rounded-full border bg-transparent ${descendingRBtnClassNames}`)}>
                      <View style={tailwind(`h-3 w-3 rounded-full ${descendingRBtnInnerClassNames}`)} />
                    </View>
                  </View>
                  <Text style={tailwind(`ml-3 text-sm font-medium leading-5 text-gray-500 ${descendingBtnInnerClassNames}`)}>Descending order</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
      <View style={tailwind('mt-10 flex-row items-center justify-between')}>
        <View style={tailwind('flex-shrink flex-grow')}>
          <Text style={tailwind('text-base font-medium leading-5 text-gray-800 blk:text-gray-100')}>Note Date Showing</Text>
          <Text style={tailwind('mt-2.5 text-base font-normal leading-6.5 text-gray-500 blk:text-gray-400')}>Show note's added date or updated date when you browse your notes. It will appear on the top right of each note.</Text>
        </View>
        <View style={tailwind('ml-4 h-6 w-11 flex-shrink-0 flex-grow-0')}>
          <Switch onValueChange={onDoShowDateBtnClick} value={doShowDate} thumbColor={Platform.OS === 'android' ? doShowDate ? switchThumbColorOn : switchThumbColorOff : ''} trackColor={{ true: switchTrackColorOn, false: switchTrackColorOff }} />
        </View>
      </View>
      <View style={tailwind('mt-10 mb-4 flex-row items-center justify-between')}>
        <View style={tailwind('flex-shrink flex-grow')}>
          <Text style={tailwind('text-base font-medium leading-5 text-gray-800 blk:text-gray-100')}>Auto Cleanup</Text>
          <Text style={tailwind('mt-2.5 text-base font-normal leading-6.5 text-gray-500 blk:text-gray-400')}>Allow old removed notes in Trash to be automatically deleted after 45 days.</Text>
        </View>
        <View style={tailwind('ml-4 h-6 w-11 flex-shrink-0 flex-grow-0')}>
          <Switch onValueChange={onDoDeleteBtnClick} value={doDeleteOldNotesInTrash} thumbColor={Platform.OS === 'android' ? doDeleteOldNotesInTrash ? switchThumbColorOn : switchThumbColorOff : ''} trackColor={{ true: switchTrackColorOn, false: switchTrackColorOff }} />
        </View>
      </View>
    </View>
  );
};

export default React.memo(SettingsPopupMisc);
