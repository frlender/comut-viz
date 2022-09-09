import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
// import App from './App';
import reportWebVitals from './reportWebVitals';
// Danfojs for dataframe usage
import * as pd from "danfojs";

function App(){
  const readFile = function(e){
    // console.log(e)
    let file = e.target.files[0]
    const formData = new FormData()
    formData.append('file', file)
    const url = 'http://localhost:3000/proc'
    fetch(url, {
      method: 'POST',
      body: formData,
    }).then((response) => {
      console.log(response)
    })
    // let fileReader = new FileReader(); 
    // fileReader.readAsText(file); 
    // fileReader.onload = () => {
    //   console.log(fileReader.result)
    //   console.log(file.type)
    // }
  }
  return <div>
      <input  onChange={readFile} type='file' accept='.css,.txt,.tsv'/>
      {/* <span>{row_count} rows</span> */}
      <div id='content'/>
    </div>
}


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
