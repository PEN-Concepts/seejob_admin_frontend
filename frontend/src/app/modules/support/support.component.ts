import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { TicketService } from "../../services/ticket.service";
import {
  SupportTicket,
  TicketFilter,
  PaginationParams,
  PaginatedResponse,
  Agent,
  TicketStatus,
  TicketPriority,
  TicketStatusType,
} from "../../models/ticket.models";

@Component({
  selector: "app-support",
  templateUrl: "./support.component.html",
  styleUrls: ["./support.component.css"],
})
export class SupportComponent implements OnInit {
  allTickets: SupportTicket[] = [];

  // Ticket collections
  activeTickets: SupportTicket[] = [];
  inProgressTickets: SupportTicket[] = [];
  completedTickets: SupportTicket[] = [];

  // Pagination
  activePagination = { page: 1, limit: 10, total: 0, totalPages: 0 };
  inProgressPagination = { page: 1, limit: 10, total: 0, totalPages: 0 };
  completedPagination = { page: 1, limit: 10, total: 0, totalPages: 0 };

  // Loading states
  loadingActive = false;
  loadingInProgress = false;
  loadingCompleted = false;

  // Filter and search
  searchQuery = "";
  selectedPriority: number | "" = "";
  selectedAgent: number | "" = "";

  // Data for dropdowns
  availableAgents: Agent[] = [];
  ticketStatuses: TicketStatus[] = [];
  ticketPriorities: TicketPriority[] = [];

  // Statistics
  ticketCounts = { active: 0, inProgress: 0, completed: 0, total: 0 };

  // Active tab
  activeTab: "active" | "inprogress" | "completed" = "active";
  activeTabIndex = 0;

  // Dropdown options for PrimeNG components
  priorityOptions: any[] = [];
  agentOptions: any[] = [];

  constructor(private ticketService: TicketService, private router: Router) {}

  ngOnInit(): void {
    this.loadInitialData();
  }

  async loadInitialData() {
    await this.loadSupportTicketList();
  }

  async loadSupportTicketList() {
    this.loadingActive = true;
    this.loadingInProgress = true;
    this.loadingCompleted = true;

    try {
      const response = await this.ticketService.getSupportTicketList();
      this.allTickets = response.tickets;
      this.ticketCounts = response.counts;
      this.setPriorityOptionsFromTickets(this.allTickets);
      this.applyLocalFilters();
    } catch (error) {
      this.allTickets = [];
      this.activeTickets = [];
      this.inProgressTickets = [];
      this.completedTickets = [];
      this.ticketCounts = {
        active: 0,
        inProgress: 0,
        completed: 0,
        total: 0,
      };
    } finally {
      this.loadingActive = false;
      this.loadingInProgress = false;
      this.loadingCompleted = false;
    }
  }

  // Load tickets by status
  async loadActiveTickets(page = 1) {
    this.activePagination.page = page;
    await this.loadSupportTicketList();
  }

  async loadInProgressTickets(page = 1) {
    this.inProgressPagination.page = page;
    await this.loadSupportTicketList();
  }

  async loadCompletedTickets(page = 1) {
    this.completedPagination.page = page;
    await this.loadSupportTicketList();
  }

  async loadAgents() {
    try {
      this.availableAgents = await this.ticketService.getAvailableAgents();
      // Convert to PrimeNG dropdown format
      this.agentOptions = this.availableAgents.map((agent) => ({
        label: agent.agent_name,
        value: agent.id,
      }));
    } catch (error) {
      this.agentOptions = [];
    }
  }

  async loadStatuses() {
    try {
      this.ticketStatuses = await this.ticketService.getAllStatuses();
    } catch (error) {
      // error handled silently
    }
  }

  async loadPriorities() {
    try {
      this.ticketPriorities = await this.ticketService.getAllPriorities();
      // Convert to PrimeNG dropdown format
      this.priorityOptions = this.ticketPriorities.map((priority) => ({
        label: priority.name,
        value: priority.id,
      }));
    } catch (error) {
      this.ticketPriorities = [];
      this.priorityOptions = [];
    }
  }

  async loadTicketCounts() {
    await this.loadSupportTicketList();
  }

  // Navigation and actions
  viewTicketDetail(ticketId: number) {
    this.router.navigate(["/support/ticket", ticketId]);
  }

  editTicket(ticketId: number) {
    this.router.navigate(["/support/ticket", ticketId, "edit"]);
  }

  createNewTicket() {
    this.router.navigate(["/support/ticket/new"]);
  }

  // Quick actions
  async quickAssignTicket(ticketId: number, agentId: number) {
    try {
      await this.ticketService.assignTicket({
        ticket_id: ticketId,
        assigned_to: agentId,
        comment: `Ticket assigned via quick action`,
      });

      // Reload the appropriate tab
      this.refreshCurrentTab();
    } catch (error) {
      // error handled silently
    }
  }

  async quickStatusUpdate(ticketId: number, statusId: number) {
    try {
      await this.ticketService.updateTicketStatus(
        ticketId,
        statusId,
        "Status updated via quick action"
      );

      // Reload all tabs as ticket might move between them
      this.loadSupportTicketList();
    } catch (error) {
      // error handled silently
    }
  }

  // Search and filtering
  async applyFilters() {
    this.applyLocalFilters();
  }

  private async loadFilteredTickets(
    type: "active" | "inprogress" | "completed",
    filter: TicketFilter
  ) {
    const pagination: PaginationParams = { page: 1, limit: 10 };

    try {
      let response: PaginatedResponse<SupportTicket>;

      switch (type) {
        case "active":
          filter.status_id = TicketStatusType.ACTIVE;
          response = await this.ticketService.getAllTickets(filter, pagination);
          this.activeTickets = response.data;
          this.activePagination.total = response.total;
          this.activePagination.totalPages = response.totalPages;
          break;
        case "inprogress":
          filter.status_id = TicketStatusType.IN_PROGRESS;
          response = await this.ticketService.getAllTickets(filter, pagination);
          this.inProgressTickets = response.data;
          this.inProgressPagination.total = response.total;
          this.inProgressPagination.totalPages = response.totalPages;
          break;
        case "completed":
          filter.status_id = TicketStatusType.COMPLETED;
          response = await this.ticketService.getAllTickets(filter, pagination);
          this.completedTickets = response.data;
          this.completedPagination.total = response.total;
          this.completedPagination.totalPages = response.totalPages;
          break;
      }
    } catch (error) {
      // error handled silently
    }
  }

  clearFilters() {
    this.searchQuery = "";
    this.selectedPriority = "";
    this.selectedAgent = "";
    this.applyLocalFilters();
  }

  // Pagination handlers
  onActivePageChange(page: number) {
    this.loadActiveTickets(page);
  }

  onInProgressPageChange(page: number) {
    this.loadInProgressTickets(page);
  }

  onCompletedPageChange(page: number) {
    this.loadCompletedTickets(page);
  }

  // Utility methods
  refreshCurrentTab() {
    this.loadSupportTicketList();
  }

  refreshAllTabs() {
    this.loadSupportTicketList();
  }

  setActiveTab(tab: "active" | "inprogress" | "completed") {
    this.activeTab = tab;
  }

  getStatusColor(statusId: number): string {
    return this.ticketService.getStatusColor(statusId);
  }

  getPriorityColor(priority: string): string {
    return this.ticketService.getPriorityColor(priority);
  }

  formatDate(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleDateString() + " " + d.toLocaleTimeString();
  }

  truncateText(text: string, maxLength: number): string {
    if (!text) return "";
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  }

  isOverdue(dueDate: Date | string): boolean {
    if (!dueDate) return false;
    const due = new Date(dueDate);
    const now = new Date();
    return due < now;
  }

  isDueSoon(dueDate: Date | string): boolean {
    if (!dueDate) return false;
    const due = new Date(dueDate);
    const now = new Date();
    const diffInHours = (due.getTime() - now.getTime()) / (1000 * 60 * 60);
    return diffInHours > 0 && diffInHours <= 24; // Due within 24 hours
  }

  // PrimeNG TabView methods
  onTabChange(event: any) {
    this.activeTabIndex = event.index;
    switch (event.index) {
      case 0:
        this.activeTab = "active";
        break;
      case 1:
        this.activeTab = "inprogress";
        break;
      case 2:
        this.activeTab = "completed";
        break;
    }
  }

  // Priority severity mapping for PrimeNG tags
  getPrioritySeverity(priorityId: number): string {
    // Map priority IDs to PrimeNG tag severities
    switch (priorityId) {
      case 1: // Low
        return "success";
      case 2: // Medium
        return "warning";
      case 3: // High
        return "danger";
      case 4: // Critical
        return "danger";
      default:
        return "info";
    }
  }

  private applyLocalFilters() {
    const query = this.searchQuery.trim().toLowerCase();
    const priorityId = this.selectedPriority ? Number(this.selectedPriority) : null;
    const agentId = this.selectedAgent ? Number(this.selectedAgent) : null;

    const filtered = this.allTickets.filter((ticket) => {
      const matchesSearch =
        !query ||
        [
          ticket.ticket_number,
          ticket.subject,
          ticket.description,
          ticket.client_email,
          ticket.client_phone,
          ticket.priority?.name,
          ticket.status?.name,
        ]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(query));

      const matchesPriority = !priorityId || Number(ticket.priority_id) === priorityId;
      const matchesAgent = !agentId || Number(ticket.assigned_to) === agentId;

      return matchesSearch && matchesPriority && matchesAgent;
    });

    this.activeTickets = filtered.filter((ticket) => this.isStatus(ticket, "active"));
    this.inProgressTickets = filtered.filter((ticket) =>
      this.isStatus(ticket, "in progress")
    );
    this.completedTickets = filtered.filter((ticket) =>
      this.isStatus(ticket, "completed")
    );

    this.activePagination.total = this.activeTickets.length;
    this.inProgressPagination.total = this.inProgressTickets.length;
    this.completedPagination.total = this.completedTickets.length;
  }

  private isStatus(ticket: SupportTicket, statusName: string): boolean {
    return String(ticket.status?.name || "")
      .trim()
      .toLowerCase() === statusName;
  }

  private setPriorityOptionsFromTickets(tickets: SupportTicket[]) {
    const priorities = new Map<number, string>();
    tickets.forEach((ticket) => {
      if (ticket.priority_id && ticket.priority?.name) {
        priorities.set(Number(ticket.priority_id), ticket.priority.name);
      }
    });

    this.priorityOptions = Array.from(priorities.entries()).map(([value, label]) => ({
      label,
      value,
    }));
  }

  getResolutionTime(
    createdAt: Date | string,
    resolvedAt: Date | string
  ): string {
    if (!createdAt || !resolvedAt) return "N/A";

    const created = new Date(createdAt);
    const resolved = new Date(resolvedAt);
    const diffInMs = resolved.getTime() - created.getTime();

    const days = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (diffInMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor((diffInMs % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) {
      return `${days}d ${hours}h`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  }
}
