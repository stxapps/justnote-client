import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { changeListName, updatePopupUrlHash } from '../actions';
import { SIDEBAR_POPUP, TRASH, ARCHIVE, LG_WIDTH } from '../types/const';
import { getListNameMap } from '../selectors';

import { useSafeAreaFrame } from '.';

const SidebarListNames = () => {

  const listNameMap = useSelector(getListNameMap);
  const isChildless = listNameMap.every(listNameObj => {
    return !listNameObj.children || listNameObj.children.length === 0;
  });

  return (
    <nav className="pl-3 pr-1 mt-6 overflow-y-auto">
      <div className="space-y-1.5">
        {listNameMap.map(listNameObj => {
          return (
            <SidebarListName key={listNameObj.listName} listNameObj={listNameObj} level={0} isChildless={isChildless} />
          );
        })}
      </div>
    </nav>
  );
};

const _SidebarListName = (props) => {

  const { listNameObj, level, isChildless } = props;
  const { width: safeAreaWidth } = useSafeAreaFrame();
  const listName = useSelector(state => state.display.listName);
  const [doExpand, setDoExpand] = useState(false);
  const dispatch = useDispatch();

  const onListNameBtnClick = () => {
    dispatch(changeListName(listNameObj.listName, true));
    if (safeAreaWidth < LG_WIDTH) updatePopupUrlHash(SIDEBAR_POPUP, false, null);
  };

  const onExpandBtnClick = () => {
    setDoExpand(!doExpand);
  };

  let btnClassNames, svgClassNames;
  if (listNameObj.listName === listName) {
    btnClassNames = 'bg-gray-200 text-gray-900';
    svgClassNames = 'text-gray-500';
  } else {
    btnClassNames = 'text-gray-700 focus:text-gray-900 focus:bg-gray-50 hover:text-gray-900 hover:bg-gray-50';
    svgClassNames = 'text-gray-400 group-focus:text-gray-500 group-hover:text-gray-500';
  }
  svgClassNames += ' flex-grow-0 flex-shrink-0 mr-3 h-5 w-5';

  let expandBtn;
  if (!isChildless) {
    if (listNameObj && listNameObj.children && listNameObj.children.length > 0) {
      const expandSvg = doExpand ? (
        <svg className="w-3.5" viewBox="0 0 11 7" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" clipRule="evenodd" d="M0.292787 1.29302C0.480314 1.10555 0.734622 1.00023 0.999786 1.00023C1.26495 1.00023 1.51926 1.10555 1.70679 1.29302L4.99979 4.58602L8.29279 1.29302C8.38503 1.19751 8.49538 1.12133 8.61738 1.06892C8.73939 1.01651 8.87061 0.988924 9.00339 0.98777C9.13616 0.986616 9.26784 1.01192 9.39074 1.0622C9.51364 1.11248 9.62529 1.18673 9.71918 1.28062C9.81307 1.37452 9.88733 1.48617 9.93761 1.60907C9.98789 1.73196 10.0132 1.86364 10.012 1.99642C10.0109 2.1292 9.9833 2.26042 9.93089 2.38242C9.87848 2.50443 9.8023 2.61477 9.70679 2.70702L5.70679 6.70702C5.51926 6.89449 5.26495 6.99981 4.99979 6.99981C4.73462 6.99981 4.48031 6.89449 4.29279 6.70702L0.292787 2.70702C0.105316 2.51949 0 2.26518 0 2.00002C0 1.73486 0.105316 1.48055 0.292787 1.29302V1.29302Z" />
        </svg>
      ) : (
        <svg className="h-3" viewBox="0 0 6 10" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" clipRule="evenodd" d="M0.292787 9.70698C0.105316 9.51945 0 9.26514 0 8.99998C0 8.73482 0.105316 8.48051 0.292787 8.29298L3.58579 4.99998L0.292787 1.70698C0.110629 1.51838 0.00983372 1.26578 0.0121121 1.00358C0.0143906 0.741382 0.11956 0.49057 0.304968 0.305162C0.490376 0.119753 0.741189 0.0145843 1.00339 0.0123059C1.26558 0.0100274 1.51818 0.110822 1.70679 0.29298L5.70679 4.29298C5.89426 4.48051 5.99957 4.73482 5.99957 4.99998C5.99957 5.26514 5.89426 5.51945 5.70679 5.70698L1.70679 9.70698C1.51926 9.89445 1.26495 9.99977 0.999786 9.99977C0.734622 9.99977 0.480314 9.89445 0.292787 9.70698Z" />
        </svg>
      );
      expandBtn = (
        <button onClick={onExpandBtnClick} className="flex-grow-0 flex-shrink-0 flex justify-center items-center w-8 h-10 -ml-2.5 rounded group focus:outline-none focus-visible:bg-gray-200 lg:h-9">
          <div className="w-3.5 h-3.5 flex justify-center items-center text-gray-500 rounded-sm group-hover:text-gray-700">
            {expandSvg}
          </div>
        </button>
      );
    } else {
      expandBtn = (
        <div className="flex-grow-0 flex-shrink-0 w-8 h-10 -ml-2.5 lg:h-9" />
      );
    }
  }

  let svg;
  if (isChildless) {
    if (listNameObj.listName === TRASH) {
      svg = (
        <svg className={svgClassNames} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path fillRule="evenodd" clipRule="evenodd" d="M9 2C8.81434 2.0001 8.63237 2.05188 8.47447 2.14955C8.31658 2.24722 8.18899 2.38692 8.106 2.553L7.382 4H4C3.73478 4 3.48043 4.10536 3.29289 4.29289C3.10536 4.48043 3 4.73478 3 5C3 5.26522 3.10536 5.51957 3.29289 5.70711C3.48043 5.89464 3.73478 6 4 6V16C4 16.5304 4.21071 17.0391 4.58579 17.4142C4.96086 17.7893 5.46957 18 6 18H14C14.5304 18 15.0391 17.7893 15.4142 17.4142C15.7893 17.0391 16 16.5304 16 16V6C16.2652 6 16.5196 5.89464 16.7071 5.70711C16.8946 5.51957 17 5.26522 17 5C17 4.73478 16.8946 4.48043 16.7071 4.29289C16.5196 4.10536 16.2652 4 16 4H12.618L11.894 2.553C11.811 2.38692 11.6834 2.24722 11.5255 2.14955C11.3676 2.05188 11.1857 2.0001 11 2H9ZM7 8C7 7.73478 7.10536 7.48043 7.29289 7.29289C7.48043 7.10536 7.73478 7 8 7C8.26522 7 8.51957 7.10536 8.70711 7.29289C8.89464 7.48043 9 7.73478 9 8V14C9 14.2652 8.89464 14.5196 8.70711 14.7071C8.51957 14.8946 8.26522 15 8 15C7.73478 15 7.48043 14.8946 7.29289 14.7071C7.10536 14.5196 7 14.2652 7 14V8ZM12 7C11.7348 7 11.4804 7.10536 11.2929 7.29289C11.1054 7.48043 11 7.73478 11 8V14C11 14.2652 11.1054 14.5196 11.2929 14.7071C11.4804 14.8946 11.7348 15 12 15C12.2652 15 12.5196 14.8946 12.7071 14.7071C12.8946 14.5196 13 14.2652 13 14V8C13 7.73478 12.8946 7.48043 12.7071 7.29289C12.5196 7.10536 12.2652 7 12 7Z" />
        </svg>
      );
    } else if (listNameObj.listName === ARCHIVE) {
      svg = (
        <svg className={svgClassNames} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M4 3C3.46957 3 2.96086 3.21071 2.58579 3.58579C2.21071 3.96086 2 4.46957 2 5C2 5.53043 2.21071 6.03914 2.58579 6.41421C2.96086 6.78929 3.46957 7 4 7H16C16.5304 7 17.0391 6.78929 17.4142 6.41421C17.7893 6.03914 18 5.53043 18 5C18 4.46957 17.7893 3.96086 17.4142 3.58579C17.0391 3.21071 16.5304 3 16 3H4Z" />
          <path fillRule="evenodd" clipRule="evenodd" d="M3 8H17V15C17 15.5304 16.7893 16.0391 16.4142 16.4142C16.0391 16.7893 15.5304 17 15 17H5C4.46957 17 3.96086 16.7893 3.58579 16.4142C3.21071 16.0391 3 15.5304 3 15V8ZM8 11C8 10.7348 8.10536 10.4804 8.29289 10.2929C8.48043 10.1054 8.73478 10 9 10H11C11.2652 10 11.5196 10.1054 11.7071 10.2929C11.8946 10.4804 12 10.7348 12 11C12 11.2652 11.8946 11.5196 11.7071 11.7071C11.5196 11.8946 11.2652 12 11 12H9C8.73478 12 8.48043 11.8946 8.29289 11.7071C8.10536 11.5196 8 11.2652 8 11Z" />
        </svg>
      );
    } else if (listNameObj.listName === listName) {
      svg = (
        <svg className={svgClassNames} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path fillRule="evenodd" clipRule="evenodd" d="M2 6C2 5.46957 2.21071 4.96086 2.58579 4.58579C2.96086 4.21071 3.46957 4 4 4H8L10 6H14C14.5304 6 15.0391 6.21071 15.4142 6.58579C15.7893 6.96086 16 7.46957 16 8V9H8C7.20435 9 6.44129 9.31607 5.87868 9.87868C5.31607 10.4413 5 11.2044 5 12V13.5C5 13.8978 4.84196 14.2794 4.56066 14.5607C4.27936 14.842 3.89782 15 3.5 15C3.10218 15 2.72064 14.842 2.43934 14.5607C2.15804 14.2794 2 13.8978 2 13.5V6Z" />
          <path d="M6 12C6 11.4696 6.21071 10.9609 6.58579 10.5858C6.96086 10.2107 7.46957 10 8 10H16C16.5304 10 17.0391 10.2107 17.4142 10.5858C17.7893 10.9609 18 11.4696 18 12V14C18 14.5304 17.7893 15.0391 17.4142 15.4142C17.0391 15.7893 16.5304 16 16 16H2H4C4.53043 16 5.03914 15.7893 5.41421 15.4142C5.78929 15.0391 6 14.5304 6 14V12Z" />
        </svg>
      );
    } else {
      svg = (
        <svg className={svgClassNames} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M2 6C2 5.46957 2.21071 4.96086 2.58579 4.58579C2.96086 4.21071 3.46957 4 4 4H9L11 6H16C16.5304 6 17.0391 6.21071 17.4142 6.58579C17.7893 6.96086 18 7.46957 18 8V14C18 14.5304 17.7893 15.0391 17.4142 15.4142C17.0391 15.7893 16.5304 16 16 16H4C3.46957 16 2.96086 15.7893 2.58579 15.4142C2.21071 15.0391 2 14.5304 2 14V6Z" />
        </svg>
      );
    }
  }

  const viewStyle = { paddingLeft: 16 * level };

  return (
    <React.Fragment>
      <div style={viewStyle} className="flex justify-start items-center">
        {expandBtn}
        <button onClick={onListNameBtnClick} className={`flex-grow flex-shrink min-w-0 ${btnClassNames} group flex items-center px-2 py-2.5 text-base font-medium rounded-md w-full focus:outline-none lg:text-sm lg:py-2`}>
          {svg}
          <span className="truncate">{listNameObj.displayName}</span>
        </button>
      </div>
      {doExpand && listNameObj.children.map(child => <SidebarListName key={child.listName} listNameObj={child} level={level + 1} isChildless={isChildless} />)}
    </React.Fragment>
  );
};

const SidebarListName = React.memo(_SidebarListName);

export default React.memo(SidebarListNames);
