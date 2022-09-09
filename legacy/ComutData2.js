
import * as pd from "danfojs";
import {DataFrame} from './Panfo'

let ct = 0

function waterfall_sort(df){
    // ct += 1
    // console.log('abc')
    // if(ct>200) return [];
    // df.print()
    const idx = df.iloc(0).gt(0)
    if(idx.sum() === 0 || idx.sum() === df.shape[1]){
      if(df.shape[0] === 1){
        return df.columns
      }else{
        return waterfall_sort(df.iloc('1:'))
      }
    }

    let pidx = []
    let nidx = []
    idx.values.forEach((x,i)=>{
      const col = idx.index[i]
      x === 0 ? nidx.push(col) : pidx.push(col)
    })

    if(df.shape[0] === 1){
      return df.loc(':',pidx).columns.conat(df.loc(':',nidx).columns)
    }else{
      return waterfall_sort(df.loc(':',pidx).iloc('1:')).concat(
        waterfall_sort(df.loc(':',nidx).iloc('1:')))
      
    }
  }


export default class ComutData{
    constructor(df){
        this.tb = new DataFrame(df.values,{columns:df.columns,index:df.index})
        this.samples = df.sample.unique().values
        this.cates = df.category.unique().values
        this.vals = df.value.unique().values

        console.log('before mf')
        const mf = this.create_mf()
        console.log('after mf')
        const mf2 = this.waterfall_mf(mf)
        console.log('after waterfall')
        this.mat = mf2
        this.vata = this.get_vata()
    }

    create_mf(){
        const df = this.tb
        // console.log(genes)
        let mp = {}
        console.log(this.tb.shape)
        this.tb.values.forEach(x=>{
            if(!(x[1] in mp)) mp[x[1]] = {}
            mp[x[1]][x[0]] = true
        })

        console.log('bb')
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
        const mf = new pd.DataFrame(mat,{'index':this.cates,
                    'columns':this.samples})
        // mf.head(10).print()
        // TODO: sort by sample names from a to z after sort by sum.
        const index = mf.sum({axis:1}).sortValues({ascending:false}).index
        const mf2 = mf.loc({rows:index})
        return mf2
    }

    waterfall_mf(mf){
        const cols = waterfall_sort(mf)
        const mf2 = mf.loc({columns:cols})
        return mf2
    }

    get_vata(){
        // get visualization data
        const vata = []
        const df = this.tb

        let multiple = 0

        this.mat.index.forEach((cate,i)=>{
            this.mat.columns.forEach((sample,j)=>{ 
                if(this.mat.iloc({rows:[i],columns:[j]}).values[0][0] > 0){
                    const qf = df.query(
                        df.sample.eq(sample)
                        .and(df.category.eq(cate))
                    )
                    
                    const val_items = []
                    this.vals.forEach((val)=>{
                        const qq = qf.value.eq(val)
                        const count = qf.loc({rows:qq}).shape[0]
                        if(count > 0){
                            val_items.push({
                                'value':val,
                                'count':count
                            })
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
                    vata.push(item)
                } // end if
            }) // end forEach sample
        }) // end forEach cate

        const sample_count = this.mat.sum({axis:1})
        let val_count = df.value.valueCounts()
        val_count = (multiple === 0 ? val_count :
            val_count.append([multiple],['multiple']))
        const values = val_count.sortValues({ascending:false}).index
        return {data:vata, shape:this.mat.shape, 
            sample_count: sample_count,
            min:sample_count.min(),
            samples: this.mat.columns,
            cates: this.mat.index,
            values: values}
    }
}