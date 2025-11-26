import { Component, OnInit } from '@angular/core';
import { GitHubService } from '../services/github.service';
import { GitHubRepository, PushRequest } from '../models/github.models';

@Component({
  selector: 'app-github-push',
  templateUrl: './github-push.component.html',
  styleUrls: ['./github-push.component.scss']
})
export class GitHubPushComponent implements OnInit {
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

  // UI state
  showModal = false;
  errorMessage = '';
  successMessage = '';

  constructor(private githubService: GitHubService) { }

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
        this.username = status.githubUsername|| '';
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
    this.githubService.logout().subscribe({
      next: () => {
        this.isAuthenticated = false;
        this.username = '';
        this.repositories = [];
        this.branches = [];
        this.resetForm();
      },
      error: (error) => {
        console.error('Logout error:', error);
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
      return;
    }

    // Find and store the selected repository object
    this.selectedRepoObject = this.repositories.find(repo => repo.fullName === this.selectedRepo) || null;

    this.isLoading = true;
    this.errorMessage = '';

    this.githubService.getBranches(this.selectedRepo).subscribe({
      next: (branches) => {
        this.branches = branches;
        this.selectedBranch = branches.length > 0 ? branches[0] : '';
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = 'Failed to load branches: ' + error.message;
      }
    });
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

    const request: PushRequest = {
      repoName: this.selectedRepo,
      branch: this.selectedBranch,
      commitMessage: this.getCommitMessage(),
      localPath: this.localPath
    };

    this.githubService.pushToGitHub(request).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.successMessage = response;
        setTimeout(() => this.closeModal(), 2000);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = 'Push failed: ' + (error.error || error.message);
      }
    });
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
  }
}