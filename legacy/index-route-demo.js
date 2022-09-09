import React from 'react';
import ReactDOM from 'react-dom/client';
import {
  BrowserRouter,
  Routes,
  Route,
  Outlet
} from "react-router-dom";
import reportWebVitals from './reportWebVitals';

import './index.css';
// import InputView from './InputView';
// // import App from './App';
// // Danfojs for dataframe usage
// // window.pd = pd;
// import {DataFrame} from './Panfo';

/* test code for Panfo.js
let data1 = [[1, 2.3, 3, 4, 5, "girl"], [30, 40.1, 39, 89, 78, "boy"]];
let index = ["a", "b"];
let columns = ["col1", "col2", "col3", "col4", "col5", "col6"]
let dtypes = ["int32", "float32", "int32", "int32", "int32", "string"]

let df = new DataFrame(data1, { index, columns, dtypes });
let df2 = new pd.DataFrame(data1, { index, columns, dtypes });

df2.iloc({rows:['0:'],columns:['1:3']}).print()
df.iloc('0:','1:3').print()
df.iloc(':',[true,false,true,false,true,false]).print()
df.loc(':',[true,false,true,false,true,false]).print()
let dff = df.loc(':',[true,false,true,false,true,false])

let d2 = [[1, 2.3, 3, 4, 5, "girl"]];
let index2 = ["a"];
let df3 = new DataFrame(d2, { index2, columns, dtypes });

let de = dff.loc(['a'])

console.log(df)
*/



function Ab(){
  return <div>abc</div>
}

function Ef(){
  return <div>efg</div>
}

// TODO Router to visualization view
// TODO draw the plot using d3
function App(){
  
    
  return <div>
      <Routes>
        <Route path="/" element={<div><h3>comut-viz</h3><Outlet/></div>}>
          <Route path="/" element={<Ab />} />
          <Route path="ef" element={<Ef />} />
        </Route>
      </Routes>
        {/* <InputView /> */}
        {/* <Outlet></Outlet> */}
    </div>
}


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      {/* <Routes>
        <Route path="/" element={<App />} />
        <Route path="ab" element={<Ab />} />
        <Route path="ef" element={<Ef />} />
      </Routes> */}
    </BrowserRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
