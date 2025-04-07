import os.path
import sys
import gradio as gr
import boto3
import pathlib


save_path = "/gradio-apps/videos"
video_path = ""


def get_video(video_name):
    s3 = boto3.resource(service_name="s3", endpoint_url="https://10.82.53.110/",
                        aws_access_key_id="GISeSU7xd6WBnXrU-QbffBee7WsCxaE2",
                        aws_secret_access_key="g2d4nVxehagjOkCkZ4WrCMOzrfTrFiI0", verify=False)
    bucket_object = s3.Bucket("aicloudprd")
    for my_bucket_object in bucket_object.objects.filter(Prefix=f'Videos/{video_name}'):
        print(video_name)
        object_save_path = (
            f"{save_path}/{pathlib.Path(my_bucket_object.key).name}"
        )
        global video_path
        video_path =f"{save_path}/{pathlib.Path(my_bucket_object.key).name}"
        if not os.path.exists(video_path):
            bucket_object.download_file(my_bucket_object.key, object_save_path)


def start_gradio():
    global video_path
    with gr.Blocks(theme=gr.themes.Soft(), title='Video Player') as demo:
        with gr.Row():
            out = gr.Video(video_path)
    demo.launch(server_name='0.0.0.0')

if __name__ == "__main__":
    if len(sys.argv) <2:
        print("Enter Video Name")
        exit
    video_name= sys.argv[1]
    get_video(video_name)
    start_gradio()
