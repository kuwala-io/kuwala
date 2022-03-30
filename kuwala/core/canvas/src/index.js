import React from 'react';
import ReactDOM from 'react-dom';
import './pages/styles.css';
import App from './pages/App';
import DataCatalog from './pages/DataCatalog';
import reportWebVitals from './reportWebVitals';
import {
    BrowserRouter,
    Route,
    Routes,
} from "react-router-dom";

import { StoreProvider } from "easy-peasy";
import Store from "./data/state/Store";
import DataPipelineManagement from "./pages/DataPipelineManagement";
import DataSourceConfiguration from "./pages/DataSourceConfiguration";
import DataSourcePreview from "./pages/DataSourcePreview";

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
        <StoreProvider store={Store}>
            <Routes>
                <Route path={'/'} element={<App />}/>
                <Route path={'/data-catalog'} element={<DataCatalog />}/>
                <Route path={'/data-pipeline-management'} element={<DataPipelineManagement />}/>
                <Route path={'/data-source-config'} element={<DataSourceConfiguration />}/>
                <Route path={'/data-source-preview'} element={<DataSourcePreview />}/>
            </Routes>
        </StoreProvider>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
