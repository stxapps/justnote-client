import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { signOut } from '../actions';

const Main = React.memo(() => {

  const dispatch = useDispatch();

  useEffect(() => {

  }, []);

  return (
    <div>
      <div>Main</div>
      <div className="-mr-2 flex items-center">
        <button onClick={() => dispatch(signOut())} type="button" className="bg-white rounded-md shadow px-4 py-2 border border-transparent text-base font-medium text-green-600 hover:text-green-500 inline-flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-inset focus:ring-green-500" id="main-menu" aria-haspopup="true">
          Sign out
        </button>
      </div>
    </div>
  );
});

export default Main;
