// This file is for annotation only

interface VizProps{
    vata: Vata,
    session?:{
        sessName?: string
        colorSchemeName,
        colorSchemes: {
            default : string
            [key: string]:string
        },
        cl_mp:{},
        wh:number[],
        geneLabelWidth:number,
    }
    


}