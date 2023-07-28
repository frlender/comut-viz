import React, { useState, useEffect } from 'react';
import {  useNavigate } from "react-router-dom";
import * as pd from "danfojs";
import {Meta} from './Misc';
import _ from 'lodash'
import InputHelp from './InputHelp';
import {ListSessions} from 'react-save-session'

export default function InputView(props){
    const [loading, setLoading] = useState(null)
    let [tb,setTb] = useState(null)
    // const [cmeta,setCmeta] = useState(null)
    let [metaTb, setMetaTb] = useState(null)
    const [exampleLoaded,setExampleLoaded] = useState(false)
    const [showExampleBtn, setShowExampleBtn] = useState(true)
    const [rmComment,setRmComment] = useState(true)

    // console.log(rmComment)

    const [errMsg,setErrMsg] = useState('')

    const sampleColNames = ['Tumor_Sample_Barcode']
    const geneColNames = ['Hugo_Symbol']
    const mutColNames = ['Variant_Classification']

    let [sampleCol,setSampleCol] = useState('-')
    let [geneCol,setGeneCol] = useState('-')
    let [mutCol,setMutCol] = useState('-')
    let [metaSampleCol, setMetaSampleCol] = useState('')

    const [fname,setFname] = useState('')
    const [fmeta,setFmeta] = useState('')

    const disableOption = (x)=>[sampleCol,geneCol,mutCol].includes(x)
    const disableNextButton = ()=> sampleCol === '-' || geneCol === '-'
        || mutCol === '-'

    let navigate = useNavigate();
    

    const readFile = function(e,cb,fileAnnot){
        // cb must setLoading(false)
        setLoading('loading ...')
        const file = e.target.files[0]
        const option = {'header':true,'skipEmptyLines':'greedy'}
        if(rmComment)
            option['comments'] = '#'
        pd.readCSV(file,option).then(cb).catch(err=>{
                // console.log('error inside',err)
                if(fileAnnot==='maf'){
                    setErrMsg('MAF file parsing error: '+err)
                }else{
                    setErrMsg('Metadata file parsing error: '+err)
                }
            })
    }

    const readData = function(e){
        // console.log(e)
        readFile(e,df => {
            // console.log(df)
            const df2 = df
            // console.log(df2)
            setTb(df2)
            setLoading(false)
            setShowExampleBtn(false)
            df2.columns.forEach(e=>{
                if(sampleColNames.includes(e) && sampleCol === '-'){
                    sampleCol = e
                    setSampleCol(e)
                }
                if(geneColNames.includes(e) && geneCol === '-'){
                    geneCol = e
                    setGeneCol(e)
                }
                if(mutColNames.includes(e) && mutCol === '-'){
                    mutCol = e
                    setMutCol(e)
                }
            },'maf')
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
        const loadStr = fname === 'TCGA-LUSC.maf' ? 
            'loading ... (may take about 1 min)' : 'loading...'
        setLoading(loadStr)
        setFname(fname)
        if(fmeta) setFmeta(fmeta)

        pd.readCSV(`/comut-viz-app/${fname}`,{'header':true,'skipEmptyLines':true})
            .then(df=>{
                // console.log(df)
                const df2 = df.dropNa({ axis: 1 })
                setTb(df2)
                setLoading(false)
                setExampleLoaded(true)
                setSampleCol('Tumor_Sample_Barcode')
                setGeneCol('Hugo_Symbol')
                setMutCol('Variant_Classification')
            })
        
        if(fmeta)
        pd.readCSV(`/comut-viz-app/${fmeta}`,{'header':true,'skipEmptyLines':true})
            .then(df=>{
                const dfo = df.copy()
                // df.setIndex({column:df.columns[0],inplace:true,drop:true})
                setMetaTb(dfo)
                setMetaSampleCol(dfo.columns[0])
                // console.log(fmeta,df)
                // setLoading(false)
            })
      }

      const readSampleMeta = function(e){
        readFile(e, dfi =>{
            // const df = dfi.dropNa({ axis: 1 })
            // const dfo = df.copy()
            const dfo = dfi
            setMetaTb(dfo)
            setMetaSampleCol(dfo.columns[0])
            // df.setIndex({column:df.columns[0],inplace:true,drop:true})
            // setCmeta(new Meta(df,dfo))
            setLoading(false)
            setShowExampleBtn(false)
        },'meta')
    }

    const enterSession = (session)=>{
        console.log(session)
        const sample_count = new pd.Series(
            session.data.vata.rows.sample_count.$data,
            {index:session.data.vata.rows.sample_count.$index})
        
        session.data.vata.rows.sample_count = sample_count
        props.setVata(session.data.vata)
        session.data.sess.sessName = session.sessName
        session.data.sess.uid = session.uid
        props.setSession(session.data.sess)
        navigate('/viz')

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
                {loading}
            </div>
        }
        {errMsg &&
            <div className="col- err">
                {errMsg}
            </div>
        }
        { tb && !loading &&
            <div className="col-">
                <button className='btn btn-success btn-i' onClick={()=>{
                    setLoading('loading ...')
                    setTimeout(()=>{
                        // console.log('abc')
                        if(metaTb){
                            // check id match
                            const metaSamples = metaTb[metaSampleCol].unique().values
                            if(metaSamples.length < metaTb.shape[0]){
                                const ct = _.countBy(metaTb[metaSampleCol].values)
                                const dups = _.keys(ct).filter(x=>ct[x]>1)
                                setErrMsg(`  ERROR: the sample IDs in the metadata file are not unique. These IDs occur more than once: ${dups.join(',')}`)
                                return
                            }
                            const mafSamples = tb[sampleCol].unique().values
                            const diffLeft = _.difference(mafSamples,metaSamples)
                            const cmmCount = mafSamples.length - diffLeft.length
                            if(cmmCount === 0){
                                setErrMsg('  ERROR: sample IDs in the mutation data file do not match those in the metadata file with no sample IDs in common. Please check.')
                                return
                            }
                            if(cmmCount > 0 && cmmCount < mafSamples.length){
                                alert(`${mafSamples.length - cmmCount} out of ${mafSamples.length} samples do not have metadata in the metadata file: \n ${diffLeft.join(', ')}. \n\n Only the ${cmmCount} samples with metadata will be shown. \n Please confirm.`)

                                const cmmMap = {}
                                mafSamples.forEach(x=>{
                                    if(metaSamples.includes(x))
                                    cmmMap[x] = true
                                    else
                                    cmmMap[x] = false
                                })
                                const idx = tb[sampleCol].values.map(x=>cmmMap[x])
                                tb = tb.iloc({rows:idx})

                                const idx2 = metaTb[metaSampleCol].values.map(x=>{
                                    if(x in cmmMap && cmmMap[x])
                                    return true
                                    else
                                    return false
                                })
                                metaTb = metaTb.iloc({rows:idx2})
                            }
                            if(cmmCount === mafSamples.length && cmmCount < 
                                metaSamples.length){
                                const idx = metaTb[metaSampleCol].values.map(x=>
                                    mafSamples.includes(x))
                                metaTb = metaTb.iloc({rows:idx})
                            }

                            const cols = [metaSampleCol].concat(
                                metaTb.columns.filter(x=>x!==metaSampleCol))
                            const dfo = metaTb.loc({columns:cols})
                            const df2 = dfo.copy()
                            df2.setIndex({column:df2.columns[0],inplace:true,drop:true})
                            props.setCmeta(new Meta(df2,dfo))
                        }else{
                            props.setCmeta(null)
                        }

                         // console.log('aaa')
                         const sub = tb.loc({columns:[sampleCol,geneCol,mutCol]})
                         // console.log('aab')
                         props.setTb(sub)

                        // console.log('sub',sub)
                        navigate('/filter')
                    })
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
         <div className="row mt-3">Loaded file{fmeta? 's':''}: {fname} {fmeta?`,   ${fmeta}`:''}</div>
    }
    {!exampleLoaded &&
    <div className="row">
        <div className="col-">
            <div className="mb-1">A table of mutation data, commonly a .maf file:</div>
            <input className='form-control-i' onChange={readData} type='file' accept='.csv,.txt,.tsv,.maf'/>
            {/* <span className="example"><a download target="_blank" href='https://raw.githubusercontent.com/frlender/comut-viz-app/gh-pages/example_input.tsv'>example</a></span> */}
        </div>
        <div className="col- pl-5">
            <div className="mb-1">Sample metadata (Optional):</div>
            <input className='form-control-i' onChange={readSampleMeta} type='file' accept='.csv,.txt,.tsv'/>
            {/* <span className="example"><a download target="_blank" href='https://raw.githubusercontent.com/frlender/comut-viz-app/gh-pages/example_sample_meta.tsv'>example</a></span> */}
        </div>
        {showExampleBtn &&
        <div className="col- pl-5">
           <button className='mt-4 btn btn-success'
                onClick={()=>loadExample('gallbladder.maf','gallbladder_meta.txt')}>example 5k</button>
             <button className='ml-2 mt-4 btn btn-success'
                onClick={()=>loadExample('TCGA-LUSC.maf')}>example 141k</button>
        </div>}
    </div>
    }
    {!exampleLoaded && !tb &&
        <div className='row mt-3 ignore-comment'>
            <input disabled={tb} checked={rmComment} onChange={e=>setRmComment(!rmComment)} type='checkbox'></input>
            <span>&nbsp; Ignore comment lines starting with "#".</span>
        </div>
    }

    {!exampleLoaded && !tb &&
        <ListSessions dbName='comut-viz' enter={enterSession}></ListSessions>
    }
   

    
    {tb && 
        <div>
            <div className='row mt-4 help-row'>
            Three pieces of information are required to create a comutation plot: sample ID, gene symbol and mutation type. Please select the corresponding columns in the table below using the dropdown menus (standard column names are auto-selected) :
            </div>
            <div className='row mt-3'>
                <div className='col-'>Select Columns:</div>
                <div className='col- pl-2'>
                    Sample ID  <select value={sampleCol}
                    onChange={(e)=>{setSampleCol(e.target.value)}}>
                        <option>-</option>
                        {tb.columns.map(x=>
                        <option disabled={disableOption(x)}
                        key={'sample'+x}>{x}</option>)}
                    </select>
                </div>
                <div className='col- pl-2'>
                    Gene  <select value={geneCol}
                    onChange={(e)=>{setGeneCol(e.target.value)}}>
                        <option>-</option>
                        {tb.columns.map(x=>
                        <option disabled={disableOption(x)}
                        key={'gene'+x}>{x}</option>)}
                    </select>
                </div>
                <div className='col- pl-2'>
                    Mutation  <select value={mutCol}
                    onChange={(e)=>{setMutCol(e.target.value)}}>
                        <option>-</option>
                        {tb.columns.map(x=>
                        <option disabled={disableOption(x)}
                        key={'mutation'+x}>{x}</option>)}
                    </select>
                </div>
                <div className='col- pl-5'>
                    Table size: {tb.shape[0]}x{tb.shape[1]} 
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
            <div className='col-'>Select the Sample ID column in the metadata:</div>
            <div className='col- pl-2'>
                <select 
                onChange={(e)=>{setMetaSampleCol(e.target.value)}}>
                    {metaTb.columns.map(x=>
                    <option key={'sample'+x}>{x}</option>)}
                </select>
            </div>
            <div className='col- pl-5'>
                    Table size: {metaTb.shape[0]}x{metaTb.shape[1]} 
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
    {!tb && <InputHelp></InputHelp>}
</div>
}