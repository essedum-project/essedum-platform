# ESSEDUM

## 1. Project Description

 Essedum is a modular, microservices-based framework designed to simplify the development, training, and deployment of AI-powered applications. It enables seamless connectivity between systems via REST APIs, Azure OpenAI, and AWS Bedrock, and supports data ingestion from sources like PostgreSQL, MySQL, S3, and Azure Blob Storage. Users can build and execute training and inference pipelines using Python-based services, manage models across platforms like SageMaker, Azure ML, and GCP Vertex AI, and deploy them as endpoints. The architecture includes a Java Spring Boot backend, Angular frontend, and containerized pipeline executors managed by Kubernetes for scalability and high availability.

## 2. Installation 


###  Required Software’s and tools
#### Backend:
  •	JDK version 21 or higher
  •	Maven 3.9.6
  •	Mysql server V 8.3 or higher
  •	Mysql workbench V 8.3 pr higher
  •	Eclipse or STS IDE for Code editing

#### Front End:
  •	Noje Js 
  •	VS Code

#### Pyjob Executor:
  • Python 3.12

### 2.1 . Backend Setup Steps
    #### 2.1.1 Java setup
      •	Download java Standard Edition and add Java_Home environment Variable
      •	Add java bin path in the system environment variables path variable
      •	Check java is added configured correctly in system environment variables using command java -version
    #### 2.1.2 Maven setup
      •	Go to the official Maven website: https://maven.apache.org/download.cgi
      •	Download the binary zip archive (e.g., apache-maven-3.9.x-bin.zip)
      •	Extract the ZIP file to a directory C:\Program Files\Apache\Maven\apache-maven-3.9.x
      •	Open Start Menu → search for Environment Variables → click Edit the system environment variables
      •	In the System Properties window, click Environment Variables
      •	Click New under System variables
      •	Variable name: MAVEN_HOME
      •	Variable value: C:\Program Files\Apache\Maven\apache-maven-3.9.x
      •	Find the Path variable under System variables and click Edit
      •	Click New and add: C:\Program Files\Apache\Maven\apache-maven-3.9.x\bin
 

    #### 2.1.3 MySQL server setup 
      •	Go to the official site: https://dev.mysql.com/downloads/installer/
      •	Right-click the downloaded .msi file → Run as Administrator
      •	Select Developer Default (includes MySQL Server, Workbench, Shell, and connectors)
      •	The installer will check for dependencies (e.g., Visual C++ Redistributable). Install if prompted.
      •	Version: Choose the latest available (e.g., 9.2 or 8.3)
      •	Config Type: Development Computer
      •	Port: Default is 3306 (you can change if needed)
      •	Authentication Method: Use Strong Password Encryption (recommended)
      •	Root Password: Set a secure root password
      •	Optionally, add a MySQL user account
      •	Click Execute to apply server configuration
      •	Wait for the configuration steps to complete
      •	Once complete, you can launch MySQL Workbench or MySQL Shell to connect to the server using user credentials created while server setup.
      •	Once connection is successful create schemas with database names for Core & Quartz mentioned in the Common-App application.yaml under config property.
                                       
    #### 2.1.4 Clone code from repository
      •	Clone existing code from existing repository in development branch
      •	Backend related code placed in SV path
      •	Front End related code placed in UI folder
    
     
    #### 2.1.5 Crate Maven Build
      •	Run below maven command in SV directory “ai-platform/sv” 
      •	mvn clean install -Dmaven.test.skip=true -Dlicense.skip=true
      •	Maven build can also be created directly form the Eclipse or STS Ide
      •	To create Maven build from Eclipse below are the steps
      •	Import code into eclipse as a maven import
      •	Right click on Aip project->Run as-> maven build->paste the command in goals as shown below                          
      •	Once build was success you will see below output
                            
   
    
    While creating build might fail because of improper Lombok dependency detection. To avoid that configure Lombok dependency in to eclipse by following below steps
    1.	Copy the lombok.jar into the root Eclipse folder and run the below command
    “java -jar lombok-1.16.12.jar” 
    2.	This will open a small UI, where the location of the Eclipse installation can be specified. Usually,the Eclipse installation will be found automatically and lombok can be installed or updated. If not found IDE location specify manually
    3.	 Just press the Install / Update button and restart the IDE. 
    
    
    
    #### 2.6 Run application in Eclipse IDE
      •	Do Maven force update before running project.
      •	Open Application.Yaml under Resource folder of Common-app and keep Liquibase enabled as true if you are running application for the first time.
       •	Configure MYSQL server user and password in application.yaml highlighted in yellow
      •	Create schemas highlighted in red in MYSQL server using MYSQL Work Bench
               
      •	Right click on common-app->click on run-> select run configuration->select java application 
      •	Provide “com.infosys.Common” as input in Main Class.
      •	Provide “-Dencryption.key=leap$123## -Dencryption.salt=salt-token -Dspring.config.location=../common-app/src/main/resources/application.yml -DLOG_PATH=/app/log -Dlogging.config=../common-app/src/main/resources/logback-spring.xml” as input in the VM arguments.
                           
      •	Click on run to start the application
      •	Application startup will take some time if we are doing it for the first time it will create all the required tables and populate data within it.
  
  

### 2.3. Front End Setup Steps
  •	Run “npm run build” command in shell-app-UI & aip-app-ui directory
  •	Once Node Modules are crated and dist file is generated in those directories.  Copy both dist files path.        
 
  #### 2.3.1. Configuring and Starting Nginix
    •	Go to the path "nginx-1.23.3\conf\nginx.conf" and open conf folder
    •	Place the path of dist file generated for both shell app, and aip app in nginx.conf
    •	Now open nginx.exe application. This starts nginx in port 8087 

### 2.4. Pyjob Executor:
    • Go to pyjob-executor folder and run below command
        pip install -r requirements.tx
    • Run python app.py
    • Pyjob Executor will be running in port 5000. 
   

### 2.5. Docker Build and Deployment in AKS Cluster :

#### 2.5.1 Backend:
    sudo docker build -t essedum_app_backend:latest .
    sudo docker tag essedum_app_backend:latest 
    sudo docker push acrreq.azurecr.io/essedum_app_backend:latest
    kubectl delete -f leap_app_backend-azure.yaml
    kubectl apply -f leap_app_backend-azure.yaml

#### 2.5.2 Frontend:
    sudo docker build -t essedum_app_ui:latest .
    sudo docker tag essedum_app_ui:latest 
    sudo docker push acrreq.azurecr.io/essedum_app_ui:latest
    kubectl delete -f leap-ui-azure.yaml
    kubectl delete -f leap-ui-service.yaml
    kubectl apply -f leap-ui-azure.yaml
    kubectl apply -f leap-ui-service.yaml



## 3. Usage

  ### 3.1. Connection
  This module allows users to configure and manage connections to various resources essential for pipeline execution. These include:
  Pipeline Execution Environment: Choose where your ML pipeline will run (e.g., local, cloud, or containerized environments).
  Log Storage: Define where logs generated during pipeline execution will be stored for monitoring and debugging.
  Dataset Storage: Connect to data sources or storage systems where training and inference datasets are located.
  
  ### 3.2. Dataset
  The dataset module enables users to:
  Create and manage datasets used in ML pipelines.
  Upload, preprocess, and organize data for training and evaluation.
  Ensure datasets are versioned and accessible for reproducibility.
  
  ### 3.3. Pipeline
  This is the core of the application where users can:
  Create and configure ML pipelines for training models, performing inference, and deploying applications.
  Integrate Python scripts to define custom steps in the pipeline.
  Automate workflows including data loading, model training, evaluation, and deployment.
  
  ### 3.4. Apps
  This module hosts interactive applications built using:
  Streamlit and Gradio: These apps provide intuitive UIs for model interaction, visualization, and testing.
  Users can launch these apps directly from the platform to explore model predictions, adjust parameters, and share results.
 
  To use this application:
  Set up your connections to data sources and execution environments.
  Create or upload datasets for training.
  Build your ML pipeline using Python scripts or predefined templates.
  Deploy and interact with your models through Streamlit or Gradio apps.


## 4. Change Log:
  Initial Version

 
## 5. License Info:
The MIT License (MIT)
Copyright © 2025 Infosys Limited

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
