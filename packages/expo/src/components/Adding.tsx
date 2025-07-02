import React, { useState, useEffect, useRef } from 'react';
import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useShareIntentContext } from 'expo-share-intent';

import { useSelector, useDispatch } from '../store';
import serverApi from '../apis/server';
import { MY_NOTES, INDEX, DOT_JSON, PUT_FILE, N_NOTES, UTF8 } from '../types/const';
import {
  isObject, isString, randomString, createDataFName, createNoteFPath,
  throwIfPerformFilesError,
} from '../utils';
import vars from '../vars';

import { useSafeAreaFrame, useTailwind } from '.';

const RENDER_ADDING = 'RENDER_ADDING';
const RENDER_ADDED = 'RENDER_ADDED';
const RENDER_NOT_SIGNED_IN = 'RENDER_NOT_SIGNED_IN';
const RENDER_INVALID = 'RENDER_INVALID';
const RENDER_ERROR = 'RENDER_ERROR';

const addNote = async (text) => {
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
  const {
    hasShareIntent, shareIntent, error, resetShareIntent,
  } = useShareIntentContext();

  const isUserSignedIn = useSelector(state => state.user.isUserSignedIn);
  const [type, setType] = useState(null);
  const dispatch = useDispatch();
  const tailwind = useTailwind();


  const onBackgroundBtnClick = () => {
    if (type === RENDER_ADDED) {
      //exitApp();
      return;
    }
  };

  return (
    <ScrollView contentContainerStyle={tailwind('min-h-full')}>

    </ScrollView>
  );
};

export default React.memo(Adding);
