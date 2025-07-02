import {
  useStore as _useStore, useSelector as _useSelector, useDispatch as _useDispatch,
} from 'react-redux';
import { legacy_createStore as createStore, applyMiddleware } from 'redux';
import { thunk } from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-expo-dev-plugin';

import reducers from '@/reducers';

export const makeStore = () => {
  let nextActions = [];
  const addNextAction = (action) => {
    nextActions.push(action);
  };

  // @ts-expect-error (github.com/matt-oakes/redux-devtools-expo-dev-plugin/issues/12)
  const store = createStore(reducers, composeWithDevTools(applyMiddleware(thunk)));
  store.subscribe(() => {
    const itnActions = [...nextActions];
    nextActions = [];

    for (const action of itnActions) {
      setTimeout(() => {
        store.dispatch(action);
      }, 100);
    }
  });
  return { store, addNextAction };
};

type MakeStoreReturn = ReturnType<typeof makeStore>;
export type AppStore = MakeStoreReturn['store'];
export type AppDispatch = AppStore['dispatch'];
export type AppGetState = AppStore['getState'];
export type RootState = ReturnType<AppGetState>;

export const useStore = _useStore.withTypes<AppStore>();
export const useSelector = _useSelector.withTypes<RootState>();
export const useDispatch = _useDispatch.withTypes<AppDispatch>();
