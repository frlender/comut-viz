import React, { useState, useEffect } from 'react';
import {  useNavigate } from "react-router-dom";
import * as pd from "danfojs";
import {Meta} from './Misc';

export default function InputView(props){
    const [loading, setLoading] = useState(false)
    const [tb,setTb] = useState(null)
    // const [cmeta,setCmeta] = useState(null)
    const [metaTb, setMetaTb] = useState(null)
    const [exampleLoaded,setExampleLoaded] = useState(false)

    const [sampleCol,setSampleCol] = useState('-')
    const [geneCol,setGeneCol] = useState('-')
    const [mutCol,setMutCol] = useState('-')
    const [metaSampleCol, setMetaSampleCol] = useState('')

    const [fname,setFname] = useState('')
    const [fmeta,setFmeta] = useState('')

    const disableOption = (x)=>[sampleCol,geneCol,mutCol].includes(x)
    const disableNextButton = ()=> sampleCol === '-' || geneCol === '-'
        || mutCol === '-'

    let navigate = useNavigate();
    

    const readFile = function(e,cb){
        // cb must setLoading(false)
        setLoading(true)
        const file = e.target.files[0]
        pd.readCSV(file,{'header':true,'skipEmptyLines':true}).then(cb)
    }

    const readData = function(e){
        // console.log(e)
        readFile(e,df => {
            console.log(df)
            const df2 = df.dropNa({ axis: 1 })
            setTb(df2)
            setLoading(false)
        })
      }

    //   const loadExample = function(){
    //     setLoading(true)
    //     pd.readCSV('/comut-viz-app/TCGA-LUSC.maf',{'header':true,'skipEmptyLines':true})
    //         .then(df=>{
    //             console.log(df)
    //             const df2 = df.dropNa({ axis: 1 })
    //             setTb(df2)
    //             setLoading(false)
    //             setExampleLoaded(true)
    //         })
    //   }
      const loadExample = function(fname,fmeta){
        setLoading(true)
        setFname(fname)
        if(fmeta) setFmeta(fmeta)

        pd.readCSV(`/comut-viz-app/${fname}`,{'header':true,'skipEmptyLines':true})
            .then(df=>{
                console.log(df)
                const df2 = df.dropNa({ axis: 1 })
                setTb(df2)
                setLoading(false)
                setExampleLoaded(true)
            })
        
        if(fmeta)
        pd.readCSV(`/comut-viz-app/${fmeta}`,{'header':true,'skipEmptyLines':true})
            .then(df=>{
                const dfo = df.copy()
                // df.setIndex({column:df.columns[0],inplace:true,drop:true})
                setMetaTb(dfo)
                setMetaSampleCol(dfo.columns[0])
                console.log(fmeta,df)
                // setLoading(false)
            })
      }

      const readSampleMeta = function(e){
        readFile(e, dfi =>{
            const df = dfi.dropNa({ axis: 1 })
            const dfo = df.copy()
            setMetaTb(dfo)
            setMetaSampleCol(dfo.columns[0])
            // df.setIndex({column:df.columns[0],inplace:true,drop:true})
            // setCmeta(new Meta(df,dfo))
            setLoading(false)
        })
    }

    useEffect(()=>{
        // console.log(tb)
        // if(tb){
        //     tb.head().plot('content').table({autosizable:true})
        // }
    },[tb])

    return <div className='container-fluid container-pad'>
    <div className="row input-status mb-2 mt-2">
        { loading &&
            <div className="col-">
                loading ...
            </div>
        }
        { tb && !loading &&
            <div className="col-">
                <button className='btn btn-success btn-i' onClick={()=>{
                    // setLoading(true)
                    const sub = tb.loc({columns:[sampleCol,geneCol,mutCol]})
                    props.setTb(sub)
                    if(metaTb){
                        const cols = [metaSampleCol].concat(
                            metaTb.columns.filter(x=>x!==metaSampleCol))
                        const dfo = metaTb.loc({columns:cols})
                        const df2 = dfo.copy()
                        df2.setIndex({column:df2.columns[0],inplace:true,drop:true})
                        props.setCmeta(new Meta(df2,dfo))
                    }
                    
                    console.log(sub)
                    navigate('/filter')
                }} disabled={disableNextButton()}>Next</button>
            </div>
        }
        {/* {
        cmeta &&
            <div className="col- pl-2">
                <div className="waterfall-sort">
                <span>waterfall sort: </span>
                <input className='checkbox' type="checkbox" onChange={e=>setWaterfall(e.target.value)} />
                </div>
            </div>
        } */}
    </div>
    {exampleLoaded && 
         <div className="row mt-3">{fname} {fmeta?`,   ${fmeta}`:''}</div>
    }
    {!exampleLoaded &&
    <div className="row">
        <div className="col-">
            <div className="mb-1">A table of delimited mutation data, commonly a .maf file:</div>
            <input className='form-control-i' onChange={readData} type='file' accept='.css,.txt,.tsv,.maf'/>
            {/* <span className="example"><a download target="_blank" href='https://raw.githubusercontent.com/frlender/comut-viz-app/gh-pages/example_input.tsv'>example</a></span> */}
        </div>
        <div className="col- pl-5">
            <div className="mb-1">Sample metadata (Optional):</div>
            <input className='form-control-i' onChange={readSampleMeta} type='file' accept='.css,.txt,.tsv'/>
            {/* <span className="example"><a download target="_blank" href='https://raw.githubusercontent.com/frlender/comut-viz-app/gh-pages/example_sample_meta.tsv'>example</a></span> */}
        </div>
        <div className="col- pl-5">
           <button className='mt-4 btn btn-success'
                onClick={()=>loadExample('gallbladder.maf','gallbladder_meta.txt')}>example</button>
        </div>
    </div>
    }
   

    
    {tb && 
        <div>
            <div className='row mt-4'>
                <div className='col-'>Select Columns:</div>
                <div className='col- pl-2'>
                    Sample  <select 
                    onChange={(e)=>{setSampleCol(e.target.value)}}>
                        <option>-</option>
                        {tb.columns.map(x=>
                        <option disabled={disableOption(x)}
                        key={'sample'+x}>{x}</option>)}
                    </select>
                </div>
                <div className='col- pl-2'>
                    Gene  <select
                    onChange={(e)=>{setGeneCol(e.target.value)}}>
                        <option>-</option>
                        {tb.columns.map(x=>
                        <option disabled={disableOption(x)}
                        key={'gene'+x}>{x}</option>)}
                    </select>
                </div>
                <div className='col- pl-2'>
                    Mutation  <select
                    onChange={(e)=>{setMutCol(e.target.value)}}>
                        <option>-</option>
                        {tb.columns.map(x=>
                        <option disabled={disableOption(x)}
                        key={'mutation'+x}>{x}</option>)}
                    </select>
                </div>
            </div>
            <div className='row mt-3'>
            <table className='table tablex'>
                <thead>
                    <tr>
                        {tb.columns.map(x => <th key={x}>{x}</th>)}
                    </tr>
                </thead>
                <tbody>
                        {tb.head(10).values.map((row,i)=>
                            <tr key={i}>{row.map((x,j)=><td key={`${i},${j}`}>{x}</td>)}</tr>)}
                </tbody>
            </table>
            </div>
        </div>
    }
    {metaTb && <div>
        <div className='row mt-4'>
            <div className='col-'>Select Columns:</div>
            <div className='col- pl-2'>
                Sample  <select 
                onChange={(e)=>{setMetaSampleCol(e.target.value)}}>
                    {metaTb.columns.map(x=>
                    <option key={'sample'+x}>{x}</option>)}
                </select>
            </div>
        </div>
        <div className='row mt-3'>
        <table className='table tablex'>
            <thead>
                <tr>
                    {metaTb.head(10).columns.map(x => <th key={x}>{x}</th>)}
                </tr>
            </thead>
            <tbody>
                    {metaTb.head(10).values.map((row,i)=>
                        <tr key={i}>{row.map((x,j)=><td key={`${i},${j}`}>{x}</td>)}</tr>)}
            </tbody>
        </table>
        </div>
    </div>
    }
    {/* <div id='content'/> */}
</div>
}