import {  useNavigate } from "react-router-dom";
import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import * as pd from "danfojs";
import {ComutData} from './ComutData';
import * as d3 from 'd3';
import {FilterData, GroupGenes} from './Misc';
import _ from 'lodash'
import { Tooltip } from 'react-tooltip'
import 'react-tooltip/dist/react-tooltip.css'
import { BiHelpCircle } from "react-icons/bi";


export default function FilterView(props){
    const [loading, setLoading] = useState(false)
  
    let [thres, setThres] = useState(1)
    let [fd, setFd] = useState(null)
    let [dfThres,setDfThres] = useState(null)
    let [cfThres,setCfThres] = useState(null) // cateTable at threshold
    const [dfThresSampleCt, setDfThresSampleCt] = useState()
    let [mutCountsThres, setMutCountsThres] = useState(null)
    let [mutSelect, setMutSelect] = useState({})
    let fdo = useRef() // original fd


    let [rmeta, setRmeta] = useState(null) //row meta
    let [cmeta, setCmeta] = useState(null)
    let [waterfall, setWaterfall] = useState(true)

    let navigate = useNavigate();

    const limit = 60 // visualiz at most 150 categories
    const waterfall_limit = 200
    const colMp = {'category':'gene','value':'mutation type'}
    const colMp2 = {'gene':'category','mutation type':'value'}

    const no_cate_ct = () =>{
        return fd.samples.length - dfThresSampleCt
    }

    const getSamplesWithNoMutations = ()=>{
        if(no_cate_ct() > 0){
            const diff = _.difference(fd.samples, dfThres.sample.unique().values)
            let res = 'The samples with no mutated genes are: <br/>'
            let arr = []
            // console.log(diff)
            diff.forEach((x,i)=>{
                arr.push(x)
                if((i+1)%3 === 0){
                    res += arr.join(', ')+'<br/>'
                    arr = []
                }
            })
            res += arr.join(', ')+'<br/>'
            // console.log(res)
            return res
        }else{
            return ''
        } 
    }

    const no_cate_str = () =>{
        const ct = no_cate_ct()
        const have = ct === 1?'has': 'have'
        return ` (${ct} ${have} no mutated genes),`
        // return `with ${ct} having no mutated genes`

    }

    const changeThres = function(thres,fd){
        const [dfThres,cfThres,mutCountsThres] = fd.changeThres(thres)
        setDfThresSampleCt(dfThres.sample.unique().shape[0])
        dfThres.rename(colMp,{inplace:true})
        cfThres.rename(colMp,{inplace:true})

        mutCountsThres.forEach((item)=>{
            if(!(item[0] in mutSelect))
                mutSelect[item[0]]=true
        })

        setThres(thres)
        setDfThres(dfThres)
        setCfThres(cfThres)
        setMutCountsThres(mutCountsThres)
        setMutSelect(mutSelect)
        if(cfThres.shape[0] <= waterfall_limit) setWaterfall(true)
        if(cfThres.shape[0] > waterfall_limit) setWaterfall(false)
        // props.changeVata({...props.vata, mat:cm.create_vata(limit)})
    }

    const changeMutSelect = key=>{
        mutSelect[key] = !mutSelect[key]
        const idx = fdo.current.df['value'].map(v=>v in mutSelect?mutSelect[v]:true)
        const df = fdo.current.df.loc({rows:idx})
        fd = new FilterData(df)
        changeThres(thres,fd)
        setFd(fd)
        // setMutCountsThres(mutCountsThres)
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
        // console.log('aa')
        let div
        let div2
        let div3
        if(!d3.select('#content').empty()){
            div = d3.select('#content').append('div').attr('id','tb')
            dfThres.plot('tb').table({autosizable:true})
            div2 = d3.select('#content2').append('div').attr('id','rsum')
            cfThres.plot('rsum').table({autosizable:true})
        }

        if(!d3.select('#content3').empty()){
            div3 = d3.select('#content3').append('div').attr('id','cmeta_tb')
            const tb = cmeta.tbo.copy()
            const ascend = {}
            tb.columns.forEach(x=>ascend[x]=true)
            function drawTable(){
                tb.plot('cmeta_tb').table()
                d3.select('#cmeta_tb').selectAll('#header').on('click',function(){
                    const col = d3.select(this).text()
                    tb.sortValues(col,{ascending:ascend[col],inplace:true})
                    ascend[col] = !ascend[col]
                    // console.log(col,tb)
                    drawTable()
                })
            }
            drawTable()
            // cmeta.tbo.plot('cmeta_tb').table()
            // console.log('abc')
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
        if(col1!=='sample')
            mp[col1] = 'sample'
        if(col2 !== 'category')
            mp[col2] = 'category'
        if(col3 !== 'value')
            mp[col3] = 'value'
        if(Object.keys(mp).length > 0)
            df.rename(mp,{inplace:true})

        const idx = []
        const notNullIdx = []
        let silentKey
        const uniqValsSet = new Set()
        df['value'].values.forEach(x=>{
            if(_.isNil(x)){
                idx.push(false)
                notNullIdx.push(false)
            }else{
                uniqValsSet.add(x)
                notNullIdx.push(true)
                if(x.toLowerCase().includes('silent')){
                    if(!silentKey) silentKey = x
                    idx.push(false)
                }else{
                    idx.push(true)
                }
            }
        })

        // fdo.current = df
        // console.log(df.columns)
        const df2 = df.loc({rows:notNullIdx})
        fdo.current = new FilterData(df2,true)
        let fd;

        const uniqVals = Array.from(uniqValsSet)

        //uncheck silent mutations by default as in maftools.
        // console.log(silentKey)       
        if(silentKey){
            // const idx = fdo.current.df['value'].map(v=>!(v===silentKey))
            const df2 = df.loc({rows:idx})
            fd = new FilterData(df2)
        }else
            fd = fdo.current

        const fdThres = fd.changeLimit(limit)
        const [dfThres,cfThres,mutCountsThres] = fd.changeThres(fdThres)
        dfThres.rename(colMp,{inplace:true})
        cfThres.rename(colMp,{inplace:true})

        setFd(fd)
        setThres(fdThres)
        setDfThres(dfThres)
        setDfThresSampleCt(dfThres.sample.unique().shape[0])
        setCfThres(cfThres)
        setMutCountsThres(mutCountsThres)

        uniqVals.forEach((key)=>{
            mutSelect[key]=true
        })
        if(silentKey)
            mutSelect[silentKey] = false
        setMutSelect(mutSelect)

        

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
            {/* {console.log('re-render everything')} */}
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
                            // console.log('abb')
                            // remove lines that contains null
                            let hasNull = false
                            const numIdx = []
                            dfThres.values.forEach((vec,i)=>{
                                const rowNotNull = _.reduce(vec,(acc,x)=>
                                    acc && (!_.isNil(x)), true)
                                hasNull = hasNull | (!rowNotNull)
                                if(rowNotNull) numIdx.push(i)
                                // return rowNotNull
                            })
                            if(hasNull){
                                console.log('dfThres has rows with nil values. Removed.')
                                dfThres = dfThres.iloc({rows:numIdx})
                            }
                            const cm = new ComutData(dfThres,fdo.current,fd.samples)
                            let vata;
                            if(cmeta){
                                vata = cm.create_vata(waterfall,cmeta.tb.index)
                                vata.cmeta = cmeta.get_vata(vata.cols.samples)
                            }else{
                                vata = cm.create_vata(waterfall)
                                vata.cmeta = {arr:[]}
                            }
                            if(props.geneGroupsRef.current){
                                const vata2 = 
                                    GroupGenes(props.geneGroupsRef.current,
                                        vata)
                                props.setVata(vata2)
                            }else
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
        {/* <span>{row_count} rows</span> */}
        {/* {console.log('ddd',cm)} */}
        {dfThres &&  <div className="row mt-4 mb-3">
                    <span className="span-input">
                        Keep genes mutated in at least &nbsp;     
                    </span>
                    <input type='number' value={thres} min='1' 
                    max={fd.sortedPairs[0][1]} onChange={e=>changeThres(parseInt(e.target.value),fd)} />
                    <span className="span-input"> &nbsp; samples. </span>
                    {/* Changing this number will change the number of genes visualized in the final plot. */}
                    <a data-tooltip-id="filter-tooltip"  data-tooltip-html="Use this filter to adjust the number of genes visualized in the comutation plot. The larger the threshold the less the number of genes are shown. <br />It retains the genes that are most frequently mutated across samples." className='xtooltip'>
                    <BiHelpCircle/>
                    </a>
                    <Tooltip id="filter-tooltip"  />
                </div>}
        <div className="row">
            {/* {console.log(dfThres)} */}
            {dfThres && <div className="colx table">
                        <div>Filtered table size: {dfThres.shape[0]}x{dfThres.shape[1]}. &nbsp;&nbsp;&nbsp; {fd.samples.length} samples{no_cate_ct() ===0?',':no_cate_str()}  &nbsp;&nbsp; {cfThres.shape[0]} genes, &nbsp;&nbsp; {dfThres['mutation type'].unique().shape[0]} mutation types.<a data-tooltip-id="filter-tooltip"  data-tooltip-html={"The number of unique samples, genes and mutation types in the table below."+getSamplesWithNoMutations()} className='xtooltip'>
                    <BiHelpCircle/>
                    </a>
                    <Tooltip id="filter-tooltip" /></div>
                        <div id='content'/>
                    </div>}

            {mutCountsThres && <div className="colx table mut-counts-div">
                <div> Mutation type selector:
                    <a data-tooltip-id="mut-counts-tooltip"  data-tooltip-html="Use this selector to exclude mutation types that you don't want to show in the comutation plot. Unselect a mutation type may cause the counts of other mutation types <br/> as well as the number of genes passing the current threshold to change. Please check the help documentation on the top right corner for detail." className='xtooltip'>
                    <BiHelpCircle/>
                    </a>
                    <Tooltip id="mut-counts-tooltip"  />
                </div>
                <table className='mut-counts-table'>
                    <thead>
                        <tr>
                            <th>Mutation Type</th>
                            <th>Count</th>
                            <th>Select</th>
                        </tr>
                    </thead>
                    <tbody>
                            {mutCountsThres.map((item,i)=>
                                <tr key={item[0]}>
                                    <td>{item[0]}</td>
                                    <td className="td-end"><span className="td-pad">{item[1]}</span></td>
                                    <td className="td-center"><input onChange={e=>{changeMutSelect(item[0])}} checked={mutSelect[item[0]]} type='checkbox'></input></td>
                                </tr>)}
                            {_.keys(mutSelect).filter(x=>!mutCountsThres.map(x=>x[0]).includes(x)).map(k=>
                                <tr key={k}>
                                    <td>{k}</td>
                                    <td className="td-end"><span className="td-pad">0</span></td>
                                    <td className="td-center"><input onChange={e=>{changeMutSelect(k)}} checked={mutSelect[k]} type='checkbox'></input></td>
                                </tr>)

                            }
                    </tbody>
                </table> 
            </div>}


            {dfThres && <div className="colx table">
                        <div>Top mutated genes ({cfThres.shape[0]} in total) and the number of samples they are mutated in. </div>
                        <div id='content2'/>
                    </div>}
            
            
            { cmeta && <div className="colx table">
                            <div>Sample metadata size: {cmeta.tb.shape[0]}x{cmeta.tb.shape[1]}.  &nbsp;&nbsp; &nbsp;The table is sortable by clicking on the column names. </div>
                            <div id='content3' />
                </div>}
        </div>
    </div>


}