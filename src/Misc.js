import * as pd from "danfojs";
import _ from 'lodash'

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
    constructor(df,limit){
        const ct = _.countBy(df.category.values)
        const pairs = _.toPairs(ct)
        const sortedPairs = _.sortBy(pairs,x=>-x[1])
        let thres = 1
        if(sortedPairs.length > limit){
            if(sortedPairs[limit][1]!==sortedPairs[limit-1][1])
                thres = sortedPairs[limit-1][1]
            else{
                let i = limit-2
                while(sortedPairs[limit-1][1] === sortedPairs[i][1])
                    i -= 1
                thres = sortedPairs[i][1]
            }
        }

        const cateTable = new pd.DataFrame(sortedPairs,
            {'columns':['category','count']})
        
        this.df = df
        this.samples = df.sample.unique().values
        this.ct = ct
        this.cateTable = cateTable
        this.cates = _.keys(ct)
        this.sortedPairs = sortedPairs

        this.thres = thres
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
        return [df,cateTable]
    }
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

export {Meta,get_fs,FilterData}