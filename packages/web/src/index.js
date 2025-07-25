//import './wdyr';

import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { legacy_createStore as createStore, compose } from 'redux';
import { install as installReduxLoop } from 'redux-loop';

import './stylesheets/tailwind.css';
import './stylesheets/loading.css';

import { showSWWUPopup } from './actions';
import reducers from './reducers';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import reportWebVitals from './reportWebVitals';

import App from './components/App';
import { useTailwind } from './components';

/** @ts-expect-error */
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const store = createStore(
  /** @type {any} */(reducers),
  composeEnhancers(
    installReduxLoop({ ENABLE_THUNK_MIGRATION: true }),
  )
);

const InnerRoot = () => {
  const tailwind = useTailwind();

  return (
    <div className={tailwind('safe-area bg-white blk:bg-gray-900')}>
      <App />
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <InnerRoot />
    </Provider>
  </React.StrictMode>
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorkerRegistration.register({
  onUpdate: () => {
    store.dispatch(showSWWUPopup());
  },
});

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
