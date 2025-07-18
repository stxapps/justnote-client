import React, { useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { useSelector, useDispatch } from '../store';
import { updatePopup } from '../actions';
import {
  changeListName, updateQueryString, updateSidebarListNamesMode,
} from '../actions/chunk';
import {
  SIDEBAR_POPUP, MY_NOTES, TRASH, ARCHIVE, LG_WIDTH,
  SIDEBAR_LIST_NAMES_MODE_CHANGE_TAG_NAME,
} from '../types/const';
import { getCanChangeListNames } from '../selectors';
import { getListNameObj } from '../utils';

import { useSafeAreaFrame, useTailwind } from '.';

const MODE_CHANGE_TAG_NAME = SIDEBAR_LIST_NAMES_MODE_CHANGE_TAG_NAME;

const SidebarListNames = () => {

  const mode = useSelector(state => state.display.sidebarListNamesMode);
  const listNameMap = useSelector(state => state.settings.listNameMap);
  const canChangeListNames = useSelector(state => getCanChangeListNames(state));
  const tagNameMap = useSelector(state => state.settings.tagNameMap);
  const dispatch = useDispatch();
  const tailwind = useTailwind();

  const onSwitchBtnClick = () => {
    if (mode === null) {
      dispatch(updateSidebarListNamesMode(MODE_CHANGE_TAG_NAME));
    } else if (mode === MODE_CHANGE_TAG_NAME) {
      dispatch(updateSidebarListNamesMode(null));
    } else {
      console.log('In SidebarListNames.onSwitchBtnClick, invalid mode:', mode);
    }
  };

  const isChildless = listNameMap.every(listNameObj => {
    return !listNameObj.children || listNameObj.children.length === 0;
  });

  let rootName = 'Lists', doShowSwitch = false, content;
  if (canChangeListNames) {
    if (mode === MODE_CHANGE_TAG_NAME) {
      [rootName, doShowSwitch] = ['Tags', true];
      content = tagNameMap.map(tagNameObj => {
        return (
          <SidebarTagName key={tagNameObj.tagName} tagNameObj={tagNameObj} />
        );
      });
    } else {
      if (tagNameMap.length > 0) doShowSwitch = true;
      content = listNameMap.map(listNameObj => {
        return (
          <SidebarListName key={listNameObj.listName} listNameObj={listNameObj} level={0} isChildless={isChildless} />
        );
      });
    }
  } else {
    const { listNameObj: _listNameObj } = getListNameObj(MY_NOTES, listNameMap);
    const listNameObj = { ..._listNameObj, children: null };
    content = (
      <SidebarListName key={listNameObj.listName} listNameObj={listNameObj} level={0} isChildless={true} />
    );
  }

  return (
    <View style={tailwind('mt-6 flex-1')}>
      <ScrollView>
        <View style={tailwind('pl-3')}>
          {doShowSwitch && <View style={tailwind('flex-row items-center justify-start')}>
            <Text style={tailwind('flex-shrink flex-grow text-sm font-medium text-gray-500 blk:text-gray-400')} numberOfLines={1} ellipsizeMode="tail">{rootName}</Text>
            <TouchableOpacity onPress={onSwitchBtnClick} style={tailwind('flex h-10 w-10 flex-shrink-0 flex-grow-0 items-center justify-center')}>
              <Svg style={tailwind('ml-2.5 h-5 w-5 font-normal text-gray-500 opacity-80 blk:text-gray-400')} viewBox="0 0 20 20" fill="currentColor">
                <Path d="M8.00003 5C7.73481 5 7.48046 5.10535 7.29292 5.29289C7.10539 5.48043 7.00003 5.73478 7.00003 6C7.00003 6.26521 7.10539 6.51957 7.29292 6.7071C7.48046 6.89464 7.73481 7 8.00003 7H13.586L12.293 8.293C12.1109 8.4816 12.0101 8.7342 12.0124 8.9964C12.0146 9.25859 12.1198 9.50941 12.3052 9.69482C12.4906 9.88022 12.7414 9.98539 13.0036 9.98767C13.2658 9.98995 13.5184 9.88915 13.707 9.707L16.707 6.707C16.8945 6.51947 16.9998 6.26516 16.9998 6C16.9998 5.73483 16.8945 5.48053 16.707 5.293L13.707 2.293C13.6148 2.19749 13.5044 2.1213 13.3824 2.0689C13.2604 2.01649 13.1292 1.9889 12.9964 1.98775C12.8637 1.98659 12.732 2.01189 12.6091 2.06218C12.4862 2.11246 12.3745 2.18671 12.2806 2.2806C12.1867 2.37449 12.1125 2.48615 12.0622 2.60904C12.0119 2.73194 11.9866 2.86362 11.9878 2.9964C11.9889 3.12918 12.0165 3.2604 12.0689 3.3824C12.1213 3.50441 12.1975 3.61475 12.293 3.707L13.586 5H8.00003ZM12 15C12.2652 15 12.5196 14.8946 12.7071 14.7071C12.8947 14.5196 13 14.2652 13 14C13 13.7348 12.8947 13.4804 12.7071 13.2929C12.5196 13.1054 12.2652 13 12 13H6.41403L7.70703 11.707C7.80254 11.6147 7.87872 11.5044 7.93113 11.3824C7.98354 11.2604 8.01113 11.1292 8.01228 10.9964C8.01344 10.8636 7.98813 10.7319 7.93785 10.609C7.88757 10.4861 7.81332 10.3745 7.71943 10.2806C7.62553 10.1867 7.51388 10.1125 7.39098 10.0622C7.26809 10.0119 7.13641 9.98659 7.00363 9.98775C6.87085 9.9889 6.73963 10.0165 6.61763 10.0689C6.49562 10.1213 6.38528 10.1975 6.29303 10.293L3.29303 13.293C3.10556 13.4805 3.00024 13.7348 3.00024 14C3.00024 14.2652 3.10556 14.5195 3.29303 14.707L6.29303 17.707C6.48163 17.8892 6.73424 17.99 6.99643 17.9877C7.25863 17.9854 7.50944 17.8802 7.69485 17.6948C7.88026 17.5094 7.98543 17.2586 7.9877 16.9964C7.98998 16.7342 7.88919 16.4816 7.70703 16.293L6.41403 15H12Z" />
              </Svg>
            </TouchableOpacity>
          </View>}
          <View style={tailwind('-mt-1.5 pr-1')}>
            {content}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const InnerSidebarListName = (props) => {

  const { listNameObj, level, isChildless } = props;
  const { width: safeAreaWidth } = useSafeAreaFrame();
  const listName = useSelector(state => state.display.listName);
  const queryString = useSelector(state => state.display.queryString);
  const [doExpand, setDoExpand] = useState(false);
  const dispatch = useDispatch();
  const tailwind = useTailwind();

  const onListNameBtnClick = () => {
    dispatch(changeListName(listNameObj.listName, true));
    if (safeAreaWidth < LG_WIDTH) dispatch(updatePopup(SIDEBAR_POPUP, false, null));
  };

  const onExpandBtnClick = () => {
    setDoExpand(!doExpand);
  };

  let btnClassNames, svgClassNames, textClassNames;
  if (listNameObj.listName === listName && queryString === '') {
    btnClassNames = 'bg-gray-200 blk:bg-gray-700';
    svgClassNames = 'text-gray-500 blk:text-gray-400';
    textClassNames = 'text-gray-900 blk:text-gray-100';
  } else {
    btnClassNames = '';
    svgClassNames = 'text-gray-400 blk:text-gray-500';
    textClassNames = 'text-gray-700 blk:text-gray-200';
  }
  svgClassNames += ' flex-grow-0 flex-shrink-0 mr-3 font-normal';

  let expandBtn;
  if (!isChildless) {
    if (listNameObj && listNameObj.children && listNameObj.children.length > 0) {
      const expandSvg = doExpand ? (
        <Svg style={tailwind('font-normal text-gray-500 blk:text-gray-400')} width={14} height={9} viewBox="0 0 11 7" fill="currentColor">
          <Path fillRule="evenodd" clipRule="evenodd" d="M0.292787 1.29302C0.480314 1.10555 0.734622 1.00023 0.999786 1.00023C1.26495 1.00023 1.51926 1.10555 1.70679 1.29302L4.99979 4.58602L8.29279 1.29302C8.38503 1.19751 8.49538 1.12133 8.61738 1.06892C8.73939 1.01651 8.87061 0.988924 9.00339 0.98777C9.13616 0.986616 9.26784 1.01192 9.39074 1.0622C9.51364 1.11248 9.62529 1.18673 9.71918 1.28062C9.81307 1.37452 9.88733 1.48617 9.93761 1.60907C9.98789 1.73196 10.0132 1.86364 10.012 1.99642C10.0109 2.1292 9.9833 2.26042 9.93089 2.38242C9.87848 2.50443 9.8023 2.61477 9.70679 2.70702L5.70679 6.70702C5.51926 6.89449 5.26495 6.99981 4.99979 6.99981C4.73462 6.99981 4.48031 6.89449 4.29279 6.70702L0.292787 2.70702C0.105316 2.51949 0 2.26518 0 2.00002C0 1.73486 0.105316 1.48055 0.292787 1.29302V1.29302Z" />
        </Svg>
      ) : (
        <Svg style={tailwind('font-normal text-gray-500 blk:text-gray-400')} width={20} height={12} viewBox="0 0 6 10" fill="currentColor">
          <Path fillRule="evenodd" clipRule="evenodd" d="M0.292787 9.70698C0.105316 9.51945 0 9.26514 0 8.99998C0 8.73482 0.105316 8.48051 0.292787 8.29298L3.58579 4.99998L0.292787 1.70698C0.110629 1.51838 0.00983372 1.26578 0.0121121 1.00358C0.0143906 0.741382 0.11956 0.49057 0.304968 0.305162C0.490376 0.119753 0.741189 0.0145843 1.00339 0.0123059C1.26558 0.0100274 1.51818 0.110822 1.70679 0.29298L5.70679 4.29298C5.89426 4.48051 5.99957 4.73482 5.99957 4.99998C5.99957 5.26514 5.89426 5.51945 5.70679 5.70698L1.70679 9.70698C1.51926 9.89445 1.26495 9.99977 0.999786 9.99977C0.734622 9.99977 0.480314 9.89445 0.292787 9.70698Z" />
        </Svg>
      );
      expandBtn = (
        <TouchableOpacity onPress={onExpandBtnClick} style={tailwind('-ml-2.5 h-10 w-8 flex-shrink-0 flex-grow-0 items-center justify-center rounded lg:h-9')}>
          <View style={tailwind('ml-1.5 h-3.5 w-3.5 items-center justify-center rounded-sm')}>
            {expandSvg}
          </View>
        </TouchableOpacity>
      );
    } else {
      expandBtn = (
        <View style={tailwind('-ml-2.5 h-10 w-8 flex-shrink-0 flex-grow-0 lg:h-9')} />
      );
    }
  }

  let svg;
  if (isChildless) {
    if (listNameObj.listName === TRASH) {
      svg = (
        <Svg style={tailwind(svgClassNames)} width={20} height={20} viewBox="0 0 20 20" fill="currentColor">
          <Path fillRule="evenodd" clipRule="evenodd" d="M9 2C8.81434 2.0001 8.63237 2.05188 8.47447 2.14955C8.31658 2.24722 8.18899 2.38692 8.106 2.553L7.382 4H4C3.73478 4 3.48043 4.10536 3.29289 4.29289C3.10536 4.48043 3 4.73478 3 5C3 5.26522 3.10536 5.51957 3.29289 5.70711C3.48043 5.89464 3.73478 6 4 6V16C4 16.5304 4.21071 17.0391 4.58579 17.4142C4.96086 17.7893 5.46957 18 6 18H14C14.5304 18 15.0391 17.7893 15.4142 17.4142C15.7893 17.0391 16 16.5304 16 16V6C16.2652 6 16.5196 5.89464 16.7071 5.70711C16.8946 5.51957 17 5.26522 17 5C17 4.73478 16.8946 4.48043 16.7071 4.29289C16.5196 4.10536 16.2652 4 16 4H12.618L11.894 2.553C11.811 2.38692 11.6834 2.24722 11.5255 2.14955C11.3676 2.05188 11.1857 2.0001 11 2H9ZM7 8C7 7.73478 7.10536 7.48043 7.29289 7.29289C7.48043 7.10536 7.73478 7 8 7C8.26522 7 8.51957 7.10536 8.70711 7.29289C8.89464 7.48043 9 7.73478 9 8V14C9 14.2652 8.89464 14.5196 8.70711 14.7071C8.51957 14.8946 8.26522 15 8 15C7.73478 15 7.48043 14.8946 7.29289 14.7071C7.10536 14.5196 7 14.2652 7 14V8ZM12 7C11.7348 7 11.4804 7.10536 11.2929 7.29289C11.1054 7.48043 11 7.73478 11 8V14C11 14.2652 11.1054 14.5196 11.2929 14.7071C11.4804 14.8946 11.7348 15 12 15C12.2652 15 12.5196 14.8946 12.7071 14.7071C12.8946 14.5196 13 14.2652 13 14V8C13 7.73478 12.8946 7.48043 12.7071 7.29289C12.5196 7.10536 12.2652 7 12 7Z" />
        </Svg>
      );
    } else if (listNameObj.listName === ARCHIVE) {
      svg = (
        <Svg style={tailwind(svgClassNames)} width={20} height={20} viewBox="0 0 20 20" fill="currentColor">
          <Path d="M4 3C3.46957 3 2.96086 3.21071 2.58579 3.58579C2.21071 3.96086 2 4.46957 2 5C2 5.53043 2.21071 6.03914 2.58579 6.41421C2.96086 6.78929 3.46957 7 4 7H16C16.5304 7 17.0391 6.78929 17.4142 6.41421C17.7893 6.03914 18 5.53043 18 5C18 4.46957 17.7893 3.96086 17.4142 3.58579C17.0391 3.21071 16.5304 3 16 3H4Z" />
          <Path fillRule="evenodd" clipRule="evenodd" d="M3 8H17V15C17 15.5304 16.7893 16.0391 16.4142 16.4142C16.0391 16.7893 15.5304 17 15 17H5C4.46957 17 3.96086 16.7893 3.58579 16.4142C3.21071 16.0391 3 15.5304 3 15V8ZM8 11C8 10.7348 8.10536 10.4804 8.29289 10.2929C8.48043 10.1054 8.73478 10 9 10H11C11.2652 10 11.5196 10.1054 11.7071 10.2929C11.8946 10.4804 12 10.7348 12 11C12 11.2652 11.8946 11.5196 11.7071 11.7071C11.5196 11.8946 11.2652 12 11 12H9C8.73478 12 8.48043 11.8946 8.29289 11.7071C8.10536 11.5196 8 11.2652 8 11Z" />
        </Svg>
      );
    } else if (listNameObj.listName === listName && queryString === '') {
      svg = (
        <Svg style={tailwind(svgClassNames)} width={20} height={20} viewBox="0 0 20 20" fill="currentColor">
          <Path fillRule="evenodd" clipRule="evenodd" d="M2 6C2 5.46957 2.21071 4.96086 2.58579 4.58579C2.96086 4.21071 3.46957 4 4 4H8L10 6H14C14.5304 6 15.0391 6.21071 15.4142 6.58579C15.7893 6.96086 16 7.46957 16 8V9H8C7.20435 9 6.44129 9.31607 5.87868 9.87868C5.31607 10.4413 5 11.2044 5 12V13.5C5 13.8978 4.84196 14.2794 4.56066 14.5607C4.27936 14.842 3.89782 15 3.5 15C3.10218 15 2.72064 14.842 2.43934 14.5607C2.15804 14.2794 2 13.8978 2 13.5V6Z" />
          <Path d="M6 12C6 11.4696 6.21071 10.9609 6.58579 10.5858C6.96086 10.2107 7.46957 10 8 10H16C16.5304 10 17.0391 10.2107 17.4142 10.5858C17.7893 10.9609 18 11.4696 18 12V14C18 14.5304 17.7893 15.0391 17.4142 15.4142C17.0391 15.7893 16.5304 16 16 16H2H4C4.53043 16 5.03914 15.7893 5.41421 15.4142C5.78929 15.0391 6 14.5304 6 14V12Z" />
        </Svg>
      );
    } else {
      svg = (
        <Svg style={tailwind(svgClassNames)} width={20} height={20} viewBox="0 0 20 20" fill="currentColor">
          <Path d="M2 6C2 5.46957 2.21071 4.96086 2.58579 4.58579C2.96086 4.21071 3.46957 4 4 4H9L11 6H16C16.5304 6 17.0391 6.21071 17.4142 6.58579C17.7893 6.96086 18 7.46957 18 8V14C18 14.5304 17.7893 15.0391 17.4142 15.4142C17.0391 15.7893 16.5304 16 16 16H4C3.46957 16 2.96086 15.7893 2.58579 15.4142C2.21071 15.0391 2 14.5304 2 14V6Z" />
        </Svg>
      );
    }
  }

  const viewStyle = { paddingLeft: 16 * level };

  return (
    <React.Fragment>
      <View style={[tailwind('mt-1.5 flex-row items-center justify-start'), viewStyle]}>
        {expandBtn}
        <TouchableOpacity onPress={onListNameBtnClick} style={tailwind(`w-full min-w-0 flex-shrink flex-grow flex-row items-center rounded-md px-2 py-2.5 lg:py-2 ${btnClassNames}`)}>
          {svg}
          <Text style={tailwind(`flex-shrink flex-grow text-base font-medium lg:text-sm ${textClassNames}`)} numberOfLines={1} ellipsizeMode="tail">{listNameObj.displayName}</Text>
        </TouchableOpacity>
      </View>
      {(doExpand && listNameObj && listNameObj.children && listNameObj.children.length > 0) && listNameObj.children.map(child => <SidebarListName key={child.listName} listNameObj={child} level={level + 1} isChildless={isChildless} />)}
    </React.Fragment>
  );
};

const SidebarListName = React.memo(InnerSidebarListName);

const InnerSidebarTagName = (props) => {

  const { tagNameObj } = props;
  const { width: safeAreaWidth } = useSafeAreaFrame();
  const queryString = useSelector(state => state.display.queryString);
  const dispatch = useDispatch();
  const tailwind = useTailwind();

  const onTagNameBtnClick = () => {
    dispatch(updateQueryString(tagNameObj.tagName, true));
    if (safeAreaWidth < LG_WIDTH) dispatch(updatePopup(SIDEBAR_POPUP, false, null));
  };

  // Only tag name for now
  const tagName = queryString.trim();

  let btnClassNames, textClassNames;
  if (tagNameObj.tagName === tagName) {
    btnClassNames = 'bg-gray-200 blk:bg-gray-700';
    textClassNames = 'text-gray-900 blk:text-gray-100';
  } else {
    btnClassNames = '';
    textClassNames = 'text-gray-700 blk:text-gray-200';
  }

  return (
    <View style={tailwind('mt-1.5 flex-row items-center justify-start pl-3')}>
      <TouchableOpacity onPress={onTagNameBtnClick} style={tailwind(`w-full min-w-0 flex-shrink flex-grow flex-row items-center rounded-md px-2 py-2.5 lg:py-2 ${btnClassNames}`)}>
        <Text style={tailwind(`flex-shrink flex-grow text-base font-medium lg:text-sm ${textClassNames}`)} numberOfLines={1} ellipsizeMode="tail">{tagNameObj.displayName}</Text>
      </TouchableOpacity>
    </View>
  );
};

const SidebarTagName = React.memo(InnerSidebarTagName);

export default React.memo(SidebarListNames);
