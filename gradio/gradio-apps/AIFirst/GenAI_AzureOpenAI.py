

import sys
import subprocess
import os
import pandas as pd
import logging

os.environ['http_proxy']='http://proxy.threatpulse.net:8080' 
os.environ['https_proxy']='http://proxy.threatpulse.net:8080'
os.environ['no_proxy']='localhost,0.0.0.0,10.*,*.ad.infosys.com,10.85.12.143,10.86.117.104,10.177.28.36'

# please load the requirements manually at the pod(rancher)
requirements = ['openai','huggingface-hub==0.16.4','python-dotenv']
for module in requirements:
    # subprocess.run(sys.executable + ' -m pip install '+ module + ' -i https://infyartifactory.ad.infosys.com/artifactory/api/pypi/pypi-remote/simple --trusted-host infyartifactory.ad.infosys.com',shell=True)
    subprocess.run(sys.executable + ' -m pip install '+ module + ' --index-url https://shreya_bansal@ad.infosys.com:cmVmdGtuOjAxOjE3MjI5Mzk1MjA6b25Yc3ZVRUYxV2tYR1VDS1p3elNFMkxQOHpM@infyartifactory.jfrog.io/artifactory/api/pypi/pypi-remote/simple --trusted-host infyartifactory.jfrog.io',shell=True)
    
import os


import os


def openai_completions():
    import gradio as gr

    def option1():
        prompt='''Generate a summary of the below conversation in the following format:\nCustomer problem:\nOutcome of the conversation:\nAction items for follow-up:\nCustomer budget:\nDeparture city:\nDestination city:\n\nConversation:\nUser: Hi there, I’m off between August 25 and September 11. I saved up 4000 for a nice trip. If I flew out from San Francisco, what are your suggestions for where I can go?\nAgent: For that budget you could travel to cities in the US, Mexico, Brazil, Italy or Japan. Any preferences?\nUser: Excellent, I’ve always wanted to see Japan. What kind of hotel can I expect?\nAgent: Great, let me check what I have. First, can I just confirm with you that this is a trip for one adult?\nUser: Yes it is\nAgent: Great, thank you, In that case I can offer you 15 days at HOTEL Sugoi, a 3 star hotel close to a Palace. You would be staying there between August 25th and September 7th. They offer free wifi and have an excellent guest rating of 8.49/10. The entire package costs 2024.25USD. Should I book this for you?\nUser: That sounds really good actually. Please book me at Sugoi.\nAgent: I can do that for you! Can I help you with anything else today?\nUser: No, thanks! Please just send me the itinerary to my email soon.\n\nSummary:'''
        
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
        prompt='''Below is an extract from the annual financial report of a company. Extract key financial number (if present), key internal risk factors, and key external risk factors.\n\n# Start of Report\nRevenue increased $7.5 billion or 16%. Commercial products and cloud services revenue increased $4.0 billion or 13%. O365 Commercial revenue grew 22% driven by seat growth of 17% and higher revenue per user. Office Consumer products and cloud services revenue increased $474 million or 10% driven by Consumer subscription revenue, on a strong prior year comparable that benefited from transactional strength in Japan. Gross margin increased $6.5 billion or 18% driven by the change in estimated useful lives of our server and network equipment. \nOur competitors range in size from diversified global companies with significant research and development resources to small, specialized firms whose narrower product lines may let them be more effective in deploying technical, marketing, and financial resources. Barriers to entry in many of our businesses are low and many of the areas in which we compete evolve rapidly with changing and disruptive technologies, shifting user needs, and frequent introductions of new products and services. Our ability to remain competitive depends on our success in making innovative products, devices, and services that appeal to businesses and consumers.\n# End of Report'''    
        
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
        prompt='''Provide a summary of the text below that captures its main idea.\n\nAt Microsoft, we have been on a quest to advance AI beyond existing techniques, by taking a more holistic, human-centric approach to learning and understanding. As Chief Technology Officer of Azure AI Cognitive Services, I have been working with a team of amazing scientists and engineers to turn this quest into a reality. In my role, I enjoy a unique perspective in viewing the relationship among three attributes of human cognition: monolingual text (X), audio or visual sensory signals, (Y) and multilingual (Z). At the intersection of all three, there’s magic—what we call XYZ-code as illustrated in Figure 1—a joint representation to create more powerful AI that can speak, hear, see, and understand humans better. We believe XYZ-code will enable us to fulfill our long-term vision: cross-domain transfer learning, spanning modalities and languages. The goal is to have pre-trained models that can jointly learn representations to support a broad range of downstream AI tasks, much in the way humans do today. Over the past five years, we have achieved human performance on benchmarks in conversational speech recognition, machine translation, conversational question answering, machine reading comprehension, and image captioning. These five breakthroughs provided us with strong signals toward our more ambitious aspiration to produce a leap in AI capabilities, achieving multi-sensory and multilingual learning that is closer in line with how humans learn and understand. I believe the joint XYZ-code is a foundational component of this aspiration, if grounded with external knowledge sources in the downstream AI tasks.'''    
        
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
        prompt='''Generate product name ideas for a yet to be launched wearable health device that will allow users to monitor their health and wellness in real-time using AI and share their health metrics with their friends and family. The generated product name ideas should reflect the product's key features, have an international appeal, and evoke positive emotions.\n\nSeed words: fast, healthy, compact\n\nExample product names: \n1. WellnessVibe\n2. HealthFlux\n3. VitalTracker\n\nProduct names:\n1.'''    
        
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
        prompt='''Write a product launch email for new AI-powered headphones that are priced at $79.99 and available at Best Buy, Target and Amazon.com. The target audience is tech-savvy music lovers and the tone is friendly and exciting.\n\n1. What should be the subject line of the email?  \n2. What should be the body of the email?'''    
        
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
        prompt='''Write a product description in bullet points for a renters insurance product that offers customizable coverage, rewards and incentives, flexible payment options and a peer-to-peer referral program. The tone should be persuasive and professional.'''    
        
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

    def option7():
        prompt='''Write a catchy and creative listicle style blog on the topic of emerging trends in e-commerce that are shaping the future of retail. The blog should have a memorable headline and a clear call to action in the end encouraging the reader to engage further.'''
        
        temperature=1
        max_tokens=600
        top_p=1
        frequency_penalty=0
        presence_penalty=0
        stop=None
        
        custom_stop=''
        pre_response=''
        post_response=''

        return [prompt, temperature, max_tokens, stop, custom_stop, top_p, frequency_penalty, presence_penalty, pre_response, post_response]

    def option8():
        prompt='''Write a job description for the following job title: 'Business Intelligence Analyst'. The job description should outline the main responsibilities of the role, list the required qualifications, highlight unique benefits like flexible working hours, and provide information on how to apply.'''    
        
        temperature=1
        max_tokens=600
        top_p=1
        frequency_penalty=0
        presence_penalty=0
        stop=None

        custom_stop=''
        pre_response=''
        post_response=''

        return [prompt, temperature, max_tokens, stop, custom_stop, top_p, frequency_penalty, presence_penalty, pre_response, post_response]

    def option9():
        prompt='''Generate a multiple choice quiz from the text below. Quiz should contain at least 5 questions. Each answer choice should be on a separate line, with a blank line separating each question.\n\nA neutron star is the collapsed core of a massive supergiant star, which had a total mass of between 10 and 25 solar masses, possibly more if the star was especially metal-rich. Neutron stars are the smallest and densest stellar objects, excluding black holes and hypothetical white holes, quark stars, and strange stars. Neutron stars have a radius on the order of 10 kilometers (6.2 mi) and a mass of about 1.4 solar masses. They result from the supernova explosion of a massive star, combined with gravitational collapse, that compresses the core past white dwarf star density to that of atomic nuclei.\n\nExample:\nQ1. What is a neutron star?\nA. The collapsed core of a massive supergiant star\nB. The smallest and densest stellar object\nC. A white hole\nD. A quark star'''    
        
        temperature=0.8
        max_tokens=500
        top_p=1
        frequency_penalty=0
        presence_penalty=0.5
        stop=None

        custom_stop=''
        pre_response=''
        post_response=''

        return [prompt, temperature, max_tokens, stop, custom_stop, top_p, frequency_penalty, presence_penalty, pre_response, post_response]

    def option10():
        prompt='''Classify the following news headline into 1 of the following categories: Business, Tech, Politics, Sport, Entertainment\n\nHeadline 1: Donna Steffensen Is Cooking Up a New Kind of Perfection. The Internet's most beloved cooking guru has a buzzy new book and a fresh new perspective\nCategory: Entertainment\n\nHeadline 2: Major Retailer Announces Plans to Close Over 100 Stores\nCategory:'''    
        
        temperature=0
        max_tokens=60
        top_p=1
        frequency_penalty=0
        presence_penalty=0
        stop=None

        custom_stop=''
        pre_response=' '
        post_response=' '

        return [prompt, temperature, max_tokens, stop, custom_stop, top_p, frequency_penalty, presence_penalty, pre_response, post_response]

    def option11():
        prompt='''For the below text, provide two labels one each from the following categories:\n- Department: “Books”, “Home”, “Fashion”, “Electronics”, “Grocery”, “Others”\n- Order intent\n\nSubject: Request for Refund of Recent Book Purchase\nDear [Business Name],\nI am writing to request a refund for the books I purchased from your store last week. Unfortunately, the books did not meet my expectations, and I would like to return them for a full refund.\nI have attached a copy of the purchase receipt to this email as proof of purchase. The books are in their original packaging and have not been used, so I hope that the refund process will be straightforward.\nPlease let me know what steps I need to take to return the books and receive a refund. I look forward to hearing back from you soon.\nThank you for your attention to this matter.\nSincerely,\n[Your Name]\n\nResponse:'''    
        
        temperature=0
        max_tokens=60
        top_p=1
        frequency_penalty=0
        presence_penalty=0
        stop=None

        custom_stop=''
        pre_response=' '
        post_response=' '

        return [prompt, temperature, max_tokens, stop, custom_stop, top_p, frequency_penalty, presence_penalty, pre_response, post_response]

    def option12():
        prompt='''Cluster the following news headlines into topic categories based on patterns seen within the text. Also mention reasoning behind how these categories were defined. \n\nOutput format:\n{\n\'topic_name\': \'\',\n\'headlines\': [],\n\'reasoning\': \'\'\n}\n\nInput news headlines:\n1. \'From books to presentations in 10s with AR + ML\'\n2. \'Demo from 1993 of 32-year-old Yann LeCun showing off the World's first Convolutional Network for Text Recognition\'\n3. \'First Order Motion Model applied to animate paintings\'\n4. \'Robinhood and other brokers literally blocking purchase of $GME, $NOK, $BB, $AMC; allow sells\'\n5. \'United Airlines stock down over 5% premarket trading\'\n6. \'Bitcoin was nearly $20,000 a year ago today\'\n\nOutput:'''    
        
        temperature=0
        max_tokens=64
        top_p=1
        frequency_penalty=0
        presence_penalty=0
        stop=None

        custom_stop=''
        pre_response=''
        post_response=''

        return [prompt, temperature, max_tokens, stop, custom_stop, top_p, frequency_penalty, presence_penalty, pre_response, post_response]

    def option13():
        prompt='''Perform aspect based sentiment analysis on the below product review. \n- Provide overall sentiment score between 0 to 5 for the review\n- Provide a sentiment polarity score between 0 to 5 for each aspect\n- Mention the top positive aspect and top negative aspect, if any\n\nReview 1: This console is an absolute beast! I finally managed to get my hands on it through the company’s invite after 2 years of the chip shortage and scalping issues. It arrived a couple days later as scheduled, no problems. Set up was simple and was kinda surprised by the weight of the console. The login process took less than 10 min, quick and easy. Installed games then instantly felt the difference. Loading times is literally insane, first time experiencing an SSD as fast as this. I also really enjoy the controller, it feels really good in the hands.  Playing games has never been better for a competitive gamer like me. Sometimes I feel like I’m cheating with how powerful this thing is for only $500. However, I do wish there were more exclusives for this console but I feel like this console will get better as time goes on. \n\nOverall sentiment score: 4.5\nAspects with sentiment polarity score:\n- Console: 5\n- Set up : 5\n- Login process: 5\n- Loading times: 5\n- Controller: 5\n- Exclusives: 3\n\nTop positive aspect: Console \nTop negative aspect: Exclusives\n\nReview 2: This console has some great features, but it's not without its flaws. The graphics are excellent, but the load times can be frustratingly slow. The online community is active and fun to engage with, but the subscription fee is a bit steep.'''    
        
        temperature=0
        max_tokens=100
        top_p=1
        frequency_penalty=0
        presence_penalty=0
        stop=None

        custom_stop=''
        pre_response=''
        post_response=''

        return [prompt, temperature, max_tokens, stop, custom_stop, top_p, frequency_penalty, presence_penalty, pre_response, post_response]

    def option14():
        prompt='''Extract the person name, company name, location and phone number from the text below.\n\nHello. My name is Robert Smith. I’m calling from Contoso Insurance, Delaware. My colleague mentioned that you are interested in learning about our comprehensive benefits policy. Could you give me a call back at (555) 346-9322 when you get a chance so we can go over the benefits?'''
        
        temperature=0.2
        max_tokens=150
        top_p=1
        frequency_penalty=0
        presence_penalty=0
        stop=None

        custom_stop=''
        pre_response=''
        post_response=''

        return [prompt, temperature, max_tokens, stop, custom_stop, top_p, frequency_penalty, presence_penalty, pre_response, post_response]

    def option15():
        prompt='''There are many fruits that were found on the recently discovered planet Goocrux. There are neoskizzles that grow there, which are purple and taste like candy. There are also loheckles, which are a grayish blue fruit and are very tart, a little bit like a lemon. Pounits are a bright green color and are more savory than sweet. There are also plenty of loopnovas which are a neon pink flavor and taste like cotton candy. Finally, there are fruits called glowls, which have a very sour and bitter taste which is acidic and caustic, and a pale orange tinge to them.\n\nPlease make a table summarizing the fruits from Goocrux\n| Fruit | Color | Flavor |\n| Neoskizzles | Purple | Sweet |\n| Loheckles | Grayish blue | Tart |'''
        
        temperature=0
        max_tokens=100
        top_p=1
        frequency_penalty=0
        presence_penalty=0
        stop=['\n\n']

        custom_stop=''
        pre_response=''
        post_response=''

        return [prompt, temperature, max_tokens, stop, custom_stop, top_p, frequency_penalty, presence_penalty, pre_response, post_response]

    def option16():
        prompt='''Translate the following to French and Spanish. \n\n1. On a scale of 1 to 10, how satisfied are you with your in-store experience today?\n2. How likely are you to recommend our product to others?'''
        
        temperature=0.2
        max_tokens=200
        top_p=1
        frequency_penalty=0
        presence_penalty=0
        stop=None

        custom_stop=''
        pre_response=' '
        post_response=' '

        return [prompt, temperature, max_tokens, stop, custom_stop, top_p, frequency_penalty, presence_penalty, pre_response, post_response]

    def option17():
        prompt='''### Postgres SQL tables, with their properties:\n#\n# Employee(id, name, department_id)\n# Department(id, name, address)\n# Salary_Payments(id, employee_id, amount, date)\n#\n### A query to list the names of the departments which employed more than 10 employees in the last 3 months\n\nSELECT'''
        
        temperature=0
        max_tokens=150
        top_p=1
        frequency_penalty=0
        presence_penalty=0
        stop=['#',';']

        custom_stop=''
        pre_response=' '
        post_response=' '

        return [prompt, temperature, max_tokens, stop, custom_stop, top_p, frequency_penalty, presence_penalty, pre_response, post_response]

    def option18():
        prompt='''# Write a python function to reverse a string. The function should be an optimal solution in terms of time and space complexity.\n# Example input to the function: abcd123\n# Example output to the function: 321dcba'''
        
        temperature=0.2
        max_tokens=150
        top_p=1
        frequency_penalty=0
        presence_penalty=0
        stop=['#']

        custom_stop=''
        pre_response=''
        post_response=''

        return [prompt, temperature, max_tokens, stop, custom_stop, top_p, frequency_penalty, presence_penalty, pre_response, post_response]

    def option19():
        prompt='''Explain what the below SQL query does. Also answer why someone might be interested in this time period, and why a company might be interested in this SQL query.\n\nDetails: Temperature = 0.8; MaxTokens = 150+; Stop sequences: #\nSELECT c.customer_id\nFROM Customers c\nJOIN Streaming s\nON c.customer_id = s.customer_id\nWHERE c.signup_date BETWEEN '2020-03-01' AND '2020-03-31'\nAND s.watch_date BETWEEN c.signup_date AND DATE_ADD(c.signup_date, INTERVAL 30 DAY)\nGROUP BY c.customer_id\nHAVING SUM(s.watch_minutes) > 50 * 60\n\nExplanation:'''
        
        temperature=0.7
        max_tokens=250
        top_p=1
        frequency_penalty=0
        presence_penalty=0
        stop=None

        custom_stop=''
        pre_response=''
        post_response=''

        return [prompt, temperature, max_tokens, stop, custom_stop, top_p, frequency_penalty, presence_penalty, pre_response, post_response]

    def option20():
        prompt='''A neutron star is the collapsed core of a massive supergiant star, which had a total mass of between 10 and 25 solar masses, possibly more if the star was especially metal-rich. Neutron stars are the smallest and densest stellar objects, excluding black holes and hypothetical white holes, quark stars, and strange stars. Neutron stars have a radius on the order of 10 kilometres (6.2 mi) and a mass of about 1.4 solar masses. They result from the supernova explosion of a massive star, combined with gravitational collapse, that compresses the core past white dwarf star density to that of atomic nuclei.\n\nAnswer the following question from the text above.\n\nQ: How are neutron stars created?\nA:'''
        
        temperature=0.7
        max_tokens=250
        top_p=1
        frequency_penalty=0
        presence_penalty=0
        stop=None

        custom_stop=''
        pre_response='A:'
        post_response='Q:'

        return [prompt, temperature, max_tokens, stop, custom_stop, top_p, frequency_penalty, presence_penalty, pre_response, post_response]

    def option21():
        prompt='''Over the last five years, our company has tracked the sales performance of our five products: Product A, Product B, Product C, Product D, and Product E. Our analysis shows that Product A has consistently been the top-selling product, with an average of 10,000 units sold per year, generating $2 million in annual revenue and a profit margin of 15%. However, the profit margin for Product A has decreased over the past two years, indicating a need for re-evaluation of our pricing strategy. Product B and Product C have also shown steady sales and profitability, with an average of 7,500 units sold per year, generating $1.5 million in annual revenue, and a consistent profit margin of 20%. Product D has seen a slight decline in sales over the past two years, with an average of 5,000 units sold per year, generating $1 million in annual revenue, and a profit margin of 10%. Our analysis suggests that we may need to adjust our marketing or product development strategies to improve its performance. Product E has shown the lowest sales and profitability among the five products, with an average of 2,000 units sold per year, generating $400,000 in annual revenue, and a profit margin of 5%. Further investigation and potential changes to our product offering or marketing approach are necessary to improve the performance of Product E. Overall, our sales performance analysis suggests that we should focus on maintaining the profitability of our top-selling products while exploring ways to improve the performance of our less successful products.\n\nCompare the performance of each product and determine which one is the most profitable.'''
        
        temperature=0.7
        max_tokens=256
        top_p=1
        frequency_penalty=0
        presence_penalty=0
        stop=['\n']
        
        custom_stop=''
        pre_response='A:'
        post_response='Q:'

        return [prompt, temperature, max_tokens, stop, custom_stop, top_p, frequency_penalty, presence_penalty, pre_response, post_response]

    def option22():
        prompt='''Q: Contoso made a sale for $50. The raw materials cost $10 and the labor was $20. What was the profit on the sale?\nA: The total cost was $10 + $20. Revenue was $50. Profit is revenue - total cost so the profit was $20\n\nQ: Fabrikam sold 100 widgets for $10 each. However, 30 of the widgets were returned for a full refund. How much money did Fabrikam make? \nA:'''
        
        temperature=0
        max_tokens=100
        top_p=1
        frequency_penalty=0
        presence_penalty=0
        stop=None
        
        custom_stop=''
        pre_response=''
        post_response=''

        return [prompt, temperature, max_tokens, stop, custom_stop, top_p, frequency_penalty, presence_penalty, pre_response, post_response]

    def option23():
        prompt='''The following is a conversation with an AI assistant. The assistant is helpful, creative, clever, and very friendly. \n \nHuman: Hello, who are you? \nAI: Hello, I am an AI assistant. I am here to help you with anything you need.\nHuman: I'd like to cancel my subscription. \nAI:'''
        
        temperature=0.9
        max_tokens=256
        top_p=1
        frequency_penalty=0
        presence_penalty=0
        stop=['Human:','AI:']
        
        custom_stop=''
        pre_response='AI:'
        post_response='Human:'

        return [prompt, temperature, max_tokens, stop, custom_stop, top_p, frequency_penalty, presence_penalty, pre_response, post_response]



    def openaicompletion(prompt, temperature, max_tokens, stop, custom_stop, top_p, frequency_penalty, presence_penalty, pre_response, post_response):
        import openai
        openai.api_type = 'azure'
        openai.api_base = 'https://codegen.openai.azure.com/'
        openai.api_version = '2022-12-01'
        openai.api_key = '9d06c3514f924d9a8372ebf1890e80bb'


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
        response = openai.Completion.create(
            engine='35turbo',
            prompt=prompt,
            temperature=temperature,
            max_tokens=max_tokens,
            top_p=top_p,
            frequency_penalty=frequency_penalty,
            presence_penalty=presence_penalty,
            stop=stop)
        out = response.choices[0].text
        if len(post_response) > 0:
            out += '\n' + post_response
        return out

    choice_with_names = ['Custom',
                        'Summarize issue resolution from conversation',
                        'Summarize key points from financial report (extractive)',
                        'Summarize an article (abstractive)',
                        'Generate product name ideas',
                        'Generate an email',
                        'Generate a product description (bullet points)',
                        'Genearte a listicle-style blog',
                        'Generate a job description',
                        'Generate a quiz',
                        'Classify Text',
                        'Classify and detect intent',
                        'Cluster into undefined categories',
                        'Analyze sentiment with aspects',
                        'Extract entities from text',
                        'Parse unstructured data',
                        'Translate text',
                        'Natural Language to SQL',
                        'Natural Language to Python',
                        'Explain a SQL query',
                        'Question answering',
                        'Generate insights',
                        'Chain of thought reasoning',
                        'Chatbot']


    choice_name_to_options = {'Custom': 'Custom',
    'Summarize issue resolution from conversation': 'Option 1',
    'Summarize key points from financial report (extractive)': 'Option 2',
    'Summarize an article (abstractive)': 'Option 3',
    'Generate product name ideas': 'Option 4',
    'Generate an email': 'Option 5',
    'Generate a product description (bullet points)': 'Option 6',
    'Genearte a listicle-style blog': 'Option 7',
    'Generate a job description': 'Option 8',
    'Generate a quiz': 'Option 9',
    'Classify Text': 'Option 10',
    'Classify and detect intent': 'Option 11',
    'Cluster into undefined categories': 'Option 12',
    'Analyze sentiment with aspects': 'Option 13',
    'Extract entities from text': 'Option 14',
    'Parse unstructured data': 'Option 15',
    'Translate text': 'Option 16',
    'Natural Language to SQL': 'Option 17',
    'Natural Language to Python': 'Option 18',
    'Explain a SQL query': 'Option 19',
    'Question answering': 'Option 20',
    'Generate insights': 'Option 21',
    'Chain of thought reasoning': 'Option 22',
    'Chatbot': 'Option 23'}

    choice_to_text = {
        'Option 1': option1(),
        'Option 2': option2(),
        'Option 3': option3(),
        'Option 4': option4(),
        'Option 5': option5(),
        'Option 6': option6(),
        'Option 7': option7(),
        'Option 8': option8(),
        'Option 9': option9(),
        'Option 10': option10(),
        'Option 11': option11(),
        'Option 12': option12(),
        'Option 13': option13(),
        'Option 14': option14(),
        'Option 15': option15(),
        'Option 16': option16(),
        'Option 17': option17(),
        'Option 18': option18(),
        'Option 19': option19(),
        'Option 20': option20(),
        'Option 21': option21(),
        'Option 22': option22(),
        'Option 23': option23()
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

    with gr.Blocks(title='APPLIED AI PLATFORM', css=custom_style) as demo:
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
                        textbox = gr.Textbox(value='', label='Human:', lines=16, max_lines=16)
                    with gr.Column():
                        outtextbox = gr.Textbox(value='', label='AI:', lines=21, max_lines=21)
        dropdown.input(update_ui, inputs=[dropdown], outputs=[textbox, slider1, slider2, dropdown1, dropdown2, slider3, slider4, slider5, textbox1, textbox2])
        btn = gr.Button('Run')
        btn.click(fn=openaicompletion, inputs=[textbox, slider1, slider2, dropdown1, dropdown2, slider3, slider4, slider5, textbox1, textbox2], outputs=[outtextbox])

    # demo.launch(debug=True)
    demo.queue(max_size=5).launch(server_name='0.0.0.0', server_port=7883)


def executePipeline():

    openai_completions()

logging.info('Completed')


if __name__ == '__main__':
    executePipeline()
    print('Completed')
