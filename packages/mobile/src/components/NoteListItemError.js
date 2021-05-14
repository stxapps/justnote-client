import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useDispatch } from 'react-redux';
import Svg, { Path } from 'react-native-svg';

import { updateNoteId } from '../actions';
import { isDiedStatus } from '../utils';
import { tailwind } from '../stylesheets/tailwind';

const NoteListItemError = (props) => {

  const { note } = props;
  const dispatch = useDispatch();

  const onContentBtnClick = () => {
    dispatch(updateNoteId(note.id, false, true));
  };

  let title, body;
  if (note.id.startsWith('conflict')) {
    title = 'Version Conflicts';
    body = 'Select this note and manually choose the correct version.';
  } else if (isDiedStatus(note.status)) {
    title = 'Oops..., something went wrong';
    body = 'Select this note and try again.';
  } else throw new Error(`Invalid id: ${note.id} and status: ${note.status}.`);

  return (
    <TouchableOpacity activeOpacity={1.0} onPress={onContentBtnClick} style={tailwind('w-full rounded-sm flex-row items-center')}>
      <View style={tailwind('w-10 h-10 bg-red-50 border border-red-100 mr-3 rounded-full items-center justify-center')}>
        <Svg style={tailwind('w-5 h-5 text-red-400')} viewBox="0 0 20 20" fill="currentColor">
          <Path fillRule="evenodd" clipRule="evenodd" d="M8.25709 3.09898C9.02209 1.73898 10.9791 1.73898 11.7431 3.09898L17.3231 13.019C18.0731 14.353 17.1101 15.999 15.5811 15.999H4.42009C2.89009 15.999 1.92709 14.353 2.67709 13.019L8.25709 3.09898ZM11.0001 13C11.0001 13.2652 10.8947 13.5196 10.7072 13.7071C10.5197 13.8946 10.2653 14 10.0001 14C9.73488 14 9.48052 13.8946 9.29299 13.7071C9.10545 13.5196 9.00009 13.2652 9.00009 13C9.00009 12.7348 9.10545 12.4804 9.29299 12.2929C9.48052 12.1053 9.73488 12 10.0001 12C10.2653 12 10.5197 12.1053 10.7072 12.2929C10.8947 12.4804 11.0001 12.7348 11.0001 13V13ZM10.0001 4.99998C9.73488 4.99998 9.48052 5.10534 9.29299 5.29287C9.10545 5.48041 9.00009 5.73476 9.00009 5.99998V8.99998C9.00009 9.2652 9.10545 9.51955 9.29299 9.70709C9.48052 9.89462 9.73488 9.99998 10.0001 9.99998C10.2653 9.99998 10.5197 9.89462 10.7072 9.70709C10.8947 9.51955 11.0001 9.2652 11.0001 8.99998V5.99998C11.0001 5.73476 10.8947 5.48041 10.7072 5.29287C10.5197 5.10534 10.2653 4.99998 10.0001 4.99998Z" />
        </Svg>
      </View>
      <View style={tailwind('flex-1')}>
        <Text style={tailwind('text-sm font-semibold text-red-700')} numberOfLines={1} ellipsizeMode="tail">{title}</Text>
        <Text style={tailwind('text-sm text-red-600 font-normal mt-1')} numberOfLines={3} ellipsizeMode="tail">{body}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default React.memo(NoteListItemError);
