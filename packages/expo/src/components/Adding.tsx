import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { useShareIntentContext } from 'expo-share-intent';
import Svg, { Path } from 'react-native-svg';
import { Flow } from 'react-native-animated-spinkit';

import { useSelector } from '../store';
import serverApi from '../apis/server';
import { MY_NOTES, INDEX, DOT_JSON, PUT_FILE, N_NOTES, BLK_MODE } from '../types/const';
import { getThemeMode } from '../selectors';
import {
  isObject, isString, randomString, createDataFName, createNoteFPath,
  throwIfPerformFilesError,
} from '../utils';
import vars from '../vars';

import Logo from '../images/logo-short.svg';
import LogoBlk from '../images/logo-short-blk.svg';

import { useSafeAreaFrame, useTailwind } from '.';

const RENDER_ADDING = 'RENDER_ADDING';
const RENDER_ADDED = 'RENDER_ADDED';
const RENDER_NOT_SIGNED_IN = 'RENDER_NOT_SIGNED_IN';
const RENDER_INVALID = 'RENDER_INVALID';
const RENDER_ERROR = 'RENDER_ERROR';

const getText = (intent) => {
  if (!isObject(intent)) return '';

  if (isString(intent.text)) return intent.text;
  if (isString(intent.webUrl)) return intent.webUrl;

  return '';
};

const addText = async (text) => {
  const listName = MY_NOTES, addedDT = Date.now();
  const body = '<p>' + text.replace(/\r?\n/g, '<br>') + '</p>';
  const note = {
    parentIds: null,
    id: `${addedDT}${randomString(4)}`,
    title: '', body, media: [], addedDT,
    updatedDT: addedDT,
  };

  const fname = createDataFName(note.id, note.parentIds);
  const fpath = createNoteFPath(listName, fname, INDEX + DOT_JSON);
  const content = { title: note.title, body: note.body };

  const values = [{ id: note.id, type: PUT_FILE, path: fpath, content }];
  const data = { values, isSequential: false, nItemsForNs: N_NOTES };
  const results = await serverApi.performFiles(data);
  throwIfPerformFilesError(data, results);
};

const Adding = () => {
  const { shareIntent, error, resetShareIntent } = useShareIntentContext();
  const { height: safeAreaHeight } = useSafeAreaFrame();
  const isUserSignedIn = useSelector(state => state.user.isUserSignedIn);
  const isUserDummy = useSelector(state => state.user.isUserDummy);
  const themeMode = useSelector(state => getThemeMode(state));
  const [type, setType] = useState(null);
  const prevText = useRef(null);
  const tailwind = useTailwind();

  const process = useCallback(async () => {
    if (![true, false].includes(isUserSignedIn)) return;

    if (isUserSignedIn === false) {
      setType(RENDER_NOT_SIGNED_IN);
      return;
    }
    if (error) {
      setType(RENDER_ERROR);
      return;
    }

    let text = getText(shareIntent);
    text = text.trim();
    if (text.length === 0) {
      setType(RENDER_INVALID);
      return;
    }

    if (prevText.current === text) return;
    prevText.current = text;
    setType(RENDER_ADDING);

    try {
      await addText(text);
    } catch (error) {
      console.log('adding.addText error:', error);
      prevText.current = null;
      setType(RENDER_ERROR);
      return;
    }

    setType(RENDER_ADDED);
    vars.translucentAdding.didShare = true;
  }, [shareIntent, error, isUserSignedIn]);

  useEffect(() => {
    process();
  }, [process]);

  const _render = (content) => {
    const classes = safeAreaHeight >= 640 ? '-mt-24 justify-center' : 'pt-28 md:pt-36';

    return (
      <ScrollView style={tailwind('flex-1')} contentContainerStyle={[tailwind('bg-white blk:bg-gray-900'), { minHeight: safeAreaHeight }]}>
        <View style={tailwind('items-center')}>
          <View style={tailwind('h-14 w-full max-w-6xl flex-row items-center px-4 md:px-6 lg:px-8')}>
            {themeMode === BLK_MODE ? <LogoBlk width={32} height={32} /> : <Logo width={32} height={32} />}
          </View>
        </View>
        <View style={tailwind(`flex-1 items-center ${classes}`)}>
          <View style={tailwind('w-full max-w-md items-center px-4 md:px-6 lg:px-8')}>
            {content}
          </View>
        </View>
      </ScrollView>
    );
  };

  const renderNav = (doHide = false) => {
    let rightText = 'Go to Welcome >';
    if (isUserSignedIn || isUserDummy) rightText = 'Go to My Notes >';
    if (doHide) rightText = '';

    let rightLink = (
      <TouchableOpacity onPress={() => resetShareIntent()} disabled={doHide}>
        <Text style={tailwind('text-right text-base font-medium text-gray-500 blk:text-gray-300')}>{rightText}</Text>
      </TouchableOpacity>
    );

    return (
      <View style={tailwind('mt-16 w-full items-end')}>
        {rightLink}
      </View>
    );
  };

  const renderAdding = () => {
    const text = getText(shareIntent);

    const content = (
      <>
        <View style={tailwind('h-24 w-full items-center justify-center')}>
          <Flow size={56} color={themeMode === BLK_MODE ? 'rgb(156, 163, 175)' : 'rgb(156, 163, 175)'} />
        </View>
        {text.length > 0 && <View style={tailwind('mt-5 w-full max-w-xs items-center')}>
          <Text style={tailwind('text-center text-base font-normal text-gray-500 blk:text-gray-400')} numberOfLines={3} ellipsizeMode="tail">{text}</Text>
          <Text style={tailwind('mt-1 text-lg font-semibold text-gray-900 blk:text-gray-50')}>is being saved.</Text>
        </View>}
        {renderNav(true)}
      </>
    );

    return _render(content);
  };

  const renderAdded = () => {
    const text = getText(shareIntent);

    const content = (
      <>
        <View style={tailwind('w-full items-center justify-center')}>
          <Svg width={96} height={96} viewBox="0 0 96 96" fill="none">
            <Path fillRule="evenodd" clipRule="evenodd" d="M48 96C74.5098 96 96 74.5098 96 48C96 21.4903 74.5098 0 48 0C21.4903 0 0 21.4903 0 48C0 74.5098 21.4903 96 48 96ZM70.2426 40.2427C72.5856 37.8995 72.5856 34.1005 70.2426 31.7573C67.8996 29.4142 64.1004 29.4142 61.7574 31.7573L42 51.5148L34.2427 43.7573C31.8995 41.4142 28.1005 41.4142 25.7573 43.7573C23.4142 46.1005 23.4142 49.8996 25.7573 52.2426L37.7573 64.2426C40.1005 66.5856 43.8995 66.5856 46.2427 64.2426L70.2426 40.2427Z" fill="rgb(74, 222, 128)" />
            <Path fillRule="evenodd" clipRule="evenodd" d="M70.2426 40.2427C72.5856 37.8995 72.5856 34.1005 70.2426 31.7573C67.8996 29.4142 64.1004 29.4142 61.7574 31.7573L42 51.5148L34.2427 43.7573C31.8995 41.4142 28.1005 41.4142 25.7573 43.7573C23.4142 46.1005 23.4142 49.8996 25.7573 52.2426L37.7573 64.2426C40.1005 66.5856 43.8995 66.5856 46.2427 64.2426L70.2426 40.2427Z" fill="rgb(20, 83, 45)" />
          </Svg>
        </View>
        <View style={tailwind('mt-5 w-full max-w-xs items-center')}>
          <Text style={tailwind('text-center text-base font-normal text-gray-500 blk:text-gray-400')} numberOfLines={3} ellipsizeMode="tail">{text}</Text>
          <Text style={tailwind('mt-1 text-lg font-semibold text-gray-900 blk:text-gray-50')}>has been saved.</Text>
        </View>
        {renderNav()}
      </>
    );

    return _render(content);
  };

  const renderNotSignedIn = () => {
    const content = (
      <>
        <View style={tailwind('w-full items-center justify-center')}>
          <Svg style={tailwind('font-normal text-yellow-400')} width={96} height={96} viewBox="0 0 20 20" fill="currentColor">
            <Path fillRule="evenodd" clipRule="evenodd" d="M8.25706 3.09882C9.02167 1.73952 10.9788 1.73952 11.7434 3.09882L17.3237 13.0194C18.0736 14.3526 17.1102 15.9999 15.5805 15.9999H4.4199C2.89025 15.9999 1.92682 14.3526 2.67675 13.0194L8.25706 3.09882ZM11.0001 13C11.0001 13.5523 10.5524 14 10.0001 14C9.44784 14 9.00012 13.5523 9.00012 13C9.00012 12.4477 9.44784 12 10.0001 12C10.5524 12 11.0001 12.4477 11.0001 13ZM10.0001 5C9.44784 5 9.00012 5.44772 9.00012 6V9C9.00012 9.55228 9.44784 10 10.0001 10C10.5524 10 11.0001 9.55228 11.0001 9V6C11.0001 5.44772 10.5524 5 10.0001 5Z" />
          </Svg>
        </View>
        <Text style={tailwind('mt-5 w-full text-center text-base font-normal text-gray-500 blk:text-gray-400')}>Please sign in first</Text>
        {renderNav()}
      </>
    );

    return _render(content);
  };

  const renderInvalid = () => {
    const content = (
      <>
        <View style={tailwind('w-full items-center justify-center')}>
          <Svg style={tailwind('font-normal text-red-500')} width={96} height={96} viewBox="0 0 20 20" fill="currentColor">
            <Path fillRule="evenodd" clipRule="evenodd" d="M8.25706 3.09882C9.02167 1.73952 10.9788 1.73952 11.7434 3.09882L17.3237 13.0194C18.0736 14.3526 17.1102 15.9999 15.5805 15.9999H4.4199C2.89025 15.9999 1.92682 14.3526 2.67675 13.0194L8.25706 3.09882ZM11.0001 13C11.0001 13.5523 10.5524 14 10.0001 14C9.44784 14 9.00012 13.5523 9.00012 13C9.00012 12.4477 9.44784 12 10.0001 12C10.5524 12 11.0001 12.4477 11.0001 13ZM10.0001 5C9.44784 5 9.00012 5.44772 9.00012 6V9C9.00012 9.55228 9.44784 10 10.0001 10C10.5524 10 11.0001 9.55228 11.0001 9V6C11.0001 5.44772 10.5524 5 10.0001 5Z" />
          </Svg>
        </View>
        <Text style={tailwind('mt-5 w-full text-center text-base font-normal text-gray-500 blk:text-gray-400')}>No text found to save to Justnote</Text>
        {renderNav()}
      </>
    );

    return _render(content);
  };

  const renderError = () => {
    const content = (
      <>
        <View style={tailwind('w-full items-center justify-center')}>
          <Svg style={tailwind('font-normal text-red-500')} width={96} height={96} viewBox="0 0 20 20" fill="currentColor">
            <Path fillRule="evenodd" clipRule="evenodd" d="M18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10ZM11 14C11 14.5523 10.5523 15 10 15C9.44772 15 9 14.5523 9 14C9 13.4477 9.44772 13 10 13C10.5523 13 11 13.4477 11 14ZM10 5C9.44772 5 9 5.44772 9 6V10C9 10.5523 9.44772 11 10 11C10.5523 11 11 10.5523 11 10V6C11 5.44772 10.5523 5 10 5Z" />
          </Svg>
        </View>
        <Text style={tailwind('mt-2 w-full text-center text-lg font-semibold text-gray-800 blk:text-gray-100')}>Oops..., something went wrong!</Text>
        <Text style={tailwind('mt-4 w-full text-center text-base font-normal text-gray-500 blk:text-gray-400')}>Please wait for a moment and try again. If the problem persists, please contact us.</Text>
        {renderNav()}
      </>
    );

    return _render(content);
  };

  if (type === RENDER_NOT_SIGNED_IN) return renderNotSignedIn();
  if (type === RENDER_INVALID) return renderInvalid();
  if (type === RENDER_ERROR) return renderError();
  if (type === RENDER_ADDED) return renderAdded();
  return renderAdding(); // type is null or RENDER_ADDING.
};

export default React.memo(Adding);
