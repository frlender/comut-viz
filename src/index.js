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
import React, { useEffect, useState } from 'react';

import InputView from './InputView'
import FilterViewHolder from './FilterViewHolder';
// import Viz from './Viz';
import VizHolder from './VizHolder'
import { BiHelpCircle } from "react-icons/bi";
import {  useNavigate } from "react-router-dom";

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
                onClick={()=>{navigate('/news')}}>v3.6.0</span>         
                <a href='/comut-viz-app/help.pdf' target='_blank' className='help'><BiHelpCircle></BiHelpCircle></a>
              </div>
              <Outlet/>
            </div>}>
          <Route path='news' element={<News></News>}/>
          <Route path="/" element={<InputView 
              setTb={setTb} setCmeta={setCmeta}/>} />
          <Route path='filter' element={<FilterViewHolder
            cmeta={cmeta} tb={tb} setVata={setVata}></FilterViewHolder>}/>
          <Route path="viz" element={<VizHolder vata={vata} />} />
        </Route>
      </Routes>
    </div>
}


function News(){
  return <div className='news-container'>
  <div className='news-block'>
    <div className='news-title'>
      <span className="row-head">v3.6.0</span>
      <span className='news-time'>2023/6/5</span>
    </div>
    <div className="news-content">
      This version is developed after revision. There are several places that are different from what is described in paper:
      <div className='news-paragraph'>1. The top bar plot now displays the mutation counts of all genes in each sample rather than only the genes shown in the comutation plot.</div>
      <div className='news-paragraph'>2. The silent mutation type is unchecked by default.</div>
      <div className='news-paragraph'>3. A maftools color scheme is provided if the input is a standard MAF file.</div>
    </div>
  </div>
  
  {/* <div className="help-row">Two input files are submitted on this page:</div>
  <div className="help-row"><span className="row-head">Mutation Data File:</span> This file is required. It should be a table of mutation data, commonly a <a href='https://docs.gdc.cancer.gov/Data/File_Formats/MAF_Format/'>MAF</a> file. It could also be a tab/comma delimited text file with a .txt, .csv or .tsv extension. The file should have a header and at least three columns representing sample ID, gene symbol and mutation type. The column names in the header are flexible. (<a href='https://github.com/frlender/comut-viz/blob/main/public/gallbladder.maf'>example 1</a>, <a href='https://github.com/frlender/comut-viz/blob/main/public/example_small.txt'> example 2</a>)</div>
  <div className="help-row"><span className="row-head">Sample Metadata File:</span> This file is optional. It should be a tab/comma delimited text file with a .txt, .csv or .tsv extension. It must have a header and a sample ID column containing the same sample IDs as in the mutation data file. The sample ID column names do not need to be the same. (<a href='https://github.com/frlender/comut-viz/blob/main/public/gallbladder.maf'>example 1</a>)</div>
  <div className="help-row">The app will automatically ignore <span className="row-head">comment lines</span> starting with "#" in the input files. If there are comment lines in other formats, please delete them before submitting to the app.</div>
  <div className="help-row"> <span className="row-head">Example Buttons: </span>Users can test the app using the two example buttons. One loads a mutationa data file with 5k rows and its metadata, and the other loads a large mutation data file with 141k rows.</div>
  <div className="help-row cit">If you find Comut-viz useful, please cite the following reference:<div><a href='https://bmcbioinformatics.biomedcentral.com/articles/10.1186/s12859-023-05351-8' target='_blank'>Qiaonan Duan, Weiyi Wang, Feiling Feng, Xiaoqing Jiang, Hao Chen, Dadong Zhang, Tongyi Zhang. <br/> Comut-viz: efficiently creating and browsing comutation plots online. <i>BMC Bioinformatics 24, 226 (2023)</i>.</a></div></div> */}

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
