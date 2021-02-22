import {
  MY_NOTES, TRASH, ARCHIVE,
  ADDED,
} from '../types/const';

const initialState = {
  listNameMap: [
    { listName: MY_NOTES, displayName: MY_NOTES, status: ADDED },
    { listName: TRASH, displayName: TRASH, status: ADDED },
    { listName: ARCHIVE, displayName: ARCHIVE, status: ADDED },
    { listName: '8112983192', displayName: 'Busan Trip', status: ADDED },
  ],
};

const settingsReducer = (state = initialState, action) => {



  return state;
};

export default settingsReducer;
