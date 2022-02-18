import React from 'react';
import { useSelector, useDispatch } from 'react-redux';

import {
  updateDoDeleteOldNotesInTrash, updateSortOn, updateDoDescendingOrder,
} from '../actions';
import { ADDED_DT, UPDATED_DT } from '../types/const';

const SettingsPopupMisc = (props) => {

  const { onSidebarOpenBtnClick } = props;
  const doDeleteOldNotesInTrash = useSelector(state => state.settings.doDeleteOldNotesInTrash);
  const sortOn = useSelector(state => state.settings.sortOn);
  const doDescendingOrder = useSelector(state => state.settings.doDescendingOrder);
  const dispatch = useDispatch();

  const onDoDeleteBtnClick = () => {
    dispatch(updateDoDeleteOldNotesInTrash(!doDeleteOldNotesInTrash));
  };

  const onSortOnInputChange = (e) => {
    const sortOn = e.target.value;
    dispatch(updateSortOn(sortOn));
  };

  const onDoDescendingInputChange = (e) => {
    const value = e.target.value;

    let doDescend;
    if (value === 'ascending') doDescend = false;
    else if (value === 'descending') doDescend = true;
    else throw new Error(`Invalid value: ${value}`);

    dispatch(updateDoDescendingOrder(doDescend));
  };

  const doDeleteBtnClassNames = doDeleteOldNotesInTrash ? 'bg-green-500' : 'bg-gray-200';
  const doDeleteBtnInnerClassNames = doDeleteOldNotesInTrash ? 'translate-x-5' : 'translate-x-0';

  const addedDTBtnClassNames = sortOn === ADDED_DT ? 'bg-green-100 border-green-200' : 'border-gray-200';
  const addedDTBtnInnerClassNames = sortOn === ADDED_DT ? 'text-green-800' : 'text-gray-600';

  const updatedDTBtnClassNames = sortOn === UPDATED_DT ? 'bg-green-100 border-green-200' : 'border-gray-200';
  const updatedDTBtnInnerClassNames = sortOn === UPDATED_DT ? 'text-green-800' : 'text-gray-600';

  const ascendingBtnClassNames = !doDescendingOrder ? 'bg-green-100 border-green-200' : 'border-gray-200';
  const ascendingBtnInnerClassNames = !doDescendingOrder ? 'text-green-800' : 'text-gray-600';

  const descendingBtnClassNames = doDescendingOrder ? 'bg-green-100 border-green-200' : 'border-gray-200';
  const descendingBtnInnerClassNames = doDescendingOrder ? 'text-green-800' : 'text-gray-600';

  return (
    <div className="p-4 relative md:p-6 md:pt-4">
      <div className="border-b border-gray-200 md:hidden">
        <button onClick={onSidebarOpenBtnClick} className="pb-1 group focus:outline-none" >
          <span className="text-sm text-gray-500 rounded-sm group-focus:ring-2 group-focus:ring-gray-400">{'<'} <span className="group-hover:underline">Settings</span></span>
        </button>
        <h3 className="pb-2 text-xl text-gray-800 font-medium leading-none">Misc.</h3>
      </div>
      <div className="mt-6 flex items-center justify-between space-x-4 md:mt-0">
        <div className="flex flex-col">
          <h4 className="text-base text-gray-800 font-medium leading-none">Auto Cleanup</h4>
          <p className="mt-2.5 text-base text-gray-500 leading-relaxed">Allow old removed notes in Trash to be automatically deleted after 45 days</p>
        </div>
        <span onClick={onDoDeleteBtnClick} role="checkbox" tabIndex={0} aria-checked="true" aria-labelledby="auto-cleanup-option-label" aria-describedby="auto-cleanup-option-description" className={`${doDeleteBtnClassNames} relative inline-flex flex-shrink-0 w-11 h-6 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-600`}>
          <span aria-hidden="true" className={`${doDeleteBtnInnerClassNames} inline-block h-5 w-5 rounded-full bg-white shadow transform transition ease-in-out duration-200`} />
        </span>
      </div>
      <div className="mt-10 flex flex-col">
        <h4 className="text-base text-gray-800 font-medium leading-none">List Order On</h4>
        <div className="sm:flex sm:items-start sm:justify-between sm:space-x-4">
          <p className="mt-2.5 flex-grow flex-shrink text-base text-gray-500 leading-relaxed">Choose whether your notes are sorted on <span className="font-semibold">added date</span> or <span className="font-semibold">updated date</span> when you browse your notes.</p>
          <div className="mx-auto mt-2.5 w-full max-w-48 bg-white rounded-md shadow-sm -space-y-px sm:mt-1 sm:flex-grow-0 sm:flex-shrink-0 sm:w-48 sm:max-w-none">
            <div className={`${addedDTBtnClassNames} p-4 relative flex border rounded-tl-md rounded-tr-md`}>
              <div className="flex items-center h-5">
                <input onChange={onSortOnInputChange} id="list-order-on-option-1" name="list-order-on-option-1" type="radio" className="h-4 w-4 text-green-600 transition duration-150 ease-in-out cursor-pointer focus:ring-2 focus:ring-offset-2 focus:ring-green-600" checked={sortOn === ADDED_DT} value={ADDED_DT} />
              </div>
              <label htmlFor="list-order-on-option-1" className="ml-3 flex flex-col cursor-pointer">
                <span className={`${addedDTBtnInnerClassNames} block text-sm leading-5 font-medium`}>Added Date</span>
              </label>
            </div>
            <div className={`${updatedDTBtnClassNames} p-4 flex relative border rounded-bl-md rounded-br-md`}>
              <div className="flex items-center h-5">
                <input onChange={onSortOnInputChange} id="list-order-on-option-2" name="list-order-on-option-2" type="radio" className="h-4 w-4 text-green-600 transition duration-150 ease-in-out cursor-pointer focus:ring-2 focus:ring-offset-2 focus:ring-green-600" checked={sortOn === UPDATED_DT} value={UPDATED_DT} />
              </div>
              <label htmlFor="list-order-on-option-2" className="ml-3 flex flex-col cursor-pointer">
                <span className={`${updatedDTBtnInnerClassNames} block text-sm leading-5 font-medium`}>Updated Date</span>
              </label>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-10 flex flex-col">
        <h4 className="text-base text-gray-800 font-medium leading-none">List Order Direction</h4>
        <div className="sm:flex sm:items-start sm:justify-between sm:space-x-4">
          <p className="mt-2.5 flex-grow flex-shrink text-base text-gray-500 leading-relaxed">Choose whether your notes are sorted in <span className="font-semibold">ascending order</span> (i.e. notes you create first appear first) or <span className="font-semibold">descending order</span> (i.e. notes you create last appear first) when you browse your notes.</p>
          <div className="mx-auto mt-2.5 w-full max-w-48 bg-white rounded-md shadow-sm -space-y-px sm:mt-1 sm:flex-grow-0 sm:flex-shrink-0 sm:w-48 sm:max-w-none">
            <div className={`${ascendingBtnClassNames} p-4 relative flex border rounded-tl-md rounded-tr-md`}>
              <div className="flex items-center h-5">
                <input onChange={onDoDescendingInputChange} id="list-order-direction-option-1" name="list-order-direction-option-1" type="radio" className="h-4 w-4 text-green-600 transition duration-150 ease-in-out cursor-pointer focus:ring-2 focus:ring-offset-2 focus:ring-green-600" checked={!doDescendingOrder} value="ascending" />
              </div>
              <label htmlFor="list-order-direction-option-1" className="ml-3 flex flex-col cursor-pointer">
                <span className={`${ascendingBtnInnerClassNames} block text-sm leading-5 font-medium`}>Ascending order</span>
              </label>
            </div>
            <div className={`${descendingBtnClassNames} p-4 flex relative border rounded-bl-md rounded-br-md`}>
              <div className="flex items-center h-5">
                <input onChange={onDoDescendingInputChange} id="list-order-direction-option-2" name="list-order-direction-option-2" type="radio" className="h-4 w-4 text-green-600 transition duration-150 ease-in-out cursor-pointer focus:ring-2 focus:ring-offset-2 focus:ring-green-600" checked={doDescendingOrder} value="descending" />
              </div>
              <label htmlFor="list-order-direction-option-2" className="ml-3 flex flex-col cursor-pointer">
                <span className={`${descendingBtnInnerClassNames} block text-sm leading-5 font-medium`}>Descending order</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(SettingsPopupMisc);
