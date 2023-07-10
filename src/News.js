export default function News(){
  return <div className='news-container'>
    <div className='news-block'>
    <div className='news-title'>
      <span className="row-head">v0.3.8</span>
      <span className='news-time'>2023/7/10</span>
    </div>
    <div className="news-content">
      Added an  checkbox in the input view to control the default behavior of ignoring comment lines starting with "#".
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
