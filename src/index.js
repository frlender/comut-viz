import ReactDOM from 'react-dom/client';
import {
  HashRouter,
  // BrowserRouter,
  Routes,
  Route,
  Outlet
} from "react-router-dom";
import reportWebVitals from './reportWebVitals';
import './bootstrap.min.css';
import './index.css';
import React, { useState } from 'react';


import InputView from './InputView';
import Viz from './Viz';

// console.log('aa')
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

// DONE filtering do not change sample number
// DONE add input examples
// DONE Make waterfall sort checkbox more salient.
// DONE make the rects in color palette smaller
// DONE Cliking on different legends changes input color of color picker when color picker is open


function App(){
  const [vata,setVata] = useState(null)
  
  // const data = [
  //   {month: new Date(2015, 0, 1), bananas: 1920, cherries: 960, dates: 400},
  //   {month: new Date(2015, 1, 1), apples: 1600, bananas: 1440, cherries: 960, dates: 400},
  //   {month: new Date(2015, 2, 1), apples:  640, bananas:  960, cherries: 640, dates: 400},
  //   {month: new Date(2015, 3, 1), apples:  320, cherries: 640, dates: 400}
  // ];

  // const stack = d3.stack()
  //   .keys(["apples", "bananas", "cherries", "dates"])
  //   .order(d3.stackOrderNone)
  //   .offset(d3.stackOffsetNone);

  // const series = stack(data);

  const changeVata = vata => {
    setVata(vata)
  }
 
  return <div>
      <Routes>
        <Route path="/" element={
            <div>
              <div className='header pl-3 pb-3 pt-3 mb-2 border-bottom'>Comut-viz</div>
              <Outlet/>
            </div>}>
          <Route path="/" element={<InputView 
            vata={vata} changeVata={changeVata} />} />
          <Route path="viz" element={<Viz vata={vata} />} />
        </Route>
      </Routes>
    </div>
}


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
