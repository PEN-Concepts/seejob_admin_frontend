import { Component, OnInit, ChangeDetectorRef } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { TicketService } from "../../../services/ticket.service";
import {
  SupportTicket,
  TicketComment,
  TicketStatus,
  TicketPriority,
  User,
  Agent,
  CreateCommentRequest,
  UpdateTicketRequest,
  PriorityLevel,
  TicketPriorityType,
} from "../../../models/ticket.models";

@Component({
  selector: "app-ticket-detail",
  templateUrl: "./ticket-detail.component.html",
  styleUrls: ["./ticket-detail.component.css"],
})
export class TicketDetailComponent implements OnInit {
  ticket: SupportTicket | null = null;
  comments: TicketComment[] = [];
  availableAgents: Agent[] = [];
  ticketStatuses: TicketStatus[] = [];
  ticketPriorities: TicketPriority[] = [];

  // Loading states
  loading = true;
  loadingComments = false;
  updating = false;

  // Edit mode
  editMode = false;

  // Form data
  editForm = {
    subject: "",
    description: "",
    priority_id: 1,
    assigned_to: 0,
    status_id: 1,
    due_date: "",
    client_name: "",
    client_email: "",
    client_phone: "",
  };

  // Comment form
  newComment = {
    comment: "",
    is_internal: true,
  };

  // File upload
  selectedFile: File | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private ticketService: TicketService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit(): Promise<void> {
    // Load support data first
    try {
      await this.loadSupportData();
    } catch (error) {
      console.error("Error loading initial support data:", error);
    }

    this.route.params.subscribe((params) => {
  const ticketId = params["id"];

  if (!ticketId || ticketId === "new") {
    console.log('here');
    this.editMode = false;
    this.createNewTicket(); // don't navigate again
  } else {
    this.editMode = true;
    this.loadTicket(+ticketId);
  }
});
  }

  async loadTicket(id: number) {
    this.loading = true;
    try {
      this.ticket = await this.ticketService.getTicketById(id);
      this.initializeEditForm();
      await this.loadComments();
    } catch (error) {
      console.error("Error loading ticket:", error);
      this.router.navigate(["/support"]);
    } finally {
      this.loading = false;
    }
  }

  async loadComments() {
    if (!this.ticket) return;

    this.loadingComments = true;
    try {
      this.comments = await this.ticketService.getTicketComments(
        this.ticket.id
      );
    } catch (error) {
      console.error("Error loading comments:", error);
    } finally {
      this.loadingComments = false;
    }
  }

  async loadSupportData() {
    try {
      console.log("Loading support data...");

      // Load each one separately with error handling
      let agents: Agent[] = [];
      let statuses: TicketStatus[] = [];
      let priorities: TicketPriority[] = [];

      try {
        agents = await this.ticketService.getAvailableAgents();
        console.log("Loaded agents:", agents);
      } catch (error) {
        console.error("Error loading agents:", error);
      }

      try {
        statuses = await this.ticketService.getAllStatuses();
        console.log("Loaded statuses:", statuses);
      } catch (error) {
        console.error("Error loading statuses:", error);
      }

      try {
        priorities = await this.ticketService.getAllPriorities();
        console.log("Loaded priorities:", priorities);
      } catch (error) {
        console.error("Error loading priorities:", error);
      }

      this.availableAgents = agents;
      this.ticketStatuses = statuses;
      this.ticketPriorities = priorities;

      console.log("Final support data:", {
        agents: this.availableAgents.length,
        statuses: this.ticketStatuses.length,
        priorities: this.ticketPriorities.length,
      });

      // Force change detection
      this.cdr.detectChanges();
    } catch (error) {
      console.error("Error loading support data:", error);
    }
  }

  createNewTicket() {
    console.log("Creating new ticket...");
    this.editMode = true;
    this.ticket = null;
    this.loading = false;

    // Always ensure support data is loaded before initializing form
    if (
      this.ticketPriorities.length === 0 ||
      this.ticketStatuses.length === 0 ||
      this.availableAgents.length === 0
    ) {
      console.log("Loading support data for new ticket...");
      this.loadSupportData()
        .then(() => {
          console.log("Support data loaded, initializing form...");
          this.initializeEditForm();
        })
        .catch((error) => {
          console.error("Error loading support data:", error);
          // Initialize form with defaults even if support data fails
          this.initializeEditForm();
        });
    } else {
      console.log("Support data already available, initializing form...");
      this.initializeEditForm();
    }
  }

  initializeEditForm() {
    if (this.ticket) {
      this.editForm = {
        subject: this.ticket.subject,
        description: this.ticket.description,
        priority_id: this.ticket.priority_id,
        assigned_to: this.ticket.assigned_to || 0,
        status_id: this.ticket.status_id,
        due_date: this.ticket.due_date
          ? new Date(this.ticket.due_date).toISOString().split("T")[0]
          : "",
        client_name: this.ticket.client_name || "",
        client_email: this.ticket.client_email || "",
        client_phone: this.ticket.client_phone || "",
      };
    } else {
      // For new tickets, set defaults based on available data
      let defaultPriorityId = 2; // Default to Medium priority
      let defaultStatusId = 1; // Default to Active status

      // Use actual data if available
      if (this.ticketPriorities.length > 0) {
        const mediumPriority = this.ticketPriorities.find((p) =>
          p.name.toLowerCase().includes("medium")
        );
        if (mediumPriority) {
          defaultPriorityId = mediumPriority.id;
        } else {
          defaultPriorityId = this.ticketPriorities[0].id;
        }
      }

      if (this.ticketStatuses.length > 0) {
        const activeStatus = this.ticketStatuses.find((s) =>
          s.name.toLowerCase().includes("active")
        );
        if (activeStatus) {
          defaultStatusId = activeStatus.id;
        } else {
          defaultStatusId = this.ticketStatuses[0].id;
        }
      }

      this.editForm = {
        subject: "",
        description: "",
        priority_id: defaultPriorityId,
        assigned_to: 0,
        status_id: defaultStatusId,
        due_date: "",
        client_name: "",
        client_email: "",
        client_phone: "",
      };
    }

    console.log("Form initialized:", this.editForm);
    console.log("Priorities available:", this.ticketPriorities);
    console.log("Statuses available:", this.ticketStatuses);

    // Force change detection after setting form values
    this.cdr.detectChanges();
  }

  onPriorityChange(event: any) {
    // Handle priority selection
  }

  async saveTicket() {
    if (!this.editForm.subject.trim() || !this.editForm.description.trim()) {
      alert("Please fill in the subject and description fields.");
      return;
    }

    this.updating = true;
    try {
      if (this.ticket) {
        // Update existing ticket
        const updateData: UpdateTicketRequest = {
  subject: this.editForm.subject,
  message: this.editForm.description, // FIX
  priority_id: this.editForm.priority_id,
  assigned_to: this.editForm.assigned_to || undefined,
  status_id: this.editForm.status_id,
  due_date: this.editForm.due_date
    ? new Date(this.editForm.due_date)
    : undefined,
  client_name: this.editForm.client_name || null,
  client_email: this.editForm.client_email || null,
  client_phone: this.editForm.client_phone || null,
};

        console.log("Updating ticket with data:", updateData);
        this.ticket = await this.ticketService.updateTicket(
          this.ticket.id,
          updateData
        );
        console.log("Ticket updated successfully:", this.ticket);

        // Reload comments after update
        await this.loadComments();
      } else {
        // Create new ticket
        const createData = {
          subject: this.editForm.subject,
          description: this.editForm.description,
          priority_id: this.editForm.priority_id,
          assigned_to: this.editForm.assigned_to || undefined,
          due_date: this.editForm.due_date
            ? new Date(this.editForm.due_date)
            : undefined,
          client_name: this.editForm.client_name,
          client_email: this.editForm.client_email,
          client_phone: this.editForm.client_phone,
        };

        console.log("Creating new ticket with data:", createData);
        this.ticket = await this.ticketService.createTicket(createData);
        console.log("Ticket created successfully:", this.ticket);

        // Navigate to the new ticket
        this.router.navigate(["/support/ticket", this.ticket.id]);
        return; // Exit here as navigation will reload the component
      }

      this.editMode = false;
      this.initializeEditForm(); // Refresh form with updated data
    } catch (error) {
      console.error("Error saving ticket:", error);
      alert("Failed to save ticket. Please try again.");
    } finally {
      this.updating = false;
    }
  }

  cancelEdit() {
    if (this.ticket) {
      this.editMode = false;
      this.initializeEditForm();
    } else {
      // Go back to support list if creating new ticket
      this.router.navigate(["/support"]);
    }
  }

  async updateStatus(statusId: number) {
    if (!this.ticket) return;

    this.updating = true;
    try {
      this.ticket = await this.ticketService.updateTicketStatus(
        this.ticket.id,
        statusId,
        "Status updated from ticket details"
      );
      await this.loadComments(); // Reload comments to show status change
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      this.updating = false;
    }
  }

  async assignTicket(agentId: number) {
    if (!this.ticket) return;

    this.updating = true;
    try {
      this.ticket = await this.ticketService.assignTicket({
        ticket_id: this.ticket.id,
        assigned_to: agentId,
        comment: "Ticket assigned from details view",
      });
      await this.loadComments(); // Reload comments to show assignment change
    } catch (error) {
      console.error("Error assigning ticket:", error);
    } finally {
      this.updating = false;
    }
  }

  async addComment() {
    if (!this.ticket || !this.newComment.comment.trim()) return;

    try {
      const commentData: CreateCommentRequest = {
        ticket_id: this.ticket.id,
        comment: this.newComment.comment,
        is_internal: this.newComment.is_internal,
      };

      const newComment = await this.ticketService.addComment(commentData);
      this.comments.push(newComment);
      this.newComment.comment = "";
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  }

  async deleteComment(commentId: number) {
    if (!confirm("Are you sure you want to delete this comment?")) return;

    try {
      await this.ticketService.deleteComment(commentId);
      this.comments = this.comments.filter((c) => c.id !== commentId);
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0] || null;
  }

  async uploadFile() {
    if (!this.ticket || !this.selectedFile) return;

    try {
      await this.ticketService.uploadAttachment(
        this.ticket.id,
        this.selectedFile
      );
      this.selectedFile = null;

      // Reload ticket to show new attachment
      await this.loadTicket(this.ticket.id);
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  }

  async deleteAttachment(attachmentId: number) {
    if (!confirm("Are you sure you want to delete this attachment?")) return;

    try {
      await this.ticketService.deleteAttachment(attachmentId);

      // Reload ticket to update attachments
      if (this.ticket) {
        await this.loadTicket(this.ticket.id);
      }
    } catch (error) {
      console.error("Error deleting attachment:", error);
    }
  }

  goBack() {
    this.router.navigate(["/support"]);
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

  getStatusName(statusId: number): string {
    const status = this.ticketStatuses.find((s) => s.id === statusId);
    return status?.name || "Unknown";
  }

  getAgentName(agentId: number): string {
    const agent = this.availableAgents.find((a) => a.id === agentId);
    return agent?.agent_name || "Unassigned";
  }
}
