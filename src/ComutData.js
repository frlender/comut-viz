
import * as pd from "danfojs";
import _ from 'lodash'

// let ct = 0

function waterfall_sort(df){
    // ct += 1
    // console.log('abc')
    // if(ct>200) return [];
    // df.print()
    const idx = df.iloc({rows:[0]}).gt(0).sum({axis:0})
    if(idx.sum() === 0 || idx.sum() === df.shape[1]){
      if(df.shape[0] === 1){
        return df.columns
      }else{
        // console.log(df)
        return waterfall_sort(df.iloc({rows:["1:"]}))
      }
    }

    let pidx = []
    let nidx = []
    idx.values.forEach((x,i)=>{
      const col = idx.index[i]
      x === 0 ? nidx.push(col) : pidx.push(col)
    })

    
    if(df.shape[0] === 1){
      return df.loc({columns:pidx}).columns.concat(df.loc({columns:nidx}).columns)
    }else{
      return waterfall_sort(df.loc({columns:pidx}).iloc({rows:['1:']})).concat(
        waterfall_sort(df.loc({columns:nidx}).iloc({rows:['1:']})))
      
    }
  }

class Counter{
    // Counter for computing bar plot data
    constructor(name='name'){
        this.mp = {}
        this.name = name
    }

    add(key,key2,val){
        if(!(key in this.mp)) this.mp[key] = {}
        if(!(key2 in this.mp[key])) this.mp[key][key2] = 0
        this.mp[key][key2] += val
    }

    arr(order,order2){
        const arr = []
        order.forEach(k=>{
            const item = {key:k,data:[],total:0}
            if(k in this.mp){
                order2.forEach(d=>{
                    if(d in this.mp[k]){
                        const count = this.mp[k][d]
                        item.data.push(
                            {value: d,
                             count: count,
                             start: item.total}
                        )
                        item.total += count
                    }
                })
            }
            arr.push(item)
        })
        return arr
    }
}


class ComutData{
    constructor(df,samples=null){
        this.tb = df
        if(samples){
            // preserve orignal number of samples.
            this.samples = samples
        }else{
            this.samples = df.sample.unique().values
        }
        this.cates = df.category.unique().values
        this.vals = df.value.unique().values

        // console.log('before mf')
        this.create_mf()
        // console.log('after mf')
        // const mf2 = this.waterfall_mf(mf)
        // console.log('after waterfall')
        // this.mat = mf2
        // this.vata = this.get_vata()
    }

   

    create_mf(){
        // implement pandas.dataframe.pivot function
        // console.log(genes)
        let mp = {}
        // console.log(this.tb.shape)
        this.tb.values.forEach(x=>{
            if(!(x[1] in mp)) mp[x[1]] = {}
            mp[x[1]][x[0]] = true
        })

        // console.log('bb')
        let mat = []
        this.cates.forEach(cate =>{
            let row = []
            this.samples.forEach(sample =>{
                if(mp[cate][sample]){
                    row.push(1)
                }else{
                    row.push(0)
                }
            })
            mat.push(row)
        })
        let mf = new pd.DataFrame(mat,{'index':this.cates,
                    'columns':this.samples})
        // mf.head(10).print()
        // Done: sort by sample names from a to z after sort by sum.
        // sort first by alphabetic order, then sort by sum
        const idx = mf.index.slice(0)
        idx.sort()
        mf = mf.loc({rows:idx})
        this.rsum = mf.sum({axis:1}).sortValues({ascending:false})
        const index = this.rsum.index
        if(index.length === 1){
            // to avoid the bug in danfojs
            this.mf = mf.T.loc({columns:index}).T
        }else{
            this.mf = mf.loc({rows:index})
        }
        return 0
    }

    // top(limit=150){
    //     const max = this.rsum.values[0]
    //     const rg = [...Array(max+1).keys()].reverse().slice(0,max)
    //     let thres;
    //     rg.every((d,i)=>{
    //         const ct = this.rsum.ge(d).sum()
    //         const ct2 = this.rsum.ge(d-1).sum()
    //         if((ct<=limit && ct2>limit) || d===1){
    //             thres = d
    //             return false
    //         }
    //         return true
    //     })
    //     const top_cates = this.rsum.loc(this.rsum.ge(thres)).index
    //     const sub = this.tb.loc({rows:this.tb.category.map(d=>top_cates.includes(d))})
    //     return [thres,sub]
    // }

    // topThres(thres){
    //     const top_cates = this.rsum.loc(this.rsum.ge(thres)).index
    //     const sub = this.tb.loc({rows:this.tb.category.map(d=>top_cates.includes(d))})
    //     return sub
    // }

    waterfall_mf(){
        const cols = waterfall_sort(this.mf)
        const mf2 = this.mf.loc({columns:cols})
        return mf2
    }

    

    get_vata(){
        // get visualization data
        const rect_data = []
        const df = this.tb

        let multiple = 0
 
        const cate_val_ct = new Counter('category') // # of muts in each cate
        const sample_val_ct = new Counter('sample')

        this.mat.index.forEach((cate,i)=>{
            this.mat.columns.forEach((sample,j)=>{ 
                if(this.mat.iloc({rows:[i],columns:[j]}).values[0][0] > 0){
                    const sub = df.loc({rows:df.sample.eq(sample)})
                    const qf = sub.loc({rows:sub.category.eq(cate)})

                    const val_items = []
                    this.vals.forEach((val)=>{
                        // console.log(val)
                        const qq = qf.value.eq(val)
                        const count = qf.loc({rows:qq}).shape[0]
                        if(count > 0){
                            val_items.push({
                                'value':val,
                                'count':count
                            })
                            cate_val_ct.add(cate,val,count)
                            sample_val_ct.add(sample,val,count)
                        }
                    })

                    if(val_items.length > 2) multiple += 1;

                    const item = {
                        'i':i,
                        'j':j,
                        'sample':sample,
                        'category':cate,
                        'val':val_items
                    }
                    rect_data.push(item)
                } // end if
            }) // end forEach sample
        }) // end forEach cate

        const sample_count = this.mat.sum({axis:1}) // # of samples of each cate
        const ct = _.countBy(df['value'].values)
        const index = []
        const data = []
        _.keys(ct).forEach(k=>{
            index.push(k)
            data.push(ct[k])
        })
        let val_count = new pd.Series(data,{index:index})
        val_count = (multiple === 0 ? val_count :
            val_count.append([multiple],['multiple']))
        const values = val_count.sortValues({ascending:false}).index
        
        // console.log(this)
        return {
            rects: {
                data: rect_data,
                shape: this.mat.shape,
                values: values  // unique value counts
            },

            rows:{ // category
                cates: this.mat.index,
                sample_count: sample_count,
                min:sample_count.min(), 
                max:sample_count.max(), 
                val_count: cate_val_ct.arr(this.mat.index,values)
            },

            cols:{ // samples
                samples: this.mat.columns,
                val_count: sample_val_ct.arr(this.mat.columns,values)
            }
        }

        // return {data:rect_data, shape:this.mat.shape, 
        //         sample_count: sample_count,
        //         min:sample_count.min(),
        //         max:sample_count.max(),
        //         samples: this.mat.columns,
        //         cates: this.mat.index,
        //         values: values,
        //         sample_val_count: sample_val_ct.arr(this.mat.columns),
        //         cate_val_count: cate_val_ct.arr(this.mat.index)}
    }

    create_vata(waterfall,samples){
        if(waterfall){
            this.mat = this.waterfall_mf()
        }else if(!waterfall && !_.isNil(samples)){
            this.mat = this.mf.loc({columns:samples})
        }else{
            this.mat = this.mf
        }
        return this.get_vata()
    }
}

export {Counter,ComutData}