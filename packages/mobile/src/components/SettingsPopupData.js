import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Switch, Linking, Platform } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useSafeAreaFrame } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { Circle } from 'react-native-animated-spinkit';

import {
  exportAllData, updateExportAllDataProgress, deleteAllData, updateDeleteAllDataProgress,
} from '../actions';
import { SM_WIDTH } from '../types/const';
import { tailwind } from '../stylesheets/tailwind';

const _SettingsPopupData = (props) => {

  const { onSidebarOpenBtnClick, onToDeleteAllDataViewBtnClick } = props;
  const { width: safeAreaWidth } = useSafeAreaFrame();

  return (
    <View style={tailwind('p-4 md:p-6 md:pt-4', safeAreaWidth)}>
      <View style={tailwind('border-b border-gray-200 md:hidden', safeAreaWidth)}>
        <TouchableOpacity onPress={onSidebarOpenBtnClick} style={tailwind('pb-1')}>
          <Text style={tailwind('text-sm text-gray-500 font-normal')}>{'<'} <Text style={tailwind('text-sm text-gray-500 font-normal')}>Settings</Text></Text>
        </TouchableOpacity>
        <Text style={tailwind('pb-2 text-xl text-gray-800 font-medium leading-6')}>Data</Text>
      </View>
      <View style={tailwind('mt-6 md:mt-0', safeAreaWidth)}>
        <Text style={tailwind('text-base text-gray-800 font-medium leading-5')}>Data Server</Text>
        <Text style={tailwind('mt-2.5 text-base text-gray-500 font-normal leading-6.5')}>Justnote stores your data in a Stacks data server. You can specify which Stacks data server to store your data. By default, your Stacks data server is at <Text onPress={() => Linking.openURL('https://hub.blockstack.org/hub_info')} style={tailwind('text-base text-gray-500 font-normal leading-6.5 underline')}>hub.blockstack.org</Text> provided by <Text onPress={() => Linking.openURL('https://www.hiro.so')} style={tailwind('text-base text-gray-500 font-normal leading-6.5 underline')}>Hiro Systems</Text>. You can also deploy your own Stacks data server. To change your Stacks data server, you need to record your server’s information to Stacks blockchain. Justnote stores your data to the server specified in the blockchain. For more details, please visit <Text onPress={() => Linking.openURL('https://docs.stacks.co/build-apps/references/gaia')} style={tailwind('text-base text-gray-500 font-normal leading-6.5 underline')}>Stacks Gaia</Text>.</Text>
      </View>
      <View style={tailwind('mt-8')}>
        <Text style={tailwind('text-base text-gray-800 font-medium leading-5')}>Import Data</Text>
        <Text style={tailwind('mt-2.5 text-base text-gray-500 font-normal leading-6.5')}>Import data from a zip file. Please go to <Text onPress={() => Linking.openURL('https://justnote.cc')} style={tailwind('text-base text-gray-500 font-normal underline leading-6.5')}>Justnote.cc</Text> to take the action.</Text>
      </View>
      <View style={tailwind('mt-8')}>
        <Text style={tailwind('text-base text-gray-800 font-medium leading-5')}>Export All Data</Text>
        <Text style={tailwind('mt-2.5 text-base text-gray-500 font-normal leading-6.5')}>Export all your data from server to your device in a zip file. Please go to <Text onPress={() => Linking.openURL('https://justnote.cc')} style={tailwind('text-base text-gray-500 font-normal underline leading-6.5')}>Justnote.cc</Text> to take the action.</Text>
      </View>
      <View style={tailwind('mt-8 mb-4')}>
        <TouchableOpacity onPress={onToDeleteAllDataViewBtnClick}>
          <Text style={tailwind('text-base text-gray-800 font-medium leading-5 underline')}>Delete All Data</Text>
        </TouchableOpacity>
        <Text style={tailwind('mt-2.5 text-base text-gray-500 font-normal leading-6.5')}>Delete all your data including but not limited to all your saved notes in all lists, all your created lists, and all your settings.</Text>
      </View>
    </View>
  );
};

const _SettingsPopupDataExport = (props) => {

  const { onBackToDataViewBtnClick } = props;
  const { width: safeAreaWidth } = useSafeAreaFrame();
  const exportAllDataProgress = useSelector(state => state.display.exportAllDataProgress);
  const didClick = useRef(false);
  const dispatch = useDispatch();

  const onExportAllDataBtnClick = () => {
    if (didClick.current) return;
    dispatch(exportAllData());
    didClick.current = true;
  };

  useEffect(() => {
    return () => {
      if (exportAllDataProgress) {
        const { total, done } = exportAllDataProgress;
        if (total === done) dispatch(updateExportAllDataProgress(null));
      }
    };
  }, [exportAllDataProgress, dispatch]);

  let actionPanel;
  if (!exportAllDataProgress) {
    actionPanel = (
      <View style={tailwind('mt-6 mb-4 justify-start items-start')}>
        <TouchableOpacity onPress={onExportAllDataBtnClick} style={tailwind('px-2 py-2 border border-gray-300 rounded-md bg-white shadow-sm')}>
          <Text style={tailwind('text-sm text-gray-500 font-normal')}>Export All My Data</Text>
        </TouchableOpacity>
      </View>
    );
  } else if (exportAllDataProgress.total === -1) {
    actionPanel = (
      <View style={tailwind('mt-6 mb-4')}>
        <View style={tailwind('flex-row items-center')}>
          <Svg style={tailwind('text-red-500 font-normal')} width={20} height={20} viewBox="0 0 20 20" fill="currentColor">
            <Path fillRule="evenodd" clipRule="evenodd" d="M18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10ZM11 14C11 14.5523 10.5523 15 10 15C9.44772 15 9 14.5523 9 14C9 13.4477 9.44772 13 10 13C10.5523 13 11 13.4477 11 14ZM10 5C9.44772 5 9 5.44772 9 6V10C9 10.5523 9.44772 11 10 11C10.5523 11 11 10.5523 11 10V6C11 5.44772 10.5523 5 10 5Z" />
          </Svg>
          <Text style={tailwind('ml-1 text-base text-red-600 font-normal')}>Oops..., something went wrong!</Text>
        </View>
        <Text style={tailwind('text-base text-red-600 font-normal leading-6.5')}>{exportAllDataProgress.error}</Text>
        <Text style={tailwind('mt-6 text-base text-gray-500 font-normal leading-6.5')}>Please wait a moment and try again. If the problem persists, please <Text onPress={() => Linking.openURL('https://justnote.cc/support')} style={tailwind('text-base text-gray-500 font-normal underline')}>contact us</Text>
          <Svg style={tailwind('mb-2 text-gray-500 font-normal')} width={16} height={16} viewBox="0 0 20 20" fill="currentColor">
            <Path d="M11 3C10.4477 3 10 3.44772 10 4C10 4.55228 10.4477 5 11 5H13.5858L7.29289 11.2929C6.90237 11.6834 6.90237 12.3166 7.29289 12.7071C7.68342 13.0976 8.31658 13.0976 8.70711 12.7071L15 6.41421V9C15 9.55228 15.4477 10 16 10C16.5523 10 17 9.55228 17 9V4C17 3.44772 16.5523 3 16 3H11Z" />
            <Path d="M5 5C3.89543 5 3 5.89543 3 7V15C3 16.1046 3.89543 17 5 17H13C14.1046 17 15 16.1046 15 15V12C15 11.4477 14.5523 11 14 11C13.4477 11 13 11.4477 13 12V15H5V7H8C8.55228 7 9 6.55228 9 6C9 5.44772 8.55228 5 8 5H5Z" />
          </Svg>.
        </Text>
      </View>
    );
  } else if (exportAllDataProgress.total === 0) {
    actionPanel = (
      <View style={tailwind('mt-6 mb-4')}>
        <View style={tailwind('flex-row items-center')}>
          <Svg style={tailwind('text-gray-400 font-normal')} width={20} height={20} viewBox="0 0 20 20" fill="currentColor">
            <Path fillRule="evenodd" clipRule="evenodd" d="M18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10ZM11 6C11 6.55228 10.5523 7 10 7C9.44772 7 9 6.55228 9 6C9 5.44772 9.44772 5 10 5C10.5523 5 11 5.44772 11 6ZM9 9C8.44772 9 8 9.44772 8 10C8 10.5523 8.44772 11 9 11V14C9 14.5523 9.44772 15 10 15H11C11.5523 15 12 14.5523 12 14C12 13.4477 11.5523 13 11 13V10C11 9.44772 10.5523 9 10 9H9Z" />
          </Svg>
          <Text style={tailwind('ml-1 text-base text-gray-500 font-normal')}>No data to export.</Text>
        </View>
        <Text style={tailwind('text-base text-gray-500 font-normal')}>{exportAllDataProgress.done} / {exportAllDataProgress.total}</Text>
      </View>
    );
  } else if (exportAllDataProgress.total === exportAllDataProgress.done) {
    actionPanel = (
      <View style={tailwind('mt-6 mb-4')}>
        <View style={tailwind('flex-row items-center')}>
          <Svg style={tailwind('text-green-500 font-normal')} width={20} height={20} viewBox="0 0 20 20" fill="currentColor">
            <Path fillRule="evenodd" clipRule="evenodd" d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18ZM13.7071 8.70711C14.0976 8.31658 14.0976 7.68342 13.7071 7.29289C13.3166 6.90237 12.6834 6.90237 12.2929 7.29289L9 10.5858L7.70711 9.29289C7.31658 8.90237 6.68342 8.90237 6.29289 9.29289C5.90237 9.68342 5.90237 10.3166 6.29289 10.7071L8.29289 12.7071C8.68342 13.0976 9.31658 13.0976 9.70711 12.7071L13.7071 8.70711Z" />
          </Svg>
          <Text style={tailwind('ml-1 text-base text-gray-500 font-normal')}>Done</Text>
        </View>
        <Text style={tailwind('text-base text-gray-500 font-normal')}>{exportAllDataProgress.done} / {exportAllDataProgress.total}</Text>
      </View>
    );
  } else {
    actionPanel = (
      <View style={tailwind('mt-6 mb-4')}>
        <View style={tailwind('flex-row items-center')}>
          <Circle size={20} color="rgba(107, 114, 128, 1)" />
          <Text style={tailwind('ml-1 text-base text-gray-500 font-normal')}>Exporting...</Text>
        </View>
        <Text style={tailwind('text-base text-gray-500 font-normal')}>{exportAllDataProgress.done} / {exportAllDataProgress.total}</Text>
      </View>
    );
  }

  return (
    <View style={tailwind('p-4 md:p-6 md:pt-4', safeAreaWidth)}>
      <View style={tailwind('border-b border-gray-200 md:border-b-0', safeAreaWidth)}>
        <TouchableOpacity onPress={onBackToDataViewBtnClick} style={tailwind('pb-1 md:pb-0', safeAreaWidth)}>
          <Text style={tailwind('text-sm text-gray-500 font-normal')}>{'<'} {safeAreaWidth < SM_WIDTH ? 'Settings / ' : ''}Data</Text>
        </TouchableOpacity>
        <Text style={tailwind('pb-2 text-xl text-gray-800 font-medium leading-6 md:pb-0', safeAreaWidth)}>Export All Data</Text>
      </View>
      <Text style={tailwind('mt-6 text-base text-gray-500 font-normal leading-6.5')}>Export all your data from server to your device in a zip file.</Text>
      <Text style={tailwind('mt-6 text-base text-gray-500 font-normal leading-6.5')}>It may take several minutes to export all your data.</Text>
      {actionPanel}
    </View>
  );
};

const _SettingsPopupDataDelete = (props) => {

  const { onBackToDataViewBtnClick } = props;
  const { width: safeAreaWidth } = useSafeAreaFrame();
  const deleteAllDataProgress = useSelector(state => state.display.deleteAllDataProgress);
  const [didCheckConfirm, setDidCheckConfirm] = useState(false);
  const [isRequiredConfirmShown, setIsRequiredConfirmShown] = useState(false);
  const didClick = useRef(false);
  const dispatch = useDispatch();

  const onConfirmInputChange = () => {
    setDidCheckConfirm(!didCheckConfirm);
    setIsRequiredConfirmShown(false);
  };

  const onDeleteAllDataBtnClick = () => {
    if (didClick.current) return;

    if (didCheckConfirm) {
      if (isRequiredConfirmShown) setIsRequiredConfirmShown(false);
      dispatch(deleteAllData());
      didClick.current = true;
      return;
    }

    setIsRequiredConfirmShown(true);
  };

  useEffect(() => {
    return () => {
      if (deleteAllDataProgress) {
        const { total, done } = deleteAllDataProgress;
        if (total === done) dispatch(updateDeleteAllDataProgress(null));
      }
    };
  }, [deleteAllDataProgress, dispatch]);

  const switchThumbColorOn = 'rgba(34, 197, 94, 1)';
  const switchThumbColorOff = 'rgba(243, 244, 246, 1)';
  const switchTrackColorOn = Platform.OS === 'android' ? 'rgba(187, 247, 208, 1)' : 'rgba(34, 197, 94, 1)';
  const switchTrackColorOff = 'rgba(156, 163, 175, 1)';

  let actionPanel;
  if (!deleteAllDataProgress) {
    actionPanel = (
      <View style={tailwind('mt-6 mb-4 justify-start items-start')}>
        <TouchableOpacity onPress={onDeleteAllDataBtnClick} style={tailwind('px-2 py-2 border border-gray-300 rounded-md bg-white shadow-sm')}>
          <Text style={tailwind('text-sm text-gray-500 font-normal')}>Delete All My Data</Text>
        </TouchableOpacity>
        {isRequiredConfirmShown && <Text style={tailwind('mt-2 text-base text-red-600 font-normal')}>Please confirm by checking the box above first.</Text>}
      </View>
    );
  } else if (deleteAllDataProgress.total === -1) {
    actionPanel = (
      <View style={tailwind('mt-6 mb-4')}>
        <View style={tailwind('flex-row items-center')}>
          <Svg style={tailwind('text-red-500 font-normal')} width={20} height={20} viewBox="0 0 20 20" fill="currentColor">
            <Path fillRule="evenodd" clipRule="evenodd" d="M18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10ZM11 14C11 14.5523 10.5523 15 10 15C9.44772 15 9 14.5523 9 14C9 13.4477 9.44772 13 10 13C10.5523 13 11 13.4477 11 14ZM10 5C9.44772 5 9 5.44772 9 6V10C9 10.5523 9.44772 11 10 11C10.5523 11 11 10.5523 11 10V6C11 5.44772 10.5523 5 10 5Z" />
          </Svg>
          <Text style={tailwind('ml-1 text-base text-red-600 font-normal')}>Oops..., something went wrong!</Text>
        </View>
        <Text style={tailwind('text-base text-red-600 font-normal leading-6.5')}>{deleteAllDataProgress.error}</Text>
        <Text style={tailwind('mt-6 text-base text-gray-500 font-normal leading-6.5')}>Please wait a moment and try again. If the problem persists, please <Text onPress={() => Linking.openURL('https://justnote.cc/support')} style={tailwind('text-base text-gray-500 font-normal underline')}>contact us</Text>
          <Svg style={tailwind('mb-2 text-gray-500 font-normal')} width={16} height={16} viewBox="0 0 20 20" fill="currentColor">
            <Path d="M11 3C10.4477 3 10 3.44772 10 4C10 4.55228 10.4477 5 11 5H13.5858L7.29289 11.2929C6.90237 11.6834 6.90237 12.3166 7.29289 12.7071C7.68342 13.0976 8.31658 13.0976 8.70711 12.7071L15 6.41421V9C15 9.55228 15.4477 10 16 10C16.5523 10 17 9.55228 17 9V4C17 3.44772 16.5523 3 16 3H11Z" />
            <Path d="M5 5C3.89543 5 3 5.89543 3 7V15C3 16.1046 3.89543 17 5 17H13C14.1046 17 15 16.1046 15 15V12C15 11.4477 14.5523 11 14 11C13.4477 11 13 11.4477 13 12V15H5V7H8C8.55228 7 9 6.55228 9 6C9 5.44772 8.55228 5 8 5H5Z" />
          </Svg>.
        </Text>
      </View>
    );
  } else if (deleteAllDataProgress.total === 0) {
    actionPanel = (
      <View style={tailwind('mt-6 mb-4')}>
        <View style={tailwind('flex-row items-center')}>
          <Svg style={tailwind('text-gray-400 font-normal')} width={20} height={20} viewBox="0 0 20 20" fill="currentColor">
            <Path fillRule="evenodd" clipRule="evenodd" d="M18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10ZM11 6C11 6.55228 10.5523 7 10 7C9.44772 7 9 6.55228 9 6C9 5.44772 9.44772 5 10 5C10.5523 5 11 5.44772 11 6ZM9 9C8.44772 9 8 9.44772 8 10C8 10.5523 8.44772 11 9 11V14C9 14.5523 9.44772 15 10 15H11C11.5523 15 12 14.5523 12 14C12 13.4477 11.5523 13 11 13V10C11 9.44772 10.5523 9 10 9H9Z" />
          </Svg>
          <Text style={tailwind('ml-1 text-base text-gray-500 font-normal')}>No data to delete.</Text>
        </View>
        <Text style={tailwind('text-base text-gray-500 font-normal')}>{deleteAllDataProgress.done} / {deleteAllDataProgress.total}</Text>
      </View>
    );
  } else if (deleteAllDataProgress.total === deleteAllDataProgress.done) {
    actionPanel = (
      <View style={tailwind('mt-6 mb-4')}>
        <View style={tailwind('flex-row items-center')}>
          <Svg style={tailwind('text-green-500 font-normal')} width={20} height={20} viewBox="0 0 20 20" fill="currentColor">
            <Path fillRule="evenodd" clipRule="evenodd" d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18ZM13.7071 8.70711C14.0976 8.31658 14.0976 7.68342 13.7071 7.29289C13.3166 6.90237 12.6834 6.90237 12.2929 7.29289L9 10.5858L7.70711 9.29289C7.31658 8.90237 6.68342 8.90237 6.29289 9.29289C5.90237 9.68342 5.90237 10.3166 6.29289 10.7071L8.29289 12.7071C8.68342 13.0976 9.31658 13.0976 9.70711 12.7071L13.7071 8.70711Z" />
          </Svg>
          <Text style={tailwind('ml-1 text-base text-gray-500 font-normal')}>Done</Text>
        </View>
        <Text style={tailwind('text-base text-gray-500 font-normal')}>{deleteAllDataProgress.done} / {deleteAllDataProgress.total}</Text>
      </View>
    );
  } else {
    actionPanel = (
      <View style={tailwind('mt-6 mb-4')}>
        <View style={tailwind('flex-row items-center')}>
          <Circle size={20} color="rgba(107, 114, 128, 1)" />
          <Text style={tailwind('ml-1 text-base text-gray-500 font-normal')}>Deleting...</Text>
        </View>
        <Text style={tailwind('text-base text-gray-500 font-normal')}>{deleteAllDataProgress.done} / {deleteAllDataProgress.total}</Text>
      </View>
    );
  }

  return (
    <View style={tailwind('p-4 md:p-6 md:pt-4', safeAreaWidth)}>
      <View style={tailwind('border-b border-gray-200 md:border-b-0', safeAreaWidth)}>
        <TouchableOpacity onPress={onBackToDataViewBtnClick} style={tailwind('pb-1 md:pb-0', safeAreaWidth)}>
          <Text style={tailwind('text-sm text-gray-500 font-normal')}>{'<'} {safeAreaWidth < SM_WIDTH ? 'Settings / ' : ''}Data</Text>
        </TouchableOpacity>
        <Text style={tailwind('pb-2 text-xl text-gray-800 font-medium leading-6 md:pb-0', safeAreaWidth)}>Delete All Data</Text>
      </View>
      <Text style={tailwind('mt-6 text-base text-gray-500 font-normal leading-6.5')}>Delete all your data including but not limited to all your saved notes in all lists, all your created lists, and all your settings.</Text>
      <Text style={tailwind('mt-6 text-base text-gray-500 font-normal leading-6.5')}>This will only remove all your data, not your account. You will still be able to sign in.</Text>
      <Text style={tailwind('mt-6 text-base text-gray-500 font-normal leading-6.5')}>It may take several minutes to delete all your data.</Text>
      <Text style={tailwind('mt-6 text-base text-red-500 font-normal leading-6.5')}>This action CANNOT be undone.</Text>
      <View style={tailwind('mt-6 flex-row items-center')}>
        <Switch onValueChange={onConfirmInputChange} style={tailwind('flex-shrink-0 flex-grow-0')} value={didCheckConfirm} thumbColor={Platform.OS === 'android' ? didCheckConfirm ? switchThumbColorOn : switchThumbColorOff : ''} trackColor={{ true: switchTrackColorOn, false: switchTrackColorOff }} />
        <Text style={tailwind('flex-shrink flex-grow ml-2 text-base text-gray-500 font-normal')}>Yes, I’m absolutely sure I want to delete all my data.</Text>
      </View>
      {actionPanel}
    </View>
  );
};

export const SettingsPopupData = React.memo(_SettingsPopupData);
export const SettingsPopupDataExport = React.memo(_SettingsPopupDataExport);
export const SettingsPopupDataDelete = React.memo(_SettingsPopupDataDelete);
