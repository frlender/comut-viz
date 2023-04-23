library(maftools)

mf = read.maf('../public/gallbladder.maf',clinicalData='gallbladder_meta_col_rename.txt')

oncoplot(mf,minMut=10,clinicalFeatures=c('sex','age','patient_id','ca199'))