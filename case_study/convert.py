# -*- coding: utf-8 -*-
"""
Created on Mon Apr 24 10:41:16 2023

@author: qiaonan.duan
"""

import pandas as pd

s1 = pd.read_csv('../public/TCGA-LUSC.maf',sep='\t')
s2 = pd.read_csv('../public/gallbladder.maf',sep='\t')

df2 = s1[['Tumor_Sample_Barcode','Hugo_Symbol','Variant_Classification']]
df2.columns = ['Sample','Gene','Type']
df2['Alteration'] = ''

df2.to_csv('TCGA-LUSC_JsComut.txt',sep='\t',index=None)


df2 = s2[['Tumor_Sample_Barcode','Hugo_Symbol','Variant_Classification']]
df2.columns = ['Sample','Gene','Type']
df2['Alteration'] = ''

df2.to_csv('gallbladder_JsComut.txt',sep='\t',index=None)


def get_type(x):
    if 'Missense' in x:
        return 'MISSENSE'
    if 'In_Frame' in x:
        return 'INFRAME'
    if 'Translation_Start_Site' == x:
        return 'PROMOTER'
    return 'OTHER'

df2 = s1[['Tumor_Sample_Barcode','Hugo_Symbol','Variant_Classification']]
df2.columns = ['Sample','Gene','Alternation']
df2['Type'] = [get_type(x) for x in df2['Alternation']]

df2.to_csv('TCGA-LUSC_oncoprinter.txt',sep='\t',header=None,index=None)


df2 = s2[['Tumor_Sample_Barcode','Hugo_Symbol','Variant_Classification']]
df2.columns = ['Sample','Gene','Alternation']
df2['Type'] = [get_type(x) for x in df2['Alternation']]

df2.to_csv('gallbladder_oncoprinter.txt',sep='\t',header=None,index=None)



df2 = s2[['Tumor_Sample_Barcode','Hugo_Symbol','Variant_Classification']]
df2.columns = ['SampleID','Gene','Mutation']
mf = df2.pivot_table(values='Mutation',index='SampleID',columns='Gene',
                aggfunc=lambda l:';'.join(l),fill_value='-')
mf.columns = ['g_'+x for x in mf.columns]

for row in mf.index:
    for column in mf.columns:
        val = mf.loc[row,column]
        splits = val.split(';')
        if len(splits) > 3:
            print(row,column)
            mf.loc[row,column] = ';'.join(splits[:3])

mf.reset_index().to_csv('gallbladder_oviz-bio.txt',sep=',',index=None)


df2 = s1[['Tumor_Sample_Barcode','Hugo_Symbol','Variant_Classification']]
df2.columns = ['SampleID','Gene','Mutation']
mf = df2.pivot_table(values='Mutation',index='SampleID',columns='Gene',
                aggfunc=lambda l:';'.join(l),fill_value='-')
mf.columns = ['g_'+x for x in mf.columns]

for row in mf.index:
    for column in mf.columns:
        val = mf.loc[row,column]
        splits = val.split(';')
        if len(splits) > 3:
            print(row,column)
            mf.loc[row,column] = ';'.join(splits[:3])

mf.reset_index().to_csv('TCGA-LUSC_oviz-bio.txt',sep=',',index=None)



