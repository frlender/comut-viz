import * as d3 from 'd3';
import * as convert from 'color-convert'
import {get_fs} from './Misc'

// 12 colors based on d3.schemeCategory10 and d3.schemePaired
const colors = ['#1f77b4', '#ff7f0e', '#2ca02c', '#e377c2', '#9467bd', 
                '#8c564b', '#d62728', '#cab2d6', '#bcbd22', '#17becf',
                '#a6cee3', '#b2df8a']

                // ['#a6cee3', '#1f78b4', '#b2df8a', '#33a02c',
                //  '#fb9a99', '#e31a1c', '#fdbf6f', '#ff7f00', 
                //  '#cab2d6', '#6a3d9a', '#ffff99', '#b15928']

const lg_title_height = 20

class Gi{
    constructor(svg,gx,gy,width,height){
        // svg: svg or g 
        [this.gx, this.gy, this.width, this.height] = [gx,gy,width,height]
        this.g = svg.append('g')
            .attr('transform',`translate(${gx},${gy})`);
    }

    draw(){
        // must implement
        return this
    }
}


class VMmat extends Gi{
    draw(mat,cl,px=1,py=1){
        // px, py pt are padding x, padding y, padding triangle
        const self = this
        const rect_width = this.width / mat.shape[1]
        const rect_height = this.height / mat.shape[0]
        // let pt = 3
        let pt = rect_width/5
        // let px = rect_width / 5
        // let py = rect_height / 5
        // console.log(pt)
        px = px*6 < rect_width ? px : 0
        py = py*6 < rect_height ? py : 0
        // pt = pt*2 < rect_height ? pt : 0
        pt = pt > 3 ? 3 : pt
        
        const gs = this.g.selectAll('g').data(mat.data).join('g')
            .attr('transform',
                d => `translate(${d.j*rect_width+px},${d.i*rect_height+py})`)

        const widthp = rect_width-px*2 // padded rect_width
        const heightp = rect_height-py*2 // padded rect_height
        
        const is_one = d => d.val.length === 1 && d.val[0].count === 1
        const is_multiple = d => d.val.length > 2

        gs.filter((d)=> is_one(d) || is_multiple(d))
            .append('rect')
            .attr('fill',d => is_one(d) ? cl[d.val[0].value] : cl['multiple'])
            .attr('width',widthp)
            .attr('height',heightp)
        
        const is_tri_same = d => d.val.length === 1 && d.val[0].count > 1
        const is_tri_diff = d => d.val.length === 2
        
        const gs_tri = gs.filter((d)=> is_tri_same(d) || is_tri_diff(d))
        
        gs_tri.append('polygon')
            .attr('points',`0,0 ${widthp-pt/2},0 0,${heightp-pt/2}`)
            .attr('fill',d => cl[d.val[0].value])
        
        gs_tri.append('polygon')
            .attr('points',`${pt/2},${heightp} ${widthp},${heightp} ${widthp},${pt/2}`)
            .attr('fill', d => is_tri_same(d) ? 
                cl[d.val[0].value] : cl[d.val[1].value])
        
         
        gs.append('title')
            .text(d=>{
                let out = [d.sample, d.category]
                d.val.forEach(x=>{
                    out.push([x.value+' '+x.count])
                })
                return out.join('\n')
            })

        this.cl = cl
        return this
    }
}

class YLabels extends Gi{
    draw(labels,padding=5){
        const y = d3.scaleBand()
                .domain(labels)
                .range([0,this.height])
        this.y = y
        this.padding = padding

        const fsw = this.width/5 //font-size width
        const fsh = y.bandwidth() // font-size height
        this.fs = fsh < fsw? fsh:fsw
        this.g.selectAll('text').data(labels)
            .join('text')
            .attr('y',d => y(d)+y.bandwidth()/2*1.4)
            .text(d => d)
            .attr('text-anchor','end')
            .attr('x',this.width-padding)
            .attr('font-size',`${this.fs}px`)

        return this
    }
}


class XLabels extends Gi{
    draw(labels,padding=5){
        const x = d3.scaleBand()
                .domain(labels)
                .range([0,this.width])
        const label_lens = labels.map(x=>x.length)
        const max_len = d3.max(label_lens)

        const fsh = this.height/max_len*1.5
        const fsw = x.bandwidth()

        this.g.selectAll('text').data(labels)
            .join('text')
            // .attr('x',=> )
            // .attr('dy',d => )
            .text(d => d)
            .attr('text-anchor','end')
            .attr('font-size',`${fsh < fsw? fsh:fsw}px`)
            // .attr('textLength',this.height-padding*2)
            // .attr('lengthAdjust','spacingAndGlyphs')
            .attr('transform',d => 
                `translate(${x(d)+x.bandwidth()/10*7},${padding}) `+ //${this.height-padding}
                `rotate(-90)`)
            // .attr('transform','rotate(90)')

        return this
    }
}

const lumi_range = [40,90] // luminance in hsl

class Indicator extends Gi{
    draw(meta,data,color,ylabel,px=1,py=2){
        // ylabel is used to get param to plot the name of the indicator
        let cl;
        if(meta.dtype === 'string'){
            cl = d => color[d]
        }else{
            const [h,s,l] = convert.hex.hsl(color)
            // reverse is inplace in js
            const lumi_scale = d3.scaleLinear([...lumi_range].reverse())
                .domain(meta.domain)
            cl = d => `hsl(${h},${s}%,${lumi_scale(d)}%)`
        }

        const len = data.length
        const rect_height = this.height
        const rect_width = this.width/len

        const widthp = rect_width - px*2
        const heightp = rect_height - py*2

        const gs = this.g.selectAll('g').data(data).join('g')
            .attr('transform',
                (d,i) => `translate(${i*rect_width+px},${py})`)
        
        gs.append('rect')
            .attr('fill',d=>cl(d.value))
            .attr('width',widthp)
            .attr('height',heightp)
        
        gs.each(function(d){
            const tt = d3.select(this).append('title')
                    .text(d.label+' '+d.value)
        })

        const gt = this.g.append('g')
            .attr('transform',`translate(${-ylabel.width},0)`)
        
        const fsw = ylabel.width/meta.name.length
        const fs = ylabel.fs < fsw ? ylabel.fs:fsw
        gt.append('text')
            .text(meta.name)
            .attr('text-anchor','end')
            .attr('y',this.height/2*1.2)
            .attr('x',ylabel.width-ylabel.padding)
            .attr('font-size',fs)
        
        gt.append('title')
           .text(meta.name)
        
        return this
    }
}


class Bar extends Gi{
    config(mode='xbar'){
        // x bar or y bar
        if(mode==='xbar'){
            // lw is long width, sw is short width
            this.lw = this.width
            this.sw = this.height-1
            this.lkey = 'width'
            this.skey = 'height'
            this.lcoord = 'x'
            this.scoord = 'y'
            this.translate = (lcoord,scoord) => {
                return `translate(${lcoord},${scoord})`}
            this.get_scoord = (d,max) => max - d.start - d.count
            this.s_axis = s => {
                const sr = d3.scaleLinear()
                        .domain(s.domain())
                        .range(s.range().reverse())
                this.g.call(d3.axisLeft(sr).ticks(4))
                        .call(g => g.select('.domain').remove())
                }
        }else{
            this.lw = this.height
            this.sw = this.width
            this.lkey = 'height'
            this.skey = 'width'
            this.lcoord = 'y'
            this.scoord = 'x'
            this.translate = (lcoord,scoord) => {
                return `translate(${scoord},${lcoord})`}
            this.get_scoord = (d,max) => d.start
            this.s_axis = s => {
                this.g.call(d3.axisTop(s).ticks(3))
                        .call(g => g.select('.domain').remove())
            }
        }
    }

    draw(mode,val_count,cl,title_fun=null){
        // pr is padding between stacked rect
        this.config(mode)
        const keys = []
        const totals = []
        val_count.forEach(d=>{
            keys.push(d.key)
            totals.push(d.total)
        })
        const total_max = d3.max(totals)
        const [lw,sw] = [this.lw, this.sw] 

        const l = d3.scaleBand()
                .domain(keys)
                .range([0,lw])
                // .padding(0.2)
        const s = d3.scaleLinear()
                .domain([0,total_max])
                .range([0,sw])
        
        const gs = this.g.selectAll('g').data(val_count)
                        .join('g')
                        .attr('transform', d => {
                            return this.translate(l(d.key),0)
                        })
        
        const rect_lw = l.bandwidth()*2/3
        const rect_lcoord = (l.bandwidth()-rect_lw)/2
        gs.selectAll('rect').data(d=>d.data)
            .join('rect')
            .attr(this.lkey, rect_lw)
            .attr(this.skey, d=>s(d.count))
            .attr(this.lcoord,rect_lcoord)
            .attr(this.scoord, d=>s(this.get_scoord(d,total_max)))
            .attr('fill', d=>cl[d.value])
        
        if(!title_fun){
            title_fun = function(d){
            const arr = [d.key]
                // console.log(d)
                d.data.forEach((x)=>{
                    // console.log(x)
                    arr.push(`${x.value} ${x.count}`)
                })
                arr.push(`total ${d.total}`)
                const tt = d3.select(this).append('title')
                        .text(arr.join('\n'))
            }
        }
        gs.each(title_fun)
        
        // A padding of 1px removes bottom overhang of the 1st tick of xbar axis 
        // because of its line width. 
        const s2 = d3.scaleLinear()
            .domain([0,total_max])
            .range([0,sw-1])
        this.s_axis(s2)
    }
}

class YBar extends Gi{
    draw(sample_count,sample_total,cl){
        const arr = []
        const pcts = []
        const tag = 'sample percentage'
        // console.log(sample_count)
        sample_count.index.forEach(key=>{
            const val = sample_count.at(key)
            arr.push({
                key: key,
                total:val,
                data:[{
                    value:tag,
                    count:val,
                    start:0
                }]
            })

            const pct = parseInt(val/sample_total*100)
            pcts.push({val:`${pct}%`,key:key})
        })

        const cl_mp = {}
        cl_mp[tag] = cl

        const gt = this.g.append('g')
        const gx = this.width/3
        const ybar = new Bar(this.g,gx,0,this.width-gx,this.height)
                    .draw('ybar',arr,cl_mp, function(d){
                        d3.select(this).append('title')
                        .text(`${d.key}\nsample count ${d.total}`)
                    })
        
        
       const y = d3.scaleBand()
                    .domain(pcts.map(x=>x.key))
                    .range([0,this.height])

        const fs = get_fs(d3.max(pcts.map(d=>d.val.length)),gx,this.height/pcts.length)
        const padding = 3
        gt.selectAll('text').data(pcts)
            .join('text')
            .attr('y',d => y(d.key)+y.bandwidth()/2+fs*.5)
            .text(d => d.val)
            .attr('text-anchor','end')
            .attr('x',gx-padding)
            .attr('font-size',`${fs}px`)
        
    }
}


class Legend extends Gi{
    draw(cl,item,setCl_info,padding=3){
        const area_width = this.width*3/10
        const label_width = this.width*7/10
    
        const title_height = lg_title_height
        const height = this.height - title_height
        
        const title = item.name
        const labels = item.domain

        const title_fs = get_fs(title.length,this.width,title_height)

        this.g.append('text')
            .text(title)
            .attr('x',padding)
            .attr('font-size',title_fs)

        const y = d3.scaleBand()
                .domain(labels)
                .range([0,height])
    
        
        let rect_width = area_width*7/10
        let rect_height = y.bandwidth()/2

        rect_width = rect_width > 40 ? 40 : rect_width
        rect_height = rect_height > 15 ? 15 : rect_height

        const gs = this.g.selectAll('g').data(labels)
            .join('g')
            .attr('transform',
                d => `translate(${padding},
                    ${y(d)+y.bandwidth()/2-rect_height/2})`)
        
        gs.append('rect')
          .attr('fill', d => cl[d])
          .attr('width', rect_width)
          .attr('height', rect_height)
          .on('mouseover',function(){
            d3.select(this)
                .attr('stroke','grey')
                .attr('stroke-width',3)
          }).on('mouseout',function(){
            d3.select(this)
                .attr('stroke-width',0)
          }).on('click',function(e,d){
            setCl_info({'color':cl[d],'label':d,'id':item.id})
          })
    
        
        let max_len = 0
        labels.forEach(d=>{
            max_len = d.length > max_len ? d.length : max_len
        })
        const wlen = label_width/max_len*1.8
        const font_size = wlen < rect_height ? wlen : rect_height

        gs.append('text')
            .text(d => d)
            .attr('x',rect_width+8)
            .attr('y',rect_height*.8)
            .attr('font-size',`${font_size}px`)
            // .attr('textLength',label_width-padding)
            // .attr('lengthAdjust','spacingAndGlyphs')
        return this
    }
}



class GradLegend extends Gi{
    draw(baseCl,item,setCl_info){
        const rect_width = 20
        const rect_height = 70
        const title_height = lg_title_height
        // const yoffset = this.height - title_height

        const title = item.name
        const domain = item.domain

        const [h,s,l] = convert.hex.hsl(baseCl)
       
        
        const y = d3.scaleLinear([rect_height,0]).domain(domain)

        const title_fs = get_fs(title.length,this.width,title_height)
        this.g.append('text')
            .text(title)
            .attr('font-size',title_fs)
            // .attr('x',padding)

        const grad = this.g.append('defs')
            .append('linearGradient')
            .attr('id',title)
            .attr('x1','0')
            .attr('x2','0')
            .attr('y1','0')
            .attr('y2','1') // vertical gradient
        
        grad.append('stop')
            .attr('offset','0%')
            // .attr('stop-color','red')
            .attr('stop-color',`hsl(${h},${s}%,${lumi_range[0]}%)`)
        
        grad.append('stop')
            .attr('offset','100%')
            // .attr('stop-color','black')
            .attr('stop-color',`hsl(${h},${s}%,${lumi_range[1]}%)`)

        this.g.append('rect')
            .attr('y',title_height)
            .attr('width',rect_width)
            .attr('height',rect_height)
            .attr('fill',`url(#${title})`)
            .on('mouseover',function(){
                d3.select(this)
                    .attr('stroke','grey')
                    .attr('stroke-width',3)
              }).on('mouseout',function(){
                d3.select(this)
                    .attr('stroke-width',0)
              }).on('click',function(e,d){
                setCl_info({'color':baseCl,'id':item.id})
              })
        
        this.g.append('title')
              .text(`min: ${domain[0]}\nmax: ${domain[1]}`)

        const g = this.g.append('g')
            .attr('transform',
                `translate(${rect_width+1},${title_height})`)
        
        // A padding of 1px removes bottom overhang of the 1st tick of axis 
        // because of its line width. 
        const y_axis = d3.scaleLinear([rect_height-1,0]).domain(domain)
        g.call(d3.axisRight(y_axis).ticks(4)
                // .tickPadding(0)
                // .tickSizeOuter(0)
                // .tickSizeInner(5)
                )
              .call(g => g.select('.domain').remove())

    }
}

export {colors, VMmat, YLabels, XLabels, Legend, Bar, YBar, GradLegend, Indicator}