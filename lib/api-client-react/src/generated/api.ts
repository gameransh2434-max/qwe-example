import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  QueryKey,
  UseQueryOptions,
  UseQueryResult,
  UseMutationOptions,
  UseMutationResult,
} from "@tanstack/react-query";
import { customFetch } from "../custom-fetch";
import type { ErrorType } from "../custom-fetch";
import type {
  HealthStatus,
  User,
  Category,
  Reward,
  Claim,
  ClaimMessage,
  Ticket,
  TicketDetail,
  Notification,
  Announcement,
  PlatformStats,
  UserDashboard,
  LeaderboardEntry,
  SearchResults,
} from "./api.schemas";

type AwaitedInput<T> = PromiseLike<T> | T;
type Awaited<O> = O extends AwaitedInput<infer T> ? T : never;
type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];

// ─── Health ───────────────────────────────────────────────────────────────────

export const getHealthCheckUrl = () => `/api/healthz`;

export const healthCheck = async (options?: RequestInit): Promise<HealthStatus> =>
  customFetch<HealthStatus>(getHealthCheckUrl(), { ...options, method: "GET" });

export const getHealthCheckQueryKey = () => [`/api/healthz`] as const;

export const getHealthCheckQueryOptions = <TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
  query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
  request?: SecondParameter<typeof customFetch>;
}) => {
  const { query: queryOptions, request: requestOptions } = options ?? {};
  const queryKey = queryOptions?.queryKey ?? getHealthCheckQueryKey();
  const queryFn = ({ signal }: { signal?: AbortSignal }) => healthCheck({ signal, ...requestOptions });
  return { queryKey, queryFn, ...queryOptions } as UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData> & { queryKey: QueryKey };
};

export function useHealthCheck<TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
  query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
  request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & { queryKey: QueryKey } {
  const queryOptions = getHealthCheckQueryOptions(options);
  const query = useQuery(queryOptions) as UseQueryResult<TData, TError> & { queryKey: QueryKey };
  return { ...query, queryKey: queryOptions.queryKey };
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const getMeUrl = () => `/api/auth/me`;
export const getGetMeQueryKey = () => [`/api/auth/me`] as const;

export const getMe = async (options?: RequestInit): Promise<User> =>
  customFetch<User>(getMeUrl(), { ...options, method: "GET" });

export const getGetMeQueryOptions = <TData = Awaited<ReturnType<typeof getMe>>, TError = ErrorType<unknown>>(options?: {
  query?: UseQueryOptions<Awaited<ReturnType<typeof getMe>>, TError, TData>;
}) => {
  const { query: queryOptions } = options ?? {};
  const queryKey = queryOptions?.queryKey ?? getGetMeQueryKey();
  const queryFn = ({ signal }: { signal?: AbortSignal }) => getMe({ signal });
  return { queryKey, queryFn, ...queryOptions } as UseQueryOptions<Awaited<ReturnType<typeof getMe>>, TError, TData> & { queryKey: QueryKey };
};

export function useGetMe<TData = Awaited<ReturnType<typeof getMe>>, TError = ErrorType<unknown>>(options?: {
  query?: UseQueryOptions<Awaited<ReturnType<typeof getMe>>, TError, TData>;
}): UseQueryResult<TData, TError> & { queryKey: QueryKey } {
  const queryOptions = getGetMeQueryOptions(options);
  const query = useQuery(queryOptions) as UseQueryResult<TData, TError> & { queryKey: QueryKey };
  return { ...query, queryKey: queryOptions.queryKey };
}

export const register = async (body: unknown): Promise<{ message: string; email: string; devOtp?: string }> =>
  customFetch(`/api/auth/register`, { method: "POST", body: JSON.stringify(body) });

export const login = async (body: unknown): Promise<{ token: string; user: User }> =>
  customFetch(`/api/auth/login`, { method: "POST", body: JSON.stringify(body) });

export const requestOtp = async (body: unknown): Promise<{ message: string; email: string; devOtp?: string }> =>
  customFetch(`/api/auth/request-otp`, { method: "POST", body: JSON.stringify(body) });

export const verifyOtp = async (body: unknown): Promise<{ token: string; user: User }> =>
  customFetch(`/api/auth/verify-otp`, { method: "POST", body: JSON.stringify(body) });

export const forgotPassword = async (body: unknown): Promise<{ message: string }> =>
  customFetch(`/api/auth/forgot-password`, { method: "POST", body: JSON.stringify(body) });

export function useLogin<TError = ErrorType<unknown>>(options?: {
  mutation?: UseMutationOptions<{ token: string; user: User }, TError, unknown>;
}): UseMutationResult<{ token: string; user: User }, TError, unknown> {
  return useMutation({ mutationFn: login, ...options?.mutation });
}

export function useRegister<TError = ErrorType<unknown>>(options?: {
  mutation?: UseMutationOptions<{ message: string; email: string; devOtp?: string }, TError, unknown>;
}): UseMutationResult<{ message: string; email: string; devOtp?: string }, TError, unknown> {
  return useMutation({ mutationFn: register, ...options?.mutation });
}

export function useRequestOtp<TError = ErrorType<unknown>>(options?: {
  mutation?: UseMutationOptions<{ message: string; email: string; devOtp?: string }, TError, unknown>;
}): UseMutationResult<{ message: string; email: string; devOtp?: string }, TError, unknown> {
  return useMutation({ mutationFn: requestOtp, ...options?.mutation });
}

export function useVerifyOtp<TError = ErrorType<unknown>>(options?: {
  mutation?: UseMutationOptions<{ token: string; user: User }, TError, unknown>;
}): UseMutationResult<{ token: string; user: User }, TError, unknown> {
  return useMutation({ mutationFn: verifyOtp, ...options?.mutation });
}

export function useForgotPassword<TError = ErrorType<unknown>>(options?: {
  mutation?: UseMutationOptions<{ message: string }, TError, unknown>;
}): UseMutationResult<{ message: string }, TError, unknown> {
  return useMutation({ mutationFn: forgotPassword, ...options?.mutation });
}

// ─── Categories ───────────────────────────────────────────────────────────────

export const getCategoriesUrl = () => `/api/categories`;
export const getGetCategoriesQueryKey = () => [`/api/categories`] as const;

export const getCategories = async (options?: RequestInit): Promise<Category[]> =>
  customFetch<Category[]>(getCategoriesUrl(), { ...options, method: "GET" });

export const getGetCategoriesQueryOptions = <TData = Awaited<ReturnType<typeof getCategories>>, TError = ErrorType<unknown>>(options?: {
  query?: UseQueryOptions<Awaited<ReturnType<typeof getCategories>>, TError, TData>;
}) => {
  const { query: queryOptions } = options ?? {};
  const queryKey = queryOptions?.queryKey ?? getGetCategoriesQueryKey();
  const queryFn = ({ signal }: { signal?: AbortSignal }) => getCategories({ signal });
  return { queryKey, queryFn, ...queryOptions } as UseQueryOptions<Awaited<ReturnType<typeof getCategories>>, TError, TData> & { queryKey: QueryKey };
};

export function useGetCategories<TData = Awaited<ReturnType<typeof getCategories>>, TError = ErrorType<unknown>>(options?: {
  query?: UseQueryOptions<Awaited<ReturnType<typeof getCategories>>, TError, TData>;
}): UseQueryResult<TData, TError> & { queryKey: QueryKey } {
  const queryOptions = getGetCategoriesQueryOptions(options);
  const query = useQuery(queryOptions) as UseQueryResult<TData, TError> & { queryKey: QueryKey };
  return { ...query, queryKey: queryOptions.queryKey };
}

// ─── Rewards ──────────────────────────────────────────────────────────────────

export const getRewardsUrl = (params?: { categoryId?: number; search?: string; featured?: boolean }) => {
  const q = new URLSearchParams();
  if (params?.categoryId !== undefined) q.set("categoryId", String(params.categoryId));
  if (params?.search) q.set("search", params.search);
  if (params?.featured !== undefined) q.set("featured", String(params.featured));
  const qs = q.toString();
  return `/api/rewards${qs ? `?${qs}` : ""}`;
};

export const getGetRewardsQueryKey = (params?: { categoryId?: number; search?: string; featured?: boolean }) =>
  [`/api/rewards`, params] as const;

export const getRewards = async (params?: { categoryId?: number; search?: string; featured?: boolean }, options?: RequestInit): Promise<Reward[]> =>
  customFetch<Reward[]>(getRewardsUrl(params), { ...options, method: "GET" });

export const getGetRewardsQueryOptions = <TData = Awaited<ReturnType<typeof getRewards>>, TError = ErrorType<unknown>>(
  params?: { categoryId?: number; search?: string; featured?: boolean },
  options?: { query?: UseQueryOptions<Awaited<ReturnType<typeof getRewards>>, TError, TData> }
) => {
  const { query: queryOptions } = options ?? {};
  const queryKey = queryOptions?.queryKey ?? getGetRewardsQueryKey(params);
  const queryFn = ({ signal }: { signal?: AbortSignal }) => getRewards(params, { signal });
  return { queryKey, queryFn, ...queryOptions } as UseQueryOptions<Awaited<ReturnType<typeof getRewards>>, TError, TData> & { queryKey: QueryKey };
};

export function useGetRewards<TData = Awaited<ReturnType<typeof getRewards>>, TError = ErrorType<unknown>>(
  params?: { categoryId?: number; search?: string; featured?: boolean },
  options?: { query?: UseQueryOptions<Awaited<ReturnType<typeof getRewards>>, TError, TData> }
): UseQueryResult<TData, TError> & { queryKey: QueryKey } {
  const queryOptions = getGetRewardsQueryOptions(params, options);
  const query = useQuery(queryOptions) as UseQueryResult<TData, TError> & { queryKey: QueryKey };
  return { ...query, queryKey: queryOptions.queryKey };
}

export const getRewardUrl = (id: number) => `/api/rewards/${id}`;
export const getGetRewardQueryKey = (id: number) => [`/api/rewards/${id}`] as const;

export const getReward = async (id: number, options?: RequestInit): Promise<Reward> =>
  customFetch<Reward>(getRewardUrl(id), { ...options, method: "GET" });

export const getGetRewardQueryOptions = <TData = Awaited<ReturnType<typeof getReward>>, TError = ErrorType<unknown>>(
  id: number,
  options?: { query?: UseQueryOptions<Awaited<ReturnType<typeof getReward>>, TError, TData> }
) => {
  const { query: queryOptions } = options ?? {};
  const queryKey = queryOptions?.queryKey ?? getGetRewardQueryKey(id);
  const queryFn = ({ signal }: { signal?: AbortSignal }) => getReward(id, { signal });
  return { queryKey, queryFn, ...queryOptions } as UseQueryOptions<Awaited<ReturnType<typeof getReward>>, TError, TData> & { queryKey: QueryKey };
};

export function useGetReward<TData = Awaited<ReturnType<typeof getReward>>, TError = ErrorType<unknown>>(
  id: number,
  options?: { query?: UseQueryOptions<Awaited<ReturnType<typeof getReward>>, TError, TData> }
): UseQueryResult<TData, TError> & { queryKey: QueryKey } {
  const queryOptions = getGetRewardQueryOptions(id, options);
  const query = useQuery(queryOptions) as UseQueryResult<TData, TError> & { queryKey: QueryKey };
  return { ...query, queryKey: queryOptions.queryKey };
}

// ─── Claims ───────────────────────────────────────────────────────────────────

export const getClaimsUrl = (params?: { status?: string; userId?: number }) => {
  const q = new URLSearchParams();
  if (params?.status) q.set("status", params.status);
  if (params?.userId !== undefined) q.set("userId", String(params.userId));
  const qs = q.toString();
  return `/api/claims${qs ? `?${qs}` : ""}`;
};

export const getGetClaimsQueryKey = (params?: { status?: string; userId?: number }) =>
  [`/api/claims`, params] as const;

export const getClaims = async (params?: { status?: string; userId?: number }, options?: RequestInit): Promise<Claim[]> =>
  customFetch<Claim[]>(getClaimsUrl(params), { ...options, method: "GET" });

export const getGetClaimsQueryOptions = <TData = Awaited<ReturnType<typeof getClaims>>, TError = ErrorType<unknown>>(
  params?: { status?: string; userId?: number },
  options?: { query?: UseQueryOptions<Awaited<ReturnType<typeof getClaims>>, TError, TData> }
) => {
  const { query: queryOptions } = options ?? {};
  const queryKey = queryOptions?.queryKey ?? getGetClaimsQueryKey(params);
  const queryFn = ({ signal }: { signal?: AbortSignal }) => getClaims(params, { signal });
  return { queryKey, queryFn, ...queryOptions } as UseQueryOptions<Awaited<ReturnType<typeof getClaims>>, TError, TData> & { queryKey: QueryKey };
};

export function useGetClaims<TData = Awaited<ReturnType<typeof getClaims>>, TError = ErrorType<unknown>>(
  params?: { status?: string; userId?: number },
  options?: { query?: UseQueryOptions<Awaited<ReturnType<typeof getClaims>>, TError, TData> }
): UseQueryResult<TData, TError> & { queryKey: QueryKey } {
  const queryOptions = getGetClaimsQueryOptions(params, options);
  const query = useQuery(queryOptions) as UseQueryResult<TData, TError> & { queryKey: QueryKey };
  return { ...query, queryKey: queryOptions.queryKey };
}

export const getClaimUrl = (id: number) => `/api/claims/${id}`;
export const getGetClaimQueryKey = (id: number) => [`/api/claims/${id}`] as const;

export const getClaim = async (id: number, options?: RequestInit): Promise<Claim> =>
  customFetch<Claim>(getClaimUrl(id), { ...options, method: "GET" });

export const getGetClaimQueryOptions = <TData = Awaited<ReturnType<typeof getClaim>>, TError = ErrorType<unknown>>(
  id: number,
  options?: { query?: UseQueryOptions<Awaited<ReturnType<typeof getClaim>>, TError, TData> }
) => {
  const { query: queryOptions } = options ?? {};
  const queryKey = queryOptions?.queryKey ?? getGetClaimQueryKey(id);
  const queryFn = ({ signal }: { signal?: AbortSignal }) => getClaim(id, { signal });
  return { queryKey, queryFn, ...queryOptions } as UseQueryOptions<Awaited<ReturnType<typeof getClaim>>, TError, TData> & { queryKey: QueryKey };
};

export function useGetClaim<TData = Awaited<ReturnType<typeof getClaim>>, TError = ErrorType<unknown>>(
  id: number,
  options?: { query?: UseQueryOptions<Awaited<ReturnType<typeof getClaim>>, TError, TData> }
): UseQueryResult<TData, TError> & { queryKey: QueryKey } {
  const queryOptions = getGetClaimQueryOptions(id, options);
  const query = useQuery(queryOptions) as UseQueryResult<TData, TError> & { queryKey: QueryKey };
  return { ...query, queryKey: queryOptions.queryKey };
}

export const updateClaimStatus = async (id: number, body: { status: string; adminNotes?: string }): Promise<Claim> =>
  customFetch<Claim>(`/api/claims/${id}/status`, { method: "PATCH", body: JSON.stringify(body) });

export function useUpdateClaimStatus<TError = ErrorType<unknown>>(options?: {
  mutation?: UseMutationOptions<Claim, TError, { id: number; body: { status: string; adminNotes?: string } }>;
}): UseMutationResult<Claim, TError, { id: number; body: { status: string; adminNotes?: string } }> {
  return useMutation({ mutationFn: ({ id, body }) => updateClaimStatus(id, body), ...options?.mutation });
}

export const getClaimMessages = async (id: number, options?: RequestInit): Promise<ClaimMessage[]> =>
  customFetch<ClaimMessage[]>(`/api/claims/${id}/messages`, { ...options, method: "GET" });

export const getGetClaimMessagesQueryKey = (id: number) => [`/api/claims/${id}/messages`] as const;

export function useGetClaimMessages<TData = Awaited<ReturnType<typeof getClaimMessages>>, TError = ErrorType<unknown>>(
  id: number,
  options?: { query?: UseQueryOptions<Awaited<ReturnType<typeof getClaimMessages>>, TError, TData> }
): UseQueryResult<TData, TError> & { queryKey: QueryKey } {
  const { query: queryOptions } = options ?? {};
  const queryKey = queryOptions?.queryKey ?? getGetClaimMessagesQueryKey(id);
  const queryFn = ({ signal }: { signal?: AbortSignal }) => getClaimMessages(id, { signal });
  const queryOptsResolved = { queryKey, queryFn, ...queryOptions } as UseQueryOptions<Awaited<ReturnType<typeof getClaimMessages>>, TError, TData> & { queryKey: QueryKey };
  const query = useQuery(queryOptsResolved) as UseQueryResult<TData, TError> & { queryKey: QueryKey };
  return { ...query, queryKey: queryOptsResolved.queryKey };
}

export const postClaimMessage = async (id: number, body: { content: string }): Promise<ClaimMessage> =>
  customFetch<ClaimMessage>(`/api/claims/${id}/messages`, { method: "POST", body: JSON.stringify(body) });

export function usePostClaimMessage<TError = ErrorType<unknown>>(options?: {
  mutation?: UseMutationOptions<ClaimMessage, TError, { id: number; body: { content: string } }>;
}): UseMutationResult<ClaimMessage, TError, { id: number; body: { content: string } }> {
  return useMutation({ mutationFn: ({ id, body }) => postClaimMessage(id, body), ...options?.mutation });
}

// ─── Tickets ──────────────────────────────────────────────────────────────────

export const getTicketsUrl = () => `/api/tickets`;
export const getGetTicketsQueryKey = () => [`/api/tickets`] as const;

export const getTickets = async (options?: RequestInit): Promise<Ticket[]> =>
  customFetch<Ticket[]>(getTicketsUrl(), { ...options, method: "GET" });

export const getGetTicketsQueryOptions = <TData = Awaited<ReturnType<typeof getTickets>>, TError = ErrorType<unknown>>(options?: {
  query?: UseQueryOptions<Awaited<ReturnType<typeof getTickets>>, TError, TData>;
}) => {
  const { query: queryOptions } = options ?? {};
  const queryKey = queryOptions?.queryKey ?? getGetTicketsQueryKey();
  const queryFn = ({ signal }: { signal?: AbortSignal }) => getTickets({ signal });
  return { queryKey, queryFn, ...queryOptions } as UseQueryOptions<Awaited<ReturnType<typeof getTickets>>, TError, TData> & { queryKey: QueryKey };
};

export function useGetTickets<TData = Awaited<ReturnType<typeof getTickets>>, TError = ErrorType<unknown>>(options?: {
  query?: UseQueryOptions<Awaited<ReturnType<typeof getTickets>>, TError, TData>;
}): UseQueryResult<TData, TError> & { queryKey: QueryKey } {
  const queryOptions = getGetTicketsQueryOptions(options);
  const query = useQuery(queryOptions) as UseQueryResult<TData, TError> & { queryKey: QueryKey };
  return { ...query, queryKey: queryOptions.queryKey };
}

export const getTicketUrl = (id: number) => `/api/tickets/${id}`;
export const getGetTicketQueryKey = (id: number) => [`/api/tickets/${id}`] as const;

export const getTicket = async (id: number, options?: RequestInit): Promise<TicketDetail> =>
  customFetch<TicketDetail>(getTicketUrl(id), { ...options, method: "GET" });

export const getGetTicketQueryOptions = <TData = Awaited<ReturnType<typeof getTicket>>, TError = ErrorType<unknown>>(
  id: number,
  options?: { query?: UseQueryOptions<Awaited<ReturnType<typeof getTicket>>, TError, TData> }
) => {
  const { query: queryOptions } = options ?? {};
  const queryKey = queryOptions?.queryKey ?? getGetTicketQueryKey(id);
  const queryFn = ({ signal }: { signal?: AbortSignal }) => getTicket(id, { signal });
  return { queryKey, queryFn, ...queryOptions } as UseQueryOptions<Awaited<ReturnType<typeof getTicket>>, TError, TData> & { queryKey: QueryKey };
};

export function useGetTicket<TData = Awaited<ReturnType<typeof getTicket>>, TError = ErrorType<unknown>>(
  id: number,
  options?: { query?: UseQueryOptions<Awaited<ReturnType<typeof getTicket>>, TError, TData> }
): UseQueryResult<TData, TError> & { queryKey: QueryKey } {
  const queryOptions = getGetTicketQueryOptions(id, options);
  const query = useQuery(queryOptions) as UseQueryResult<TData, TError> & { queryKey: QueryKey };
  return { ...query, queryKey: queryOptions.queryKey };
}

export const createTicket = async (body: { subject: string; message: string }): Promise<Ticket> =>
  customFetch<Ticket>(`/api/tickets`, { method: "POST", body: JSON.stringify(body) });

export function useCreateTicket<TError = ErrorType<unknown>>(options?: {
  mutation?: UseMutationOptions<Ticket, TError, { subject: string; message: string }>;
}): UseMutationResult<Ticket, TError, { subject: string; message: string }> {
  return useMutation({ mutationFn: createTicket, ...options?.mutation });
}

export const sendTicketMessage = async (id: number, body: { content: string; proofUrl?: string }): Promise<{ id: number; content: string; isAdmin: boolean; createdAt: string }> =>
  customFetch(`/api/tickets/${id}/messages`, { method: "POST", body: JSON.stringify(body) });

export function useSendTicketMessage<TError = ErrorType<unknown>>(options?: {
  mutation?: UseMutationOptions<{ id: number; content: string; isAdmin: boolean; createdAt: string }, TError, { id: number; body: { content: string; proofUrl?: string } }>;
}): UseMutationResult<{ id: number; content: string; isAdmin: boolean; createdAt: string }, TError, { id: number; body: { content: string; proofUrl?: string } }> {
  return useMutation({ mutationFn: ({ id, body }) => sendTicketMessage(id, body), ...options?.mutation });
}

// ─── Notifications ────────────────────────────────────────────────────────────

export const getNotificationsUrl = () => `/api/notifications`;
export const getGetNotificationsQueryKey = () => [`/api/notifications`] as const;

export const getNotifications = async (options?: RequestInit): Promise<Notification[]> =>
  customFetch<Notification[]>(getNotificationsUrl(), { ...options, method: "GET" });

export const getGetNotificationsQueryOptions = <TData = Awaited<ReturnType<typeof getNotifications>>, TError = ErrorType<unknown>>(options?: {
  query?: UseQueryOptions<Awaited<ReturnType<typeof getNotifications>>, TError, TData>;
}) => {
  const { query: queryOptions } = options ?? {};
  const queryKey = queryOptions?.queryKey ?? getGetNotificationsQueryKey();
  const queryFn = ({ signal }: { signal?: AbortSignal }) => getNotifications({ signal });
  return { queryKey, queryFn, ...queryOptions } as UseQueryOptions<Awaited<ReturnType<typeof getNotifications>>, TError, TData> & { queryKey: QueryKey };
};

export function useGetNotifications<TData = Awaited<ReturnType<typeof getNotifications>>, TError = ErrorType<unknown>>(options?: {
  query?: UseQueryOptions<Awaited<ReturnType<typeof getNotifications>>, TError, TData>;
}): UseQueryResult<TData, TError> & { queryKey: QueryKey } {
  const queryOptions = getGetNotificationsQueryOptions(options);
  const query = useQuery(queryOptions) as UseQueryResult<TData, TError> & { queryKey: QueryKey };
  return { ...query, queryKey: queryOptions.queryKey };
}

export const markNotificationRead = async (id: number): Promise<{ message: string }> =>
  customFetch(`/api/notifications/${id}/read`, { method: "PATCH" });

export function useMarkNotificationRead<TError = ErrorType<unknown>>(options?: {
  mutation?: UseMutationOptions<{ message: string }, TError, number>;
}): UseMutationResult<{ message: string }, TError, number> {
  return useMutation({ mutationFn: markNotificationRead, ...options?.mutation });
}

export const markAllNotificationsRead = async (): Promise<{ message: string }> =>
  customFetch(`/api/notifications/read-all`, { method: "PATCH" });

export function useMarkAllNotificationsRead<TError = ErrorType<unknown>>(options?: {
  mutation?: UseMutationOptions<{ message: string }, TError, void>;
}): UseMutationResult<{ message: string }, TError, void> {
  return useMutation({ mutationFn: markAllNotificationsRead, ...options?.mutation });
}

// ─── Announcements ────────────────────────────────────────────────────────────

export const getAnnouncementsUrl = () => `/api/announcements`;
export const getGetAnnouncementsQueryKey = () => [`/api/announcements`] as const;

export const getAnnouncements = async (options?: RequestInit): Promise<Announcement[]> =>
  customFetch<Announcement[]>(getAnnouncementsUrl(), { ...options, method: "GET" });

export const getGetAnnouncementsQueryOptions = <TData = Awaited<ReturnType<typeof getAnnouncements>>, TError = ErrorType<unknown>>(options?: {
  query?: UseQueryOptions<Awaited<ReturnType<typeof getAnnouncements>>, TError, TData>;
}) => {
  const { query: queryOptions } = options ?? {};
  const queryKey = queryOptions?.queryKey ?? getGetAnnouncementsQueryKey();
  const queryFn = ({ signal }: { signal?: AbortSignal }) => getAnnouncements({ signal });
  return { queryKey, queryFn, ...queryOptions } as UseQueryOptions<Awaited<ReturnType<typeof getAnnouncements>>, TError, TData> & { queryKey: QueryKey };
};

export function useGetAnnouncements<TData = Awaited<ReturnType<typeof getAnnouncements>>, TError = ErrorType<unknown>>(options?: {
  query?: UseQueryOptions<Awaited<ReturnType<typeof getAnnouncements>>, TError, TData>;
}): UseQueryResult<TData, TError> & { queryKey: QueryKey } {
  const queryOptions = getGetAnnouncementsQueryOptions(options);
  const query = useQuery(queryOptions) as UseQueryResult<TData, TError> & { queryKey: QueryKey };
  return { ...query, queryKey: queryOptions.queryKey };
}

// ─── Stats ────────────────────────────────────────────────────────────────────

export const getStatsUrl = () => `/api/stats`;
export const getGetStatsQueryKey = () => [`/api/stats`] as const;

export const getStats = async (options?: RequestInit): Promise<PlatformStats> =>
  customFetch<PlatformStats>(getStatsUrl(), { ...options, method: "GET" });

export const getGetStatsQueryOptions = <TData = Awaited<ReturnType<typeof getStats>>, TError = ErrorType<unknown>>(options?: {
  query?: UseQueryOptions<Awaited<ReturnType<typeof getStats>>, TError, TData>;
}) => {
  const { query: queryOptions } = options ?? {};
  const queryKey = queryOptions?.queryKey ?? getGetStatsQueryKey();
  const queryFn = ({ signal }: { signal?: AbortSignal }) => getStats({ signal });
  return { queryKey, queryFn, ...queryOptions } as UseQueryOptions<Awaited<ReturnType<typeof getStats>>, TError, TData> & { queryKey: QueryKey };
};

export function useGetStats<TData = Awaited<ReturnType<typeof getStats>>, TError = ErrorType<unknown>>(options?: {
  query?: UseQueryOptions<Awaited<ReturnType<typeof getStats>>, TError, TData>;
}): UseQueryResult<TData, TError> & { queryKey: QueryKey } {
  const queryOptions = getGetStatsQueryOptions(options);
  const query = useQuery(queryOptions) as UseQueryResult<TData, TError> & { queryKey: QueryKey };
  return { ...query, queryKey: queryOptions.queryKey };
}

export const getUserDashboardUrl = () => `/api/users/dashboard`;
export const getGetUserDashboardQueryKey = () => [`/api/users/dashboard`] as const;

export const getUserDashboard = async (options?: RequestInit): Promise<UserDashboard> =>
  customFetch<UserDashboard>(getUserDashboardUrl(), { ...options, method: "GET" });

export const getGetUserDashboardQueryOptions = <TData = Awaited<ReturnType<typeof getUserDashboard>>, TError = ErrorType<unknown>>(options?: {
  query?: UseQueryOptions<Awaited<ReturnType<typeof getUserDashboard>>, TError, TData>;
}) => {
  const { query: queryOptions } = options ?? {};
  const queryKey = queryOptions?.queryKey ?? getGetUserDashboardQueryKey();
  const queryFn = ({ signal }: { signal?: AbortSignal }) => getUserDashboard({ signal });
  return { queryKey, queryFn, ...queryOptions } as UseQueryOptions<Awaited<ReturnType<typeof getUserDashboard>>, TError, TData> & { queryKey: QueryKey };
};

export function useGetUserDashboard<TData = Awaited<ReturnType<typeof getUserDashboard>>, TError = ErrorType<unknown>>(options?: {
  query?: UseQueryOptions<Awaited<ReturnType<typeof getUserDashboard>>, TError, TData>;
}): UseQueryResult<TData, TError> & { queryKey: QueryKey } {
  const queryOptions = getGetUserDashboardQueryOptions(options);
  const query = useQuery(queryOptions) as UseQueryResult<TData, TError> & { queryKey: QueryKey };
  return { ...query, queryKey: queryOptions.queryKey };
}

export const getLeaderboardUrl = (params?: { type?: "claims" | "invites" }) => {
  const q = new URLSearchParams();
  if (params?.type) q.set("type", params.type);
  const qs = q.toString();
  return `/api/leaderboard${qs ? `?${qs}` : ""}`;
};

export const getGetLeaderboardQueryKey = (params?: { type?: string }) => [`/api/leaderboard`, params] as const;

export const getLeaderboard = async (params?: { type?: "claims" | "invites" }, options?: RequestInit): Promise<LeaderboardEntry[]> =>
  customFetch<LeaderboardEntry[]>(getLeaderboardUrl(params), { ...options, method: "GET" });

export const getGetLeaderboardQueryOptions = <TData = Awaited<ReturnType<typeof getLeaderboard>>, TError = ErrorType<unknown>>(
  params?: { type?: "claims" | "invites" },
  options?: { query?: UseQueryOptions<Awaited<ReturnType<typeof getLeaderboard>>, TError, TData> }
) => {
  const { query: queryOptions } = options ?? {};
  const queryKey = queryOptions?.queryKey ?? getGetLeaderboardQueryKey(params);
  const queryFn = ({ signal }: { signal?: AbortSignal }) => getLeaderboard(params, { signal });
  return { queryKey, queryFn, ...queryOptions } as UseQueryOptions<Awaited<ReturnType<typeof getLeaderboard>>, TError, TData> & { queryKey: QueryKey };
};

export function useGetLeaderboard<TData = Awaited<ReturnType<typeof getLeaderboard>>, TError = ErrorType<unknown>>(
  params?: { type?: "claims" | "invites" },
  options?: { query?: UseQueryOptions<Awaited<ReturnType<typeof getLeaderboard>>, TError, TData> }
): UseQueryResult<TData, TError> & { queryKey: QueryKey } {
  const queryOptions = getGetLeaderboardQueryOptions(params, options);
  const query = useQuery(queryOptions) as UseQueryResult<TData, TError> & { queryKey: QueryKey };
  return { ...query, queryKey: queryOptions.queryKey };
}

// ─── Search ───────────────────────────────────────────────────────────────────

export const getSearchUrl = (q: string) => `/api/search?q=${encodeURIComponent(q)}`;
export const getSearchQueryKey = (q: string) => [`/api/search`, q] as const;

export const search = async (q: string, options?: RequestInit): Promise<SearchResults> =>
  customFetch<SearchResults>(getSearchUrl(q), { ...options, method: "GET" });

export const getSearchQueryOptions = <TData = Awaited<ReturnType<typeof search>>, TError = ErrorType<unknown>>(
  q: string,
  options?: { query?: UseQueryOptions<Awaited<ReturnType<typeof search>>, TError, TData> }
) => {
  const { query: queryOptions } = options ?? {};
  const queryKey = queryOptions?.queryKey ?? getSearchQueryKey(q);
  const queryFn = ({ signal }: { signal?: AbortSignal }) => search(q, { signal });
  return { queryKey, queryFn, ...queryOptions } as UseQueryOptions<Awaited<ReturnType<typeof search>>, TError, TData> & { queryKey: QueryKey };
};

export function useSearch<TData = Awaited<ReturnType<typeof search>>, TError = ErrorType<unknown>>(
  q: string,
  options?: { query?: UseQueryOptions<Awaited<ReturnType<typeof search>>, TError, TData> }
): UseQueryResult<TData, TError> & { queryKey: QueryKey } {
  const queryOptions = getSearchQueryOptions(q, options);
  const query = useQuery(queryOptions) as UseQueryResult<TData, TError> & { queryKey: QueryKey };
  return { ...query, queryKey: queryOptions.queryKey };
}
