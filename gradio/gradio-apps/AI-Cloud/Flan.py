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
url = config['MODELS']['Flant5']

def api_call(prompt, max_len,url,usertoken):
    payload = json.dumps({
        "inputs": prompt,
        "parameters": {
            "max_length": max_len
        }
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
    if response.status_code ==200:
        response = json.loads(response.text)
        return response[0]["generated_text"]
    else:
        return response.text


with gr.Blocks(theme=gr.themes.Soft(), title='AI-Cloud Flan') as demo:
    gr.Markdown(value='# AI-Cloud Flan')
    gr.Markdown(value='## Content Generation')
    with gr.Tab("Model"):
        with gr.Row():
            with gr.Column(scale=1):
                gr.Dropdown(choices=['Flan T5xl'], value='Flan T5xl', label='Model', interactive=True)
            with gr.Column(scale=1):
                max_length = gr.Slider(label='Max length', minimum=0, maximum=100, value=50, step=1)

        with gr.Row():
            with gr.Column(scale=1):
                inp = gr.TextArea(label='Input', value='A step by step recipe to make bolognese pasta:')
            with gr.Column(scale=1):
                out = gr.TextArea(label='Output')

        with gr.Row():
            with gr.Column(scale=35):
                pass
            with gr.Column(scale=10):
                btn1 = gr.Button(value='Generate').style(full_width=False)
            with gr.Column(scale=20):
                pass
    with gr.Tab("Connection"):
        with gr.Row():
            url = gr.Textbox(label='URL', value=url)
        with gr.Row():
            usertoken = gr.Textbox(label='Token' , type='password')

    btn1.click(fn=api_call, inputs=[inp, max_length,url,usertoken], outputs=out)

demo.launch(server_name='0.0.0.0')
