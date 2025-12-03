import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { GithubLoginComponent } from './github-login/github-login.component';

interface FileNode {
  name: string;
  type: 'file' | 'folder';
  children?: FileNode[];
  content?: string;
  id?: string;
  path?: string;
}

// API Configuration
const API_CONFIG = {
  baseUrl: 'http://localhost:8080',
  endpoints: {
    uploadZip: '/api/zip/upload',
    getUserFiles: '/api/zip/user/{userId}',
    downloadFile: '/api/zip/download/{fileId}'
  }
};

// Sample API structure for reference
const SAMPLE_API_SPEC = {
  "openapi": "3.0.1",
  "info": {
    "title": "OpenAPI definition",
    "version": "v0"
  },
  "servers": [
    {
      "url": "http://localhost:8080",
      "description": "Generated server url"
    }
  ],
  "paths": {
    "/api/zip/upload": {
      "post": {
        "tags": ["zip-controller"],
        "operationId": "uploadZip",
        "parameters": [
          {
            "name": "userId",
            "in": "query",
            "required": true,
            "schema": {"type": "string"}
          }
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "required": ["file"],
                "type": "object",
                "properties": {
                  "file": {"type": "string", "format": "binary"}
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "OK",
            "content": {"*/*": {"schema": {"type": "string"}}}
          }
        }
      }
    },
    "/api/zip/user/{userId}": {
      "get": {
        "tags": ["zip-controller"],
        "operationId": "getFilesForUser",
        "parameters": [
          {
            "name": "userId",
            "in": "path",
            "required": true,
            "schema": {"type": "string"}
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "*/*": {
                "schema": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "additionalProperties": {"type": "string"}
                  }
                }
              }
            }
          }
        }
      }
    },
    "/api/zip/download/{fileId}": {
      "get": {
        "tags": ["zip-controller"],
        "operationId": "downloadFile",
        "parameters": [
          {
            "name": "fileId",
            "in": "path",
            "required": true,
            "schema": {"type": "integer", "format": "int64"}
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "*/*": {
                "schema": {
                  "type": "array",
                  "items": {"type": "string", "format": "byte"}
                }
              }
            }
          }
        }
      }
    }
  },
  "components": {}
};

interface AgentCard {
  cid: string;
  name: string;
  alias: string;
  description: string;
  type: string;
  language: string;
  status: string;
  version: string;
  lastModified: Date;
  tags?: string[];
  lastmodifiedon?: Date;
  createdby?: string;
  hover?: boolean;
}

@Component({
  selector: 'app-agent-pipeline',
  templateUrl: './agent-pipeline.component.html',
  styleUrls: ['./agent-pipeline.component.scss'],
})
export class AgentPipelineComponent implements OnInit {
 
 githubUsername:string = "";
  
  // API-related properties
  currentUserId: string = 'user123'; // Default user ID for testing
  isLoadingFiles: boolean = false;
  // View mode: 'list' shows cards, 'detail' shows script/generate tabs
  viewMode: 'list' | 'detail' = 'list';
  selectedAgent: AgentCard | null = null;
  
  // Card title
  CARD_TITLE = 'Agent Pipelines';
  lastRefreshedTime: Date | null = null;
  
  // Filter properties
  tagrefresh: boolean = false;
  selectedFilterTypes: any = {};
  
  // JSON Processing Flow
  isJsonProcessed = false;
  isProcessingJson = false;
  
  // Console output for Generate SDK Agent
  consoleOutput: string[] = [];
  isGenerating = false;
  
  // Playground popup
  showPlayground = false;
  hasGeneratedAgent = false;
  playgroundMessages: Array<{role: 'user' | 'agent', content: string}> = [];
  userQuestion = '';
  isAgentThinking = false;
  
  // GitHub Push popup
  showGitHubPush = false;
  githubRepoName = '';
  selectedBranch = 'main';
  availableBranches: string[] = ['main', 'develop', 'feature/agent-updates', 'staging', 'production'];
  availableRepositories: Array<{name: string, description?: string}> = [
    { name: 'customer-support-agent-sdk', description: 'Customer Support Agent SDK' },
    { name: 'data-analysis-agent-sdk', description: 'Data Analysis Agent SDK' },
    { name: 'code-review-agent-sdk', description: 'Code Review Agent SDK' },
    { name: 'marketing-automation-sdk', description: 'Marketing Automation SDK' },
    { name: 'content-generator-sdk', description: 'Content Generator SDK' },
    { name: 'chatbot-framework-sdk', description: 'Chatbot Framework SDK' }
  ];
  useCustomCommit = false;
  commitMessage = '';
  isPushing = false;
  
  // Hardcoded agent cards
  agentCards: AgentCard[] = [
    {
      cid: '1',
      name: 'customer-support-agent',
      alias: 'Customer Support Agent',
      description: 'AI-powered customer support agent with knowledge base integration and ticket management',
      type: 'AgentScript',
      language: 'Python3',
      status: 'Active',
      version: '1.2.0',
      lastModified: new Date('2024-11-15'),
      tags: ['customer-service', 'automation', 'nlp'],
      lastmodifiedon: new Date('2024-11-15'),
      createdby: 'admin@example.com',
      hover: false
    },
    {
      cid: '2',
      name: 'data-analysis-agent',
      alias: 'Data Analysis Agent',
      description: 'Automated data analysis and visualization agent for business intelligence',
      type: 'AgentScript',
      language: 'Python3',
      status: 'Active',
      version: '2.0.1',
      lastModified: new Date('2024-11-17'),
      tags: ['analytics', 'bi', 'data-science'],
      lastmodifiedon: new Date('2024-11-17'),
      createdby: 'admin@example.com',
      hover: false
    },
    {
      cid: '3',
      name: 'code-review-agent',
      alias: 'Code Review Agent',
      description: 'Intelligent code review agent that analyzes pull requests and suggests improvements',
      type: 'AgentScript',
      language: 'Python3',
      status: 'Ready',
      version: '1.0.0',
      lastModified: new Date('2024-11-10'),
      tags: ['code-quality', 'devops', 'automation'],
      lastmodifiedon: new Date('2024-11-10'),
      createdby: 'admin@example.com',
      hover: false
    }
  ];
  
  // JSON configuration
  jsonContent = `{
  "agent_name": "customer-support-agent",
  "version": "1.0.0"
}`;

  // File system structure
  fileSystemData: FileNode[] = [];

  // Selected file content for editor
  selectedFileContent = '';
  selectedFileName = '';
  fileExtension = 'py';
  
  // Hover states
  isHoveredBack = false;
  isHoveredTag = false;
  isHoveredSave = false;
  isHoveredDuplicate = false;

  constructor(
    private location: Location,
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.lastRefreshedTime = new Date();
  }

  navigateBack(): void {
    if (this.viewMode === 'detail') {
      this.viewMode = 'list';
      this.selectedAgent = null;
      this.isJsonProcessed = false;
      this.isProcessingJson = false;
      this.hasGeneratedAgent = false;
      this.fileSystemData = [];
    } else {
      this.location.back();
    }
  }

  onSearch(searchTerm: string): void {
    console.log('Search:', searchTerm);
    // TODO: Implement search functionality
  }

  onRefresh(): void {
    this.lastRefreshedTime = new Date();
    console.log('Refreshed at:', this.lastRefreshedTime);
    // TODO: Implement refresh functionality
  }

  onAdd(): void {
    console.log('Add new agent pipeline');
    // TODO: Implement add functionality
  }

  onTagSelected(tags: any): void {
    console.log('Tags selected:', tags);
    this.tagrefresh = !this.tagrefresh;
    // TODO: Implement tag filtering
  }

  onFilterStatusChange(filters: any): void {
    console.log('Filters changed:', filters);
    // TODO: Implement filter functionality
  }

  viewDetails(agent: AgentCard): void {
    this.selectedAgent = agent;
    this.viewMode = 'detail';
    
    // Reset file selection and processing state
    this.selectedFileName = '';
    this.selectedFileContent = '';
    this.isJsonProcessed = true; // Show JSON and console directly
    this.isProcessingJson = false;
    this.hasGeneratedAgent = false; // Reset playground button state
    
    // Update JSON content based on selected agent
    this.updateJsonContent(agent);
    // Don't generate file system data until agent is generated
  }



  refreshConfiguration(): void {
    if (!this.selectedAgent) return;
    
    // Reset file selection and regenerate file structure
    this.selectedFileName = '';
    this.selectedFileContent = '';
    this.isLoadingFiles = true;
    
    // Update JSON content and regenerate file structure
    this.updateJsonContent(this.selectedAgent);
    this.updateFileSystemData(this.selectedAgent);
  }

  updateJsonContent(agent: AgentCard): void {
    this.jsonContent = `{
  "agent_name": "${agent.name}",
  "version": "${agent.version}",
  "description": "${agent.description}",
  "configuration": {
    "model": "gpt-4",
    "temperature": 0.7,
    "max_tokens": 2000,
    "tools": ${JSON.stringify(this.getToolsForAgent(agent.name), null, 6)}
  },
  "runtime": {
    "type": "${agent.language}",
    "dependencies": [
      "openai>=1.0.0",
      "requests>=2.28.0",
      "python-dotenv>=0.19.0"
    ]
  }
}`;
  }

  getToolsForAgent(agentName: string): any[] {
    const toolsMap: any = {
      'customer-support-agent': [
        { name: "search_knowledge_base", description: "Search the knowledge base for relevant articles" },
        { name: "create_ticket", description: "Create a support ticket" },
        { name: "get_customer_info", description: "Retrieve customer information" }
      ],
      'data-analysis-agent': [
        { name: "load_dataset", description: "Load and preprocess datasets" },
        { name: "generate_visualizations", description: "Create charts and graphs" },
        { name: "run_statistical_analysis", description: "Perform statistical computations" }
      ],
      'code-review-agent': [
        { name: "analyze_code_quality", description: "Check code quality metrics" },
        { name: "detect_vulnerabilities", description: "Scan for security issues" },
        { name: "suggest_improvements", description: "Provide code optimization suggestions" }
      ]
    };
    return toolsMap[agentName] || [];
  }

  updateFileSystemData(agent: AgentCard): void {
    this.isLoadingFiles = true;
    
    // Use hardcoded API simulation that matches exact endpoint behavior
    this.fetchUserFiles(this.currentUserId)
      .then(apiResponse => {
        console.log('Building file tree from API response:', apiResponse);
        this.fileSystemData = this.buildFileTreeFromApiResponse(apiResponse);
        this.isLoadingFiles = false;
      })
      .catch(error => {
        console.error('Error loading files:', error);
        this.isLoadingFiles = false;
        // Fallback to empty structure
        this.fileSystemData = [];
      });
  }
  
  // Build nested file tree structure from flat API response
  buildFileTreeFromApiResponse(apiResponse: any[]): FileNode[] {
    const root: FileNode = { name: 'root', type: 'folder', children: [] };
    
    apiResponse.forEach(item => {
      const pathParts = item.path.split('/');
      let currentNode = root;
      
      // Navigate/create the directory structure
      for (let i = 0; i < pathParts.length; i++) {
        const part = pathParts[i];
        const isFile = i === pathParts.length - 1;
        
        if (!currentNode.children) {
          currentNode.children = [];
        }
        
        // Find existing node or create new one
        let existingNode = currentNode.children.find(child => child.name === part);
        
        if (!existingNode) {
          existingNode = {
            name: part,
            type: isFile ? 'file' : 'folder',
            id: isFile ? item.id : undefined,
            path: isFile ? item.path : undefined,
            children: isFile ? undefined : []
          };
          currentNode.children.push(existingNode);
        }
        
        currentNode = existingNode;
      }
    });
    
    return root.children || [];
  }
  
  // Method to fetch files from API (hardcoded for now with exact API structure)
  async fetchUserFiles(userId: string): Promise<any[]> {
    try {
      // Simulate the API call with exact endpoint structure
      console.log(`Calling GET ${API_CONFIG.baseUrl}${API_CONFIG.endpoints.getUserFiles.replace('{userId}', userId)}`);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Return exact API response structure as provided
      const response = [
        { "path": "pom.xml", "fileName": "pom.xml", "id": "1" },
        { "path": "src/main/resources/application.properties", "fileName": "application.properties", "id": "2" },
        { "path": "src/main/java/com/example/zipupload/ZipUploadApplication.java", "fileName": "ZipUploadApplication.java", "id": "3" },
        { "path": "src/main/java/com/example/zipupload/service/ZipProcessingService.java", "fileName": "ZipProcessingService.java", "id": "4" },
        { "path": "src/main/java/com/example/zipupload/repository/FileRepository.java", "fileName": "FileRepository.java", "id": "5" },
        { "path": "src/main/java/com/example/zipupload/entity/FileEntity.java", "fileName": "FileEntity.java", "id": "6" },
        { "path": "src/main/java/com/example/zipupload/controller/ZipController.java", "fileName": "ZipController.java", "id": "7" }
      ];
      
      console.log('API Response:', response);
      return response;
    } catch (error) {
      console.error('Failed to fetch user files:', error);
      return [];
    }
  }
  
  // Method to download file content from API (hardcoded for now with exact API structure)
  async downloadFileContent(fileId: string): Promise<string> {
    try {
      // Simulate the API call with exact endpoint structure
      console.log(`Calling GET ${API_CONFIG.baseUrl}${API_CONFIG.endpoints.downloadFile.replace('{fileId}', fileId)}`);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // API returns byte array according to OpenAPI spec
      // Simulate converting byte array response to string content
      const byteArrayResponse = this.simulateByteArrayResponse(fileId);
      const content = this.convertByteArrayToString(byteArrayResponse);
      
      console.log(`Downloaded file ${fileId}, content length: ${content.length}`);
      return content;
    } catch (error) {
      console.error('Failed to download file:', error);
      return 'Error loading file content';
    }
  }
  
  // Simulate byte array response from API
  simulateByteArrayResponse(fileId: string): number[] {
    const content = this.getSampleFileContent(fileId);
    // Convert string to byte array simulation
    const byteArray = [];
    for (let i = 0; i < content.length; i++) {
      byteArray.push(content.charCodeAt(i));
    }
    return byteArray;
  }
  
  // Convert byte array to string (as would be done in real implementation)
  convertByteArrayToString(byteArray: number[]): string {
    return String.fromCharCode(...byteArray);
  }

  getClassName(agentName: string): string {
    return agentName.split('-').map((word: string) => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join('') + 'Agent';
  }

  getMainPyContent(agentName: string): string {
    const className = this.getClassName(agentName);
    const tools = this.getToolsForAgent(agentName);
    
    const toolMethods = tools.map((tool: any) => `
    def ${tool.name}(self, *args, **kwargs):
        """${tool.description}"""
        # Implementation here
        return {"status": "success", "data": {}}`).join('\n');

    return `import os
from openai import OpenAI
from dotenv import load_dotenv
from typing import Dict, Any

# Load environment variables
load_dotenv()

class ${className}:
    def __init__(self):
        self.client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        self.model = "gpt-4"
        self.tools = ${JSON.stringify(tools, null, 8)}
${toolMethods}
    
    def process_request(self, message: str) -> str:
        """Process ${agentName.replace(/-/g, ' ')} request"""
        response = self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": "You are a helpful AI agent."},
                {"role": "user", "content": message}
            ],
            tools=self.tools,
            tool_choice="auto"
        )
        return response.choices[0].message.content
    
    def run(self):
        """Main execution loop"""
        print("${className} initialized successfully!")
        print(f"Available tools: {[tool['name'] for tool in self.tools]}")

if __name__ == "__main__":
    agent = ${className}()
    agent.run()
`;
  }

  getToolsPyContent(agentName: string): string {
    const tools = this.getToolsForAgent(agentName);
    const toolFunctions = tools.map((tool: any) => `
def ${tool.name}(*args, **kwargs):
    """${tool.description}"""
    # Implementation
    pass`).join('\n');

    return `"""
Agent tools and utilities for ${agentName}
"""
${toolFunctions}

class AgentToolkit:
    """Collection of tools for the agent"""
    
    def __init__(self):
        self.tools = {
${tools.map((t: any) => `            '${t.name}': ${t.name}`).join(',\n')}
        }
    
    def execute_tool(self, tool_name: str, *args, **kwargs):
        """Execute a tool by name"""
        if tool_name in self.tools:
            return self.tools[tool_name](*args, **kwargs)
        raise ValueError(f"Tool {tool_name} not found")
`;
  }

  onJsonChange(event: any): void {
    this.jsonContent = event.join('\n');
  }

  onFileContentChange(event: any): void {
    this.selectedFileContent = event.join('\n');
  }

  saveChanges(): void {
    console.log('Saving changes...');
    // Implementation for saving
  }

  duplicateAgent(): void {
    console.log('Duplicating agent...');
    // Implementation for duplication
  }

  openTagModal(): void {
    console.log('Opening tag modal...');
    // Implementation for tags
  }

  // Generate sample file content based on file ID and type
  getSampleFileContent(fileId: string): string {
    const fileMap: { [key: string]: string } = {
      '1': `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 
         http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    
    <groupId>com.example</groupId>
    <artifactId>zip-upload</artifactId>
    <version>1.0.0</version>
    <packaging>jar</packaging>
    
    <name>Zip Upload Service</name>
    <description>Service for handling zip file uploads and processing</description>
</project>`,
      '2': `# Application Configuration
server.port=8080
spring.application.name=zip-upload-service

# File Upload Configuration
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB

# Database Configuration
spring.datasource.url=jdbc:h2:mem:testdb
spring.datasource.driverClassName=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=

# JPA Configuration
spring.jpa.database-platform=org.hibernate.dialect.H2Dialect
spring.jpa.hibernate.ddl-auto=update
spring.h2.console.enabled=true`,
      '3': `package com.example.zipupload;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class ZipUploadApplication {

    public static void main(String[] args) {
        SpringApplication.run(ZipUploadApplication.class, args);
    }

}`,
      '4': `package com.example.zipupload.service;

import org.springframework.stereotype.Service;
import java.io.*;
import java.util.zip.*;
import java.util.List;
import java.util.ArrayList;

@Service
public class ZipProcessingService {

    public List<String> extractZipFile(InputStream zipInputStream) throws IOException {
        List<String> extractedFiles = new ArrayList<>();
        
        try (ZipInputStream zis = new ZipInputStream(zipInputStream)) {
            ZipEntry zipEntry;
            while ((zipEntry = zis.getNextEntry()) != null) {
                if (!zipEntry.isDirectory()) {
                    extractedFiles.add(zipEntry.getName());
                    // Process file content here
                }
                zis.closeEntry();
            }
        }
        
        return extractedFiles;
    }
}`,
      '5': `package com.example.zipupload.repository;

import com.example.zipupload.entity.FileEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface FileRepository extends JpaRepository<FileEntity, Long> {
    List<FileEntity> findByUserId(String userId);
}`,
      '6': `package com.example.zipupload.entity;

import javax.persistence.*;

@Entity
@Table(name = "files")
public class FileEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "user_id")
    private String userId;
    
    @Column(name = "file_name")
    private String fileName;
    
    @Column(name = "file_path")
    private String filePath;
    
    @Lob
    @Column(name = "content")
    private byte[] content;
    
    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    
    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }
    
    public String getFilePath() { return filePath; }
    public void setFilePath(String filePath) { this.filePath = filePath; }
    
    public byte[] getContent() { return content; }
    public void setContent(byte[] content) { this.content = content; }
}`,
      '7': `package com.example.zipupload.controller;

import com.example.zipupload.service.ZipProcessingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/zip")
public class ZipController {

    @Autowired
    private ZipProcessingService zipProcessingService;

    @PostMapping("/upload")
    public ResponseEntity<String> uploadZip(
            @RequestParam("userId") String userId,
            @RequestParam("file") MultipartFile file) {
        try {
            List<String> extractedFiles = zipProcessingService.extractZipFile(file.getInputStream());
            return ResponseEntity.ok("Files processed successfully: " + extractedFiles.size());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error processing zip file: " + e.getMessage());
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Map<String, String>>> getFilesForUser(@PathVariable String userId) {
        // Implementation here
        return ResponseEntity.ok(List.of());
    }

    @GetMapping("/download/{fileId}")
    public ResponseEntity<byte[]> downloadFile(@PathVariable Long fileId) {
        // Implementation here
        return ResponseEntity.ok(new byte[0]);
    }
}`
    };
    
    return fileMap[fileId] || `// File content for ID: ${fileId}\n// This is a sample file generated from the API response\n// In a real implementation, this would be fetched from the backend`;
  }

  // File system methods
  async selectFile(node: FileNode): Promise<void> {
    if (node.type === 'file') {
      this.selectedFileName = node.name;
      
      // Set file extension
      if (node.name.endsWith('.py')) {
        this.fileExtension = 'py';
      } else if (node.name.endsWith('.json')) {
        this.fileExtension = 'json';
      } else if (node.name.endsWith('.java')) {
        this.fileExtension = 'java';
      } else if (node.name.endsWith('.xml')) {
        this.fileExtension = 'xml';
      } else if (node.name.endsWith('.properties')) {
        this.fileExtension = 'properties';
      } else if (node.name.endsWith('.md')) {
        this.fileExtension = 'markdown';
      } else {
        this.fileExtension = 'txt';
      }
      
      // Load file content from API if node has an ID
      if (node.id) {
        this.selectedFileContent = 'Loading...';
        try {
          this.selectedFileContent = await this.downloadFileContent(node.id);
        } catch (error) {
          console.error('Error loading file content:', error);
          this.selectedFileContent = 'Error loading file content';
        }
      } else {
        this.selectedFileContent = node.content || '';
      }
      
      console.log('Selected file:', this.selectedFileName, 'Extension:', this.fileExtension, 'Content length:', this.selectedFileContent.length);
    }
  }

  isFileSelected(node: FileNode): boolean {
    return node.type === 'file' && node.name === this.selectedFileName;
  }

  getFileLanguage(fileName: string): string {
    if (fileName.endsWith('.py')) return 'python';
    if (fileName.endsWith('.json')) return 'json';
    if (fileName.endsWith('.md')) return 'markdown';
    if (fileName.endsWith('.txt')) return 'text';
    return 'text';
  }

  // Generate SDK Agent
  generateSDKAgent(): void {
    this.isGenerating = true;
    this.hasGeneratedAgent = false; // Reset flag when starting new generation
    this.consoleOutput = [];
    
    const agentName = this.selectedAgent ? this.selectedAgent.alias : 'Agent';
    const version = this.selectedAgent ? this.selectedAgent.version : '1.0.0';
    
    // Simulate console output
    const messages = [
      `Starting SDK Agent generation for ${agentName}...`,
      'Initializing build environment...',
      'Installing dependencies...',
      '  - openai>=1.0.0',
      '  - requests>=2.28.0',
      '  - python-dotenv>=0.19.0',
      '  - pandas>=2.0.0',
      '  - numpy>=1.24.0',
      'Setting up project structure...',
      '  - Created src/ directory',
      '  - Created tests/ directory',
      '  - Generated main.py',
      '  - Generated tools.py',
      '  - Generated config.py',
      'Running validation checks...',
      '  ✓ Configuration valid',
      '  ✓ Dependencies resolved',
      '  ✓ Code syntax valid',
      '  ✓ All tests passed',
      'Building agent package...',
      'Compiling bytecode...',
      'Creating distribution...',
      'Packaging complete!',
      `SDK Agent generated successfully for ${agentName}!`,
      '',
      `Output: ./dist/${this.selectedAgent?.name}-v${version}.tar.gz`,
      `Size: 2.4 MB`,
      '',
      'Loading file structure for Essedum Codespace...'
    ];

    let index = 0;
    const interval = setInterval(() => {
      if (index < messages.length) {
        this.consoleOutput.push(messages[index]);
        index++;
      } else {
        clearInterval(interval);
        this.isGenerating = false;
        this.hasGeneratedAgent = true; // Show playground button after generation
        
        // Generate file structure for Essedum Codespace
        if (this.selectedAgent) {
          this.updateFileSystemData(this.selectedAgent);
        }
        
        // Show playground popup after generation completes
        setTimeout(() => {
          this.openPlayground();
        }, 500);
      }
    }, 300);
  }

  clearConsole(): void {
    this.consoleOutput = [];
  }

  trackByCardId(index: number, card: AgentCard): string {
    return card.cid;
  }

  editAgent(agent: AgentCard): void {
    console.log('Edit agent:', agent);
    // TODO: Implement edit functionality
  }

  deleteAgent(agent: AgentCard): void {
    console.log('Delete agent:', agent);
    // TODO: Implement delete functionality
  }

  // Playground methods
  openPlayground(): void {
    this.showPlayground = true;
    this.playgroundMessages = [
      {
        role: 'agent',
        content: `Hello! I'm the ${this.selectedAgent?.alias || 'Agent'} (v${this.selectedAgent?.version}). I'm now running from the generated SDK. How can I help you today?`
      }
    ];
  }

  closePlayground(): void {
    this.showPlayground = false;
    this.playgroundMessages = [];
    this.userQuestion = '';
  }

  sendQuestion(): void {
    if (!this.userQuestion.trim()) return;
    
    // Add user message
    this.playgroundMessages.push({
      role: 'user',
      content: this.userQuestion
    });
    
    const question = this.userQuestion;
    this.userQuestion = '';
    this.isAgentThinking = true;
    
    // Simulate agent response
    setTimeout(() => {
      const agentResponse = this.getAgentResponse(question);
      this.playgroundMessages.push({
        role: 'agent',
        content: agentResponse
      });
      this.isAgentThinking = false;
    }, 1500);
  }

  getAgentResponse(question: string): string {
    const agentName = this.selectedAgent?.name || '';
    const questionLower = question.toLowerCase();
    
    // Contextual responses based on agent type and question
    if (agentName === 'customer-support-agent') {
      if (questionLower.includes('ticket') || questionLower.includes('issue')) {
        return 'I can help you create a support ticket. Please provide me with: 1) Issue description, 2) Priority level (Low/Medium/High), and 3) Your contact information. I\'ll search our knowledge base for similar issues first.';
      } else if (questionLower.includes('order') || questionLower.includes('tracking')) {
        return 'I can look up your order status. Let me search our customer database. Could you provide your order number or email address associated with the account?';
      } else if (questionLower.includes('refund') || questionLower.includes('return')) {
        return 'I can assist with refund requests. According to our policy, refunds are processed within 5-7 business days. Would you like me to create a refund ticket for you?';
      }
    } else if (agentName === 'data-analysis-agent') {
      if (questionLower.includes('analyze') || questionLower.includes('data')) {
        return 'I can analyze your dataset. I support CSV, Excel, and JSON formats. Please upload your data and specify what insights you\'re looking for: trends, correlations, outliers, or statistical summaries?';
      } else if (questionLower.includes('visualiz') || questionLower.includes('chart') || questionLower.includes('graph')) {
        return 'I can create various visualizations: bar charts, line graphs, scatter plots, heatmaps, and more. What type of visualization would best represent your data?';
      } else if (questionLower.includes('report')) {
        return 'I can generate comprehensive reports with statistical analysis, charts, and insights. Would you like a summary report, detailed analysis, or executive dashboard?';
      }
    } else if (agentName === 'code-review-agent') {
      if (questionLower.includes('review') || questionLower.includes('code')) {
        return 'I can review your code for quality, security vulnerabilities, and best practices. Please provide the repository URL or paste the code snippet you\'d like me to analyze.';
      } else if (questionLower.includes('security') || questionLower.includes('vulnerab')) {
        return 'I\'ll run a security scan to detect: SQL injection risks, XSS vulnerabilities, hardcoded credentials, and insecure dependencies. Should I proceed with a full security audit?';
      } else if (questionLower.includes('improve') || questionLower.includes('optimize')) {
        return 'I can suggest improvements for: code performance, readability, maintainability, and adherence to design patterns. Would you like me to focus on a specific aspect?';
      }
    }
    
    // Generic helpful response
    const tools = this.getToolsForAgent(agentName);
    if (tools.length > 0) {
      return `I'm equipped with the following capabilities: ${tools.map(t => t.description).join(', ')}. Which of these would you like me to help you with?`;
    }
    
    return `I understand your question: "${question}". Based on my SDK configuration, I can process this request using my trained model. How would you like me to proceed?`;
  }

  onPlaygroundKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendQuestion();
    }
  }
  
  // GitHub Push methods
  openGitHubPush(): void {
    // First check if user is authenticated with GitHub
    if (!this.isGitHubAuthenticated()) {
      this.openGitHubLoginDialog();
      return;
    }
    
    this.showGitHubPush = true;
    // Set default repo name based on selected agent
    if (this.selectedAgent && !this.githubRepoName) {
      this.githubRepoName = `${this.selectedAgent.name}-sdk`;
    }
    // Load available branches (in real implementation, this would call an API)
    this.loadAvailableBranches();
  }

  private isGitHubAuthenticated(): boolean {
    // Check if user has GitHub authentication token
    // In a real implementation, check localStorage, sessionStorage, or service
    const token = localStorage.getItem('github_token');
    this.githubUsername = localStorage.getItem('github_username') || '';
    return !!token;
  }

  private openGitHubLoginDialog(): void {
    const dialogRef = this.dialog.open(GithubLoginComponent, {
      width: '450px',
      maxWidth: '90vw',
      disableClose: true,
      panelClass: 'github-login-dialog'
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result && result.token) {
        // Save authentication data
        localStorage.setItem('github_token', result.token);
        localStorage.setItem('github_username', result.username);
        this.githubUsername = result.username;
        // Now open the GitHub push dialog
        this.showGitHubPush = true;
        if (this.selectedAgent && !this.githubRepoName) {
          this.githubRepoName = `${this.selectedAgent.name}-sdk`;
        }
        this.loadAvailableBranches();
      }
    });
  }
  
  closeGitHubPush(): void {
    this.showGitHubPush = false;
    this.githubRepoName = '';
    this.selectedBranch = 'main';
    this.useCustomCommit = false;
    this.commitMessage = '';
    this.isPushing = false;
  }
  
  onRepoNameChange(event: any): void {
    // Handle both input field (event.target.value) and mat-select (event.value) events
    this.githubRepoName = event.value || event.target?.value || event;
    // Mock: Load branches for the specified repository
    this.loadAvailableBranches();
  }
  
  loadAvailableBranches(): void {
    // Mock data - in real implementation, this would call GitHub API
    const mockBranches = {
      'customer-support-agent-sdk': ['main', 'develop', 'feature/chat-integration', 'hotfix/bug-fixes'],
      'data-analysis-agent-sdk': ['main', 'develop', 'feature/new-charts', 'staging'],
      'code-review-agent-sdk': ['main', 'develop', 'feature/security-scan', 'production']
    };
    
    this.availableBranches = mockBranches[this.githubRepoName as keyof typeof mockBranches] || 
                           ['main', 'develop', 'feature/agent-updates', 'staging', 'production'];
  }
  
  onCustomCommitChange(event: any): void {
    this.useCustomCommit = event.checked;
    if (!this.useCustomCommit) {
      this.commitMessage = '';
    }
  }
  
  getDefaultCommitMessage(): string {
    const agentName = this.selectedAgent?.alias || 'Agent';
    const version = this.selectedAgent?.version || '1.0.0';
    const timestamp = new Date().toISOString().split('T')[0];
    return `feat: Add ${agentName} SDK v${version} - Generated on ${timestamp}`;
  }
  
  canPush(): boolean {
    return !!(this.githubRepoName && this.selectedBranch);
  }
  
  pushToGitHub(): void {
    if (!this.canPush()) return;
    
    this.isPushing = true;
    
    // Prepare the commit message
    const finalCommitMessage = this.useCustomCommit ? 
      this.commitMessage : 
      this.getDefaultCommitMessage();
    
    // Mock API call data
    const pushData = {
      repository: this.githubRepoName,
      branch: this.selectedBranch,
      commitMessage: finalCommitMessage,
      agentCode: this.getAgentCodeForPush(),
      timestamp: new Date().toISOString()
    };
    
    console.log('Pushing to GitHub:', pushData);
    
    // Simulate API call
    setTimeout(() => {
      this.isPushing = false;
      console.log('Successfully pushed to GitHub!');
      // Show success message or notification
      alert(`Successfully pushed ${this.selectedAgent?.alias} to ${this.githubRepoName}/${this.selectedBranch}!`);
      this.closeGitHubPush();
    }, 3000);
  }
  
  getAgentCodeForPush(): any {
    // Mock: Return the generated agent code structure
    return {
      files: this.flattenFileStructure(this.fileSystemData),
      metadata: {
        agentName: this.selectedAgent?.name,
        agentAlias: this.selectedAgent?.alias,
        version: this.selectedAgent?.version,
        description: this.selectedAgent?.description,
        generatedAt: new Date().toISOString()
      }
    };
  }
  
  flattenFileStructure(nodes: FileNode[]): any[] {
    const files: any[] = [];
    
    const processNode = (node: FileNode, path: string = '') => {
      const fullPath = path ? `${path}/${node.name}` : node.name;
      
      if (node.type === 'file') {
        files.push({
          path: fullPath,
          content: node.content || '',
          type: 'file'
        });
      } else if (node.children) {
        files.push({
          path: fullPath,
          type: 'directory'
        });
        node.children.forEach(child => processNode(child, fullPath));
      }
    };
    
    nodes.forEach(node => processNode(node));
    return files;
  }
}
