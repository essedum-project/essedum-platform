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
url = config['MODELS']['Bloom7b']

def api_call(prompt,min_len, max_len,temperature,no_repeat_ngram_size,url,usertoken):
    payload = json.dumps({
        "inputs": prompt,
        "parameters": {
            "min_length": min_len,
            "max_length": max_len,
            "temperature":temperature,
            "no_repeat_ngram_size": no_repeat_ngram_size
        }
    })
    headers = {
        'Content-Type': 'application/json',
    }
    if config['AUTH']['type'] == 'OAUTH' or 'itgateway' in url:
        if usertoken == '':
            token = OauthToken.get_new_token()
        else:
            token = usertoken
        headers['Authorization'] = 'Bearer ' + token

    response = requests.request("POST", url, headers=headers, data=payload,verify= False)
    if response.status_code == 200:
        response = json.loads(response.text)
        return response[0]["generated_text"]
    else:
        return response.text


with gr.Blocks(theme=gr.themes.Soft(), title='AI-Cloud Bloom7b1') as demo:
    gr.Markdown(value='# AI-Cloud Bloom7B1')
    gr.Markdown(value='BigScience Large Open-science Open-access Multilingual Language Model (BLOOM) is a '
                      'transformer-based large language model for Language generation and content authoring')

    with gr.Tab("Model"):
        with gr.Row():
            with gr.Column():
                gr.Dropdown(choices=['Bloom7B1'], value='Bloom7B1', label='Model', interactive=True)
            with gr.Column(scale=1):
                min_length = gr.Slider(label='Min length',minimum=0,maximum=100,value=5,step=1)
            with gr.Column(scale=1):
                max_length = gr.Slider(label='Max length',minimum=0,maximum=100,value=50,step=1)
            with gr.Column(scale=1):
                temperature = gr.Slider(label='Temperature', minimum=0, maximum=1, value=0.8, step=0.1)
            with gr.Column(scale=1):
                no_repeat_ngram_size = gr.Slider(label='No repeat_ngram_size',minimum=0,maximum=10,value=2,step=1)


        with gr.Row():
            with gr.Column(scale=1):
                inp = gr.TextArea(label='Input', value='Cricket is best')
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
            usertoken = gr.Textbox(label='Token', type='password')

    btn1.click(fn=api_call, inputs=[inp,min_length,max_length,temperature,no_repeat_ngram_size,url,usertoken], outputs=out)

demo.launch(server_name='0.0.0.0',root_path="/bloom")
