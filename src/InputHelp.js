export default function InputHelp(){
    return <div className='help-container'>
        <div className="help-row">Comut-viz is an online tool to generate comutation plot, which delivers a global view of the mutation landascape of large-scale genomic studies. It accpets a table of mutation data as input, interactively filters it and visualize the top mutated genes in a costomizable plot. 
        </div>
        <div className="help-row">Users are requested to submit two files in this page:</div>
        <div className="help-row"><span className="row-head">Mutation Data File:</span> This file is required. It should be a table of mutation data, commonly a <a href='https://docs.gdc.cancer.gov/Data/File_Formats/MAF_Format/'>MAF</a> file. It could also be a tab/comma delimited text file with .txt, .csv or .tsv extension. The file should have a header and at least three columns representing sample ID, gene symbol and mutation type. The column names in the header are flexible. (<a href='https://github.com/frlender/comut-viz/blob/main/public/gallbladder.maf'>example 1</a>, <a href='https://github.com/frlender/comut-viz/blob/main/public/example_small.txt'> example 2</a>)</div>
        <div className="help-row"><span className="row-head">Sample Metadata File:</span> This file is optional. It should be a tab/comma delimited text file with .txt, .csv or .tsv extension. It must have a header and a sample ID column containing the same sample IDs as in the mutation data file, though the column name does not need to be the same. (<a href='https://github.com/frlender/comut-viz/blob/main/public/gallbladder.maf'>example 1</a>)</div>
        <div className="help-row">The app will automatically ignore <span className="row-head">comment lines</span> starting with "#" in the input files. If there are comment lines in other formats, please delete them before submitting to the app.</div>
        <div className="help-row"> <span className="row-head">Example Buttons: </span>Users can test the app using the two example buttons. One loads a mutationa data file with 5k rows and its metadata, and the other loads a large mutation data file with 141k rows.</div>
        <div className="help-row"></div>

    </div>
}