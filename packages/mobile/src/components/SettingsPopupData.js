import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Switch, Linking, Platform } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import Svg, { Path } from 'react-native-svg';
import { Circle } from 'react-native-animated-spinkit';

import {
  importAllData, updateImportAllDataProgress, exportAllData, updateExportAllDataProgress,
  deleteAllData, updateDeleteAllDataProgress, deleteSyncData,
  updateDeleteSyncDataProgress,
} from '../actions/data';
import { DOMAIN_NAME, HASH_SUPPORT, SM_WIDTH, BLK_MODE } from '../types/const';
import { getThemeMode } from '../selectors';

import { useSafeAreaFrame, useTailwind } from '.';

const _SettingsPopupData = (props) => {

  const {
    onSidebarOpenBtnClick, onToImportAllDataViewBtnClick,
    onToExportAllDataViewBtnClick, onToDeleteAllDataViewBtnClick,
    onToDeleteSyncDataViewBtnClick,
  } = props;
  const tailwind = useTailwind();

  return (
    <View style={tailwind('p-4 md:p-6')}>
      <View style={tailwind('border-b border-gray-200 blk:border-gray-700 md:hidden')}>
        <TouchableOpacity onPress={onSidebarOpenBtnClick} style={tailwind('pb-1')}>
          <Text style={tailwind('text-sm font-normal text-gray-500 blk:text-gray-400')}>{'<'} <Text style={tailwind('text-sm font-normal text-gray-500 blk:text-gray-400')}>Settings</Text></Text>
        </TouchableOpacity>
        <Text style={tailwind('pb-2 text-xl font-medium leading-6 text-gray-800 blk:text-gray-100')}>Data</Text>
      </View>
      <View style={tailwind('mt-6 md:mt-0')}>
        <Text style={tailwind('text-base font-medium leading-5 text-gray-800 blk:text-gray-100')}>Data Server</Text>
        <Text style={tailwind('mt-2.5 text-base font-normal leading-6.5 text-gray-500 blk:text-gray-400')}>Justnote stores your data in a Stacks data server. You can specify which Stacks data server to store your data. By default, your Stacks data server is at <Text onPress={() => Linking.openURL('https://hub.hiro.so/hub_info')} style={tailwind('text-base font-normal leading-6.5 text-gray-500 underline blk:text-gray-400')}>hub.hiro.so</Text> provided by <Text onPress={() => Linking.openURL('https://www.hiro.so')} style={tailwind('text-base font-normal leading-6.5 text-gray-500 underline blk:text-gray-400')}>Hiro Systems</Text>. You can also deploy your own Stacks data server. To change your Stacks data server, you need to record your server’s information on the Stacks blockchain. Justnote stores your data on the server specified in the blockchain. For more details, please visit <Text onPress={() => Linking.openURL('https://docs.stacks.co/docs/gaia')} style={tailwind('text-base font-normal leading-6.5 text-gray-500 underline blk:text-gray-400')}>Stacks Gaia</Text>.</Text>
      </View>
      <View style={tailwind('mt-8')}>
        <TouchableOpacity onPress={onToImportAllDataViewBtnClick}>
          <Text style={tailwind('text-base font-medium leading-5 text-gray-800 underline blk:text-gray-100')}>Import Data</Text>
        </TouchableOpacity>
        <Text style={tailwind('mt-2.5 text-base font-normal leading-6.5 text-gray-500 blk:text-gray-400')}>Import data from a zip file. The zip file can be exported from note taking apps like <Text onPress={() => Linking.openURL('https://takeout.google.com/')} style={tailwind('text-base font-normal leading-6.5 text-gray-500 underline blk:text-gray-400')}>Google Keep</Text>, <Text onPress={() => Linking.openURL('https://help.evernote.com/hc/en-us/articles/209005557-Export-notes-and-notebooks-as-ENEX-or-HTML')} style={tailwind('text-base font-normal leading-6.5 text-gray-500 underline blk:text-gray-400')}>Evernote</Text> (as multiple web pages (.html) and manually zip the folder), and our website.</Text>
      </View>
      <View style={tailwind('mt-8')}>
        <TouchableOpacity onPress={onToExportAllDataViewBtnClick}>
          <Text style={tailwind('text-base font-medium leading-5 text-gray-800 underline blk:text-gray-100')}>Export All Data</Text>
        </TouchableOpacity>
        <Text style={tailwind('mt-2.5 text-base font-normal leading-6.5 text-gray-500 blk:text-gray-400')}>Export all your data from the server to your device in a zip file.</Text>
      </View>
      <View style={tailwind('mt-8')}>
        <TouchableOpacity onPress={onToDeleteAllDataViewBtnClick}>
          <Text style={tailwind('text-base font-medium leading-5 text-gray-800 underline blk:text-gray-100')}>Delete All Data</Text>
        </TouchableOpacity>
        <Text style={tailwind('mt-2.5 text-base font-normal leading-6.5 text-gray-500 blk:text-gray-400')}>Delete all your data including but not limited to all your saved notes in all lists, all your created lists, and all your settings.</Text>
      </View>
      <View style={tailwind('mt-8 mb-4')}>
        <TouchableOpacity onPress={onToDeleteSyncDataViewBtnClick}>
          <Text style={tailwind('text-base font-medium leading-5 text-gray-800 underline blk:text-gray-100')}>Clean Up Sync Logs</Text>
        </TouchableOpacity>
        <Text style={tailwind('mt-2.5 text-base font-normal leading-6.5 text-gray-500 blk:text-gray-400')}>Clean up your sync logs used for syncing your data across your devices.</Text>
      </View>
    </View>
  );
};

const _SettingsPopupDataImport = (props) => {

  const { onBackToDataViewBtnClick } = props;
  const { width: safeAreaWidth } = useSafeAreaFrame();
  const importAllDataProgress = useSelector(
    state => state.display.importAllDataProgress
  );
  const themeMode = useSelector(state => getThemeMode(state));
  const dispatch = useDispatch();
  const tailwind = useTailwind();

  const onImportAllDataBtnClick = () => {
    dispatch(importAllData());
  };

  useEffect(() => {
    return () => {
      if (importAllDataProgress) {
        const { total, done } = importAllDataProgress;
        if (total === done) dispatch(updateImportAllDataProgress(null));
      }
    };
  }, [importAllDataProgress, dispatch]);

  let actionPanel;
  if (!importAllDataProgress) {
    actionPanel = (
      <TouchableOpacity onPress={onImportAllDataBtnClick} style={tailwind('mt-6 mb-4 items-start justify-start')}>
        <View style={tailwind('rounded-md border border-gray-300 bg-white px-2 py-2 shadow-sm blk:border-gray-400 blk:bg-gray-900')}>
          <Text style={tailwind('text-sm font-normal text-gray-500 blk:text-gray-300')}>Choose a file</Text>
        </View>
      </TouchableOpacity>
    );
  } else if (importAllDataProgress.total === -1) {
    actionPanel = (
      <View style={tailwind('mt-6 mb-4')}>
        <View style={tailwind('flex-row items-center')}>
          <Svg style={tailwind('flex-shrink-0 flex-grow-0 font-normal text-red-500 blk:text-red-500')} width={20} height={20} viewBox="0 0 20 20" fill="currentColor">
            <Path fillRule="evenodd" clipRule="evenodd" d="M18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10ZM11 14C11 14.5523 10.5523 15 10 15C9.44772 15 9 14.5523 9 14C9 13.4477 9.44772 13 10 13C10.5523 13 11 13.4477 11 14ZM10 5C9.44772 5 9 5.44772 9 6V10C9 10.5523 9.44772 11 10 11C10.5523 11 11 10.5523 11 10V6C11 5.44772 10.5523 5 10 5Z" />
          </Svg>
          <Text style={tailwind('ml-1 flex-shrink flex-grow text-base font-normal text-red-600 blk:text-red-500')}>Oops..., something went wrong!</Text>
        </View>
        <Text style={tailwind('text-base font-normal leading-6.5 text-red-600 blk:text-red-500')}>{importAllDataProgress.error}</Text>
        <Text style={tailwind('mt-6 text-base font-normal leading-6.5 text-gray-500 blk:text-gray-400')}>Please wait a moment and try again. If the problem persists, please <Text onPress={() => Linking.openURL(DOMAIN_NAME + '/' + HASH_SUPPORT)} style={tailwind('text-base font-normal leading-6.5 text-gray-500 underline blk:text-gray-400')}>contact us</Text>.</Text>
      </View>
    );
  } else if (importAllDataProgress.total === 0) {
    actionPanel = (
      <View style={tailwind('mt-6 mb-4')}>
        <View style={tailwind('flex-row items-center')}>
          <Svg style={tailwind('flex-shrink-0 flex-grow-0 font-normal text-gray-400 blk:text-gray-400')} width={20} height={20} viewBox="0 0 20 20" fill="currentColor">
            <Path fillRule="evenodd" clipRule="evenodd" d="M18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10ZM11 6C11 6.55228 10.5523 7 10 7C9.44772 7 9 6.55228 9 6C9 5.44772 9.44772 5 10 5C10.5523 5 11 5.44772 11 6ZM9 9C8.44772 9 8 9.44772 8 10C8 10.5523 8.44772 11 9 11V14C9 14.5523 9.44772 15 10 15H11C11.5523 15 12 14.5523 12 14C12 13.4477 11.5523 13 11 13V10C11 9.44772 10.5523 9 10 9H9Z" />
          </Svg>
          <Text style={tailwind('ml-1 flex-shrink flex-grow text-base font-normal text-gray-500 blk:text-gray-400')}>No data to import.</Text>
        </View>
        <Text style={tailwind('text-base font-normal text-gray-500 blk:text-gray-400')}>{importAllDataProgress.done} / {importAllDataProgress.total}</Text>
      </View>
    );
  } else if (importAllDataProgress.total === importAllDataProgress.done) {
    actionPanel = (
      <View style={tailwind('mt-6 mb-4')}>
        <View style={tailwind('flex-row items-center')}>
          <Svg style={tailwind('flex-shrink-0 flex-grow-0 font-normal text-green-500 blk:text-green-400')} width={20} height={20} viewBox="0 0 20 20" fill="currentColor">
            <Path fillRule="evenodd" clipRule="evenodd" d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18ZM13.7071 8.70711C14.0976 8.31658 14.0976 7.68342 13.7071 7.29289C13.3166 6.90237 12.6834 6.90237 12.2929 7.29289L9 10.5858L7.70711 9.29289C7.31658 8.90237 6.68342 8.90237 6.29289 9.29289C5.90237 9.68342 5.90237 10.3166 6.29289 10.7071L8.29289 12.7071C8.68342 13.0976 9.31658 13.0976 9.70711 12.7071L13.7071 8.70711Z" />
          </Svg>
          <Text style={tailwind('ml-1 flex-shrink flex-grow text-base font-normal text-gray-500 blk:text-gray-400')}>Done</Text>
        </View>
        <Text style={tailwind('text-base font-normal text-gray-500 blk:text-gray-400')}>{importAllDataProgress.done} / {importAllDataProgress.total}</Text>
      </View>
    );
  } else {
    actionPanel = (
      <View style={tailwind('mt-6 mb-4')}>
        <View style={tailwind('flex-row items-center')}>
          <Circle size={20} color={themeMode === BLK_MODE ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)'} />
          <Text style={tailwind('ml-1 text-base font-normal text-gray-500 blk:text-gray-400')}>Importing...</Text>
        </View>
        <Text style={tailwind('text-base font-normal text-gray-500 blk:text-gray-400')}>{importAllDataProgress.done} / {importAllDataProgress.total}</Text>
      </View>
    );
  }

  return (
    <View style={tailwind('p-4 md:p-6 md:pt-4')}>
      <View style={tailwind('border-b border-gray-200 blk:border-gray-700 md:border-b-0')}>
        <TouchableOpacity onPress={onBackToDataViewBtnClick} style={tailwind('pb-1 md:pb-0')}>
          <Text style={tailwind('text-sm font-normal text-gray-500 blk:text-gray-400')}>{'<'} {safeAreaWidth < SM_WIDTH ? 'Settings / ' : ''}Data</Text>
        </TouchableOpacity>
        <Text style={tailwind('pb-2 text-xl font-medium leading-6 text-gray-800 blk:text-gray-100 md:pb-0')}>Import Data</Text>
      </View>
      <Text style={tailwind('mt-6 text-base font-normal leading-6.5 text-gray-500 blk:text-gray-400')}>Import data from a zip file.</Text>
      <Text style={tailwind('mt-6 text-base font-normal leading-6.5 text-gray-500 blk:text-gray-400')}>It may take several minutes to import data.</Text>
      {actionPanel}
    </View>
  );
};

const _SettingsPopupDataExport = (props) => {

  const { onBackToDataViewBtnClick } = props;
  const { width: safeAreaWidth } = useSafeAreaFrame();
  const exportAllDataProgress = useSelector(
    state => state.display.exportAllDataProgress
  );
  const themeMode = useSelector(state => getThemeMode(state));
  const didClick = useRef(false);
  const dispatch = useDispatch();
  const tailwind = useTailwind();

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
      <TouchableOpacity onPress={onExportAllDataBtnClick} style={tailwind('mt-6 mb-4 items-start justify-start')}>
        <View style={tailwind('rounded-md border border-gray-300 bg-white px-2 py-2 shadow-sm blk:border-gray-400 blk:bg-gray-900')}>
          <Text style={tailwind('text-sm font-normal text-gray-500 blk:text-gray-300')}>Export All My Data</Text>
        </View>
      </TouchableOpacity>
    );
  } else if (exportAllDataProgress.total === -1) {
    actionPanel = (
      <View style={tailwind('mt-6 mb-4')}>
        <View style={tailwind('flex-row items-center')}>
          <Svg style={tailwind('flex-shrink-0 flex-grow-0 font-normal text-red-500 blk:text-red-500')} width={20} height={20} viewBox="0 0 20 20" fill="currentColor">
            <Path fillRule="evenodd" clipRule="evenodd" d="M18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10ZM11 14C11 14.5523 10.5523 15 10 15C9.44772 15 9 14.5523 9 14C9 13.4477 9.44772 13 10 13C10.5523 13 11 13.4477 11 14ZM10 5C9.44772 5 9 5.44772 9 6V10C9 10.5523 9.44772 11 10 11C10.5523 11 11 10.5523 11 10V6C11 5.44772 10.5523 5 10 5Z" />
          </Svg>
          <Text style={tailwind('ml-1 flex-shrink flex-grow text-base font-normal text-red-600 blk:text-red-500')}>Oops..., something went wrong!</Text>
        </View>
        <Text style={tailwind('text-base font-normal leading-6.5 text-red-600 blk:text-red-500')}>{exportAllDataProgress.error}</Text>
        <Text style={tailwind('mt-6 text-base font-normal leading-6.5 text-gray-500 blk:text-gray-400')}>Please wait a moment and try again. If the problem persists, please <Text onPress={() => Linking.openURL(DOMAIN_NAME + '/' + HASH_SUPPORT)} style={tailwind('text-base font-normal leading-6.5 text-gray-500 underline blk:text-gray-400')}>contact us</Text>.</Text>
      </View>
    );
  } else if (exportAllDataProgress.total === 0) {
    actionPanel = (
      <View style={tailwind('mt-6 mb-4')}>
        <View style={tailwind('flex-row items-center')}>
          <Svg style={tailwind('flex-shrink-0 flex-grow-0 font-normal text-gray-400 blk:text-gray-400')} width={20} height={20} viewBox="0 0 20 20" fill="currentColor">
            <Path fillRule="evenodd" clipRule="evenodd" d="M18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10ZM11 6C11 6.55228 10.5523 7 10 7C9.44772 7 9 6.55228 9 6C9 5.44772 9.44772 5 10 5C10.5523 5 11 5.44772 11 6ZM9 9C8.44772 9 8 9.44772 8 10C8 10.5523 8.44772 11 9 11V14C9 14.5523 9.44772 15 10 15H11C11.5523 15 12 14.5523 12 14C12 13.4477 11.5523 13 11 13V10C11 9.44772 10.5523 9 10 9H9Z" />
          </Svg>
          <Text style={tailwind('ml-1 flex-shrink flex-grow text-base font-normal text-gray-500 blk:text-gray-400')}>No data to export.</Text>
        </View>
        <Text style={tailwind('text-base font-normal text-gray-500 blk:text-gray-400')}>{exportAllDataProgress.done} / {exportAllDataProgress.total}</Text>
      </View>
    );
  } else if (exportAllDataProgress.total === exportAllDataProgress.done) {
    actionPanel = (
      <View style={tailwind('mt-6 mb-4')}>
        <View style={tailwind('flex-row items-center')}>
          <Svg style={tailwind('flex-shrink-0 flex-grow-0 font-normal text-green-500 blk:text-green-400')} width={20} height={20} viewBox="0 0 20 20" fill="currentColor">
            <Path fillRule="evenodd" clipRule="evenodd" d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18ZM13.7071 8.70711C14.0976 8.31658 14.0976 7.68342 13.7071 7.29289C13.3166 6.90237 12.6834 6.90237 12.2929 7.29289L9 10.5858L7.70711 9.29289C7.31658 8.90237 6.68342 8.90237 6.29289 9.29289C5.90237 9.68342 5.90237 10.3166 6.29289 10.7071L8.29289 12.7071C8.68342 13.0976 9.31658 13.0976 9.70711 12.7071L13.7071 8.70711Z" />
          </Svg>
          <Text style={tailwind('ml-1 flex-shrink flex-grow text-base font-normal text-gray-500 blk:text-gray-400')}>Done</Text>
        </View>
        <Text style={tailwind('text-base font-normal text-gray-500 blk:text-gray-400')}>{exportAllDataProgress.done} / {exportAllDataProgress.total}</Text>
      </View>
    );
  } else {
    actionPanel = (
      <View style={tailwind('mt-6 mb-4')}>
        <View style={tailwind('flex-row items-center')}>
          <Circle size={20} color={themeMode === BLK_MODE ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)'} />
          <Text style={tailwind('ml-1 text-base font-normal text-gray-500 blk:text-gray-400')}>Exporting...</Text>
        </View>
        <Text style={tailwind('text-base font-normal text-gray-500 blk:text-gray-400')}>{exportAllDataProgress.done} / {exportAllDataProgress.total}</Text>
      </View>
    );
  }

  return (
    <View style={tailwind('p-4 md:p-6 md:pt-4')}>
      <View style={tailwind('border-b border-gray-200 blk:border-gray-700 md:border-b-0')}>
        <TouchableOpacity onPress={onBackToDataViewBtnClick} style={tailwind('pb-1 md:pb-0')}>
          <Text style={tailwind('text-sm font-normal text-gray-500 blk:text-gray-400')}>{'<'} {safeAreaWidth < SM_WIDTH ? 'Settings / ' : ''}Data</Text>
        </TouchableOpacity>
        <Text style={tailwind('pb-2 text-xl font-medium leading-6 text-gray-800 blk:text-gray-100 md:pb-0')}>Export All Data</Text>
      </View>
      <Text style={tailwind('mt-6 text-base font-normal leading-6.5 text-gray-500 blk:text-gray-400')}>Export all your data from the server to your device in a zip file.</Text>
      <Text style={tailwind('mt-6 text-base font-normal leading-6.5 text-gray-500 blk:text-gray-400')}>It may take several minutes to export all your data.</Text>
      {actionPanel}
    </View>
  );
};

const _SettingsPopupDataDelete = (props) => {

  const { onBackToDataViewBtnClick } = props;
  const { width: safeAreaWidth } = useSafeAreaFrame();
  const deleteAllDataProgress = useSelector(
    state => state.display.deleteAllDataProgress
  );
  const themeMode = useSelector(state => getThemeMode(state));
  const [didCheckConfirm, setDidCheckConfirm] = useState(false);
  const [isRequiredConfirmShown, setIsRequiredConfirmShown] = useState(false);
  const didClick = useRef(false);
  const dispatch = useDispatch();
  const tailwind = useTailwind();

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

  const switchThumbColorOn = 'rgb(34, 197, 94)';
  const switchThumbColorOff = 'rgb(243, 244, 246)';
  const switchTrackColorOn = Platform.OS === 'android' ? 'rgb(187, 247, 208)' : 'rgb(34, 197, 94)';
  const switchTrackColorOff = 'rgb(156, 163, 175)';
  const switchIosTrackColorOff = themeMode === BLK_MODE ? 'rgb(55, 65, 81)' : 'rgb(243, 244, 246)';

  let actionPanel;
  if (!deleteAllDataProgress) {
    actionPanel = (
      <View style={tailwind('mt-6 mb-4 items-start justify-start')}>
        <TouchableOpacity onPress={onDeleteAllDataBtnClick} style={tailwind('rounded-md border border-gray-300 bg-white px-2 py-2 shadow-sm blk:border-gray-400 blk:bg-gray-900')}>
          <Text style={tailwind('text-sm font-normal text-gray-500 blk:text-gray-300')}>Delete All My Data</Text>
        </TouchableOpacity>
        {isRequiredConfirmShown && <Text style={tailwind('mt-2 text-base font-normal text-red-600 blk:text-red-500')}>Please confirm by checking the box above first.</Text>}
      </View>
    );
  } else if (deleteAllDataProgress.total === -1) {
    actionPanel = (
      <View style={tailwind('mt-6 mb-4')}>
        <View style={tailwind('flex-row items-center')}>
          <Svg style={tailwind('flex-shrink-0 flex-grow-0 font-normal text-red-500 blk:text-red-500')} width={20} height={20} viewBox="0 0 20 20" fill="currentColor">
            <Path fillRule="evenodd" clipRule="evenodd" d="M18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10ZM11 14C11 14.5523 10.5523 15 10 15C9.44772 15 9 14.5523 9 14C9 13.4477 9.44772 13 10 13C10.5523 13 11 13.4477 11 14ZM10 5C9.44772 5 9 5.44772 9 6V10C9 10.5523 9.44772 11 10 11C10.5523 11 11 10.5523 11 10V6C11 5.44772 10.5523 5 10 5Z" />
          </Svg>
          <Text style={tailwind('ml-1 flex-shrink flex-grow text-base font-normal text-red-600 blk:text-red-500')}>Oops..., something went wrong!</Text>
        </View>
        <Text style={tailwind('text-base font-normal leading-6.5 text-red-600 blk:text-red-500')}>{deleteAllDataProgress.error}</Text>
        <Text style={tailwind('mt-6 text-base font-normal leading-6.5 text-gray-500 blk:text-gray-400')}>Please wait a moment and try again. If the problem persists, please <Text onPress={() => Linking.openURL(DOMAIN_NAME + '/' + HASH_SUPPORT)} style={tailwind('text-base font-normal leading-6.5 text-gray-500 underline blk:text-gray-400')}>contact us</Text>.</Text>
      </View>
    );
  } else if (deleteAllDataProgress.total === 0) {
    actionPanel = (
      <View style={tailwind('mt-6 mb-4')}>
        <View style={tailwind('flex-row items-center')}>
          <Svg style={tailwind('flex-shrink-0 flex-grow-0 font-normal text-gray-400 blk:text-gray-400')} width={20} height={20} viewBox="0 0 20 20" fill="currentColor">
            <Path fillRule="evenodd" clipRule="evenodd" d="M18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10ZM11 6C11 6.55228 10.5523 7 10 7C9.44772 7 9 6.55228 9 6C9 5.44772 9.44772 5 10 5C10.5523 5 11 5.44772 11 6ZM9 9C8.44772 9 8 9.44772 8 10C8 10.5523 8.44772 11 9 11V14C9 14.5523 9.44772 15 10 15H11C11.5523 15 12 14.5523 12 14C12 13.4477 11.5523 13 11 13V10C11 9.44772 10.5523 9 10 9H9Z" />
          </Svg>
          <Text style={tailwind('ml-1 flex-shrink flex-grow text-base font-normal text-gray-500 blk:text-gray-400')}>No data to delete.</Text>
        </View>
        <Text style={tailwind('text-base font-normal text-gray-500 blk:text-gray-400')}>{deleteAllDataProgress.done} / {deleteAllDataProgress.total}</Text>
      </View>
    );
  } else if (deleteAllDataProgress.total === deleteAllDataProgress.done) {
    actionPanel = (
      <View style={tailwind('mt-6 mb-4')}>
        <View style={tailwind('flex-row items-center')}>
          <Svg style={tailwind('flex-shrink-0 flex-grow-0 font-normal text-green-500 blk:text-green-400')} width={20} height={20} viewBox="0 0 20 20" fill="currentColor">
            <Path fillRule="evenodd" clipRule="evenodd" d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18ZM13.7071 8.70711C14.0976 8.31658 14.0976 7.68342 13.7071 7.29289C13.3166 6.90237 12.6834 6.90237 12.2929 7.29289L9 10.5858L7.70711 9.29289C7.31658 8.90237 6.68342 8.90237 6.29289 9.29289C5.90237 9.68342 5.90237 10.3166 6.29289 10.7071L8.29289 12.7071C8.68342 13.0976 9.31658 13.0976 9.70711 12.7071L13.7071 8.70711Z" />
          </Svg>
          <Text style={tailwind('ml-1 flex-shrink flex-grow text-base font-normal text-gray-500 blk:text-gray-400')}>Done</Text>
        </View>
        <Text style={tailwind('text-base font-normal text-gray-500 blk:text-gray-400')}>{deleteAllDataProgress.done} / {deleteAllDataProgress.total}</Text>
      </View>
    );
  } else {
    actionPanel = (
      <View style={tailwind('mt-6 mb-4')}>
        <View style={tailwind('flex-row items-center')}>
          <Circle size={20} color={themeMode === BLK_MODE ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)'} />
          <Text style={tailwind('ml-1 text-base font-normal text-gray-500 blk:text-gray-400')}>Deleting...</Text>
        </View>
        <Text style={tailwind('text-base font-normal text-gray-500 blk:text-gray-400')}>{deleteAllDataProgress.done} / {deleteAllDataProgress.total}</Text>
      </View>
    );
  }

  return (
    <View style={tailwind('p-4 md:p-6 md:pt-4')}>
      <View style={tailwind('border-b border-gray-200 blk:border-gray-700 md:border-b-0')}>
        <TouchableOpacity onPress={onBackToDataViewBtnClick} style={tailwind('pb-1 md:pb-0')}>
          <Text style={tailwind('text-sm font-normal text-gray-500 blk:text-gray-400')}>{'<'} {safeAreaWidth < SM_WIDTH ? 'Settings / ' : ''}Data</Text>
        </TouchableOpacity>
        <Text style={tailwind('pb-2 text-xl font-medium leading-6 text-gray-800 blk:text-gray-100 md:pb-0')}>Delete All Data</Text>
      </View>
      <Text style={tailwind('mt-6 text-base font-normal leading-6.5 text-gray-500 blk:text-gray-400')}>Delete all your data including but not limited to all your saved notes in all lists, all your created lists, and all your settings.</Text>
      <Text style={tailwind('mt-6 text-base font-normal leading-6.5 text-gray-500 blk:text-gray-400')}>This will only remove all your data, not your account. You will still be able to sign in.</Text>
      <Text style={tailwind('mt-6 text-base font-normal leading-6.5 text-gray-500 blk:text-gray-400')}>It may take several minutes to delete all your data.</Text>
      <Text style={tailwind('mt-6 text-base font-normal leading-6.5 text-red-500 blk:text-red-500')}>This action CANNOT be undone.</Text>
      <View style={tailwind('mt-6 flex-row items-center')}>
        <Switch onValueChange={onConfirmInputChange} style={tailwind('flex-shrink-0 flex-grow-0')} value={didCheckConfirm} thumbColor={Platform.OS === 'android' ? didCheckConfirm ? switchThumbColorOn : switchThumbColorOff : ''} trackColor={{ true: switchTrackColorOn, false: switchTrackColorOff }} ios_backgroundColor={switchIosTrackColorOff} />
        <Text style={tailwind('ml-2 flex-shrink flex-grow text-base font-normal text-gray-500 blk:text-gray-400')}>Yes, I’m absolutely sure I want to delete all my data.</Text>
      </View>
      {actionPanel}
    </View>
  );
};

const _SettingsPopupDataDeleteSync = (props) => {

  const { onBackToDataViewBtnClick } = props;
  const { width: safeAreaWidth } = useSafeAreaFrame();
  const deleteSyncDataProgress = useSelector(
    state => state.display.deleteSyncDataProgress
  );
  const themeMode = useSelector(state => getThemeMode(state));
  const didClick = useRef(false);
  const dispatch = useDispatch();
  const tailwind = useTailwind();

  const onDeleteSyncDataBtnClick = () => {
    if (didClick.current) return;
    dispatch(deleteSyncData());
    didClick.current = true;
  };

  useEffect(() => {
    return () => {
      if (deleteSyncDataProgress) {
        const { total, done } = deleteSyncDataProgress;
        if (total === done) dispatch(updateDeleteSyncDataProgress(null));
      }
    };
  }, [deleteSyncDataProgress, dispatch]);

  let actionPanel;
  if (!deleteSyncDataProgress) {
    actionPanel = (
      <TouchableOpacity onPress={onDeleteSyncDataBtnClick} style={tailwind('mt-7 mb-4 items-start justify-start')}>
        <View style={tailwind('rounded-md border border-gray-300 bg-white px-2 py-2 shadow-sm blk:border-gray-400 blk:bg-gray-900')}>
          <Text style={tailwind('text-sm font-normal text-gray-500 blk:text-gray-300')}>Clean Up My Sync Logs</Text>
        </View>
      </TouchableOpacity>
    );
  } else if (deleteSyncDataProgress.total === -1) {
    actionPanel = (
      <View style={tailwind('mt-6 mb-4')}>
        <View style={tailwind('flex-row items-center')}>
          <Svg style={tailwind('flex-shrink-0 flex-grow-0 font-normal text-red-500 blk:text-red-500')} width={20} height={20} viewBox="0 0 20 20" fill="currentColor">
            <Path fillRule="evenodd" clipRule="evenodd" d="M18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10ZM11 14C11 14.5523 10.5523 15 10 15C9.44772 15 9 14.5523 9 14C9 13.4477 9.44772 13 10 13C10.5523 13 11 13.4477 11 14ZM10 5C9.44772 5 9 5.44772 9 6V10C9 10.5523 9.44772 11 10 11C10.5523 11 11 10.5523 11 10V6C11 5.44772 10.5523 5 10 5Z" />
          </Svg>
          <Text style={tailwind('ml-1 flex-shrink flex-grow text-base font-normal text-red-600 blk:text-red-500')}>Oops..., something went wrong!</Text>
        </View>
        <Text style={tailwind('text-base font-normal leading-6.5 text-red-600 blk:text-red-500')}>{deleteSyncDataProgress.error}</Text>
        <Text style={tailwind('mt-6 text-base font-normal leading-6.5 text-gray-500 blk:text-gray-400')}>Please wait a moment and try again. If the problem persists, please <Text onPress={() => Linking.openURL(DOMAIN_NAME + '/' + HASH_SUPPORT)} style={tailwind('text-base font-normal leading-6.5 text-gray-500 underline blk:text-gray-400')}>contact us</Text>.</Text>
      </View>
    );
  } else if (deleteSyncDataProgress.total === 0) {
    actionPanel = (
      <View style={tailwind('mt-6 mb-4')}>
        <View style={tailwind('flex-row items-center')}>
          <Svg style={tailwind('flex-shrink-0 flex-grow-0 font-normal text-gray-400 blk:text-gray-400')} width={20} height={20} viewBox="0 0 20 20" fill="currentColor">
            <Path fillRule="evenodd" clipRule="evenodd" d="M18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10ZM11 6C11 6.55228 10.5523 7 10 7C9.44772 7 9 6.55228 9 6C9 5.44772 9.44772 5 10 5C10.5523 5 11 5.44772 11 6ZM9 9C8.44772 9 8 9.44772 8 10C8 10.5523 8.44772 11 9 11V14C9 14.5523 9.44772 15 10 15H11C11.5523 15 12 14.5523 12 14C12 13.4477 11.5523 13 11 13V10C11 9.44772 10.5523 9 10 9H9Z" />
          </Svg>
          <Text style={tailwind('ml-1 flex-shrink flex-grow text-base font-normal text-gray-500 blk:text-gray-400')}>No logs to clean up.</Text>
        </View>
        <Text style={tailwind('text-base font-normal text-gray-500 blk:text-gray-400')}>{deleteSyncDataProgress.done} / {deleteSyncDataProgress.total}</Text>
      </View>
    );
  } else if (deleteSyncDataProgress.total === deleteSyncDataProgress.done) {
    actionPanel = (
      <View style={tailwind('mt-6 mb-4')}>
        <View style={tailwind('flex-row items-center')}>
          <Svg style={tailwind('flex-shrink-0 flex-grow-0 font-normal text-green-500 blk:text-green-400')} width={20} height={20} viewBox="0 0 20 20" fill="currentColor">
            <Path fillRule="evenodd" clipRule="evenodd" d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18ZM13.7071 8.70711C14.0976 8.31658 14.0976 7.68342 13.7071 7.29289C13.3166 6.90237 12.6834 6.90237 12.2929 7.29289L9 10.5858L7.70711 9.29289C7.31658 8.90237 6.68342 8.90237 6.29289 9.29289C5.90237 9.68342 5.90237 10.3166 6.29289 10.7071L8.29289 12.7071C8.68342 13.0976 9.31658 13.0976 9.70711 12.7071L13.7071 8.70711Z" />
          </Svg>
          <Text style={tailwind('ml-1 flex-shrink flex-grow text-base font-normal text-gray-500 blk:text-gray-400')}>Done</Text>
        </View>
        <Text style={tailwind('text-base font-normal text-gray-500 blk:text-gray-400')}>{deleteSyncDataProgress.done} / {deleteSyncDataProgress.total}</Text>
      </View>
    );
  } else {
    actionPanel = (
      <View style={tailwind('mt-6 mb-4')}>
        <View style={tailwind('flex-row items-center')}>
          <Circle size={20} color={themeMode === BLK_MODE ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)'} />
          <Text style={tailwind('ml-1 text-base font-normal text-gray-500 blk:text-gray-400')}>Cleaning...</Text>
        </View>
        <Text style={tailwind('text-base font-normal text-gray-500 blk:text-gray-400')}>{deleteSyncDataProgress.done} / {deleteSyncDataProgress.total}</Text>
      </View>
    );
  }

  return (
    <View style={tailwind('p-4 md:p-6 md:pt-4')}>
      <View style={tailwind('border-b border-gray-200 blk:border-gray-700 md:border-b-0')}>
        <TouchableOpacity onPress={onBackToDataViewBtnClick} style={tailwind('pb-1 md:pb-0')}>
          <Text style={tailwind('text-sm font-normal text-gray-500 blk:text-gray-400')}>{'<'} {safeAreaWidth < SM_WIDTH ? 'Settings / ' : ''}Data</Text>
        </TouchableOpacity>
        <Text style={tailwind('pb-2 text-xl font-medium leading-6 text-gray-800 blk:text-gray-100 md:pb-0')}>Clean Up Sync Logs</Text>
      </View>
      <Text style={tailwind('mt-6 text-base font-normal leading-6.5 text-gray-500 blk:text-gray-400')}>Clean up your sync logs used for syncing your data across your devices.</Text>
      <Text style={tailwind('mt-6 text-base font-normal leading-6.5 text-red-500 blk:text-red-500')}>You need to sign out on all other devices first. If not, the sync logs will be synced back and may cause some notes to have a conflicted version.</Text>
      <Text style={tailwind('mt-6 text-base font-normal leading-6.5 text-gray-500 blk:text-gray-400')}>Cleaning up sync logs helps reduce sync time as fewer sync logs to download and compare for new updates.</Text>
      <Text style={tailwind('mt-6 text-base font-normal leading-6.5 text-gray-500 blk:text-gray-400')}>It may take several minutes to clean up all your sync logs.</Text>
      {actionPanel}
    </View>
  );
};

export const SettingsPopupData = React.memo(_SettingsPopupData);
export const SettingsPopupDataImport = React.memo(_SettingsPopupDataImport);
export const SettingsPopupDataExport = React.memo(_SettingsPopupDataExport);
export const SettingsPopupDataDelete = React.memo(_SettingsPopupDataDelete);
export const SettingsPopupDataDeleteSync = React.memo(_SettingsPopupDataDeleteSync);
