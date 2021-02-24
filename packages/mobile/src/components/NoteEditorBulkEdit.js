import React from 'react';
import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useSafeAreaFrame } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { updateBulkEdit } from '../actions';
import { getSelectedNoteIdsLength } from '../selectors';
import { tailwind } from '../stylesheets/tailwind';

import NoteCommands from './NoteCommands';

const NoteEditorBulkEdit = (props) => {

  const { width } = props;
  const { width: safeAreaWidth } = useSafeAreaFrame();
  const selectedNoteIdsLength = useSelector(getSelectedNoteIdsLength);
  const dispatch = useDispatch();

  const onExitBtnClick = () => {
    dispatch(updateBulkEdit(false));
  };

  const style = { width: Math.max(400, width) };

  return (
    <View style={tailwind('w-full h-full')}>
      <ScrollView horizontal={true}>
        <View style={[tailwind('px-4 h-full bg-gray-600 sm:px-6 lg:px-8', safeAreaWidth), style]}>
          <TouchableOpacity onPress={onExitBtnClick} style={tailwind('absolute top-5 right-5 p-2')}>
            <Svg width={20} height={20} style={tailwind('text-white font-normal')} viewBox="0 0 20 20" fill="currentColor">
              <Path fillRule="evenodd" clipRule="evenodd" d="M4.29303 4.29302C4.48056 4.10555 4.73487 4.00023 5.00003 4.00023C5.26519 4.00023 5.5195 4.10555 5.70703 4.29302L10 8.58602L14.293 4.29302C14.3853 4.19751 14.4956 4.12133 14.6176 4.06892C14.7396 4.01651 14.8709 3.98892 15.0036 3.98777C15.1364 3.98662 15.2681 4.01192 15.391 4.0622C15.5139 4.11248 15.6255 4.18673 15.7194 4.28062C15.8133 4.37452 15.8876 4.48617 15.9379 4.60907C15.9881 4.73196 16.0134 4.86364 16.0123 4.99642C16.0111 5.1292 15.9835 5.26042 15.9311 5.38242C15.8787 5.50443 15.8025 5.61477 15.707 5.70702L11.414 10L15.707 14.293C15.8892 14.4816 15.99 14.7342 15.9877 14.9964C15.9854 15.2586 15.8803 15.5094 15.6948 15.6948C15.5094 15.8802 15.2586 15.9854 14.9964 15.9877C14.7342 15.99 14.4816 15.8892 14.293 15.707L10 11.414L5.70703 15.707C5.51843 15.8892 5.26583 15.99 5.00363 15.9877C4.74143 15.9854 4.49062 15.8802 4.30521 15.6948C4.1198 15.5094 4.01463 15.2586 4.01236 14.9964C4.01008 14.7342 4.11087 14.4816 4.29303 14.293L8.58603 10L4.29303 5.70702C4.10556 5.51949 4.00024 5.26518 4.00024 5.00002C4.00024 4.73486 4.10556 4.48055 4.29303 4.29302Z" />
            </Svg>
          </TouchableOpacity>
          <View style={tailwind('w-full h-16')}></View>
          <View>
            <Text style={tailwind('pt-5 text-white text-lg font-medium')}>{selectedNoteIdsLength} Notes selected</Text>
            <Text style={tailwind('pt-7 text-white text-sm font-normal')}>Please choose an action below.</Text>
            <View style={tailwind('pt-3 flex-row')}>
              <NoteCommands isOnDarkBackground={true} isLeftAlign={true} />
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default React.memo(NoteEditorBulkEdit);
