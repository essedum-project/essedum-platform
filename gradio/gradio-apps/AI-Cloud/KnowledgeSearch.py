# -*- coding: utf-8 -*-
"""
Created on Wed Jun 28 11:19:41 2023

@author: somanadh.maganti
"""

import gradio as gr
import os
import json

import requests
import warnings
import pandas as pd
# To ignore the warnings
warnings.filterwarnings("ignore")

demo = gr.Blocks()

def getanswergradio(method,question,file):
    query = question
    method = method
    file = file
    if method == "text":
        url = "http://10.177.41.196:8080/getanswer"
        json_input = {"question":query}
        request_json = json.dumps(json_input)

        response = requests.post(url=url,data= request_json)
        out = response.json()
        json_str = json.dumps(out, indent=4)
        return json_str,None
    else :
        df=pd.read_excel(file)
        question = df['Questions'].tolist()

        url = "http://10.177.41.196:8080/getanswerlist"
        json_input = {"question":question}
        request_json = json.dumps(json_input)
        response = requests.post(url=url,data= request_json)
        out = response.json()
        df = pd.DataFrame(out)
        file='response'+'.xlsx'
        df.to_excel(file)
        output = ''
        return output,file

if __name__ == "__main__":
    with gr.Blocks(title='ISAIML STATION') as demo:
        with gr.Tabs():
            with gr.TabItem('KNOWLEDGE SEARCH'):
                with gr.Row():
                    with gr.Column():
                        inputs11=[gr.Radio(['text', 'excel'], label='input format', interactive=True,value='text'),
                                 gr.Textbox(label='Text Question'),
                                 gr.File(label='Question excel:')]
                        with gr.Column():
                                text_button11=gr.Button('Run')
                    with gr.Column():
                        outputs11=[gr.Textbox(label="Output"),gr.File(label='output file')]
                gr.Examples(
                        examples=[["text" ,"Does Infosys have any experience with Big Data technologies?"]],
                        inputs=inputs11,
                        fn=getanswergradio)

                text_button11.click(getanswergradio,inputs=inputs11,outputs=outputs11)
        layout="vertical",
        allow_flagging="never"
    demo.launch(server_name='0.0.0.0',inbrowser=True,inline='False')
    ENVIRONMENT_DEBUG = os.environ.get("DEBUG", False)
