export interface HealthStatus {
  status: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  discordUsername: string | null;
  avatarUrl: string | null;
  totalClaims: number;
  approvedClaims: number;
  inviteCount: number;
  isVerified: boolean;
  createdAt: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string;
  description: string | null;
  order: number;
  rewardCount: number;
}

export interface Reward {
  id: number;
  title: string;
  description: string;
  requirement: string;
  requirementValue: number | null;
  rewardValue: string;
  categoryId: number;
  categoryName: string | null;
  isFeatured: boolean;
  isActive: boolean;
  claimCount: number;
  createdAt: string;
}

export interface Claim {
  id: number;
  userId: number;
  username: string | null;
  rewardId: number;
  rewardTitle: string | null;
  rewardValue?: string | null;
  status: string;
  discordUsername: string;
  discordLink?: string | null;
  email: string;
  paymentMethod?: string | null;
  paymentAmount?: number | null;
  proofUrl: string | null;
  notes: string | null;
  adminNotes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ClaimMessage {
  id: number;
  claimId: number;
  userId: number;
  username: string | null;
  content: string;
  isAdmin: boolean;
  createdAt: string;
}

export interface Ticket {
  id: number;
  userId: number;
  username: string | null;
  subject: string;
  status: string;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface TicketMessage {
  id: number;
  ticketId: number;
  userId: number;
  username: string | null;
  content: string;
  isAdmin: boolean;
  proofUrl: string | null;
  createdAt: string;
}

export interface TicketDetail {
  id: number;
  userId: number;
  username: string | null;
  subject: string;
  status: string;
  createdAt: string;
  messages: TicketMessage[];
}

export interface Notification {
  id: number;
  userId: number;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface Announcement {
  id: number;
  title: string;
  content: string;
  type: string;
  isPinned: boolean;
  createdAt: string;
}

export interface PlatformStats {
  totalUsers: number;
  totalRewards: number;
  totalClaims: number;
  approvedClaims: number;
  totalCategories: number;
  pendingClaims: number;
}

export interface UserDashboard {
  totalClaims: number;
  pendingClaims: number;
  approvedClaims: number;
  rejectedClaims: number;
  completedClaims: number;
  notifications: number;
  recentClaims: Claim[];
}

export interface LeaderboardEntry {
  rank: number;
  userId: number;
  username: string;
  avatarUrl: string | null;
  score: number;
  label: string;
}

export interface ActivityItem {
  id: number;
  type: "claim_approved" | "new_user" | "announcement";
  username: string | null;
  message: string;
  createdAt: string;
}

export interface SearchResults {
  rewards: Reward[];
  categories: Category[];
  users: User[];
}
