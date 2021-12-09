import React from 'react';
import { View, Text, TouchableOpacity, Switch, Platform } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useSafeAreaFrame } from 'react-native-safe-area-context';

import {
  updateDoDeleteOldNotesInTrash, updateSortOn, updateDoDescendingOrder,
  updateDoAlertScreenRotation,
} from '../actions';
import { ADDED_DT, UPDATED_DT } from '../types/const';
import { tailwind } from '../stylesheets/tailwind';

const SettingsPopupAccount = (props) => {

  const { onSidebarOpenBtnClick } = props;
  const { width: safeAreaWidth } = useSafeAreaFrame();
  const doDeleteOldNotesInTrash = useSelector(state => state.settings.doDeleteOldNotesInTrash);
  const sortOn = useSelector(state => state.settings.sortOn);
  const doDescendingOrder = useSelector(state => state.settings.doDescendingOrder);
  const doAlertScreenRotation = useSelector(state => state.settings.doAlertScreenRotation);
  const dispatch = useDispatch();

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

  const onDoAlertBtnClick = () => {
    dispatch(updateDoAlertScreenRotation(!doAlertScreenRotation));
  };

  const switchThumbColorOn = 'rgba(34, 197, 94, 1)';
  const switchThumbColorOff = 'rgba(243, 244, 246, 1)';
  const switchTrackColorOn = Platform.OS === 'android' ? 'rgba(187, 247, 208, 1)' : 'rgba(34, 197, 94, 1)';
  const switchTrackColorOff = 'rgba(156, 163, 175, 1)';

  const addedDTBtnClassNames = sortOn === ADDED_DT ? 'bg-green-100 border-green-200' : 'border-gray-200';
  const addedDTBtnInnerClassNames = sortOn === ADDED_DT ? 'text-green-800 font-normal' : 'text-gray-600 font-normal';
  const addedDTRBtnClassNames = sortOn === ADDED_DT ? 'border-green-500' : 'border-gray-200';
  const addedDTRBtnInnerClassNames = sortOn === ADDED_DT ? 'bg-green-500' : 'bg-gray-200';

  const updatedDTBtnClassNames = sortOn === UPDATED_DT ? 'bg-green-100 border-green-200' : 'border-gray-200';
  const updatedDTBtnInnerClassNames = sortOn === UPDATED_DT ? 'text-green-800 font-normal' : 'text-gray-600 font-normal';
  const updatedDTRBtnClassNames = sortOn === UPDATED_DT ? 'border-green-500' : 'border-gray-200';
  const updatedDTRBtnInnerClassNames = sortOn === UPDATED_DT ? 'bg-green-500' : 'bg-gray-200';

  const ascendingBtnClassNames = !doDescendingOrder ? 'bg-green-100 border-green-200' : 'border-gray-200';
  const ascendingBtnInnerClassNames = !doDescendingOrder ? 'text-green-800 font-normal' : 'text-gray-600 font-normal';
  const ascendingRBtnClassNames = !doDescendingOrder ? 'border-green-500' : 'border-gray-200';
  const ascendingRBtnInnerClassNames = !doDescendingOrder ? 'bg-green-500' : 'bg-gray-200';

  const descendingBtnClassNames = doDescendingOrder ? 'bg-green-100 border-green-200' : 'border-gray-200';
  const descendingBtnInnerClassNames = doDescendingOrder ? 'text-green-800 font-normal' : 'text-gray-600 font-normal';
  const descendingRBtnClassNames = doDescendingOrder ? 'border-green-500' : 'border-gray-200';
  const descendingRBtnInnerClassNames = doDescendingOrder ? 'bg-green-500' : 'bg-gray-200';

  return (
    <View style={tailwind('p-4 relative md:p-6 md:pt-4', safeAreaWidth)}>
      <View style={tailwind('border-b border-gray-200 md:hidden', safeAreaWidth)}>
        <TouchableOpacity onPress={onSidebarOpenBtnClick} style={tailwind('pb-1')}>
          <Text style={tailwind('text-sm text-gray-500 font-normal')}>{'<'} <Text style={tailwind('text-sm text-gray-500 font-normal')}>Settings</Text></Text>
        </TouchableOpacity>
        <Text style={tailwind('pb-2 text-xl text-gray-800 font-medium leading-6')}>Misc.</Text>
      </View>
      <View style={tailwind('mt-6 flex-row items-center justify-between md:mt-0', safeAreaWidth)}>
        <View style={tailwind('flex-grow flex-shrink')}>
          <Text style={tailwind('text-base text-gray-800 font-medium leading-5')}>Auto Cleanup</Text>
          <Text style={tailwind('mt-2.5 text-base text-gray-500 font-normal leading-6.5')}>Allow old removed notes in Trash to be automatically deleted after 45 days</Text>
        </View>
        <View style={tailwind('ml-4 flex-grow-0 flex-shrink-0 w-11 h-6')}>
          <Switch onValueChange={onDoDeleteBtnClick} value={doDeleteOldNotesInTrash} thumbColor={Platform.OS === 'android' ? doDeleteOldNotesInTrash ? switchThumbColorOn : switchThumbColorOff : ''} trackColor={{ true: switchTrackColorOn, false: switchTrackColorOff }} />
        </View>
      </View>
      <View style={tailwind('mt-10')}>
        <Text style={tailwind('text-base text-gray-800 font-medium leading-6')}>List Order On</Text>
        <View style={tailwind('sm:flex-row sm:items-start sm:justify-between', safeAreaWidth)}>
          <View style={tailwind('mt-2.5 sm:flex-grow sm:flex-shrink', safeAreaWidth)}>
            <Text style={tailwind('text-base text-gray-500 font-normal leading-6.5')}>Choose whether your notes are sorted on <Text style={tailwind('text-base text-gray-500 font-semibold')}>added date</Text> or <Text style={tailwind('text-base text-gray-500 font-semibold')}>updated date</Text> when you browse your notes.</Text>
          </View>
          <View style={tailwind('mt-2.5 items-center sm:ml-4 sm:flex-grow-0 sm:flex-shrink-0', safeAreaWidth)}>
            <View style={tailwind('w-full max-w-48 bg-white rounded-md shadow-sm sm:w-48', safeAreaWidth)}>
              <TouchableOpacity onPress={() => onSortOnInputChange(ADDED_DT)}>
                <View style={tailwind(`${addedDTBtnClassNames} p-4 flex-row border rounded-tl-md rounded-tr-md`)}>
                  <View style={tailwind('flex-row items-center h-5')}>
                    <View style={tailwind(`${addedDTRBtnClassNames} justify-center items-center h-4 w-4 bg-transparent border rounded-full`)}>
                      <View style={tailwind(`${addedDTRBtnInnerClassNames} h-3 w-3 rounded-full`)} />
                    </View>
                  </View>
                  <Text style={tailwind(`${addedDTBtnInnerClassNames} ml-3 text-sm leading-5 font-medium text-gray-500`)}>Added Date</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => onSortOnInputChange(UPDATED_DT)}>
                <View style={tailwind(`${updatedDTBtnClassNames} p-4 flex-row border rounded-bl-md rounded-br-md`)}>
                  <View style={tailwind('flex-row items-center h-5')}>
                    <View style={tailwind(`${updatedDTRBtnClassNames} justify-center items-center h-4 w-4 bg-transparent border rounded-full`)}>
                      <View style={tailwind(`${updatedDTRBtnInnerClassNames} h-3 w-3 rounded-full`)} />
                    </View>
                  </View>
                  <Text style={tailwind(`${updatedDTBtnInnerClassNames} ml-3 text-sm leading-5 font-medium text-gray-500`)}>Updated Date</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
      <View style={tailwind('mt-10')}>
        <Text style={tailwind('text-base text-gray-800 font-medium leading-6')}>List Order Direction</Text>
        <View style={tailwind('sm:flex-row sm:items-start sm:justify-between', safeAreaWidth)}>
          <View style={tailwind('mt-2.5 sm:flex-grow sm:flex-shrink', safeAreaWidth)}>
            <Text style={tailwind('text-base text-gray-500 font-normal leading-6.5')}>Choose whether your notes are sorted in <Text style={tailwind('text-base text-gray-500 font-semibold')}>ascending order</Text> (i.e. notes you create first appear first) or <Text style={tailwind('text-base text-gray-500 font-semibold')}>descending order</Text> (i.e. notes you create last appear first) when you browse your notes.</Text>
          </View>
          <View style={tailwind('mt-2.5 items-center sm:ml-4 sm:flex-grow-0 sm:flex-shrink-0', safeAreaWidth)}>
            <View style={tailwind('w-full max-w-48 bg-white rounded-md shadow-sm sm:w-48', safeAreaWidth)}>
              <TouchableOpacity onPress={() => onDoDescendingInputChange('ascending')}>
                <View style={tailwind(`${ascendingBtnClassNames} p-4 flex-row border rounded-tl-md rounded-tr-md`)}>
                  <View style={tailwind('flex-row items-center h-5')}>
                    <View style={tailwind(`${ascendingRBtnClassNames} justify-center items-center h-4 w-4 bg-transparent border rounded-full`)}>
                      <View style={tailwind(`${ascendingRBtnInnerClassNames} h-3 w-3 rounded-full`)} />
                    </View>
                  </View>
                  <Text style={tailwind(`${ascendingBtnInnerClassNames} ml-3 text-sm leading-5 font-medium text-gray-500`)}>Ascending order</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => onDoDescendingInputChange('descending')}>
                <View style={tailwind(`${descendingBtnClassNames} p-4 flex-row border rounded-bl-md rounded-br-md`)}>
                  <View style={tailwind('flex-row items-center h-5')}>
                    <View style={tailwind(`${descendingRBtnClassNames} justify-center items-center h-4 w-4 bg-transparent border rounded-full`)}>
                      <View style={tailwind(`${descendingRBtnInnerClassNames} h-3 w-3 rounded-full`)} />
                    </View>
                  </View>
                  <Text style={tailwind(`${descendingBtnInnerClassNames} ml-3 text-sm leading-5 font-medium text-gray-500`)}>Descending order</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
      <View style={tailwind('mt-10 mb-4 flex-row items-center justify-between')}>
        <View style={tailwind('flex-grow flex-shrink')}>
          <Text style={tailwind('text-base text-gray-800 font-medium leading-5')}>Screen Rotation Warning</Text>
          <Text style={tailwind('mt-2.5 text-base text-gray-500 font-normal leading-6.5')}>Show a warning when rotating screen on iPad/Tablet as on these devices, screen rotation is not fully supported. Please do not rotate your iPad/Tablet while editing your note, new changes to your note will be lost. We are sorry for the inconvenience.</Text>
        </View>
        <View style={tailwind('ml-4 flex-grow-0 flex-shrink-0 w-11 h-6')}>
          <Switch onValueChange={onDoAlertBtnClick} value={doAlertScreenRotation} thumbColor={Platform.OS === 'android' ? doAlertScreenRotation ? switchThumbColorOn : switchThumbColorOff : ''} trackColor={{ true: switchTrackColorOn, false: switchTrackColorOff }} />
        </View>
      </View>
    </View>
  );
};

export default React.memo(SettingsPopupAccount);
