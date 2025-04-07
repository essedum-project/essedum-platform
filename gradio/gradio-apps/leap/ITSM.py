import sys
import subprocess
import os
import pandas as pd


##--------------------------##
# enable for hosting infra
##--------------------------##
os.environ['http_proxy']='http://blrproxy.ad.infosys.com:80' 
os.environ['https_proxy']='http://blrproxy.ad.infosys.com:80'
os.environ['HTTP_PROXY']='http://blrproxy.ad.infosys.com:80' 
os.environ['HTTPS_PROXY']='http://blrproxy.ad.infosys.com:80'
os.environ['no_proxy']='localhost,0.0.0.0,10.*,*.ad.infosys.com,10.85.12.143,10.86.117.104,10.177.28.36'
# # please load the requirements manually at the pod(rancher)
requirements = ['huggingface-hub==0.16.4','python-dotenv','openai']
for module in requirements:
    #subprocess.run(sys.executable + ' -m pip install '+ module + ' -i https://infyartifactory.ad.infosys.com/artifactory/api/pypi/pypi-remote/simple --trusted-host infyartifactory.ad.infosys.com',shell=True)
    subprocess.run(sys.executable + ' -m pip install '+ module + ' --index-url https://shreya_bansal@ad.infosys.com:cmVmdGtuOjAxOjE3MjI5Mzk1MjA6b25Yc3ZVRUYxV2tYR1VDS1p3elNFMkxQOHpM@infyartifactory.jfrog.io/artifactory/api/pypi/pypi-remote/simple --trusted-host infyartifactory.jfrog.io',shell=True)
    

##--------------------------##
##-----------------------------
##--------------------------##

# not the most elegant way, needs to be rewirtten to semantic kernel or more efficient method
def openai_completions():
    import gradio as gr

    def option1():
        prompt='''Indonesia - check out anomaly - System Detected Anomaly IN retail store FOR inventory validation for today's sales'''
        
        temperature=0.3
        max_tokens=350
        top_p=1
        frequency_penalty=0
        presence_penalty=0
        stop=None
        custom_stop=''
        pre_response=' '
        post_response=' '

        return [prompt, temperature, max_tokens, stop, custom_stop, top_p, frequency_penalty, presence_penalty, pre_response, post_response]

    def option2():
        prompt='''Urgent: Our e-commerce website is down and customers are unable to place orders. 
Please investigate and resolve the issue immediately.'''    
        
        temperature=0.3
        max_tokens=350
        top_p=1
        frequency_penalty=0
        presence_penalty=0
        stop=None

        custom_stop=''
        pre_response=' '
        post_response=' '

        return [prompt, temperature, max_tokens, stop, custom_stop, top_p, frequency_penalty, presence_penalty, pre_response, post_response]

    def option3():
        prompt='''I am very satisfied with the product. It was exactly what I was looking for and it works perfectly. I would definitely recommend it to others.'''    
        
        temperature=0.3
        max_tokens=250
        top_p=1
        frequency_penalty=0
        presence_penalty=0
        stop=None

        custom_stop=''
        pre_response=' '
        post_response=' '

        return [prompt, temperature, max_tokens, stop, custom_stop, top_p, frequency_penalty, presence_penalty, pre_response, post_response]

    def option4():
        prompt='''Titre: Erreur 500 lors de la connexion

Description: Lorsque j'essaie de me connecter, j'obtiens une erreur 500. J'ai essayé plusieurs fois et j'ai même essayé de vider le cache, mais cela n'a pas fonctionné. 
C'est très urgent car je dois accéder à mon compte pour effectuer une transaction importante. Pouvez-vous s'il vous plaît résoudre ce problème dès'''    
        
        temperature=0.8
        max_tokens=60
        top_p=1
        frequency_penalty=0
        presence_penalty=0
        stop=None

        custom_stop=''
        pre_response=' '
        post_response=' '

        return [prompt, temperature, max_tokens, stop, custom_stop, top_p, frequency_penalty, presence_penalty, pre_response, post_response]

    def option5():
        prompt='''Microsoft Office or other software needs to be installed'''    
        
        temperature=1
        max_tokens=350
        top_p=1
        frequency_penalty=0
        presence_penalty=0
        stop=None

        custom_stop=''
        pre_response=''
        post_response=''

        return [prompt, temperature, max_tokens, stop, custom_stop, top_p, frequency_penalty, presence_penalty, pre_response, post_response]

    def option6():
        prompt='''Ticket opened: 09/26/2023
Ticket last updated: 10/02/2023
Ticket status: Open
Ticket with: Support
Ticket description: The e-commerce website is down and we are unable to place orders. 
Please investigate and resolve the issue immediately.'''    
        
        temperature=1
        max_tokens=150
        top_p=1
        frequency_penalty=1.6
        presence_penalty=0
        stop=None

        custom_stop=''
        pre_response=''
        post_response=''

        return [prompt, temperature, max_tokens, stop, custom_stop, top_p, frequency_penalty, presence_penalty, pre_response, post_response]

    


    def openaicompletion(choice, prompt, temperature, max_tokens, stop, custom_stop, top_p, frequency_penalty, presence_penalty, pre_response, post_response):
        import openai
        openai.proxy = {'http' : 'http://blrproxy.ad.infosys.com:80','https' : 'http://blrproxy.ad.infosys.com:80'}
        openai.api_type = 'azure'
        openai.api_base = 'https://openaigptsam.openai.azure.com'
        openai.api_version = '2023-07-01-preview'
        openai.api_key = '21ec62f5d31442308e77b9ad583ee3e9'

        default_template = '''As a IT Operations Customer Support bot, you are here to assist with any issues 
a user might be facing with their IT Operations.
Please provide as much detail as possible about the problem, how to solve it, and steps a user should take to fix it.
If the provided context doesn't provide enough information, you are allowed to use your knowledge and experience to offer you the best possible assistance.
{ticket content}'''
        prompt_template = choice_name_to_prompts.get(choice, default_template) # Needs to refine Custom
        prompt = prompt_template.replace('{ticket content}', prompt)
        if len(stop) > 0 and len(custom_stop) > 0:
            custom_stop = custom_stop.replace('\\n', '\n')
            if len(custom_stop) > 0:
                if isinstance(stop, list):
                    stop[0] = stop[0].replace('\\n', '\n')
                    stop.extend(custom_stop)
                else:
                    stop = stop.replace('\\n', '\n')
                    stop = [stop, custom_stop]
        elif len(custom_stop) > 0:
            custom_stop = custom_stop.replace('\\n', '\n')
            stop = custom_stop
        else:
            stop=None

        if len(pre_response) > 0:
            prompt += '\n' + pre_response

        # response = openai.Completion.create(
        #     engine='35turbo',
        #     prompt=prompt,
        #     temperature=temperature,
        #     max_tokens=max_tokens,
        #     top_p=top_p,
        #     frequency_penalty=frequency_penalty,
        #     presence_penalty=presence_penalty,
        #     stop=stop)
        # out = response.choices[0].text

        response = openai.ChatCompletion.create(engine='gpt35',
                #messages = [{"role":"user","content":"List top 5 initiatives and associated metrics for business alignment and agility to improve user experience and optimize processes, applications"}],
                messages = [{"role":"user","content":prompt}],
                temperature=temperature,
                max_tokens=max_tokens,
                top_p=top_p,
                frequency_penalty=frequency_penalty,
                presence_penalty=presence_penalty,
                stop=stop)
        out = response["choices"][0]["message"]["content"]

        if len(post_response) > 0:
            out += '\n' + post_response
        return out

    choice_with_names = ['Custom',
                        'Incident Categorization',
                        'Priority Assignment',
                        'Ticket Sentiment Analysis',
                        'Language Translation',
                        'First Response',
                        'Automated Follow-ups']


    choice_name_to_options = {'Custom': 'Custom',
    'Incident Categorization': 'Option 1',
    'Priority Assignment': 'Option 2',
    'Ticket Sentiment Analysis': 'Option 3',
    'Language Translation': 'Option 4',
    'First Response': 'Option 5',
    'Automated Follow-ups': 'Option 6'}

    choice_name_to_prompts = {'Custom': '''As a IT Operations Customer Support bot, you are here to assist with any issues 
a user might be facing with their IT Operations.
Please provide as much detail as possible about the problem, how to solve it, and steps a user should take to fix it.
If the provided context doesn't provide enough information, you are allowed to use your knowledge and experience to offer you the best possible assistance.
{ticket content}''',
    # 'Incident Categorization'
    'Incident Categorization': '''Categories are:
1. Data
2. Business Application & Databases
3. Consumer Solutions and Data
4. Customer Solutions
Categorize this support ticket: {ticket content}. Return the Category in the following template: ```Category: ___
Explanation: ____```''', # Need to add Incident Label

    # 'Priority Assignment'
    'Priority Assignment': '''P1 - Critical: Critical issues are the highest priority issues and should be fixed as soon as possible. These issues cause a significant impact on the business or end-users, and the system is unusable or data is lost. The resolution time for critical issues should be within 24 hours.
P2 - High: High priority issues are those that are important but do not cause a significant impact on the business or end-users. These issues are important to fix but can wait for a few days.
P3 - Medium: Medium priority issues are those that are not critical or high priority but still need to be addressed. These issues do not have a significant impact on the business or end-users, and the system is still usable. The resolution time for medium priority issues should be within a week.
P4 - Low: Low priority issues are those that have a minor impact on the business or end-users. These issues are not critical and can be fixed later. The resolution time for low priority issues should be within a few weeks.
P5 - Lowest: Lowest priority issues are those that have the least impact on the business or end-users. These issues are not critical and can be fixed at a later time. The resolution time for lowest priority issues should be within a few months.

Analyze the urgency of this issue: {ticket content}. What priority level(P1, P2, P3, P4 and P5) should it be assigned? Return the priority in the following template: ``` Priority: ___
Explanation: ____```''',

    # 'Ticket Sentiment Analysis'
    'Ticket Sentiment Analysis': '''Determine the sentiment of this customer message: {ticket content}. Return the sentiment in the following json: ```Sentiment: ___
Explanation: ____```
If the provided context doesn't provide enough information, you are not allowed to use your knowledge hence write a best message to offer the best possible assistance.''',
    
    # 'French Language Translation'
    'Language Translation': '''Translate this customer ticket from source language to English: {ticket content}.''',
    
    # 'First Response'
    'First Response': '''Based on this customer message {ticket content}, draft a response. To assess the candidate's ability to draft a first response, we were looking for the following:
An understanding of the issue raised by the customer
A clear and concise response that addresses the issue
A polite and professional tone
A clear call to action.
If the provided context doesn't provide enough information, you are allowed to use your knowledge and experience to offer you the best possible assistance.''',
    
    # 'Automated Follow-ups'
    'Automated Follow-ups': '''Draft a follow-up message for ticket number: {ticket content}. Based on the above ticket data, identify ticket pendancy days = current date - ticket last updated date. The SLA for ticket pendancy is 7 days. If the ticket status is Open and with Support team then generate a response to update customer about work in progress. If the ticket status is Open and with Customer then generate a response to remind the customer to provide the inputs. If the ticket status is marked for closure and with Customer then generate a response to remind the customer to verify and close the ticket.'''}

    choice_to_text = {
        'Option 1': option1(),
        'Option 2': option2(),
        'Option 3': option3(),
        'Option 4': option4(),
        'Option 5': option5(),
        'Option 6': option6()
    }


    # Function to update the textbox value based on dropdown choice
    def update_ui(choice):
        choice = choice_name_to_options.get(choice, 'Custom')
        textbox, s1, s2, d1, d2, s3, s4, s5, t1, t2 = choice_to_text.get(choice, ['', 1, 100, '', '', 0.5, 0, 0, ' ', ' '])
        if d1 is None:
            d1 = ''
        elif isinstance(d1, list) and len(d1) == 1 and '\n' in d1[0]:
            d1 = d1[0].replace('\n', '\\n')
        if len(t1) == 0:
            t1, t2 = gr.update(value = t1, visible=False), gr.update(value = t2, visible=False)
        else:
            t1, t2 = gr.update(value = t1, visible=True), gr.update(value = t2, visible=True)
        return textbox, s1, s2, d1, d2, s3, s4, s5, t1, t2


    custom_style = '''
    #scrollable-column {
        height: 415px;
    }
    '''

    with gr.Blocks(title='ITSM Buddy', css=custom_style) as demo:
        with gr.Row(equal_height=True):
            with gr.Accordion('Parameters'):
                with gr.Column(scale=1, elem_id='scrollable-column'):
                    slider1 = gr.Slider(0, 1, value=1, label='Temperature')
                    slider2 = gr.Slider(0, 4000, value=100, label='Max length (tokens)')
                    dropdown1 = gr.Dropdown(choices=[], label='Stop sequences', multiselect=True)
                    dropdown2 = gr.Dropdown(choices=[], label='Custom Stop sequences', value='Enter Option', allow_custom_value=True)
                    slider3 = gr.Slider(0, 1, value=0.5, label='Top probabilities')
                    slider4 = gr.Slider(0, 2, value=0, label='Frequency penalty')
                    slider5 = gr.Slider(0, 2, value=0, label='Presence penalty')
                    textbox1 = gr.Textbox(value='', label='Pre-response text')
                    textbox2 = gr.Textbox(value='', label='Post-response text')
            with gr.Column(scale=2):
                with gr.Row():
                    with gr.Column():
                        dropdown = gr.Dropdown(choices=choice_with_names, label='Examples', value='Custom')
                        textbox = gr.Textbox(value='', label='ITSM Ticket:', lines=16, max_lines=16)
                    with gr.Column():
                        outtextbox = gr.Textbox(value='', label='AI:', lines=21, max_lines=21)
        dropdown.input(update_ui, inputs=[dropdown], outputs=[textbox, slider1, slider2, dropdown1, dropdown2, slider3, slider4, slider5, textbox1, textbox2])
        btn = gr.Button('Run')
        
        btn.click(fn=openaicompletion, inputs=[dropdown, textbox, slider1, slider2, dropdown1, dropdown2, slider3, slider4, slider5, textbox1, textbox2], outputs=[outtextbox])
        gr.Examples(
                examples=[['Incident Categorization', '''Cart Pricing when ER Loyalty is Processed Now/REMOVE with only two shipments'''],
                          ['Incident Categorization', '''Alert - Source system check in ACP on 28.03.2023.'''],
                          ['Priority Assignment', '''A payment gateway is down, and users cannot complete transactions.'''],
                          ['Priority Assignment', '''The website takes a few seconds longer to load than usual.'''],
                          ['Ticket Sentiment Analysis', '''I am extremely impressed with the level of service I received from your team. They were able to resolve my issue in a timely manner and were very courteous and professional. Thank you for your excellent service.'''],
                          ['Ticket Sentiment Analysis', '''I am disappointed with the quality of your customer service. Your representatives were not helpful and were not able to provide me with the information I needed. Please train your staff to be more knowledgeable and helpful.'''],
                          ['Language Translation', '''Bonjour, je n'arrive pas à accéder à la page d'accueil de votre site web. Je reçois un message d'erreur à chaque fois que j'essaie de me connecter. Pouvez-vous m'aider à résoudre ce problème ? Merci beaucoup.'''],
                          ['First Response', '''I am facing issues with the billing system. I received an incorrect bill for the services provided.'''],
                          ['Automated Follow-ups', '''Ticket opened: 09/26/2023
Ticket last updated: 10/02/2023
Ticket status: Open
Ticket with: Customer
Ticket description: The e-commerce website is down and we are unable to place orders. 
Please investigate and resolve the issue immediately.'''],
                           ['Automated Follow-ups', '''Ticket opened: 09/26/2023
Ticket last updated: 10/02/2023
Ticket status: Marked for closure
Ticket with: Customer
Ticket description: The e-commerce website is down and we are unable to place orders. 
Please investigate and resolve the issue immediately.'''],
                           ['Automated Follow-ups', '''Ticket opened: 09/26/2023               
Ticket last updated: 10/02/2023
Ticket status: Open
Ticket with: Support
Ticket description: The website's search functionality is not working correctly, 
which is causing us to struggle to find the information need.''']],
                inputs=[dropdown, textbox, slider1, slider2, dropdown1, dropdown2, slider3, slider4, slider5, textbox1, textbox2],
                outputs=[outtextbox],
                fn=openaicompletion
            )
    # demo.launch(debug=True)
    demo.queue(max_size=5).launch(server_name='0.0.0.0',server_port=7863)


def executePipeline():

    openai_completions()



if __name__ == '__main__':
    executePipeline()
    print('Completed')
