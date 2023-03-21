import {  useNavigate } from "react-router-dom";
import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import * as pd from "danfojs";
import {ComutData} from './ComutData';
import * as d3 from 'd3';
import {FilterData} from './Misc';

export default function FilterView(props){
    const [loading, setLoading] = useState(false)
  
    let [thres, setThres] = useState(1)
    let [fd, setFd] = useState(null)
    let [dfThres,setDfThres] = useState(null)
    let [cfThres,setCfThres] = useState(null) // cateTable at threshold
    const [dfThresSampleCt, setDfThresSampleCt] = useState()
    let [mutCountsThres, setMutCountsThres] = useState(null)
    let [mutSelect, setMutSelect] = useState({})

    const scroll = useRef([0,0])

    let [rmeta, setRmeta] = useState(null) //row meta
    let [cmeta, setCmeta] = useState(null)
    let [waterfall, setWaterfall] = useState(true)

    let navigate = useNavigate();

    const limit = 60 // visualiz at most 150 categories
    const colMp = {'category':'gene','value':'mutation type'}
    const colMp2 = {'gene':'category','mutation type':'value'}

    const no_cate_ct = () =>{
        return fd.samples.length - dfThresSampleCt
    }

    const no_cate_str = () =>{
        const ct = no_cate_ct()
        const have = ct === 1?'has': 'have'
        return `, ${ct} ${have} no mutated genes.`
    }

    const changeThres = function(e){
        thres = parseInt(e.target.value)
        const [dfThres,cfThres,mutCountsThres] = fd.changeThres(thres)
        setDfThresSampleCt(dfThres.sample.unique().shape[0])
        dfThres.rename(colMp,{inplace:true})
        cfThres.rename(colMp,{inplace:true})

        setThres(thres)
        setDfThres(dfThres)
        setCfThres(cfThres)
        if(cfThres.shape[0] <= limit) setWaterfall(true)
        if(cfThres.shape[0] > limit) setWaterfall(false)
        // props.changeVata({...props.vata, mat:cm.create_vata(limit)})
    }

    const changeMutSelect = key=>{
        mutSelect[key] = !mutSelect[key]
        setMutSelect({...mutSelect})
    }

    // useLayoutEffect(()=>{
    //     console.log(window.scrollX,window.scrollY)

    //     console.log(scroll.current)
    //     // window.scrollTo(0,500)
    //     // window.scrollY = scroll.current[1]
    //     window.scrollTo(scroll.current[0],
    //         scroll.current[1])
    // })
    

    useEffect(()=>{
        console.log('aa')
        let div
        let div2
        let div3
        if(!d3.select('#content').empty()){
            div = d3.select('#content').append('div').attr('id','tb')
            dfThres.plot('tb').table({autosizable:true})
            div2 = d3.select('#content2').append('div').attr('id','rsum')
            // cfThres.plot('rsum').table({autosizable:true})
        }

        if(!d3.select('#content3').empty()){
            div3 = d3.select('#content3').append('div').attr('id','cmeta_tb')
            cmeta.tbo.plot('cmeta_tb').table()
        }
        
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

        // console.log(df.columns)
        const fd = new FilterData(df,limit)
        const [dfThres,cfThres,mutCountsThres] = fd.changeThres(fd.thres)
        dfThres.rename(colMp,{inplace:true})
        cfThres.rename(colMp,{inplace:true})

        setFd(fd)
        setThres(fd.thres)
        setDfThres(dfThres)
        setDfThresSampleCt(dfThres.sample.unique().shape[0])
        setCfThres(cfThres)
        setMutCountsThres(mutCountsThres)

        mutCountsThres.index.forEach((key)=>{
            mutSelect[key]=true
        })
        setMutSelect(mutSelect)

        // console.log(mutCountsThres)


        if(props.cmeta){
            setCmeta(props.cmeta)
        }
        // setLoading(false)
        // if(cm.mf.shape[0] <= limit && ! props.cmeta) setWaterfall(true)
        // if(cm.mf.shape[0] > limit) setWaterfall(false)
    },[])

    return <div className='container-fluid container-pad'>
        <div className="row input-status mb-2 mt-2">
            { loading &&
                <div className="col- loading">
                    loading ...
                </div>
            }
            {console.log('re-render everything')}
            { dfThres && !loading &&
                <div className="col-">
                    <button className='btn btn-success btn-i' onClick={()=>{
                        setLoading(true)
                        setTimeout(()=>{
                            // console.log('a')
                            try{
                                dfThres.rename(colMp2,{inplace:true})
                            }catch(err){
                                // do nothing. This is a bug of DanfoJS package
                            }
                            console.log('abb')
                            const cm = new ComutData(dfThres,fd.samples)
                            let vata;
                            if(cmeta){
                                vata = cm.create_vata(waterfall,cmeta.tb.index)
                                vata.cmeta = cmeta.get_vata(vata.cols.samples)
                            }else{
                                vata = cm.create_vata(waterfall)
                                vata.cmeta = {arr:[]}
                            }
                            props.setVata(vata)
                            setLoading(false)
                            navigate('/viz')
                        },1)
                    }}>Visualize</button>
                </div>
            }
            {
            // cmeta &&
                <div className="col- pl-2">
                    <div className="waterfall-sort">
                    <span>waterfall sort: </span>
                    <input className='checkbox' type="checkbox" onChange={e=>setWaterfall(!waterfall)} checked={waterfall}/>
                    </div>
                </div>
            }
        </div>
        {/* <div style={{height:'800px'}}></div> */}
        {dfThres &&  <div className="row mt-4 mb-3">
                    <span className="span-input">
                        Keep genes mutated in at least &nbsp;     
                    </span>
                    <input type='number' value={thres} min='1' 
                    max={fd.sortedPairs[0][1]} onChange={changeThres} />
                    <span className="span-input"> &nbsp; samples.</span>
                </div>}
        <div className="" style={{'min-height':'450px'}}>
                 {dfThres && <div className="col- table">
                        <div>Filtered table size: {dfThres.shape[0]}x{dfThres.shape[1]}. &nbsp;&nbsp;&nbsp; {fd.samples.length} samples{no_cate_ct() ===0?'.':no_cate_str()}  &nbsp;&nbsp;&nbsp; {dfThres['mutation type'].unique().shape[0]} mutation types.</div>
                        <div id='content'/>
                    </div>}

                    {/* {dfThres && <div className="col- table">
                        <div>There are {cfThres.shape[0]} genes mutated in at least {thres} samples. </div>
                        <div id='content2'/>
                    </div>} */}

                

        </div>
        
        <div style={{'min-height':'400px'}}>{mutCountsThres && <div className="table mut-counts-div">
                        <table className=''>
                            <thead>
                                <tr>
                                    <th>Mutation</th>
                                    <th>Count</th>
                                    <th>Select</th>
                                </tr>
                            </thead>
                            <tbody>
                                    {mutCountsThres.index.map((key,i)=>
                                        <tr key={Math.random()}>
                                            <td>{key}</td>
                                            <td>{mutCountsThres.iloc([i]).values[0]}</td>
                                            <td><input onChange={e=>{changeMutSelect(key)}} checked={mutSelect[key]} type='checkbox'></input></td>
                                        </tr>)}
                            </tbody>
                        </table> 
                    </div>}</div>

        {/* <div className="row">
            {dfThres && <div className="col- table">
                        <div>Filtered table size: {dfThres.shape[0]}x{dfThres.shape[1]}. &nbsp;&nbsp;&nbsp; {fd.samples.length} samples{no_cate_ct() ===0?'.':no_cate_str()}  &nbsp;&nbsp;&nbsp; {dfThres['mutation type'].unique().shape[0]} mutation types.</div>
                        <div id='content'/>
                    </div>}

           

            {dfThres && <div className="col- table">
                        <div>There are {cfThres.shape[0]} genes mutated in at least {thres} samples. </div>
                        <div id='content2'/>
                    </div>}
            
                    {mutCountsThres && <div className="col- table mut-counts-div">
                <table className=''>
                    <thead>
                        <tr>
                            <th>Mutation</th>
                            <th>Count</th>
                            <th>Select</th>
                        </tr>
                    </thead>
                    <tbody>
                            {mutCountsThres.index.map((key,i)=>
                                <tr key={Math.random()}>
                                    <td>{key}</td>
                                    <td>{mutCountsThres.iloc([i]).values[0]}</td>
                                    <td><input onChange={e=>{changeMutSelect(key)}} checked={mutSelect[key]} type='checkbox'></input></td>
                                </tr>)}
                    </tbody>
                </table> 
            </div>}

            
            
            { cmeta && <div className="col- table">
                            <div>Sample metadata size: {cmeta.tb.shape[0]}x{cmeta.tb.shape[1]}.</div>
                            <div id='content3' />
                </div>}
        </div> */}
    </div>


}