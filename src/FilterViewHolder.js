import {useEffect } from 'react';

import {useNavigate} from 'react-router-dom'
import _ from 'lodash'

import FilterView from './FilterView';


export default function VizHolder(props){
    const navigate = useNavigate()

    const noData = !_.has(props,'tb') || _.isNull(props.tb)

    useEffect(()=>{
        if(noData){
            navigate('/')
        }
    })
    
    return <div>
        {!noData && <FilterView cmeta={props.cmeta} tb={props.tb} 
        setVata={props.setVata}
        geneGroupsRef={props.geneGroupsRef}></FilterView>}
    </div>
}