import { Component, Input, OnInit, EventEmitter, Output } from '@angular/core';
import { GitHubService } from '../services/github.service';
import { GitHubRepository, PushRequest, PullRequest } from '../models/github.models';
import { AgentPipelineService } from '../../agent-pipeline/agent-pipeline.service';
import JSZip from 'jszip';
import { Services } from '../../services/service';
@Component({
  selector: 'app-github-push',
  templateUrl: './github-push.component.html',
  styleUrls: ['./github-push.component.scss']
})
export class GitHubPushComponent implements OnInit {
  @Input() mode: 'push' | 'pull' = 'push';
  @Output() zipFileCreated = new EventEmitter<File>();
  
  // Authentication state
  isAuthenticated = false;
  username = '';
  isLoading = false;

  // Repository data
  repositories: GitHubRepository[] = [];
  branches: string[] = [];

  // Form data
  selectedRepo = '';
  selectedRepoObject: GitHubRepository | null = null;
  selectedBranch = '';
  useCustomMessage = false;
  commitMessage = '';
  localPath = '/server/path/to/files'; // Server-side path
  
  // Pull mode specific
  repoUrl = '';
  extractedRepoName = '';

  // UI state
  showModal = false;
  errorMessage = '';
  successMessage = '';

  @Input() cname: string;
  constructor(private githubService: GitHubService,
    private agentPipelineService: AgentPipelineService,
    private service: Services,
  ) { }

  ngOnInit(): void {
    this.checkAuthStatus();
  }

  /**
   * Check if user is already authenticated
   */
  checkAuthStatus(): void {
    this.githubService.checkAuthStatus().subscribe({
      next: (status) => {
        this.isAuthenticated = status.authenticated;
        if (status.authenticated && status.githubUsername) {
          this.username = status.githubUsername;
          
          // Store username in sessionStorage
          sessionStorage.setItem('git_username', this.username);
          //this.updateGitHubConfig();
          
          this.loadRepositories();
        }
      },
      error: (error) => {
        console.error('Error checking auth status:', error);
      }
    });
  }

  /**
   * Open modal
   */
  openModal(): void {
    this.errorMessage = '';
    this.successMessage = '';

    // For pull mode, we don't need authentication
    if (this.mode === 'pull') {
      this.showModal = true;
      return;
    }

    // For push mode, authentication is required
    if (!this.isAuthenticated) {
      // User needs to login - trigger login automatically
      this.login();
      return;
    }

    // User already authenticated, show modal with repos
    this.showModal = true;
    if (this.repositories.length === 0) {
      this.loadRepositories();
    }
  }

  /**
   * Get modal title based on mode
   */
  getModalTitle(): string {
    return this.mode === 'push' ? 'Push to GitHub' : 'Upload from GitHub';
  }

  /**
   * Get button text based on mode
   */
  getButtonText(): string {
    return this.mode === 'push' ? 'Push to GitHub' : 'Upload from GitHub';
  }

  /**
   * Close modal
   */
  closeModal(): void {
    this.showModal = false;
    this.resetForm();
  }

  /**
   * Initiate GitHub login
   */
  login(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.githubService.initiateOAuthFlow().subscribe({
      next: (status) => {
        this.isLoading = false;
        this.isAuthenticated = true;
        this.username = status.githubUsername || '';
        
        // // Store username in sessionStorage
        // sessionStorage.setItem('git_username', this.username);
        //this.updateGitHubConfig();
        
        this.showModal = true;
        this.loadRepositories();
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.message || 'Authentication failed. Please try again.';
        this.showModal = true; // Show modal with error message
      }
    });
  }

  /**
   * Logout
   */
  logout(): void {
    this.isLoading = true;
    this.githubService.logout().subscribe({
      next: () => {
        // Clear local state
        this.isAuthenticated = false;
        this.username = '';
        this.repositories = [];
        this.branches = [];
        this.resetForm();
        this.isLoading = false;

        // Clear sessionStorage
        // sessionStorage.removeItem('git_username');
        // sessionStorage.removeItem('git_selected_Repo');
        // sessionStorage.removeItem('git_selected_branch');
        // sessionStorage.removeItem('github_config');

        // Show message to user about logging out from GitHub
        this.successMessage = 'Logged out successfully. Next login will prompt for account selection.';
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);

        // Keep modal open to allow login to different account
      },
      error: (error) => {
        console.error('Logout error:', error);
        this.isLoading = false;
        this.errorMessage = 'Failed to logout. Please try again.';
      }
    });
  }

  /**
   * Load repositories
   */
  loadRepositories(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.githubService.getRepositories().subscribe({
      next: (repos) => {
        this.repositories = repos;
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = 'Failed to load repositories: ' + error.message;
      }
    });
  }

  /**
   * Handle repository selection
   */
  onRepoChange(): void {
    if (!this.selectedRepo) {
      this.branches = [];
      this.selectedRepoObject = null;
      //sessionStorage.removeItem('git_selected_Repo');
      //this.updateGitHubConfig();
      return;
    }

    // Find and store the selected repository object
    this.selectedRepoObject = this.repositories.find(repo => repo.fullName === this.selectedRepo) || null;

    // Store selected repo in sessionStorage
    //sessionStorage.setItem('git_selected_Repo', this.selectedRepo);
    this.loadSourceBranch();
    //this.updateGitHubConfig();

    this.isLoading = true;
    this.errorMessage = '';

    this.githubService.getBranches(this.selectedRepo).subscribe({
      next: (branches) => {
        this.branches = branches;
        if (!this.selectedBranch || !branches.includes(this.selectedBranch)) {
          this.selectedBranch = branches.length > 0 ? branches[0] : '';
        }
        
        // Store selected branch in sessionStorage
        //sessionStorage.setItem('git_selected_branch', this.selectedBranch);
        //this.updateGitHubConfig();
        
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = 'Failed to load branches: ' + error.message;
      }
    });
  }

  /**
   * Handle branch selection change
   */
  onBranchChange(): void {
    if (this.selectedBranch) {
      // Store selected branch in sessionStorage
      //sessionStorage.setItem('git_selected_branch', this.selectedBranch);
      //this.updateGitHubConfig();
    }
  }

  /**
   * Update GitHub config object in sessionStorage
   */
  // updateGitHubConfig(): void {
  //   const githubConfig = {
  //     git_username: sessionStorage.getItem('git_username') || this.username || '',
  //     git_selected_Repo: sessionStorage.getItem('git_selected_Repo') || this.selectedRepo || '',
  //     git_selected_branch: sessionStorage.getItem('git_selected_branch') || this.selectedBranch || ''
  //   };
    
    //sessionStorage.setItem('github_config', JSON.stringify(githubConfig));
  //}

  /**
   * Handle repository URL input change (Pull mode only)
   */
  onRepoUrlChange(): void {
    this.branches = [];
    this.selectedBranch = '';
    this.errorMessage = '';
    this.extractedRepoName = '';

    if (!this.repoUrl.trim()) {
      return;
    }

    // Extract owner/repo from URL
    const repoName = this.extractRepoFromUrl(this.repoUrl);
    if (!repoName) {
      this.errorMessage = 'Invalid GitHub repository URL. Expected format: https://github.com/owner/repository';
      return;
    }

    this.extractedRepoName = repoName;

    // Fetch branches for the repository
    this.isLoading = true;
    this.githubService.getBranches(repoName).subscribe({
      next: (branches) => {
        this.branches = branches;
        this.selectedBranch = branches.length > 0 ? branches[0] : '';
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = 'Failed to load branches: ' + (error.error?.message || error.message || 'Repository may not exist or is not public');
      }
    });
  }

  /**
   * Extract owner/repo from GitHub URL
   */
  extractRepoFromUrl(url: string): string | null {
    try {
      // Remove trailing slashes
      url = url.trim().replace(/\/+$/, '');

      // Try to match GitHub URL patterns
      // Supports: https://github.com/owner/repo, github.com/owner/repo, owner/repo
      const patterns = [
        /github\.com\/([^\/]+)\/([^\/]+)/i,  // https://github.com/owner/repo or github.com/owner/repo
        /^([^\/]+)\/([^\/]+)$/                // owner/repo
      ];

      for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) {
          const owner = match[1];
          const repo = match[2].replace(/\.git$/, ''); // Remove .git if present
          return `${owner}/${repo}`;
        }
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Generate default commit message
   */
  getCommitMessage(): string {
    if (this.useCustomMessage && this.commitMessage.trim()) {
      return this.commitMessage.trim();
    }
    return `Automated commit - ${new Date().toISOString()}`;
  }

  /**
   * Push to GitHub
   */
  pushToGitHub(): void {
    if (!this.selectedRepo || !this.selectedBranch) {
      this.errorMessage = 'Please select a repository and branch';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.agentPipelineService.getFilesList(this.cname).subscribe({
      next: (fetchedFiles) => {
        console.log('Fetched files:', fetchedFiles);

        const request: PushRequest = {
          repoName: this.selectedRepo,
          branch: this.selectedBranch,
          commitMessage: this.getCommitMessage(),
          files: fetchedFiles.map(file => ({
            path: file.filePath,
            fileName: file.filename,
            id: file.id,
            content: file.filescript
          }))
        };

        this.githubService.pushToGitHub(request).subscribe({
          next: (response) => {
            this.isLoading = false;
            this.successMessage = response;
            this.saveGitConfig();
            setTimeout(() => this.closeModal(), 2000);
          },
          error: (error) => {
            this.isLoading = false;
            this.errorMessage = 'Push failed: ' + (error.error || error.message);
          }
        });
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = 'Failed to fetch files: ' + (error.error || error.message);
      }
    });
  }

  /**
   * Pull from GitHub
   */
  pullFromGitHub(): void {
    if (!this.selectedBranch) {
      this.errorMessage = 'Please select a branch';
      return;
    }

    if (!this.repoUrl || !this.extractedRepoName) {
      this.errorMessage = 'Please enter a valid GitHub repository URL';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Use the URL provided by the user
    const repoUrl = this.repoUrl.trim();

    const request: PullRequest = {
      repoUrl: repoUrl,
      branch: this.selectedBranch
    };

    this.githubService.pullFromGitHub(request).subscribe({
      next: (response) => {
        console.log('Pull response:', response);
        this.successMessage = 'Successfully pulled from GitHub! Creating ZIP file...';
        
        // Convert files to ZIP
        this.createZipFromPulledFiles(response.files).then((zipFile) => {
          this.isLoading = false;
          this.successMessage = 'ZIP file created successfully!';
          
          // Emit the zip file for parent component to handle upload
          this.zipFileCreated.emit(zipFile);
          
          setTimeout(() => this.closeModal(), 2000);
        }).catch((error) => {
          this.isLoading = false;
          this.errorMessage = 'Failed to create ZIP file: ' + error.message;
        });
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = 'Pull failed: ' + (error.error?.message || error.message || 'Unknown error');
      }
    });
  }

  /**
   * Create ZIP file from pulled files
   */
  private async createZipFromPulledFiles(files: any[]): Promise<File> {
    const zip = new JSZip();
    
    // For pull mode, use extracted repo name
    const repoName = this.mode === 'pull' && this.extractedRepoName 
      ? this.extractedRepoName.split('/')[1] || 'repository'
      : this.selectedRepo.split('/')[1] || 'repository';
      
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
    const zipFileName = `${repoName}-${this.selectedBranch}-${timestamp}.zip`;

    // Add each file to the zip
    for (const file of files) {
      const filePath = file.path || file.fileName || 'unknown';
      const content = file.content || '';
      
      // Add file to zip with its path
      zip.file(filePath, content);
    }

    // Generate the zip file as a Blob
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    
    // Convert Blob to File
    const zipFile = new File([zipBlob], zipFileName, { type: 'application/zip' });
    
    return zipFile;
  }

  /**
   * Execute the appropriate action based on mode
   */
  executeAction(): void {
    if (this.mode === 'push') {
     this.pushToGitHub();
    } else {
      this.pullFromGitHub();
    }
  }

  /**
   * Check if action can be executed
   */
  canExecuteAction(): boolean {
    if (this.mode === 'push') {
      return !!(this.selectedRepo && this.selectedBranch);
    } else {
      return !!(this.repoUrl && this.extractedRepoName && this.selectedBranch);
    }
  }

  /**
   * Save git configuration after successful push
   */
  saveGitConfig(): void {
    if (!this.cname || !this.selectedRepo || !this.selectedBranch) {
      this.service.message('Missing required data for saving git config','warning');
      return;
    }

    const currentUser = sessionStorage.getItem('username') || 'demo';
    const gitConfigPayload = {
      id: null,
      cname: this.cname,
      org: sessionStorage.getItem('organization'),
      bname: this.selectedBranch,
      repo: this.selectedRepo,
      gituser: this.username,
      createdby: currentUser,
      createdat: new Date().toISOString(),
      updatedby: currentUser,
      updatedat: new Date().toISOString()
    };

    this.githubService.saveGitConfig(gitConfigPayload).subscribe({
      next: (response) => {
          this.service.message(
              'Git config saved successfully.',
              'success'
            );
      },
      error: (error) => {
         const errorMessage =error?.details || 'Failed to save git config';
        this.service.message(errorMessage, 'error');
      }
    });
  }

  /**
   * Load source branch from API and pre-populate if available
   */
  loadSourceBranch(): void {
    if (!this.cname || !sessionStorage.getItem('organization')) {
      return;
    }
    this.service.getGitConfig(this.cname,  sessionStorage.getItem('organization')).subscribe(
      (response) => {
        if (response) {
          this.selectedBranch = response.bname;
        }
      },
      (error) => {
          const errorMessage =error?.details || 'Error loading source branch configuration';
        this.service.message(errorMessage, 'error');
      }
    );
  }


  /**
   * Reset form
   */
  resetForm(): void {
    this.selectedRepo = '';
    this.selectedRepoObject = null;
    this.selectedBranch = '';
    this.branches = [];
    this.useCustomMessage = false;
    this.commitMessage = '';
    this.errorMessage = '';
    this.successMessage = '';
    this.repoUrl = '';
    this.extractedRepoName = '';
  }
}