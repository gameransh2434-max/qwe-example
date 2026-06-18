import * as zod from "zod";

export const HealthCheckResponse = zod.object({
  status: zod.string(),
});

export const RegisterBody = zod.object({
  username: zod.string().min(3),
  email: zod.string().email(),
  password: zod.string().min(6),
  discordUsername: zod.string().optional(),
});

export const LoginBody = zod.object({
  email: zod.string().email(),
  password: zod.string(),
});

export const ForgotPasswordBody = zod.object({
  email: zod.string().email(),
});

export const ResetPasswordBody = zod.object({
  token: zod.string(),
  password: zod.string().min(6),
});

export const CreateCategoryBody = zod.object({
  name: zod.string().min(1),
  slug: zod.string().min(1),
  icon: zod.string().min(1),
  description: zod.string().optional(),
  order: zod.number().optional(),
});

export const DeleteCategoryParams = zod.object({
  id: zod.number().int().positive(),
});

export const GetRewardsQueryParams = zod.object({
  categoryId: zod.number().int().positive().optional(),
  search: zod.string().optional(),
  featured: zod.boolean().optional(),
});

export const CreateRewardBody = zod.object({
  title: zod.string().min(1),
  description: zod.string().min(1),
  requirement: zod.string().min(1),
  requirementValue: zod.number().optional(),
  rewardValue: zod.string().min(1),
  categoryId: zod.number().int().positive(),
  isFeatured: zod.boolean().optional(),
  isActive: zod.boolean().optional(),
});

export const GetRewardParams = zod.object({
  id: zod.number().int().positive(),
});

export const UpdateRewardParams = zod.object({
  id: zod.number().int().positive(),
});

export const UpdateRewardBody = zod.object({
  title: zod.string().optional(),
  description: zod.string().optional(),
  requirement: zod.string().optional(),
  requirementValue: zod.number().optional(),
  rewardValue: zod.string().optional(),
  categoryId: zod.number().int().positive().optional(),
  isFeatured: zod.boolean().optional(),
  isActive: zod.boolean().optional(),
});

export const DeleteRewardParams = zod.object({
  id: zod.number().int().positive(),
});

export const GetClaimsQueryParams = zod.object({
  status: zod.string().optional(),
  userId: zod.number().int().positive().optional(),
});

export const CreateClaimBody = zod.object({
  rewardId: zod.number().int().positive(),
  discordUsername: zod.string().min(1),
  discordLink: zod.string().optional(),
  email: zod.string().email().optional(),
  paymentMethod: zod.string().optional(),
  paymentAmount: zod.number().optional(),
  proofUrl: zod.string().optional(),
  notes: zod.string().optional(),
});

export const GetClaimParams = zod.object({
  id: zod.number().int().positive(),
});

export const UpdateClaimStatusParams = zod.object({
  id: zod.number().int().positive(),
});

export const UpdateClaimStatusBody = zod.object({
  status: zod.string().min(1),
  adminNotes: zod.string().optional(),
});

export const CreateTicketBody = zod.object({
  subject: zod.string().min(1),
  message: zod.string().min(1),
});

export const GetTicketParams = zod.object({
  id: zod.number().int().positive(),
});

export const SendTicketMessageParams = zod.object({
  id: zod.number().int().positive(),
});

export const SendTicketMessageBody = zod.object({
  content: zod.string().min(1),
  proofUrl: zod.string().optional(),
});

export const CloseTicketParams = zod.object({
  id: zod.number().int().positive(),
});

export const MarkNotificationReadParams = zod.object({
  id: zod.number().int().positive(),
});

export const CreateAnnouncementBody = zod.object({
  title: zod.string().min(1),
  content: zod.string().min(1),
  type: zod.string().default("info"),
  isPinned: zod.boolean().optional(),
});

export const DeleteAnnouncementParams = zod.object({
  id: zod.number().int().positive(),
});

export const GetLeaderboardQueryParams = zod.object({
  type: zod.enum(["claims", "invites"]).optional(),
});

export const AdminUpdateUserRoleParams = zod.object({
  id: zod.number().int().positive(),
});

export const AdminUpdateUserRoleBody = zod.object({
  role: zod.enum(["user", "admin"]),
});
