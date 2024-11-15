export default function News(props){
  return <div className='news-container'>
         <div className='news-block'>
      <div className='news-title'>
        <span className="row-head">v0.8.2</span>
        <span className='news-time'>2024/11/14</span>
      </div>
      <div className="news-content">
        Multiple bar plots:
        <div className='news-paragraph'>With this release, you can visualize sample metadata as bar plots.</div>
        <img src='/comut-viz-app/example_bar.png'></img>
        <div style={{"margin-top":"1.5em"}} className='news-paragraph'>All you need to do is to add the bar plot data as columns in the metadata file with the column names in the format of [description]@[group_id]. You can check an example by clicking on the "example 5k" button.</div>
        <img style={{"margin-left":"3em"}} src='/comut-viz-app/example_bar_metadata_file.png'></img>
      </div>
  </div>

     <div className='news-block'>
    <div className='news-title'>
      <span className="row-head">v0.7.8</span>
      <span className='news-time'>2024/6/17</span>
    </div>
    <div className="news-content">
      Input file names:
      <div className='news-paragraph'>Input file names will now be shown at the bottom of the visualization view and saved along with other visualization data during session saving. This feature will help users to keep track of the input files used for a plot recovered from a saved session.</div>
    </div>
  </div>
    <div className='news-block'>
    <div className='news-title'>
      <span className="row-head">v0.7.6</span>
      <span className='news-time'>2024/6/17</span>
    </div>
    <div className="news-content">
      Choose how to join data and metadata:
      <div className='news-paragraph'>Previously, data and metadata were  joined in the way that only the common samples between data and metadata are shown in the final figure. Now users can choose to show all samples in the data even if a metadata file is available. Samples with no metadata will have their metadata fields set to nulls. </div>
      <img style={{marginTop: '.5em',width:'95%'}} src='/comut-viz-app/meta_join.png'></img>
    </div>
  </div>
     <div className='news-block'>
    <div className='news-title'>
      <span className="row-head">v0.7.0</span>
      <span className='news-time'>2024/3/7</span>
    </div>
    <div className="news-content">
      Gene Group Annotation (if a gene groups file is provided):
      <div className='news-paragraph'>Overlapping genes are now allowed between different gene groups in the gene groups file. In other words, a gene can belong to multiple gene groups.</div>
    </div>
  </div>
     <div className='news-block'>
    <div className='news-title'>
      <span className="row-head">v0.6.5</span>
      <span className='news-time'>2024/1/23</span>
    </div>
    <div className="news-content">
      Gene Group Annotation (if a gene groups file is provided):
      
      <div className='news-paragraph'>1. Lines will be added to the right bar plot to divide them according to the gene groups</div>
      <div className='news-paragraph'>2. The names of the gene groups will be automatically added to the plot.</div>
    </div>
  </div>
    <div className='news-block'>
    <div className='news-title'>
      <span className="row-head">v0.6.0</span>
      <span className='news-time'>2023/12/22</span>
    </div>
    <div className="news-content">
      Add Gene Grouping function:
      <div className='news-paragraph'>The user can now submit a gene groups file to group genes in the final plot. The following example is created by first submitting the <a href='https://github.com/frlender/comut-viz/blob/main/asset/gene-groups-by-pathway.yml'>example gene groups file</a> and then click on the example 141k button. Note that the orange pathway annotations are mannually added in InkScape.</div>
      <img src='/comut-viz-app/gene_groups_example.png'></img>
    </div>
  </div>
    <div className='news-block'>
    <div className='news-title' >
      <span className="row-head">v0.5.0</span>
      <span className='news-time'>2023/7/28</span>
    </div>
    <div className="news-content">
      Add Session Saving functions:
      <div className='news-paragraph'>1. In the visualization view, users can click on the save button to save the current session to the local storage in the browser.</div>
      <div className='news-paragraph'>2. Users can edit the session name by clicking on it.</div>
      <div className='news-paragraph'>3. After a session is saved, a link will appear in the input view. Click on the link to load the session.</div>
    </div>
  </div>
    <div className='news-block'>
    <div className='news-title'>
      <span className="row-head">v0.3.8</span>
      <span className='news-time'>2023/7/10</span>
    </div>
    <div className="news-content">
      1. Added an  checkbox in the input view to control the default behavior of ignoring comment lines starting with "#".
      <div>2. Mouse over a gene label in the visualization view show its sample count.</div>
      {/* <div className='news-paragraph'>1. The top bar plot now displays the mutation counts of all genes in each sample rather than only the genes shown in the comutation plot.</div>
      <div className='news-paragraph'>2. The silent mutation type is unchecked by default.</div>
      <div className='news-paragraph'>3. A maftools color scheme is provided if the input is a standard MAF file.</div> */}
    </div>
  </div>
    <div className='news-block'>
    <div className='news-title'>
      <span className="row-head">v0.3.7</span>
      <span className='news-time'>2023/6/29</span>
    </div>
    <div className="news-content">
      Added an input box in the visualization view to allow users to adjust the width of the gene labels in the plot in case the labels are too long to display.
      {/* <div className='news-paragraph'>1. The top bar plot now displays the mutation counts of all genes in each sample rather than only the genes shown in the comutation plot.</div>
      <div className='news-paragraph'>2. The silent mutation type is unchecked by default.</div>
      <div className='news-paragraph'>3. A maftools color scheme is provided if the input is a standard MAF file.</div> */}
    </div>
  </div>
  <div className='news-block'>
    <div className='news-title'>
      <span className="row-head">v0.3.6</span>
      <span className='news-time'>2023/6/5</span>
    </div>
    <div className="news-content">
      This version is developed after revision. There are several places that are different from what is described in paper:
      <div className='news-paragraph'>1. The top bar plot now displays the mutation counts of all genes in each sample rather than only the genes shown in the comutation plot.</div>
      <div className='news-paragraph'>2. The silent mutation type is unchecked by default.</div>
      <div className='news-paragraph'>3. A maftools color scheme is provided if the input is a standard MAF file.</div>
    </div>
  </div>
</div>
}
