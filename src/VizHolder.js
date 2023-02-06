import {useEffect } from 'react';

import {useNavigate} from 'react-router-dom'
import _ from 'lodash'

import Viz from './Viz';


export default function VizHolder(props){
    const navigate = useNavigate()

    const noData = !_.has(props,'vata') || _.isNull(props.vata)

    useEffect(()=>{
        if(noData){
            navigate('/')
        }
    })
    
    return <div>
        {!noData && <Viz vata={props.vata}></Viz>}
    </div>
}