import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { init } from '../actions';

import Adding from './TranslucentAdding';

const Share = () => {

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(init());
  }, [dispatch]);

  return <Adding />;
};

export default React.memo(Share);
