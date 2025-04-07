import gradio as gr
import requests
import json
import OauthToken
import configparser
import os
from pathlib import Path

path = Path(__file__).parent
config = configparser.ConfigParser()
config.read(os.path.join(path, 'urls.ini'))
url = config['MODELS']['Codegen']

def api_call(prompt,url,usertoken):
    payload = json.dumps({
        "inputs": [
            {
                "name": "prompt",
                "datatype": "BYTES",
                "shape": [
                    1,
                    1
                ],
                "data": [
                    [prompt
                     ]
                ]
            }
        ]
    })
    headers = {
        'Content-Type': 'application/json'
    }
    if config['AUTH']['type'] == 'OAUTH' or 'itgateway' in url:
        if usertoken == '':
            token = OauthToken.get_new_token()
        else:
            token = usertoken
        headers['Authorization'] = 'Bearer ' + token

    response = requests.request("POST", url, headers=headers, data=payload, verify=False)
    response = json.loads(response.text)
    return response['outputs'][0]['data'][0]


with gr.Blocks(theme=gr.themes.Soft(), title="CodeGen") as demo:
    gr.Markdown(value='# AI-Cloud CodeGen')
    gr.Markdown(
        value='Generate source code using Salesforce codegen-350m-multi language model fine tuned with Java code from IS '
              'repo in Infosys Github')
    with gr.Tab("Model"):
        with gr.Row():
            with gr.Column(scale=1):
                gr.Dropdown(choices=['Java'], value='Java', label='Language', interactive=True)
            with gr.Column(scale=1):
                gr.Dropdown(choices=['CodeGen'], value='CodeGen', label='Model', interactive=True)

        with gr.Row():
            with gr.Column(scale=1):
                inp = gr.TextArea(label='Input', value="/*** write a program to add two numbers and return sum n*/ def add(number1, number2):")
            with gr.Column(scale=1):
                out = gr.TextArea(label='Output')

        with gr.Row():
            with gr.Column(scale=35):
                pass
            with gr.Column(scale=10):
                btn1 = gr.Button(value='Submit').style(full_width=False)
            with gr.Column(scale=20):
                pass

    with gr.Tab("Connection"):
        with gr.Row():
            url = gr.Textbox(label='URL', value=url)
        with gr.Row():
            usertoken = gr.Textbox(label='Token' , type='password')

    btn1.click(fn=api_call, inputs=[inp,url,usertoken], outputs=out)
demo.launch(server_name='0.0.0.0')
