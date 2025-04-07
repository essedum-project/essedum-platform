import gradio as gr
import base64
import requests
import json
import OauthToken
import configparser
import os
from pathlib import Path
path = Path(__file__).parent
config = configparser.ConfigParser()
config.read(os.path.join(path, 'urls.ini'))

url = config['MODELS']['Whisper']

def getData(audio,url,usertoken):
    os.rename(audio, audio + '.wav')
    with open(audio + '.wav', "rb") as f:
        input_wav = f.read()
    byteArray = base64.b64encode(input_wav)
    payload = json.dumps({"audio_bytes": str(byteArray)[2:-1]})
    headers = {'Content-Type': 'application/json'}

    if config['AUTH']['type'] == 'OAUTH' or  'itgateway' in url:
        if usertoken =='':
            token = OauthToken.get_new_token()
        else:
            token = usertoken
        headers['Authorization'] = 'Bearer ' + token


    response = requests.request("POST", url, headers=headers, data=payload, verify=False)
    if response.status_code == 200:
        return json.loads(response.text)["text"]
    else:
        return response.text


with gr.Blocks(title="Whisper", theme=gr.themes.Soft()) as demo:

    gr.Markdown(value='# AI-Cloud Whisper')
    with gr.Tab("Model"):
        with gr.Row():
            with gr.Column(scale=1):
                audio = gr.Audio(label="Audio", type="filepath")
            with gr.Column(scale=1):
                out = gr.TextArea(label="Transcript",lines= 8)
        with gr.Row():
            submit = gr.Button("Submit")
    with gr.Tab("Connection"):
        with gr.Row():
            url = gr.Textbox(label='URL', value=url)
        with gr.Row():
            usertoken = gr.Textbox(label='Token', type='password')
    submit.click(getData, inputs=[audio,url,usertoken], outputs=out)

demo.launch(server_name='0.0.0.0')
