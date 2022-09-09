import * as d3 from 'd3';
import {colors} from './Areas';

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


export {Meta,get_fs}