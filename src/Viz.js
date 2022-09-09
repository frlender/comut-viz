import * as d3 from 'd3';
import { useState, useEffect } from 'react';
import {colors, VMmat, YLabels, XLabels, Legend, Bar, YBar, 
    GradLegend, Indicator} from './Areas'
// import * as pd from "danfojs";
import ColorPicker from './ColorPicker';
import {Counter} from './ComutData';

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

export default function Viz(props){
    const [vata,setVata] = useState(props.vata)
    // const [cl,setCl] = useState(get_cl_mp(props.vata.rects.values))
    const [cl_info, setCl_info] = useState(null)
    // const [grad_cl, setGrad_cl] = useState(colors[0])

    const [cl_mp,setCl_mp] = useState(cl_mp_init(props))

    const [wh, setWh] = useState([800,500])

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

    const changeMin = function(e){
        // TODO update values after changing min
        // console.log(e.target.value)
        const vata2 = structuredClone(props.vata)
        const min = parseInt(e.target.value)
        const sample_count = props.vata.rows.sample_count
        vata2.rows.sample_count = sample_count.loc(sample_count.ge(min))
        vata2.rows.min = min
        if(min > props.vata.rows.min){
            const cates = sample_count.loc(sample_count.ge(min)).index
            const cate_mp = {}
            cates.forEach((x,i)=>{
                cate_mp[x] = i
            })
            
            const cate_val_ct = new Counter('category') // # of muts in each cate
            const sample_val_ct = new Counter('sample')

            const ct = {'multiple':0} // value total count
            const data = []
            vata2.rects.data.forEach(x=>{
                if(cates.includes(x.category)){
                    x.i = cate_mp[x.category]
                    data.push(x)

                    x.val.forEach(d=>{
                        if(!(d.value in ct)) ct[d.value] = 0;
                        ct[d.value] += d.count
                        
                        cate_val_ct.add(x.category,d.value,d.count)
                        sample_val_ct.add(x.sample,d.value,d.count)
                    })

                    if(x.val.length > 2) ct['multiple'] += 1

                }
            })

            let arr = []
            for (let [key, val] of Object.entries(ct)) {
                if(val > 0) arr.push({key:key,val:val})
            }
            arr.sort((x,y)=>y.val-x.val)
            const values = arr.map(x=>x.key)

            vata2.rects.data = data
            vata2.rects.shape[0] = cates.length
            vata2.rects.values = values
            vata2.rows.cates = cates
            vata2.rows.val_count = cate_val_ct.arr(cates,values)
            vata2.cols.val_count = sample_val_ct.arr(vata2.cols.samples,values)
        }
        setVata(vata2)
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
        const margin = 30 
        const svg = d3.select('#viz').append('svg')
            .attr('width',width)
            .attr('height',height)
        
        // svg.append('rect')
        //     .attr('width',width)
        //     .attr('height',height)
        //     .attr('fill','lightgrey');
        
        const xbar_height = margin*2
        const ybar_width = margin*2
        const indi_height_each = margin/2*1.2
        const xlabel_height = margin*2
        const ylabel_width =  margin*2

        
        const indi_height = vata.cmeta.arr.length*indi_height_each

        const vm = new VMmat(svg,ylabel_width,xbar_height+margin+indi_height,
                width-ylabel_width-ybar_width-margin,
                height-xbar_height-xlabel_height-margin-indi_height)
                .draw(vata.rects,cl_mp.vm)
        
        const xbar = new Bar(svg,vm.gx,margin,vm.width,xbar_height)
                    .draw('xbar',vata.cols.val_count,cl_mp.vm)
        
        // const ybar = new Bar(svg,vm.gx+vm.width,vm.gy,
        //             ybar_width,vm.height)
        //             .draw('ybar',vata.rows.val_count,cl_mp.vm)
        
        const ybar = new YBar(svg,vm.gx+vm.width,vm.gy,
                    ybar_width,vm.height)
                    .draw(vata.rows.sample_count,
                        vata.rects.shape[1], cl_mp.pct[''])
        
        const ylabels = new YLabels(svg,0,vm.gy,
                ylabel_width,vm.height)
                .draw(vata.rows.cates)
        
        const xlabels = new XLabels(svg,ylabel_width,vm.gy+vm.height,
                    vm.width,xlabel_height)
                    .draw(vata.cols.samples)
        
        const indis = [];
        vata.cmeta.arr.forEach((item,i) => {
            const indi = new Indicator(svg,vm.gx,vm.gy-indi_height+indi_height_each*i,
                vm.width,indi_height_each)
                    .draw(item, vata.cmeta.mp[item.id],
                        cl_mp[item.id], ylabels)
            indis.push(indi)
        })

        // console.log(wh)
        
        // // start to draw legend on a separate svg
       

        const lg_width = margin*5
        const lg_height = margin*6
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


    return <div className='container-fluid container-pad'>
        <div className="row input-status mb-2 mt-2">
            <button className='btn btn-primary btn-i' onClick={download}>Download</button>
            &nbsp; <span className="span-input">width:</span>  &nbsp;<input type='number' value={wh[0]} min='200' step='100' onChange={changeWidth}/>
            &nbsp; <span className="span-input">height:</span>  &nbsp;<input type='number' value={wh[1]} min='200' step='100' onChange={changeheight}/>
        </div>
        <div className="row mb-2">
            <span className="span-input">
                Keep categories (mutations) that occur in at least &nbsp;  
            </span>
            <input type='number' value={vata.rows.min} 
                min={props.vata.rows.min} 
                max={props.vata.rows.max} 
                onChange={changeMin}/> 
            <span className="span-input"> &nbsp; samples.
                <span className='ml-3'>{vata.rows.cates.length} categories. </span> 
                <span className='ml-3'>{vata.cols.samples.length} samples. </span>
            </span>
              
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
    </div> 
    
}