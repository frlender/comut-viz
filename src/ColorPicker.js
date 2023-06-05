import * as d3 from 'd3';
import { useEffect, useState} from 'react';
import {colors} from './Areas'
import './index.css'

export default function ColorPicker(props){
    const [sampleCl,setSampleCl] = useState(props.cl_info.color)

    useEffect(()=>{
        // watch for props.cl_info.color change
        if(sampleCl != props.cl_info.color) setSampleCl(props.cl_info.color)
    },[props.cl_info.color])

    useEffect(()=>{
        const [width, height] = [160,120]
        const padding = 3
        
        const svg = d3.select('#cl_pk').append('svg')
            .attr('width',width)
            .attr('height',height)
            .attr('fill','grey');
        
        const bot_height = 0
        const rect_width = width/4
        const rect_height = (height-bot_height)/3

        svg.selectAll('rect').data(colors).join('rect')
            .attr('x',(d,i)=> (i%4)*rect_width)
            .attr('y',(d,i)=> parseInt(i/4)*rect_height)
            .attr('width',rect_width - padding/2)
            .attr('height',rect_height - padding/2)
            .attr('fill',d=>d)
            .on('mouseover',function(){
                d3.select(this)
                    .attr('stroke','grey')
                    .attr('stroke-width',3)
            }).on('mouseout',function(){
                d3.select(this)
                    .attr('stroke-width',0)
            }).on('click',function(e,d){
                setSampleCl(d)
            })
        
        // const [sw,sh] = [80,50]
        // const svg2 = d3.select('#sample').append('svg')
        //         .attr('width',sw)
        //         .attr('height',sh)
        // svg2.append('rect')
        //     .attr('width',sw)
        //     .attr('height',sh)
        //     .attr('fill',sampleCl);

        return () => {
                svg.remove()
                // svg2.remove()
            }
    },[])

    return  <div className='inline'>
        <div id='cl_pk'></div>
        {/* <div id='sample'></div> */}
        <input type='color' onChange={(e)=>setSampleCl(e.target.value)} value={sampleCl}/>
        <button onClick={(e)=> props.changeCl(sampleCl)} 
            className='btn btn-outline-secondary set-color-btn'>Set</button>
        {/* w */}
    </div>
}