import * as pd from "danfojs";

class DataFrame extends pd.DataFrame {
    // create a customized dataframe with the loc and the iloc method 
    // having the exactly the same syntax as pandas'.
    // e.g.: df.loc(':','1:'), df.iloc(0) returns a row as a series.
    old(){
        return new pd.DataFrame(this.values,{
            columns: this.columns,
            index: this.index
        })
    }
    
    _loc(ridx=':',cidx=':'){
        let ridx_ = Array.isArray(ridx)? ridx : [ridx]
        let cidx_ = Array.isArray(cidx)? cidx : [cidx]
        if(cidx_.every(x=> typeof(x) === 'boolean')){
            cidx_ = this.columns.filter((col,i) => cidx_[i])
        }
        const df = super.loc({rows:ridx_,columns:cidx_})
        const new_df = new DataFrame(df.values,{
            'columns': df.columns,
            'index': df.index
        })
        return new_df
    }

    _is_danfo_idx(idx){
        return Array.isArray(idx) || (typeof(idx)==='string' && 
            idx.includes(':'))
    }
    _is_danfo_ridx(idx){
        return (Array.isArray(idx) && idx.length > 1) || (typeof(idx)==='string' && 
            idx.includes(':'))
    }
    
    _T(){
        return new DataFrame(this.T.values, {
            'columns': this.index,
            'index': this.columns
        })
    }

    loc(ridx=':',cidx=':'){
        if(this._is_danfo_ridx(ridx) && this._is_danfo_idx(cidx)){
            return this._loc(ridx,cidx)
        }else if((Array.isArray(ridx) && ridx.length === 1) 
                && this._is_danfo_idx(cidx)){
            return this._loc(':',cidx)._T()._loc(':',ridx)._T()
            // && typeof(ridx[0]) !== 'boolean'
            // TODO: make it works for boolean ridx = [true]
            // const sub = this._loc(':',cidx)
            // const rname = ridx[0]
            // const d = []
            // d.push(sub.columns.map(x => sub.at(rname,x)))
            // const index = [rname]
            // const cols = sub.columns
            // return new DataFrame(d,{index:index,columns:cols})
        }else if(this._is_danfo_idx(cidx) && !this._is_danfo_idx(ridx)){
            return this._loc(':',cidx)._T()[ridx]
            // const sub = this._loc(':',cidx)
            // const rname = ridx
            // const d = sub.columns.map(x => sub.at(rname,x))
            // const cols = sub.columns
            // return new pd.Series(d,{index:cols})
        }else if(!this._is_danfo_idx(cidx) && this._is_danfo_idx(ridx)){
            return this.loc(ridx,':')[cidx]
        }else{
            return this.at(ridx,cidx)
        }
    }

    _iloc(ridx=':',cidx=':'){
        let ridx_ = Array.isArray(ridx)? ridx : [ridx]
        let cidx_ = Array.isArray(cidx)? cidx : [cidx]
        if(cidx_.every(x=> typeof(x) === 'boolean')){
            const arr = []
            this.columns.forEach((col,i)=>{
                if(cidx_[i]) arr.push(i);
            })
            cidx_ = arr
        }
        const df = super.iloc({rows:ridx_,columns:cidx_})
        const new_df = new DataFrame(df.values,{
            'columns': df.columns,
            'index': df.index
        })
        return new_df
    }

    iloc(ridx=':',cidx=':'){
        if(this._is_danfo_ridx(ridx) && this._is_danfo_idx(cidx)){
            return this._iloc(ridx,cidx)

        }else if((Array.isArray(ridx) && ridx.length === 1) 
                && this._is_danfo_idx(cidx)){
            return this._iloc(':',cidx)._T()._iloc(':',ridx)._T()

        }else if(this._is_danfo_idx(cidx) && !this._is_danfo_idx(ridx)){
            return this._iloc(':',cidx)._T()[ridx]

        }else if(!this._is_danfo_idx(cidx) && this._is_danfo_idx(ridx)){
            return this.iloc(ridx,':')[cidx]

        }else{
            return this.iat(ridx,cidx)
        }
    }
    
}

export {DataFrame};