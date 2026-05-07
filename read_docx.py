# -*- coding: utf-8 -*-
from docx import Document

doc = Document(r"C:\Users\Sophie\Documents\r_电子书\【024】公考成语易错1265个＋公考易错实词辨析1500词\myKu_成语1265条\【六】谦辞敬辞类 53个.doc")

for para in doc.paragraphs:
    print(para.text)