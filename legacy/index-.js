import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
// import App from './App';
import reportWebVitals from './reportWebVitals';
// Danfojs for dataframe usage
import * as pd from "danfojs";
import ComutData from './ComutData';

function App(){
  const readFile = function(e){
    // console.log(e)
    let file = e.target.files[0]
    pd.readCSV(file,{'header':true,'skipEmptyLines':true}).then(df => {
      df.head().print()
      df.plot('content').table()
      const samples = df.sample.unique()
      const genes = df.category.unique()
      // console.log(genes)
      let mat = []
      genes.values.forEach(gene =>{
        let row = []
        samples.values.forEach(sample =>{
          // console.log(gene,sample)
          const qf = df.query(df.sample.eq(sample).and(df.category.eq(gene)));
          // console.log(qf)
          if(qf.shape[0]===0){
            row.push(0)
          }else{
            row.push(1)
          }
        })
        mat.push(row)
      })
      const mf = new pd.DataFrame(mat,{'index':genes.values,
                'columns':samples.values})
      mf.head(10).print()
      const index = mf.sum({axis:1}).sortValues({ascending:false}).index
      const mf2 = mf.loc({rows:index})
      // const idx = mf2.iloc({rows:[0]}).gt(0)
      // idx.sum({axis:1}).print()

      function waterfall_sort(df){
        const idx = df.iloc({rows:[0]}).gt(0).sum({axis:0})
        if(idx.sum() === 0 || idx.sum() === df.shape[1]){
          if(df.shape[0] === 1){
            return df.columns
          }else{
            return waterfall_sort(df.iloc({rows:["1:"]}))
          }
        }

        let pidx = []
        let nidx = []
        idx.values.forEach((x,i)=>{
          const col = idx.index[i]
          x === 0 ? nidx.push(col) : pidx.push(col)
        })

        if(df.shape[0] === 1){
          return df.loc({columns:pidx}).columns.conat(df.loc({columns:nidx}).columns)
        }else{
          return waterfall_sort(df.loc({columns:pidx}).iloc({rows:['1:']})).concat(
            waterfall_sort(df.loc({columns:nidx}).iloc({rows:['1:']})))
          
        }
      }

      const cols = waterfall_sort(mf2)
      const mf3 = mf2.loc({columns:cols})
      console.log()
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
