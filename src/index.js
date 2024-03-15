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
import React, { useEffect, useState, useRef} from 'react';

import InputView from './InputView'
import FilterViewHolder from './FilterViewHolder';
// import Viz from './Viz';
import VizHolder from './VizHolder'
import { BiHelpCircle } from "react-icons/bi";
import {  useNavigate } from "react-router-dom";
import News from './News';

// DONE make legend font size bigger for 141k example
// DONE 141k example
// DONE loading ... position
// DONE to change the names of the legends.
// DONE filtering do not change sample number
// DONE add input examples
// DONE Make waterfall sort checkbox more salient.
// DONE make the rects in color palette smaller
// DONE Cliking on different legends changes input color of color picker when color picker is open




function App(){
  const [vata,setVata] = useState(null)
  const [tb,setTb] = useState(null)
  const [cmeta,setCmeta] = useState(null)
  let navigate = useNavigate();
  const [session, setSession] = useState()
  const geneGroupsRef = useRef()

  useEffect(()=>{
     // add footer text
     const year = new Date().getFullYear();
     document.getElementsByClassName('footer-inner')[0].textContent = `2015-${year} 3D Medicines Corporation`;
  })
 
  return <div>
      <Routes>
        <Route path="/" element={
            <div>
              <div className='header pl-3 pb-3 pt-3 mb-2 border-bottom'>
                <span className='big-header' onClick={()=>{
                  navigate('/')
                }}>Comut-viz</span> 
                <span className='version' 
                onClick={()=>{navigate('/news')}}>v0.7.2</span>         
                <a href='/comut-viz-app/help.pdf' target='_blank' className='help'><BiHelpCircle></BiHelpCircle></a>
              </div>
              <Outlet/>
            </div>}>
          <Route path='news' element={<News></News>}/>
          <Route path="/" element={<InputView 
              setVata={setVata} setSession={setSession}
              setTb={setTb} setCmeta={setCmeta} geneGroupsRef={geneGroupsRef}/>} />
          <Route path='filter' element={<FilterViewHolder
            cmeta={cmeta} tb={tb} setVata={setVata}
            geneGroupsRef={geneGroupsRef}></FilterViewHolder>}/>
          <Route path="viz" element={<VizHolder vata={vata} session={session}/>} />
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
