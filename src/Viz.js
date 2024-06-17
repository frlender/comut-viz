import * as d3 from 'd3';
import { useState, useEffect, useRef } from 'react';
import {colors, VMmat, YLabels, XLabels, Legend, Bar, YBar, 
    GradLegend, Indicator} from './Areas'
// import * as pd from "danfojs";
import ColorPicker from './ColorPicker';
import {Counter} from './ComutData';
import { Tooltip } from 'react-tooltip'
import { BiHelpCircle } from "react-icons/bi";
import _ from 'lodash'
import { SaveSession } from 'react-save-session';
import { from_raw, Series } from 'jandas';
import { DataFrame } from 'danfojs';

const colorSchemes = {
    // only use hex color values as that is the only accepted format for the input element.
    'maftools':{
        'Missense_Mutation': '#33a02c',
        'Splice_Site': '#ff7f00',
        'Frame_Shift_Del': '#1f78b4',
        'Nonsense_Mutation': '#e31a1c',
        'In_Frame_Del': '#ffff99',
        'Frame_Shift_Ins': '#6a3d9a',
        'Nonstop_Mutation': '#a6cee3',
        'In_Frame_Ins': '#d53e4f',
        'Translation_Start_Site': '#f46d43',
        'multiple': '#000000'
    }
}

function get_cl_mp(values){
    const cl = d3.scaleOrdinal(colors)
        .domain(values)
    const mp = {}
    values.forEach(d =>{
        mp[d] = cl(d)
    })
    return mp
}

function cl_mp_init(props){
    const cl_mpo = {
        vm: get_cl_mp(props.vata.rects.values),
        pct: {'':'grey'}
    }// initial value of cl_mp 
    
    if('cmeta' in props.vata){
        let ct = 0
        props.vata.cmeta.arr.forEach(d =>{
            if(d.dtype === 'string'){
                cl_mpo[d.id] = get_cl_mp(d.domain)
            }else{
                cl_mpo[d.id] = colors[ct % 12]
                ct += 1
            }
        })
    }

    if('rmeta' in props.vata){
        let ct = 0
        props.vata.rmeta.arr.forEach(d =>{
            if(d.dtype === 'string'){
                cl_mpo[d.id] = get_cl_mp(d.domain)
            }else{
                cl_mpo[d.id] = colors[ct % 12]
                ct += 1
            }
        })
    }
    return cl_mpo
}

function get_vata_export(vata){
    const sample_count = vata.rows.sample_count
    delete vata.rows.sample_count
    vata.rows.sample_count = sample_count.to_raw()
    const vata_copy = structuredClone(vata)
    vata.rows.sample_count = sample_count
    return vata_copy
}

export default function Viz(props){
    console.log(props)
    const vataRef = useRef(props.vata)
    const [vata,setVata] = useState(props.vata)
    // const [cl,setCl] = useState(get_cl_mp(props.vata.rects.values))
    const [cl_info, setCl_info] = useState(null)
    // const [grad_cl, setGrad_cl] = useState(colors[0])

    const [cl_mp,setCl_mp] = useState(
        props.session ? props.session.cl_mp:cl_mp_init(props))

    const [wh, setWh] = useState(
        props.session ? props.session.wh:[800,700])

    const geneLabelWidthInit = 60
    const [geneLabelWidth, setGeneLabelWidth] = useState(
        props.session ? props.session.geneLabelWidth: geneLabelWidthInit)

    if(props.session){
        _.keys(props.session.colorSchemes).forEach(k=>{
            colorSchemes[k] = props.session.colorSchemes[k]
        })
    }

    const defaultColors = useRef(
        props.session ? props.session.colorSchemes['default'] :
            undefined
    )

    const colorSchemeName = useRef(
        props.session? props.session.colorSchemeName:'default')
    const schemesInit = ['default','maftools']

    const getSessData = ()=>{
        colorSchemes['default'] = defaultColors.current
        return {
            vata:get_vata_export(vata),
            sess:{
                colorSchemeName: colorSchemeName.current,
                colorSchemes:colorSchemes,
                cl_mp: cl_mp,
                wh: wh,
                geneLabelWidth: geneLabelWidth,
                inputFnames: props.inputFnamesRef.current
            }
        }
    }

    const checkColorSchemeOverlap = function(schemeName){
        if(schemeName === 'default') return true
        const schemeMuts = _.keys(colorSchemes[schemeName])
        const overlap = _.intersection(schemeMuts,vata.rects.values)
        // console.log(overlap)
        if(overlap.length > vata.rects.values.length-2){
            return true
        }else{
            return false
        }
    }

    const schemes = schemesInit.filter(x=>checkColorSchemeOverlap(x))
    // console.log(schemes,schemesInit)

    const changeColorScheme = e=>{
        const schemeName = e.target.value
        console.log(e.target.value)
        colorSchemeName.current = schemeName
        if(_.isNil(defaultColors.current)){
            defaultColors.current = cl_mp['vm']
        }
        if(schemeName==='default') cl_mp['vm'] = defaultColors.current
        else{
            cl_mp['vm'] = colorSchemes[schemeName]
            const diff = _.difference(vata.rects.values,_.keys(cl_mp['vm']))
            const cl = d3.scaleOrdinal(_.reverse(colors.slice(0)))
            .domain(diff)
        
            diff.forEach(d =>{
                cl_mp['vm'][d] = cl(d)
                })
        }
        setCl_mp({...cl_mp})
        setCl_info(null)
    }

    const changeCl = function(color){
        if('label' in cl_info){
            cl_mp[cl_info.id][cl_info.label]= color
        }else{
            cl_mp[cl_info.id] = color
        }
        setCl_mp({...cl_mp})
        setCl_info(null)
    }

    function changeWidth(e){
        setWh([e.target.value,wh[1]])
    }

    function changeheight(e){
        setWh([wh[0],e.target.value])
    }

    function changeGeneLabelWidth(e){
        setGeneLabelWidth(e.target.value)
    }

    const changeMin = function(e){
        const minVal = parseInt(e.target.value)
        const vata2 = changeMinVal(minVal)
        setVata(vata2)
    }

    const changeMinVal = function(minVal){
        // TODO update values after changing min
        // console.log(e.target.value)
        const vata2 = structuredClone(get_vata_export(vataRef.current))
        vata2.rows.sample_count = from_raw(vata2.rows.sample_count)
        const min = minVal
        const sample_count = vataRef.current.rows.sample_count
        vata2.rows.sample_count = sample_count.q(`x >= ${min}`)
        vata2.rows.min = min
        if(min > vataRef.current.rows.min){
            const cates = sample_count.q(`x >= ${min}`).index.__values
            
            const cate_mp = {}
            cates.forEach((x,i)=>{
                if(!(x in cate_mp))
                    cate_mp[x] = [i]
                else
                    cate_mp[x].push(i)
            })
            
            // const cate_val_ct = new Counter('category') // # of muts in each cate
            // const sample_val_ct = new Counter('sample')

            const ct = {'multiple':0} // value total count
            const data = []
            let skipCount = 0
            vata2.rects.data.forEach(x=>{
                if(cates.includes(x.category) && skipCount===0){
                    const i_arr = cate_mp[x.category]
                    skipCount = i_arr.length
                    i_arr.forEach((i,j)=>{
                        const y = j === 0 ? 
                            x:{...x}
                        y.i = i
                        data.push(y)
                    })

                    x.val.forEach(d=>{
                        if(!(d.value in ct)) ct[d.value] = 0;
                        ct[d.value] += d.count
                        
                        // cate_val_ct.add(x.category,d.value,d.count)
                        // sample_val_ct.add(x.sample,d.value,d.count)
                    })

                    if(x.val.length > 2) ct['multiple'] += 1
                }
                if(skipCount>0)
                    skipCount -= 1
            })

            let arr = []
            for (let [key, val] of Object.entries(ct)) {
                if(val > 0) arr.push({key:key,val:val})
            }
            arr.sort((x,y)=>y.val-x.val)
            const values = arr.map(x=>x.key)

            if(!_.isUndefined(vata.rows.groups)){
                // console.log('groups')
                const vata = vataRef.current
                const gp = new Series(vata.rows.groups,
                    {index:vata.rows.cates})
                const idx = vata.rows.sample_count.b(`x >= ${min}`)
                vata2.rows.groups = gp.loc(idx).values
            }
                
            vata2.rects.data = data
            vata2.rects.shape[0] = cates.length
            vata2.rects.values = values
            vata2.rows.cates = cates
            // vata2.rows.val_count = cate_val_ct.arr(cates,values)
            // vata2.cols.val_count = sample_val_ct.arr(vata2.cols.samples,values)
        }
        // console.log(vata2)
        return vata2
        // setCl(get_cl_mp(vata2.mat.values))
    }

    function downloadSVG(id,fname){
        const svg = document.getElementById(id).getElementsByTagName('svg')[0]
        svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
        const svg_html = svg.outerHTML;

        const blob = new Blob([svg_html.toString()]);
        const element = document.createElement("a");
        element.download = `${fname}.svg`;
        element.href = window.URL.createObjectURL(blob);
        element.click();
        element.remove();
    }

    function download(){
        downloadSVG('viz','comut')
        downloadSVG('lg','comut_legend')
    }



    useEffect(()=>{
        // console.log('in effect',vata)
        const [width, height] = wh
        // console.log(width, height, geneLabelWidth)
        const ylabel_width =  parseFloat(geneLabelWidth)
        const margin = 30 
        const svg = d3.select('#viz').append('svg')
            .attr('width',width)
            .attr('height',height)
        
        // svg.append('rect')
        //     .attr('width',width)
        //     .attr('height',height)
        //     .attr('fill','lightgrey');
        
        const xbar_height = margin*2
        const ybar_width = margin*2.4
        const indi_height_each = margin/2*1.2
        const xlabel_height = margin*2
        

        
        const indi_height = vata.cmeta.arr.length*indi_height_each

        const vm = new VMmat(svg,ylabel_width,margin+xbar_height+indi_height,
                width-ylabel_width-ybar_width-margin,
                height-xbar_height-xlabel_height-margin-indi_height)
                .draw(vata.rects,cl_mp.vm)
        
        // use vata.cols.val_count to plot bars with only top mutated genes.
        const xbar = new Bar(svg,vm.gx,margin,vm.width,xbar_height)
                    .draw('xbar',vata.cols.tmb_count,cl_mp.vm)
        
        // const ybar = new Bar(svg,vm.gx+vm.width,vm.gy,
        //             ybar_width,vm.height)
        //             .draw('ybar',vata.rows.val_count,cl_mp.vm)
        
        const ybar = new YBar(svg,vm.gx+vm.width,vm.gy,
                    ybar_width,vm.height)
                    .draw(vata.rows.sample_count,
                        vata.rows.groups,
                        vata.rects.shape[1], cl_mp.pct[''])
        
        const ylabels = new YLabels(svg,0,vm.gy,
                ylabel_width,vm.height)
                .draw(vata.rows.cates,vata.rows.sample_count)
        
        // const xlabels = new XLabels(svg,ylabel_width,vm.gy+vm.height,
        //             vm.width,xlabel_height)
        //             .draw(vata.cols.samples)
        
        const indis = [];
        vata.cmeta.arr.forEach((item,i) => {
            const indi = new Indicator(svg,vm.gx,vm.gy-indi_height+indi_height_each*i,
                vm.width,indi_height_each)
                    .draw(item, vata.cmeta.mp[item.id],
                        cl_mp[item.id], ylabels)
            indis.push(indi)
        })

        vm.interact(svg,margin,ylabels,ybar)


        // console.log(wh)
        
        // // start to draw legend on a separate svg
       

        const lg_width = margin*5
        const lg_height = margin*8
        const grad_lg_width = margin*3
        const grad_lg_height = margin*5

        let lg_width_tt = lg_width*2 // vm + pct
        vata.cmeta.arr.forEach(d=>{
            lg_width_tt += d.dtype === 'string'?lg_width : grad_lg_width
        })

        const svg_lg = d3.select('#lg').append('svg')
                // .attr('width',width)
                .attr('height',lg_height+margin*2)
                .attr('fill','grey')
                .attr('width',lg_width_tt+margin*2)

        const item_vm_lg = {
            id:'vm', name: 'Mutation', 
            domain:vata.rects.values
        }
        const vm_lg = new Legend(svg_lg,margin,margin,
                    lg_width,lg_height)
                    .draw(vm.cl,item_vm_lg,setCl_info)
        
        const lgs = []
        let accu = vm_lg.gx+vm_lg.width
        vata.cmeta.arr.forEach((item,i) => {
            let lg;
            if(item.dtype === 'string'){
                lg = new Legend(svg_lg,accu,margin,
                    lg_width,lg_height)
                    .draw(cl_mp[item.id],item,setCl_info)
                accu += lg_width
            }else{
                lg = new GradLegend(svg_lg,
                    accu,
                    margin,
                    grad_lg_width,grad_lg_height)
                    .draw(cl_mp[item.id],item,setCl_info)
                accu += grad_lg_width
            }
            lgs.push(lg)
            
        })
        
        const item_pct_lg = {
            id:'pct', name: 'Mutation Pct', 
            domain:['']
        }
        const pct_lg = new Legend(svg_lg,accu,margin,
                    lg_width,lg_height/3)
                    .draw(cl_mp[item_pct_lg.id],item_pct_lg,setCl_info)
        
        

        return () => {
            svg.remove()
            svg_lg.remove()
        }
    });

    const getFnames = ()=>{
        let dataFname,metaFname,geneGroupsFname
        if(props.session){
            if(props.session.inputFnames){
                dataFname = props.session.inputFnames.data
                metaFname = props.session.inputFnames.meta
                geneGroupsFname = props.session.inputFnames.geneGroups
            }
        }else{
            dataFname = props.inputFnamesRef.current.data
            metaFname = props.inputFnamesRef.current.meta
            geneGroupsFname = props.inputFnamesRef.current.geneGroups
        }
        if(dataFname){
            const metaStr = metaFname ? `, ${metaFname}` : ''
            const geneGroupsStr = geneGroupsFname ? `, ${geneGroupsFname}` : ''
            return dataFname+metaStr+geneGroupsStr
        }else{
            return undefined
        }  
    }
    // console.log(vataRef.current.rows.min)

    return <div className='container-fluid container-pad'>
        <div className="row input-status mb-2 mt-2">
            <button className='btn btn-primary btn-i' onClick={download}>Download</button>
            &nbsp; <span className="span-input">Width:</span>  &nbsp;<input className='input-adjust' type='number' value={wh[0]} min='200' step='100' onChange={changeWidth}/>
            &nbsp; <span className="span-input">Height:</span>  &nbsp;<input className='input-adjust'type='number' value={wh[1]} min='200' step='100' onChange={changeheight}/>
            &nbsp; <span className="span-input">Gene label width:</span>  &nbsp;<input  className='input-adjust' type='number' value={geneLabelWidth} min='60' step='10' onChange={changeGeneLabelWidth}/>
            {schemes.length > 1 && <span className='color-scheme'>Color schemes: &nbsp; 
            <select onChange={e=>changeColorScheme(e)} defaultValue={colorSchemeName.current}>
                {schemes.map(x=>
                    <option key={x}>{x}</option>)}   
            </select></span>}
            <SaveSession dbName='comut-viz' 
                buttonClass={'btn btn-primary btn-session'}
                editTextStyle={{'width':'80px','height':'25px','verticalAlign':'-7%',}}
                getData={getSessData}
                notification
                // notificationDelay={1000}
                sessName={props.session ? props.session.sessName : undefined}
                uid={props.session ? props.session.uid : undefined}></SaveSession>
        </div>
        <div className="row mb-2">
            <span className="span-input">
                Keep genes mutated in at least &nbsp;  
            </span>
            <input className='input-filter' type='number' value={vata.rows.min} 
                min={vataRef.current.rows.min} 
                max={vataRef.current.rows.max} 
                onChange={changeMin}/> 
            <span className="span-input-2"> &nbsp; samples.
            <a data-tooltip-id="filter-tooltip"  data-tooltip-html="Use this filter to adjust the number of genes visualized in the comutation plot. The larger the threshold the less the number of genes are shown. <br />It retains the genes that are most frequently mutated across samples." className='xtooltip'>
                    <BiHelpCircle/>
                    </a>
            <Tooltip id="filter-tooltip"  />
                <span className='ml-4'>{vata.rows.cates.length} genes, </span> 
                <span className='ml-2'>{vata.cols.samples.length} samples, </span>
                <span className='ml-2'>{vata.rects.values.length} mutation types. </span>
            </span>
            {/* <span>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Group genes by pathways: &nbsp;
                <input className='viz-input-file' type='file' onChange={readData} accept='.yml,.yaml'></input>
                <a href=''>example yaml file</a>
            </span> */}
            
        </div>
        {/* <button>set</button> */}
        <div className='row'>
            <div id='viz' className='col-'></div>
            <div className='col-'>
                {/* <div className='row'> */}
                    <div id='lg' className='col-'></div>
                    <div className='col- pl-4'>
                        { cl_info &&
                            <ColorPicker cl_info={cl_info} changeCl={changeCl} />
                        }
                {/* </div> */}
            </div>
            </div>
        </div>
        {getFnames() && <div className='row'>
            Input file names: {getFnames()}
        </div>}
    </div> 
    
}