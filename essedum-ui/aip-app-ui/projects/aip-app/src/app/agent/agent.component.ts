import {
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Services } from '../services/service';
import { MatDialog } from '@angular/material/dialog';
import { HttpParams } from '@angular/common/http';
import { catchError, of } from 'rxjs';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-agent',
  templateUrl: './agent.component.html',
  styleUrls: ['./agent.component.scss'],
})
export class AgentComponent implements OnInit {
  // Constants
  readonly CARD_TITLE = 'Agents';
  
  // Component state
  hoverStates: boolean[] = [];
  loading = true;
  lastRefreshedTime: Date | null = null;
  
  // Auth flags
  createAuth = true;
  editAuth = true;
  deleteAuth = true;
  deployAuth = true;
  
  // Data
  cards: any[] = [];
  paginatedCards: any[] = [];
  
  // Pagination
  pageNumber = 1;
  noOfPages = 0;
  pageArr: number[] = [1];
  startIndex = 0;
  endIndex = 0;
  totalItems = 0;
  
  constructor(
    private service: Services,
    private router: Router,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer
  ) {}
  
  ngOnInit(): void {
    this.lastRefreshedTime = new Date();
    this.currentIframeUrl = this.sanitizer.bypassSecurityTrustResourceUrl('https://langflow.az.ad.idemo-ppc.com/');
    this.loadAgents();
  }
  
  // Load agents from all flows (using the new getAllAgentFlows service)
  loadAgentsFromAllFlows(search: string = '') {
    this.loading = true;
    console.log(`🔍 Loading agents from all flows API... ${search ? 'Searching for: ' + search : ''}`);
    
    this.service.getAllAgentFlows(true, true)
      .pipe(
        catchError(error => {
          console.error('❌ Error loading agents from all flows API:', error);
          // Fall back to the original method if this fails
          console.log('Falling back to original loadAgents method...');
          return this.service.getAllAgents(this.pageNumber, 8, search);
        })
      )
      .subscribe((response) => {
        console.log("🚀 All agent flows response:", response);
        
        // Process the response - handle the nested structure from the API
        let flowsData = [];
        
        if (response && response.flows && Array.isArray(response.flows)) {
          // Check if the first element has the nested structure shown in the screenshot
          if (response.flows.length > 0 && response.flows[0].flows && Array.isArray(response.flows[0].flows)) {
            // Extract the actual flows array from the nested structure
            flowsData = response.flows[0].flows;
            console.log(`📊 Extracted ${flowsData.length} flows from nested structure`);
          } else {
            // Fallback: use the flows array directly
            flowsData = response.flows;
            console.log(`📊 Using flows array directly: ${flowsData.length} items`);
          }
        } else if (response && Array.isArray(response)) {
          // Fallback: direct array response
          flowsData = response;
          console.log(`📊 Using direct array response: ${flowsData.length} items`);
        }
        
        if (Array.isArray(flowsData) && flowsData.length > 0) {
          // Map the response to the expected card format
          let mappedAgents = flowsData.map(agent => ({
            cid: agent.id,
            name: agent.name,
            description: agent.description || 'No description provided',
            createdon: new Date(agent.created_at || new Date()),
            lastmodifiedon: new Date(agent.updated_at || new Date()),
            status: agent.is_component ? 'Component' : (agent.locked ? 'Locked' : 'Active'),
            type: agent.folder_name || 'Default',
            tags: agent.tags || []
          }));
          
          // Apply search filter if provided
          if (search && search.trim() !== '') {
            const searchLower = search.toLowerCase();
            mappedAgents = mappedAgents.filter(agent => 
              agent.name?.toLowerCase().includes(searchLower) || 
              agent.description?.toLowerCase().includes(searchLower) ||
              agent.type?.toLowerCase().includes(searchLower) ||
              agent.tags?.some(tag => tag.toLowerCase().includes(searchLower))
            );
            console.log(`🔍 Filtered agents by search term "${search}": ${mappedAgents.length} results`);
          }
          
          this.cards = mappedAgents;
          
          // Calculate pagination for the new data
          this.calculatePagination();
        } else {
          console.warn('⚠️ No valid flows data found in response:', response);
          // Initialize empty cards array
          this.cards = [];
          this.calculatePagination();
        }
        
        this.paginatedCards = [...this.cards];
        this.loading = false;
        this.lastRefreshedTime = new Date();
        this.cdr.detectChanges();
      });
  }
  
  // Load agents from service (original method kept for backward compatibility)
  loadAgents(search: string = '') {
    this.loading = true;
    
    // First try the new method that gets all flows - pass the search parameter through
    this.loadAgentsFromAllFlows(search);
  }
  
  // Fallback to original loading method if needed
  loadAgentsFallback(search: string = '') {
    // Explicitly set page size to 8 items per page
    const pageSize = 8;
    this.service.getAllAgents(this.pageNumber, pageSize, search)
      .pipe(
        catchError(error => {
          console.error('Error loading agents:', error);
          // Return empty array if API fails
          this.loading = false;
          this.cards = [];
          return of({ flows: { items: [] } });
        })
      )
      .subscribe((response) => {
        console.log("agent flow response:", response);
        
        // Check if response has the structure shown in screenshot (response.flows.items)
        if (response && response.flows && response.flows.items && Array.isArray(response.flows.items)) {
          console.log("Processing response.flows.items:", response.flows.items);
          
          this.cards = response.flows.items.map(agent => ({
            cid: agent.id,
            name: agent.name,
            description: agent.description || 'No description provided',
            createdon: new Date(agent.updated_at || new Date()),
            lastmodifiedon: new Date(agent.updated_at || new Date()),
            status: agent.locked ? 'Locked' : 'Active',
            type: agent.access_type,
            tags: agent.tags || []
          }));
          
          // Extract pagination metadata from the response
          if (response.flows.total !== undefined) {
            // Set up pagination based on API response
            this.totalItems = response.flows.total;
            const itemsPerPage = response.flows.size || 8;
            
            // Use the page and pages values directly from the response
            this.pageNumber = response.flows.page || this.pageNumber;
            this.noOfPages = response.flows.pages || Math.ceil(this.totalItems / itemsPerPage);
            
            // Generate page array with values from 0 to (noOfPages - 1)
            // This is important for the app-aip-pagination component
            this.pageArr = Array.from({length: this.noOfPages}, (_, i) => i);
            
            // Initialize hover states array to match the page array
            this.hoverStates = new Array(this.noOfPages).fill(false);
            
            this.startIndex = (this.pageNumber - 1) * itemsPerPage + 1;
            this.endIndex = Math.min(this.startIndex + this.cards.length - 1, this.totalItems);
            
            console.log(`Pagination: Page ${this.pageNumber}/${this.noOfPages}, Items ${this.startIndex}-${this.endIndex} of ${this.totalItems}`);
          } else {
            // Fallback to calculating based on current items
            this.calculatePagination();
          }
        } else {
          // If response doesn't have the expected structure, use what we got
          if (Array.isArray(response)) {
            this.cards = response;
          }
          this.calculatePagination();
        }
        
        this.paginatedCards = [...this.cards];
        this.loading = false;
        this.lastRefreshedTime = new Date();
        this.cdr.detectChanges();
      });
  }

  
  // Pagination methods
  calculatePagination() {
    const itemsPerPage = 8; // Changed from 10 to 8 to match the requested page size
    this.totalItems = this.cards.length;
    this.noOfPages = Math.ceil(this.cards.length / itemsPerPage);
    // Generate page array with values from 0 to (noOfPages - 1)
    // This is important for the app-aip-pagination component
    this.pageArr = Array.from({length: this.noOfPages}, (_, i) => i);
    this.startIndex = this.cards.length > 0 ? (this.pageNumber - 1) * itemsPerPage + 1 : 0;
    this.endIndex = Math.min(this.startIndex + itemsPerPage - 1, this.cards.length);
    
    // Ensure we always have at least one page
    if (this.noOfPages === 0) {
      this.noOfPages = 1;
      this.pageArr = [1];
    }
    
    // Initialize hover states array with the same length as pageArr
    this.hoverStates = new Array(this.noOfPages).fill(false);
    
    console.log(`Local pagination: Page ${this.pageNumber}/${this.noOfPages}, Items ${this.startIndex}-${this.endIndex} of ${this.cards.length}`);
  }
  
  onPrevPage() {
    if (this.pageNumber > 1) {
      this.pageNumber--;
      this.loading = true; // Show loading indicator
      console.log(`Navigating to previous page: ${this.pageNumber}`);
      this.loadAgents(); // Reload with new page number
    }
  }
  
  onNextPage() {
    if (this.pageNumber < this.noOfPages) {
      this.pageNumber++;
      this.loading = true; // Show loading indicator
      console.log(`Navigating to next page: ${this.pageNumber}`);
      this.loadAgents(); // Reload with new page number
    }
  }
  
  onChangePage(pageNum: number) {
    // The app-aip-pagination component sends page numbers starting from 1
    // but our API might expect 0-indexed page numbers, so we handle that here
    if (pageNum !== this.pageNumber) {
      this.pageNumber = pageNum;
      this.loading = true; // Show loading indicator
      console.log(`Navigating to page: ${this.pageNumber}`);
      this.loadAgents(); // Reload with new page number
    }
  }
  
  // Card interactions
  trackByCardId(index: number, card: any): string {
    return card.cid;
  }
  
  onSearch(searchTerm: string) {
    // Reset to page 1 when searching
    this.pageNumber = 1;
    
    // Call API with search parameter
    this.loadAgents(searchTerm);
  }
  
  onRefresh() {
    this.loading = true;
    this.lastRefreshedTime = new Date();
    setTimeout(() => {
      this.loadAgents();
    }, 500);
  }
  
  onAdd() {
    // Directly open Langflow agent builder interface in embedded view
    this.embedLangflow();
  }

  // Method to open Langflow directly in new tab
  openLangflowDirectly() {
    console.log('🌐 Opening Langflow directly...');
    window.open('https://langflow.az.ad.idemo-ppc.com/', '_blank');
  }

  // Embedded Langflow interface state
  showLangflowInterface = false;
  currentIframeUrl: SafeResourceUrl;

  // Method to embed Langflow in iframe
  embedLangflow() {
    this.currentIframeUrl = this.sanitizer.bypassSecurityTrustResourceUrl('https://langflow.az.ad.idemo-ppc.com/');
    this.showLangflowInterface = true;
  }

  // Method to close the embedded Langflow interface
  closeLangflowInterface() {
    this.showLangflowInterface = false;
    this.currentIframeUrl = this.sanitizer.bypassSecurityTrustResourceUrl('https://langflow.az.ad.idemo-ppc.com/');
  }
  
  viewAgentDetails(card: any) {
    // Open directly in embedded Langflow viewer
    const langflowViewUrl = `https://langflow.az.ad.idemo-ppc.com/flow/${card.cid}`;
    this.currentIframeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(langflowViewUrl);
    this.showLangflowInterface = true;
  }
  
  editAgent(id: string) {
    // Open agent directly in embedded Langflow editor for editing
    const langflowEditUrl = `https://langflow.az.ad.idemo-ppc.com/flow/${id}`;
    this.currentIframeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(langflowEditUrl);
    this.showLangflowInterface = true;
  }
  
  deleteAgent(id: string) {
    // Show loading state
    this.loading = true;
    
    // Call service to delete the agent
    this.service.deleteAgent(id)
      .pipe(
        catchError(error => {
          console.error('Error deleting agent:', error);
          alert(`Failed to delete agent: ${error.message || 'Unknown error'}`);
          this.loading = false;
          return of(null);
        })
      )
      .subscribe(response => {
        if (response !== null) {
          console.log('Agent deleted successfully:', response);
          
          // Update local data
          this.cards = this.cards.filter(card => card.cid !== id);
          this.paginatedCards = this.paginatedCards.filter(card => card.cid !== id);
          this.calculatePagination();
          
          // Show success message
          alert('Agent deleted successfully');
        }
        this.loading = false;
      });
  }
  
  onFilterStatusChange(event: any) {
    // Filter implementation would go here
  }
  
  // Empty state helper
  get shouldShowEmptyState(): boolean {
    return !this.loading && this.paginatedCards.length === 0;
  }
  
  // Pagination helper
  get shouldShowPagination(): boolean {
    return !this.loading && (this.noOfPages > 1 || this.cards.length > 8);
  }
}