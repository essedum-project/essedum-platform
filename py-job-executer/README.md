# Python Job Executor

The **Python Job Executor** is a component of the Essedum platform responsible for executing jobs written in Python. It runs as a separate service, listening for job requests and executing them in a controlled environment. This service is essential for running data processing, machine learning, and other Python-based tasks within the Essedum ecosystem.

## Prerequisites

Before setting up the Python Job Executor, ensure you have the following installed on your system:

- **Python**: Version 3.12 or higher.
- **Virtual Environment (Recommended)**: A tool like `venv` to isolate project dependencies.

## Installation

Follow these steps to set up the Python Job Executor:

1. **Set up Python**:
   - Install Python 3.12+ and ensure it is added to your system's `PATH`. You can verify the installation by running `python --version`.

2. **Create a Virtual Environment**:
   - Navigate to the `py-job-executer` directory.
   - Create a virtual environment to manage dependencies:
     ```bash
     python -m venv venv
     ```

3. **Activate the Virtual Environment**:
   - **On Windows**:
     ```bash
     .\venv\Scripts\activate
     ```
   - **On macOS and Linux**:
     ```bash
     source venv/bin/activate
     ```

4. **Install Dependencies**:
   - With the virtual environment activated, install the required packages using the `requirements.txt` file:
     ```bash
     pip install -r requirements.txt
     ```

## Running the Service

Once the installation is complete, you can start the service by running the main application file:

```bash
python app.py
```

By default, the service will start on the IP and port specified in the configuration.

## Advanced Configuration

### Exposing the Service

To make the service accessible from outside the host machine, you may need to configure your firewall:

1. Open **Windows Defender Firewall with Advanced Security**.
2. Go to **Inbound Rules** and create a **New Rule**.
3. Select **Port** and specify the TCP port the service is running on.
4. Allow the connection and assign the rule a descriptive name.

### Running as a Windows Service

For production environments, it is recommended to run the Python Job Executor as a background service. You can use a tool like **NSSM (the Non-Sucking Service Manager)** to achieve this:

1. **Install NSSM**:
   - Download and install NSSM, then add its path to your system's environment variables.

2. **Install the Service**:
   - Open a command prompt with administrator privileges and run:
     ```bash
     nssm install "Python Job Executor"
     ```
   - In the NSSM GUI, configure the following:
     - **Path**: The full path to your `python.exe` (e.g., `C:\path\to\your\venv\Scripts\python.exe`).
     - **Startup directory**: The path to the `py-job-executer` directory.
     - **Arguments**: `app.py`.
     - **I/O Tab**: Redirect stdout and stderr to a log file for debugging.

3. **Start the Service**:
   - You can now start, stop, and manage the "Python Job Executor" service from the Windows Services panel (`services.msc`).
