/*
 * @Author: DT
 * @Description: ...
 * @Date: 2020-09-18 11:21:55
 * @LastEditTime: 2020-09-18 13:19:55
 */
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import WorkTable from './WorkTable';
import * as serviceWorker from './serviceWorker';

ReactDOM.render(
  <React.StrictMode>
    <WorkTable />
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
