import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { 
  SupportTicket, 
  TicketComment, 
  TicketStatus, 
  TicketPriority,
  User,
  Agent,
  TicketFilter,
  PaginationParams,
  PaginatedResponse,
  CreateTicketRequest,
  UpdateTicketRequest,
  CreateCommentRequest,
  TicketAssignmentRequest,
  TicketStatusType,
  TicketPriorityType,
  PriorityLevel
} from '../models/ticket.models';

@Injectable({
  providedIn: 'root'
})
export class TicketService {

  constructor(private api: ApiService) { }

  async getSupportTicketList(): Promise<{
    tickets: SupportTicket[],
    counts: { active: number, inProgress: number, completed: number, total: number }
  }> {
    const response = await this.api.get('admin_contactRequest/support_ticket_list') as any;
    const rows = Array.isArray(response?.data) ? response.data : [];
    const counts = response?.counts || {};

    return {
      tickets: rows.map((ticket: any) => this.transformSupportTicketListRow(ticket)),
      counts: {
        active: Number(counts.active) || 0,
        inProgress: Number(counts.in_progress ?? counts.inProgress) || 0,
        completed: Number(counts.completed) || 0,
        total: Number(counts.total) || 0,
      },
    };
  }

  // Ticket CRUD Operations
  async getAllTickets(filter?: TicketFilter, pagination?: PaginationParams): Promise<PaginatedResponse<SupportTicket>> {
    const params = new URLSearchParams();
    
    if (filter) {
      Object.keys(filter).forEach(key => {
        const value = (filter as any)[key];
        if (value !== null && value !== undefined) {
          params.append(key, value.toString());
        }
      });
    }
    
    if (pagination) {
      params.append('page', pagination.page.toString());
      params.append('limit', pagination.limit.toString());
      if (pagination.sortBy) params.append('sortBy', pagination.sortBy);
      if (pagination.sortOrder) params.append('sortOrder', pagination.sortOrder);
    }

    const queryString = params.toString() ? `?${params.toString()}` : '';
    const response = await this.api.get(`/api/support/tickets${queryString}`) as any;
    
    // Handle the actual API response format
    if (response && response.success && response.data) {
      const tickets = response.data.tickets || [];
      const paginationData = response.data.pagination || {};
      
      // Transform tickets to match our interface
      const transformedTickets: SupportTicket[] = tickets.map((ticket: any) => ({
        id: ticket.id,
        ticket_number: ticket.id ? `TK-${ticket.id.toString().padStart(6, '0')}` : 'N/A',
        subject: ticket.subject || 'No Subject',
        description: ticket.message || '',
        priority_id: ticket.priority_id,
        priority: ticket.priority ? {
          id: ticket.priority.id,
          name: ticket.priority.priority,
          level: ticket.priority_id,
          color: this.getPriorityColor(ticket.priority_id)
        } : undefined,
        status_id: ticket.status_id,
        status: ticket.status ? {
          id: ticket.status.id,
          name: ticket.status.name,
          color: this.getStatusColor(ticket.status_id)
        } : undefined,
        client_name: this.extractClientName(ticket.client_email),
        client_email: ticket.client_email,
        client_phone: ticket.client_contact,
        assigned_to: ticket.assigned_to,
        assigned_user: ticket.assigned_user,
        created_by: ticket.created_by,
        created_user: ticket.created_user,
        created_at: new Date(ticket.created_at),
        updated_at: new Date(ticket.updated_at),
        due_date: ticket.due_date ? new Date(ticket.due_date) : undefined,
        resolved_at: ticket.resolved_at ? new Date(ticket.resolved_at) : undefined,
        attachments: ticket.attachment ? [{
          id: 1,
          ticket_id: ticket.id,
          filename: this.extractFilename(ticket.attachment),
          file_path: ticket.attachment,
          file_size: 0,
          mime_type: 'application/octet-stream',
          uploaded_by: ticket.created_by,
          uploaded_at: new Date(ticket.created_at)
        }] : [],
        comments: ticket.support_ticket_comments || []
      }));
      
      return {
        data: transformedTickets,
        page: paginationData.page || 1,
        limit: paginationData.limit || 10,
        total: paginationData.total || 0,
        totalPages: paginationData.totalPages || 1
      };
    }
    
    // Fallback for unexpected response format
    return {
      data: [],
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 1
    };
  }

  async getTicketsByStatus(statusId: number, pagination?: PaginationParams): Promise<PaginatedResponse<SupportTicket>> {
    const filter: TicketFilter = { status_id: statusId };
    return await this.getAllTickets(filter, pagination);
  }

  async getActiveTickets(pagination?: PaginationParams): Promise<PaginatedResponse<SupportTicket>> {
    return await this.getTicketsByStatus(TicketStatusType.ACTIVE, pagination);
  }

  async getInProgressTickets(pagination?: PaginationParams): Promise<PaginatedResponse<SupportTicket>> {
    return await this.getTicketsByStatus(TicketStatusType.IN_PROGRESS, pagination);
  }

  async getCompletedTickets(pagination?: PaginationParams): Promise<PaginatedResponse<SupportTicket>> {
    return await this.getTicketsByStatus(TicketStatusType.COMPLETED, pagination);
  }

  async getTicketById(id: number): Promise<SupportTicket> {
    const response = await this.api.get(`/api/support/tickets/${id}`) as any;
    
    // Handle the actual API response format
    if (response && response.success && response.data) {
      return this.transformTicketResponse(response.data);
    }
    
    // If direct ticket object is returned
    if (response && response.id) {
      return this.transformTicketResponse(response);
    }
    
    // Fallback if unexpected response format
    throw new Error('Invalid ticket data format');
  }

  async createTicket(ticketData: CreateTicketRequest): Promise<SupportTicket> {
    const response = await this.api.post('/api/support/tickets', ticketData) as any;
    
    // Handle the response format and transform if needed
    if (response && response.success && response.data) {
      return this.transformTicketResponse(response.data);
    }
    
    // If direct ticket object is returned
    if (response && response.id) {
      return this.transformTicketResponse(response);
    }
    
    throw new Error('Invalid create ticket response');
  }

  async updateTicket(id: number, ticketData: UpdateTicketRequest): Promise<SupportTicket> {
    const response = await this.api.put(`/api/support/tickets/${id}`, ticketData) as any;
    
    // Handle the response format and transform if needed
    if (response && response.success && response.data) {
      return this.transformTicketResponse(response.data);
    }
    
    // If direct ticket object is returned
    if (response && response.id) {
      return this.transformTicketResponse(response);
    }
    
    throw new Error('Invalid update ticket response');
  }

  // Helper method to transform ticket response
  private transformTicketResponse(ticket: any): SupportTicket {
    return {
      id: ticket.id,
      ticket_number: ticket.id ? `TK-${ticket.id.toString().padStart(6, '0')}` : 'N/A',
      subject: ticket.subject || 'No Subject',
      description: ticket.message || ticket.description || '',
      priority_id: ticket.priority_id,
      priority: ticket.priority ? {
        id: ticket.priority.id,
        name: ticket.priority.priority,
        level: ticket.priority_id,
        color: this.getPriorityColor(ticket.priority_id)
      } : undefined,
      status_id: ticket.status_id,
      status: ticket.status ? {
        id: ticket.status.id,
        name: ticket.status.name,
        color: this.getStatusColor(ticket.status_id)
      } : undefined,
      client_name: this.extractClientName(ticket.client_email),
      client_email: ticket.client_email,
      client_phone: ticket.client_contact,
      assigned_to: ticket.assigned_to,
      assigned_user: ticket.assigned_user,
      created_by: ticket.created_by,
      created_user: ticket.created_user,
      created_at: new Date(ticket.created_at),
      updated_at: new Date(ticket.updated_at),
      due_date: ticket.due_date ? new Date(ticket.due_date) : undefined,
      resolved_at: ticket.resolved_at ? new Date(ticket.resolved_at) : undefined,
      attachments: ticket.attachment ? [{
        id: 1,
        ticket_id: ticket.id,
        filename: this.extractFilename(ticket.attachment),
        file_path: ticket.attachment,
        file_size: 0,
        mime_type: 'application/octet-stream',
        uploaded_by: ticket.created_by,
        uploaded_at: new Date(ticket.created_at)
      }] : [],
      comments: ticket.support_ticket_comments || []
    };
  }

  private transformSupportTicketListRow(ticket: any): SupportTicket {
    return {
      id: ticket.id,
      ticket_number: ticket.id ? `TK-${ticket.id.toString().padStart(6, '0')}` : 'N/A',
      subject: ticket.subject || 'No Subject',
      description: ticket.message || '',
      priority_id: Number(ticket.priority_id) || 0,
      priority: {
        id: Number(ticket.priority_id) || 0,
        name: ticket.priority_name || 'Unknown',
        level: Number(ticket.priority_id) || 0,
        color: this.getPriorityColor(Number(ticket.priority_id) || 0),
      },
      status_id: Number(ticket.status_id) || 0,
      status: {
        id: Number(ticket.status_id) || 0,
        name: ticket.status_name || 'Unknown',
        color: this.getStatusColor(Number(ticket.status_id) || 0),
        description: ticket.status_name || 'Unknown',
      },
      client_name: this.extractClientName(ticket.client_email),
      client_email: ticket.client_email,
      client_phone: ticket.client_contact,
      assigned_to: ticket.assigned_to,
      created_by: this.getCurrentUserId(),
      created_at: ticket.created_at ? new Date(ticket.created_at) : new Date(),
      updated_at: ticket.updated_at ? new Date(ticket.updated_at) : new Date(),
      resolved_at:
        String(ticket.status_name || '').toLowerCase() === 'completed' && ticket.updated_at
          ? new Date(ticket.updated_at)
          : undefined,
      attachments: ticket.attachment ? [{
        id: 1,
        ticket_id: ticket.id,
        filename: this.extractFilename(ticket.attachment),
        file_path: ticket.attachment,
        file_size: 0,
        mime_type: 'application/octet-stream',
        uploaded_by: 0,
        uploaded_at: ticket.created_at ? new Date(ticket.created_at) : new Date(),
      }] : [],
      comments: [],
    };
  }

  async deleteTicket(id: number): Promise<void> {
    await this.api.delete(`/api/support/tickets/${id}`);
  }

  // Status Management
  async getAllStatuses(): Promise<TicketStatus[]> {
    try {
      const response = await this.api.get('/api/support/statuses') as any;
      
      // Handle wrapped response format: { success: true, data: [...] }
      let statusesData: any[] = [];
      if (response && response.success && response.data) {
        statusesData = response.data;
      } else if (Array.isArray(response)) {
        statusesData = response;
      } else {
        throw new Error('Unexpected API response format');
      }
      
      // Transform API format to our expected format
      const transformedStatuses: TicketStatus[] = statusesData.map(item => ({
        id: item.id,
        name: item.name || item.status_name,
        color: item.color || this.getStatusColor(item.id),
        description: item.description || `${item.name || item.status_name} status`
      }));
      
      return transformedStatuses;
    } catch (error) {
      // Fallback statuses
      return [
        { id: 1, name: 'Active', color: '#f39c12', description: 'Active status' },
        { id: 2, name: 'In Progress', color: '#3498db', description: 'In Progress status' },
        { id: 3, name: 'Completed', color: '#27ae60', description: 'Completed status' },
        { id: 4, name: 'Closed', color: '#95a5a6', description: 'Closed status' }
      ];
    }
  }

  // Priority Management
  async getAllPriorities(): Promise<TicketPriority[]> {
    try {
      const response = await this.api.get('/api/support/priorities') as any;
      
      // Handle wrapped response format: { success: true, data: [...] }
      let prioritiesData: any[] = [];
      if (response && response.success && response.data) {
        prioritiesData = response.data;
      } else if (Array.isArray(response)) {
        prioritiesData = response;
      } else {
        throw new Error('Unexpected API response format');
      }
      
      // Transform API format to our expected format
      const transformedPriorities: TicketPriority[] = prioritiesData.map(item => ({
        id: item.id,
        name: item.priority || item.name, // Handle both 'priority' and 'name' fields
        level: item.level || item.id, // Use level if available, otherwise use id
        color: item.color || this.getDefaultPriorityColor(item.id),
        description: item.description || `${item.priority || item.name} priority`
      }));
      
      return transformedPriorities;
    } catch (error) {
      const fallbackPriorities = [
        { id: 1, name: 'Low', level: 1, color: '#27ae60', description: 'Low priority' },
        { id: 2, name: 'Medium', level: 2, color: '#f39c12', description: 'Medium priority' },
        { id: 3, name: 'High', level: 3, color: '#e67e22', description: 'High priority' },
        { id: 4, name: 'Critical', level: 4, color: '#e74c3c', description: 'Critical priority' }
      ];
      return fallbackPriorities;
    }
  }

  private getDefaultPriorityColor(id: number): string {
    const colors: { [key: number]: string } = {
      1: '#27ae60', // Low - Green
      2: '#f39c12', // Medium - Orange
      3: '#e67e22', // High - Dark Orange
      4: '#e74c3c'  // Critical - Red
    };
    return colors[id] || '#95a5a6'; // Default gray
  }

  async updateTicketStatus(ticketId: number, statusId: number, comment?: string): Promise<SupportTicket> {
    const payload = { status_id: statusId, comment };
    const response = await this.api.put(`/api/support/tickets/${ticketId}/status`, payload) as any;
    
    // Handle the response format and transform if needed
    if (response && response.success && response.data) {
      return this.transformTicketResponse(response.data);
    }
    
    // If direct ticket object is returned
    if (response && response.id) {
      return this.transformTicketResponse(response);
    }
    
    throw new Error('Invalid update status response');
  }

  // Assignment Management
  async assignTicket(assignmentData: TicketAssignmentRequest): Promise<SupportTicket> {
    const response = await this.api.put(`/api/support/tickets/${assignmentData.ticket_id}/assign`, assignmentData) as any;
    
    // Handle the response format and transform if needed
    if (response && response.success && response.data) {
      return this.transformTicketResponse(response.data);
    }
    
    // If direct ticket object is returned
    if (response && response.id) {
      return this.transformTicketResponse(response);
    }
    
    throw new Error('Invalid assign ticket response');
  }

  async unassignTicket(ticketId: number, comment?: string): Promise<SupportTicket> {
    const payload = { assigned_to: null, comment };
    return await this.api.put(`/api/support/tickets/${ticketId}/assign`, payload) as SupportTicket;
  }

  async getMyAssignedTickets(pagination?: PaginationParams): Promise<PaginatedResponse<SupportTicket>> {
    const params = new URLSearchParams();
    if (pagination) {
      params.append('page', pagination.page.toString());
      params.append('limit', pagination.limit.toString());
      if (pagination.sortBy) params.append('sortBy', pagination.sortBy);
      if (pagination.sortOrder) params.append('sortOrder', pagination.sortOrder);
    }
    
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return await this.api.get(`/api/support/tickets/my-assigned${queryString}`) as PaginatedResponse<SupportTicket>;
  }

  // Comment Management
  async getTicketComments(ticketId: number): Promise<TicketComment[]> {
    return await this.api.get(`/api/support/tickets/${ticketId}/comments`) as TicketComment[];
  }

  async addComment(commentData: CreateCommentRequest): Promise<TicketComment> {
    return await this.api.post(`/api/support/tickets/${commentData.ticket_id}/comments`, commentData) as TicketComment;
  }

  async updateComment(commentId: number, comment: string): Promise<TicketComment> {
    return await this.api.put(`/api/support/comments/${commentId}`, { comment }) as TicketComment;
  }

  async deleteComment(commentId: number): Promise<void> {
    await this.api.delete(`/api/support/comments/${commentId}`);
  }

  // User Management for Assignments
  async getAvailableAgents(): Promise<Agent[]> {
    try {
      // Try the specific agents endpoint first
      const response = await this.api.get('/api/support/agents') as any;
      
      // Handle wrapped response format: { success: true, data: [...] }
      let agentsData: any[] = [];
      if (response && response.success && response.data) {
        agentsData = response.data;
      } else if (Array.isArray(response)) {
        agentsData = response;
      } else {
        throw new Error('Unexpected API response format');
      }
      
      // Transform API format to our expected Agent format
      const transformedAgents: Agent[] = agentsData.map(item => ({
        id: item.id,
        agent_name: item.agent_name || item.name,
        agent_email: item.agent_email || item.email,
        agent_phone: item.agent_phone,
        department: item.department,
        status: item.status || 'Active',
        specialization: item.specialization,
        max_tickets: item.max_tickets || 10,
        current_tickets: item.current_tickets || 0,
        created_at: item.created_at ? new Date(item.created_at) : undefined,
        updated_at: item.updated_at ? new Date(item.updated_at) : undefined
      }));
      
      return transformedAgents;
    } catch (error) {
      return [
        { 
          id: 1, 
          agent_name: 'System Admin', 
          agent_email: 'admin@example.com',
          agent_phone: '+1-555-0101',
          department: 'IT',
          status: 'Active',
          specialization: 'System Administration',
          max_tickets: 20,
          current_tickets: 5
        },
        { 
          id: 2, 
          agent_name: 'Support Agent 1', 
          agent_email: 'agent1@example.com',
          agent_phone: '+1-555-0102',
          department: 'Support',
          status: 'Active',
          specialization: 'Technical Issues',
          max_tickets: 15,
          current_tickets: 8
        },
        { 
          id: 3, 
          agent_name: 'Support Agent 2', 
          agent_email: 'agent2@example.com',
          agent_phone: '+1-555-0103',
          department: 'Support',
          status: 'Active',
          specialization: 'Billing Issues',
          max_tickets: 12,
          current_tickets: 6
        }
      ];
    }
  }

  async getAllUsers(): Promise<User[]> {
    return await this.api.get('/api/users') as User[];
  }

  // File Upload/Attachments
  async uploadAttachment(ticketId: number, file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('ticket_id', ticketId.toString());
    
    return await this.api.postFormData(`/api/support/tickets/${ticketId}/attachments`, formData);
  }

  async deleteAttachment(attachmentId: number): Promise<void> {
    await this.api.delete(`/api/support/attachments/${attachmentId}`);
  }

  // Search and Filtering
  async searchTickets(query: string, pagination?: PaginationParams): Promise<PaginatedResponse<SupportTicket>> {
    const filter: TicketFilter = { search: query };
    return await this.getAllTickets(filter, pagination);
  }

  async getTicketsByClient(clientEmail: string, pagination?: PaginationParams): Promise<PaginatedResponse<SupportTicket>> {
    const filter: TicketFilter = { client_email: clientEmail };
    return await this.getAllTickets(filter, pagination);
  }

  // Dashboard/Statistics
  async getTicketStatistics(): Promise<any> {
    return await this.api.get('/api/support/statistics');
  }

  async getTicketCounts(): Promise<{active: number, inProgress: number, completed: number, total: number}> {
    try {
      const response = await this.api.get('/api/support/tickets/counts') as any;
      
      const defaultCounts = {
        active: 0,
        inProgress: 0,
        completed: 0,
        total: 0
      };

      // Handle wrapped response with byStatus in data
      if (response?.success && response?.data?.byStatus && Array.isArray(response.data.byStatus)) {
        return this.processStatusArray(response.data.byStatus);
      }

      // Handle direct byStatus array
      if (response?.byStatus && Array.isArray(response.byStatus)) {
        return this.processStatusArray(response.byStatus);
      }

      // Handle wrapped response with direct properties
      if (response?.success && response?.data) {
        return {
          active: response.data.active || 0,
          inProgress: response.data.inProgress || 0,
          completed: response.data.completed || 0,
          total: response.data.total || 0
        };
      }
      
      // Fallback for direct data response
      if (response && typeof response === 'object' && response.active !== undefined) {
        return {
          active: response.active || 0,
          inProgress: response.inProgress || 0,
          completed: response.completed || 0,
          total: response.total || 0
        };
      }

      return defaultCounts;
    } catch (error) {
      return {
        active: 0,
        inProgress: 0,
        completed: 0,
        total: 0
      };
    }
  }

  // External API Integration (Placeholder functions)
  async syncWithExternalSystem(): Promise<any> {
    return await this.api.post('/api/support/external/sync', {});
  }

  async notifyExternalSystem(ticketId: number, action: string): Promise<any> {
    return await this.api.post('/api/support/external/notify', { ticket_id: ticketId, action });
  }

  // Utility Methods
  getStatusColor(statusId: number): string {
    switch (statusId) {
      case TicketStatusType.ACTIVE: return '#f39c12';
      case TicketStatusType.IN_PROGRESS: return '#3498db';
      case TicketStatusType.COMPLETED: return '#27ae60';
      case TicketStatusType.CLOSED: return '#95a5a6';
      case TicketStatusType.CANCELLED: return '#e74c3c';
      default: return '#95a5a6';
    }
  }

  getStatusName(statusId: number): string {
    switch (statusId) {
      case TicketStatusType.ACTIVE: return 'Active';
      case TicketStatusType.IN_PROGRESS: return 'In Progress';
      case TicketStatusType.COMPLETED: return 'Completed';
      case TicketStatusType.CLOSED: return 'Closed';
      case TicketStatusType.CANCELLED: return 'Cancelled';
      default: return 'Unknown';
    }
  }

  getPriorityColor(priority: string | number): string {
    // Handle both string names and numeric IDs
    const priorityStr = typeof priority === 'string' ? priority.toLowerCase() : '';
    const priorityId = typeof priority === 'number' ? priority : 0;
    
    // Handle by string name
    switch (priorityStr) {
      case 'low': return '#27ae60';
      case 'medium': return '#f39c12';
      case 'high': return '#e67e22';
      case 'critical': return '#e74c3c';
    }
    
    // Handle by ID (update these to match your database)
    switch (priorityId) {
      case TicketPriorityType.LOW: return '#27ae60';
      case TicketPriorityType.MEDIUM: return '#f39c12';
      case TicketPriorityType.HIGH: return '#e67e22';
      case TicketPriorityType.CRITICAL: return '#e74c3c';
      default: return '#95a5a6';
    }
  }

  getPriorityName(priorityId: number): string {
    switch (priorityId) {
      case TicketPriorityType.LOW: return 'Low';
      case TicketPriorityType.MEDIUM: return 'Medium';
      case TicketPriorityType.HIGH: return 'High';
      case TicketPriorityType.CRITICAL: return 'Critical';
      default: return 'Unknown';
    }
  }

  private processStatusArray(statusArray: any[]): {active: number, inProgress: number, completed: number, total: number} {
    const counts = {
      active: 0,
      inProgress: 0,
      completed: 0,
      total: 0
    };

    statusArray.forEach(statusCount => {
      const statusName = statusCount.status_name?.toLowerCase();
      const count = statusCount.count || 0;

      switch (statusName) {
        case 'active':
          counts.active = count;
          break;
        case 'in progress':
          counts.inProgress = count;
          break;
        case 'completed':
        case 'resolved':
        case 'closed':
          counts.completed += count;
          break;
      }
    });

    counts.total = statusArray.reduce((sum, statusCount) => sum + (statusCount.count || 0), 0);
    return counts;
  }

  private extractClientName(email: string): string {
    if (!email) return 'Unknown Client';
    // Extract name from email (part before @)
    const namePart = email.split('@')[0];
    // Convert to proper case (capitalize first letter of each word)
    return namePart.split('.').map(part => 
      part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
    ).join(' ');
  }

  private extractFilename(filePath: string): string {
    if (!filePath) return 'unknown-file';
    // Extract filename from path
    const parts = filePath.split('/');
    return parts[parts.length - 1] || 'unknown-file';
  }

  private getCurrentUserId(): number {
    try {
      const rawUser = localStorage.getItem('user');
      if (!rawUser) return 0;
      const user = JSON.parse(rawUser);
      return Number(user?.id) || 0;
    } catch {
      return 0;
    }
  }
}
