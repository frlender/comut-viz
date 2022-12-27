import {  useNavigate } from "react-router-dom";
import React, { useState, useEffect } from 'react';
import * as pd from "danfojs";
import {ComutData} from './ComutData';
import * as d3 from 'd3';
import {Meta} from './Misc';

export default function FilterView(props){
    const [loading, setLoading] = useState(false)
  
    let [thres, setThres] = useState(1)
    const [cmo,setCmo] = useState(null)
    let [cm,setCm] = useState(null)
    let [rmeta, setRmeta] = useState(null) //row meta
    let [cmeta, setCmeta] = useState(null)
    let [waterfall, setWaterfall] = useState(false)

    let navigate = useNavigate();

    const limit = 150 // visualiz at most 150 categories


    const no_cate_ct = cm =>{
        return cm.samples.length - cm.tb.sample.unique().shape[0]
    }

    const no_cate_str = cm =>{
        const have = no_cate_ct(cm) === 1?'has': 'have'
        return `, ${no_cate_ct(cm)} ${have} no categories.`
    }

    const changeThres = function(e){
        thres = parseInt(e.target.value)
        const sub = cmo.topThres(thres)
        cm = new ComutData(sub,cmo.samples)
        setThres(thres)
        setCm(cm)
        if(cm.mf.shape[0] <= limit && ! cmeta) setWaterfall(true)
        if(cm.mf.shape[0] > limit && ! cmeta) setWaterfall(false)
        // props.changeVata({...props.vata, mat:cm.create_vata(limit)})
    }
    
    // const readFile = function(e,cb){
    //     // cb must setLoading(false)
    //     setLoading(true)
    //     const file = e.target.files[0]
    //     pd.readCSV(file,{'header':true,'skipEmptyLines':true}).then(cb)
    // }

    // const readData = function(e){
    //     // console.log(e)
    //     readFile(e,df => {
    //         cm = new ComutData(df)
    //         setCmo(cm)
    //         if(cm.tb.shape[0] > limit){
    //           let sub
    //           [thres,sub] = cm.top(limit)
    //           cm = new ComutData(sub,cm.samples)
    //           setThres(thres)
    //         }          
    //         // console.log(cm)
    //       //   props.changeVata({...props.vata, mat:cm.create_vata(limit)})
    //         setCm(cm)
    //         setLoading(false)
    //         if(cm.mf.shape[0] <= limit && ! cmeta) setWaterfall(true)
    //         if(cm.mf.shape[0] > limit && ! cmeta) setWaterfall(false)
    //     })
    //   }
    
    // const readSampleMeta = function(e){
    //     readFile(e, df =>{
    //         // const df = new DataFrame(df_.values,{
    //         //     'columns': df_.columns,
    //         //     'index': df_.index
    //         // })
    //         // console.log(df)
    //         // df.old().print()
    //         // df.print()
    //         const dfo = df.copy()
    //         df.setIndex({column:'sample',inplace:true,drop:true})
    //         setCmeta(new Meta(df,dfo))
    //         setLoading(false)
    //         setWaterfall(false)
    //     })
    // }


    
    useEffect(()=>{
        console.log('aa')
        let div
        let div2
        let div3
        if(!d3.select('#content').empty()){
            div = d3.select('#content').append('div').attr('id','tb')
            cm.tb.plot('tb').table({autosizable:true})
            div2 = d3.select('#content2').append('div').attr('id','rsum')
            const arr = []
            cm.rsum.values.forEach((d,i)=>{
                arr.push([cm.rsum.index[i],d])
            })
            new pd.DataFrame(arr,{columns:['category','count']})
                .plot('rsum').table({autosizable:true})
        }

        if(!d3.select('#content3').empty()){
            div3 = d3.select('#content3').append('div').attr('id','cmeta_tb')
            cmeta.tbo.plot('cmeta_tb').table()
        }

        // add footer text
        const year = new Date().getFullYear();
        document.getElementsByClassName('footer-inner')[0].textContent = `2015-${year} 3D Medicines Corporation`;
        
        return ()=>{
            if(div) div.remove()
            if(div2) div2.remove()
            if(div3) div3.remove()
        }
    })

    useEffect(()=>{
        const df = props.tb
        const [col1,col2,col3] = df.columns
        const mp = {}
        mp[col1] = 'sample'
        mp[col2] = 'category'
        mp[col3] = 'value'
        if(col1!=='sample' && col2 !== 'category'
            && col3!=='value')
            df.rename(mp,{inplace:true})

        console.log(df.columns)
        cm = new ComutData(df)
        if(cm.tb.shape[0] > limit){
            let sub
            [thres,sub] = cm.top(limit)
            cm = new ComutData(sub,cm.samples)
            setThres(thres)
        }
        setCmo(cm)          
        setCm(cm)
        if(props.cmeta){
            setCmeta(props.cmeta)
        }
        // setLoading(false)
        if(cm.mf.shape[0] <= limit && ! props.cmeta) setWaterfall(true)
        if(cm.mf.shape[0] > limit && ! props.cmeta) setWaterfall(false)
    },[])

    return <div className='container-fluid container-pad'>
        <div className="row input-status mb-2 mt-2">
            { loading &&
                <div className="col-">
                    loading ...
                </div>
            }
            { cm && !loading &&
                <div className="col-">
                    <button className='btn btn-success btn-i' onClick={()=>{
                        setLoading(true)
                        setTimeout(()=>{
                            const vata = cm.create_vata(waterfall)
                            vata.cmeta = {arr:[]}
                            vata.rmeta = {arr:[]}
                            if(cmeta){
                                vata.cmeta = cmeta.get_vata(vata.cols.samples)
                            }
                            props.setVata(vata)
                            setLoading(false)
                            navigate('/viz')
                        },1)
                    }}>Visualize</button>
                </div>
            }
            {
            cmeta &&
                <div className="col- pl-2">
                    <div className="waterfall-sort">
                    <span>waterfall sort: </span>
                    <input className='checkbox' type="checkbox" onChange={e=>setWaterfall(e.target.value)} />
                    </div>
                </div>
            }
        </div>
        {/* <div className="row">
            <div className="col-">
                <div className="mb-1">Mutation data in the format of "sample category value":</div>
                <input className='form-control-i' onChange={readData} type='file' accept='.css,.txt,.tsv'/>
                <span className="example"><a download target="_blank" href='https://raw.githubusercontent.com/frlender/comut-viz-app/gh-pages/example_input.tsv'>example</a></span>
            </div>
            <div className="col- pl-5">
                <div className="mb-1">Sample metadata (Optional):</div>
                <input className='form-control-i' onChange={readSampleMeta} type='file' accept='.css,.txt,.tsv'/>
                <span className="example"><a download target="_blank" href='https://raw.githubusercontent.com/frlender/comut-viz-app/gh-pages/example_sample_meta.tsv'>example</a></span>
            </div>
        
        </div> */}
        {/* <span>{row_count} rows</span> */}
        {console.log('ddd',cm)}
        {cm &&  <div className="row mt-4 mb-3">
                    <span className="span-input">
                        Keep categories (mutations) that occur in at least &nbsp;     
                    </span>
                    <input type='number' value={thres} min='1' 
                    max={cm.rsum.values[0]} onChange={changeThres} />
                    <span className="span-input"> &nbsp; samples.</span>
                </div>}
        <div className="row">
            {cm && <div className="col- table">
                        <div>Input table size: {cm.tb.shape[0]}x{cm.tb.shape[1]}. &nbsp;&nbsp;&nbsp; {cm.samples.length} unique samples{no_cate_ct(cm) ===0?'.':no_cate_str(cm)}  &nbsp;&nbsp;&nbsp; {cm.tb.value.unique().shape[0]} unique values.</div>
                        <div id='content'/>
                    </div>}

            {cm && <div className="col- table">
                        <div>There are {cm.mf.shape[0]} categories passing current filtering criterion. </div>
                        <div id='content2'/>
                    </div>}

            { cmeta && <div className="col- table">
                            <div>Sample metadata size: {cmeta.tb.shape[0]}x{cmeta.tb.shape[1]}.</div>
                            <div id='content3' />
                </div>}
        </div>
    </div>


}