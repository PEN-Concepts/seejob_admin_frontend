export interface SupportTicket {
  id: number;
  ticket_number: string;
  subject: string;
  description: string;
  priority_id: number;
  priority?: TicketPriority;
  status_id: number;
  status?: TicketStatus;
  client_name?: string;
  client_email?: string;
  client_phone?: string;
  assigned_to?: number;
  assigned_user?: User;
  assigned_agent?: Agent;
  created_by: number;
  created_user?: User;
  created_at: Date;
  updated_at: Date;
  due_date?: Date;
  resolved_at?: Date;
  attachments?: TicketAttachment[];
  comments?: TicketComment[];
}

export interface TicketStatus {
  id: number;
  name: string;
  color?: string;
  description?: string;
}

export interface TicketPriority {
  id: number;
  name: string;
  level: number;
  color?: string;
  description?: string;
}

export interface TicketComment {
  id: number;
  ticket_id: number;
  user_id: number;
  user?: User;
  comment: string;
  is_internal: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface TicketAttachment {
  id: number;
  ticket_id: number;
  filename: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  uploaded_by: number;
  uploaded_user?: User;
  uploaded_at: Date;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role?: string;
  department?: string;
}

// Maps to Prisma model: ticket_agents
// Database table: ticket_agents
export interface Agent {
  id: number;                    // id (Int, @id, @default(autoincrement()))
  agent_name: string;           // agent_name (String, @db.VarChar(100))
  agent_email: string;          // agent_email (String, @unique, @db.VarChar(100))
  agent_phone?: string;         // agent_phone (String?, @db.VarChar(20))
  department?: string;          // department (String?, @db.VarChar(50))
  status?: string;              // status (String, @default("Active"), @db.VarChar(20))
  specialization?: string;      // specialization (String?, @db.VarChar(100))
  max_tickets?: number;         // max_tickets (Int?, @default(10))
  current_tickets?: number;     // current_tickets (Int?, @default(0))
  created_at?: Date;            // created_at (DateTime?, @default(now()), @db.Timestamp(0))
  updated_at?: Date;            // updated_at (DateTime?, @default(now()), @updatedAt, @db.Timestamp(0))
}

export enum PriorityLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Update these values to match your actual database lookup table
export enum TicketStatusType {
  ACTIVE = 1,        // or whatever your DB has for "Active/New" status
  IN_PROGRESS = 2,   // or whatever your DB has for "In Progress" status  
  COMPLETED = 3,     // or whatever your DB has for "Completed/Resolved" status
  CLOSED = 4,        // or whatever your DB has for "Closed" status
  CANCELLED = 5      // or whatever your DB has for "Cancelled" status
}

// Update these values to match your actual database lookup table
export enum TicketPriorityType {
  LOW = 1,           // or whatever your DB has for "Low" priority
  MEDIUM = 2,        // or whatever your DB has for "Medium" priority
  HIGH = 3,          // or whatever your DB has for "High" priority
  CRITICAL = 4       // or whatever your DB has for "Critical" priority
}

export interface TicketFilter {
  status_id?: number;
  assigned_to?: number;
  priority_id?: number;
  priority_level?: PriorityLevel;
  client_email?: string;
  search?: string;
  created_from?: Date;
  created_to?: Date;
  due_from?: Date;
  due_to?: Date;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateTicketRequest {
  subject: string;
  description: string;
  priority_id: number;
  client_name?: string;
  client_email?: string;
  client_phone?: string;
  assigned_to?: number;
  due_date?: Date;
}

export interface UpdateTicketRequest {
  subject?: string;
  description?: string;
  priority_id?: number;
  status_id?: number;
  assigned_to?: number;
  due_date?: Date;
  client_name?: string;
  client_email?: string;
  client_phone?: string;
  message?: string;
}

export interface CreateCommentRequest {
  ticket_id: number;
  comment: string;
  is_internal: boolean;
}

export interface TicketAssignmentRequest {
  ticket_id: number;
  assigned_to: number;
  comment?: string;
}