import * as pd from "danfojs";
import _ from 'lodash'
import {Counter} from './ComutData'
import { DataFrame } from "jandas";

class Meta{
    constructor(tb,tbo){
        this.tb = tb
        this.tbo = tbo // for plot the table in input view
    }

    get_vata(order){
        const arr = []
        const mp = {}
        const tb = this.tb.loc({rows:order})
        tb.columns.forEach(col=>{
            const ss = tb[col]
            const dtype = ss.dtypes[0]
            const item = {
                name: col,
                id: col+'_'+Math.random().toString(16).substring(2, 10),
                dtype: dtype,
            }

            if(dtype === 'string'){
                item.val_count = ss.valueCounts().sortValues({ascending:false})
                item.domain = item.val_count.index
            }else{
                item.domain = [ss.min(),ss.max()]
            }
            arr.push(item)

            
            mp[item['id']] =  order.map(d=>{
                return {
                    label: d,
                    value: tb.at(d,col) 
                }
            })
        })
        return {
            arr: arr,
            mp: mp
        }
    }
}



function get_fs(len,width,height){
    const fsw = width/len*1.3
    const fsh = height*.8
    return fsh > fsw? fsw : fsh
}


class FilterData{
    constructor(df,raw=false){
        // raw: true if df is the raw input data without any filtering
        this.df = df
        const ct = {}
        const sample_mp = {}
        let sampleValCt;
        if(raw)
            sampleValCt = new Counter('SampleVal')
        // const self = this
        df.values.forEach(vec=>{
            const [sample,cate,val] = vec
            if(!(cate in ct))
                ct[cate] = {}
            if(!(sample in ct[cate]))
                ct[cate][sample] = true

            if(!(sample in sample_mp))
                sample_mp[sample]=true
            
            if(raw)
                sampleValCt.add(sample,val,1)
            
        })
        const pairs = []
        _.keys(ct).forEach(k=>{
            const count = _.keys(ct[k]).length
            ct[k] = count
            pairs.push([k,count])
        })
        this.ct = ct
        this.samples = _.keys(sample_mp)
        this.sampleValCt = sampleValCt

        this.sortedPairs = _.sortBy(pairs,x=>-x[1])
        this.cateTable = new pd.DataFrame(this.sortedPairs,
            {'columns':['category','count']})
    }

    // constructor(df){
    //     this.df = df
    //     this.ct = _.mapValues(_.groupBy(df.values,x=>x[1]),
    //         vals=>_.uniqBy(vals,x=>x[0]).length)
    //     const pairs = _.toPairs(this.ct)
    //     this.sortedPairs = _.sortBy(pairs,x=>-x[1])
    //     this.cateTable = new pd.DataFrame(this.sortedPairs,
    //         {'columns':['category','count']})
    //     this.samples = df.sample.unique().values
    //     // this.cates = _.keys(this.ct)
    // }
    changeLimit(limit){
        // const df = this.df
        // const ct = this.ct
        const sortedPairs = this.sortedPairs
        let thres = 1
        if(sortedPairs.length > limit){
            if(sortedPairs[limit][1]!==sortedPairs[limit-1][1])
                thres = sortedPairs[limit-1][1]
            else{
                let i = limit-2
                while(sortedPairs[limit-1][1] === sortedPairs[i][1] && i > 0)
                    i -= 1
                thres = sortedPairs[i][1]
            }
        }
        return thres
    }

    changeThres(thres){
        const df =  this.df.loc({
            rows:this.df.category.map(d=>this.ct[d] >= thres)
        })

        const cateTable = this.cateTable.loc({
            rows:this.cateTable.category.map(
                d=>this.ct[d] >= thres
            )
        })

        const mp = _.countBy(df['value'].values)
        const pp = _.toPairs(mp)
        const sp = _.sortBy(pp,x=>-x[1])
        // mutCounts.sortValues({ascending:false,inplace:true})

        return [df,cateTable,sp]
    }
}

const GroupGenes =  (geneGroups,vata)=>{
        
    const data = geneGroups.data
    // const vata2 = structuredClone(props.vata)
    // vata2.
    // const order = _.hasIn(data,'__order') ? data.__order : _.keys(data)
    const order = geneGroups.order
    const rec = {}
    order.forEach(key=>{
        rec[key] = []
    })

    vata.rows.sample_count.index.values.forEach(v=>{
        order.forEach(key=>{
            if(data[key].includes(v))
                rec[key].push(v)
        })
    })

    let cates = []
    order.forEach(key=>{
        cates = cates.concat(rec[key])
    })

    // console.log(cates)
    const cate_mp = {}
    cates.forEach((x,i)=>{
        cate_mp[x] = i
    })

    const vata2 = vata

    // const rect_uniq_vals = new Set()
    const rect_data = []
    vata2.rects.data.forEach(x=>{
        if(cates.includes(x.category)){
            x.i = cate_mp[x.category]
            rect_data.push(x)
            // x.val.forEach(d=>rect_uniq_vals.add(d.value))
        }
    })

    vata2.rects.data = rect_data
    // vata2.rects.values = Array.from(rect_uniq_vals)
    // vata2.rects.shape[0] = cates.length
    vata2.rows.cates = cates
    vata2.rows.sample_count = vata2.rows.sample_count.loc(cates)
    // vata2.rows.min = vata2.rows.sample_count.min()
    // vata2.rows.max = vata2.rows.sample_count.max()
    const vf = new DataFrame(vata2.rows.val_count).set_index('key')
    vata2.rows.val_count = vf.loc(cates).reset_index().to_dict()

    return vata2
    // vataRef.current =vata2

    // if(vata2.rows.min < vata.rows.min)
    //     setVata(changeMinVal(vata.rows.min))
    // else
    //     setVata(vata2)
}



// function reduceDf(df,limit){
//     const cates = df.category.unique().values
//     const samples = df.sample.unique().values
//     if(cates.length > limit){
//         const ct = {}
//         df.category.values.forEach((v)=>{
//             if(!(v in ct)){
//                 ct[v] = 0
//             }
//             ct[v] += 1
//         })
//         const items =  Object.entries(ct).sort((a,b)=>b[1]-a[1])
//         const item_len = items.length
        
//         let d,di
//         let i = 0
//         let d2 = items[0][1]
//         while(true){
//             d = d2
//             di = i
//             while(items[i][1] === d || items[i+1][1] === items[i][1]){
//                 i+=1
//                 if(i+1 >= item_len) break
//             }
//             d2 = items[i][1]
//             if((i+1)>limit) break
//         }
//         // console.log(d,i)

//         const top_cates = []
//         i = 0
//         while(items[i][1] >= d){
//             top_cates.push(items[i][0])
//             i += 1
//         }
//         const thres = d
//         // console.log(items)
//         // const [ks,vs] = [[],[]]
//         // items.forEach((v)=>{
//         //     ks.push(v[0])
//         //     vs.push(v[1])
//         // })
//         // const rsum = new pd.Series(vs,{'index':ks})
//         // const max = rsum.values[0]
//         // const rg = [...Array(max+1).keys()].reverse().slice(0,max)
//         // let thres;
//         // rg.every((d,i)=>{
//         //     const ct = rsum.ge(d).sum()
//         //     const ct2 = rsum.ge(d-1).sum()
//         //     if((ct<=limit && ct2>limit) || d===1){
//         //         thres = d
//         //         return false
//         //     }
//         //     return true
//         // })
//         // const top_cates = rsum.loc(rsum.ge(thres)).index
//         const sub = df.loc({rows:df.category.map(d=>top_cates.includes(d))})
//         return [thres,sub,samples]
//     }else{
//         return [1,df,samples]
//     }
// }

function get_transform_xy(transformStr){
    const ts = transformStr.replace('translate(','[')
                    .replace(')',']')
    return eval(ts)
}

export {Meta,get_fs,get_transform_xy,FilterData,GroupGenes}