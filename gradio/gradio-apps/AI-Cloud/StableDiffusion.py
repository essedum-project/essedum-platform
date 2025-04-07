import gradio as gr
import requests
import json
import datetime
import OauthToken
import configparser
import os
from pathlib import Path

path = Path(__file__).parent
config = configparser.ConfigParser()
config.read(os.path.join(path, 'urls.ini'))

url = config['MODELS']['Stablediffusion']


def api_call(prompt,url,usertoken):
    payload = json.dumps({
        "instances": [
            {
                "input_text": prompt,
                "num_images": "4"
            }
        ]
    })
    headers = {
        'Content-Type': 'application/json'
    }
    if config['AUTH']['type'] == 'OAUTH' or  'itgateway' in url:
        if usertoken =='':
            token = OauthToken.get_new_token()
        else:
            token = usertoken
        headers['Authorization'] = 'Bearer ' + token

    response = requests.request("POST", url, headers=headers, data=payload, verify=False)
    response = json.loads(response.text)
    img= response['predictedBase64Image'][0]
    im = gr.processing_utils.decode_base64_to_image(img)
    timestamp = datetime.datetime.now()
    filename = f'input_{timestamp.strftime("%Y-%m-%d-%H-%M-%S")}.png'
    im.save(f'{filename}', 'PNG')
    return im


with gr.Blocks(theme=gr.themes.Soft(), title='AI-Cloud Stable Diffusion') as demo:
    gr.Markdown(value='## AI-Cloud Stable Diffusion')
    gr.Markdown(value='Stable Diffusion is is a latent text-to-image diffusion model which is primarily used to '
                      'generate detailed images conditioned on text descriptions. This can be used for designing '
                      'logos, creation of animation and visual effects in motion pictures and tasks such as '
                      'inpainting, outpainting,etc.')
    with gr.Tab("Model"):
        with gr.Row():
            with gr.Column(scale=1):
                gr.Dropdown(choices=['Logo Generation'], value='Logo Generation', label='Operation', interactive=True)
            with gr.Column(scale=1):
                gr.Dropdown(choices=['Stable diffusion'], value='Stable diffusion', label='Model', interactive=True)

        with gr.Row():
            inp = gr.Textbox(label='Input', value='an acrylic painting, shopping basket, blue background, '
                                                  'post-Impressionism')

        with gr.Row():
            with gr.Column(scale=35):
                pass
            with gr.Column(scale=10):
                btn1 = gr.Button(value='Generate').style(full_width=False)
            with gr.Column(scale=20):
                pass
        with gr.Row():
            out = gr.Image(label='Generated Image').style(height=300, width=300)
    with gr.Tab("Connection"):
        with gr.Row():
            url = gr.Textbox(label='URL', value=url)
        with gr.Row():
            usertoken = gr.Textbox(label='Token', type='password')

    btn1.click(fn=api_call, inputs=[inp,url,usertoken], outputs=out)

demo.launch(server_name='0.0.0.0')
