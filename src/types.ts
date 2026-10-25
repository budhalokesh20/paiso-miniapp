export type UserGender = 'Male' | 'Female';

export interface UserVerification {
  verified: boolean;
  fullName: string;
  email: string;
  dob: string;
  gender: UserGender;
  verifiedAt?: string;
}

export interface PendingOtp {
  otp: string;
  fullName: string;
  email: string;
  dob: string;
  gender: UserGender;
  expiresAt: number;
  attempts?: number;
  sentAt?: number;
}

export interface User {
  id: string;
  first_name: string;
  username: string;
  coins: number;
  totalEarned: number;
  referrals: number;
  lastDaily: string;
  lastDailyAt?: number;
  dailyStreak?: number;
  totalDailyCheckins?: number;
  totalAdsWatched?: number;
  totalTasksCompleted?: number;
  referredBy: string | null;
  refBonusPaid?: boolean;
  qualifiedAt?: string;
  verified?: boolean;
  verification?: UserVerification;
  pendingOtp?: PendingOtp;
  joinedAt: string;
  adDay?: string;
  adCount?: number;
  lastAdAt?: number;
}

export interface QualificationStatus {
  adsDone: number;
  adsReq: number;
  tasksDone: number;
  tasksReq: number;
  dailyDone: number;
  dailyReq: number;
  qualified: boolean;
}

export interface ReferralHistoryItem {
  id: string;
  name: string;
  username: string;
  joinedAt: string;
  qualified: boolean;
  bonusCoins: number;
  adsDone: number;
  adsReq: number;
  tasksDone: number;
  tasksReq: number;
  dailyDone: number;
  dailyReq: number;
}

export type TaskType = 'telegram_join' | 'social_visit' | 'app_task' | 'play_game';

export interface Task {
  id: string;
  title: string;
  description: string;
  icon: string;
  reward: number;
  type: TaskType;
  target: string;
  url: string;
  waitSeconds?: number;
  resetHours?: number;
  lastResetAt?: string;
  claimsCount?: number;
  nextAvailableAt?: number;
  done?: boolean;
}

export type WithdrawMethod = string;
export type WithdrawStatus = 'pending' | 'paid' | 'rejected';

export interface CustomWithdrawMethod {
  id: string;
  name: string;
  logo: string;
  placeholder?: string;
  country?: string;
  enabled: boolean;
}

export interface AllowedCountryItem {
  code: string;
  name: string;
  flag: string;
}

export interface Withdrawal {
  id: string;
  userId: string;
  username: string;
  method: WithdrawMethod;
  account: string;
  coins: number;
  npr: number;
  status: WithdrawStatus;
  at: string;
}

export interface WithdrawSettings {
  methods: CustomWithdrawMethod[];
  allowedMethods: string[];
  minWithdrawCoins: number;
  coinPerNpr: number;
  countries: AllowedCountryItem[];
  allowedCountries: string[];
  requireQualification: boolean;
}

export type NotificationType = 'task' | 'reward' | 'withdraw' | 'referral' | 'admin' | 'system';

export interface AppNotification {
  id: string;
  userId: string; // 'all' for broadcast or specific user.id
  title: string;
  message: string;
  type: NotificationType;
  coins?: number;
  createdAt: string;
  readBy?: string[]; // userIds for broadcast, or [userId]
}

export interface DatabaseSchema {
  users: Record<string, User>;
  withdrawals: Withdrawal[];
  claims: Record<string, number>;
  tasks?: Task[];
  settings?: WithdrawSettings;
  notifications?: AppNotification[];
}

export interface AdsInfo {
  blockId: string;
  reward: number;
  dailyCap: number;
  watchedToday: number;
}

export interface MeResponse {
  user: User;
  tasks: Task[];
  coinPerNpr: number;
  minWithdrawCoins: number;
  dailyBonus: number;
  ads: AdsInfo;
  canDaily: boolean;
  nextDailyAt: number;
  dailyStreak: number;
  qualification: QualificationStatus;
  referralHistory: ReferralHistoryItem[];
  withdrawSettings: WithdrawSettings;
  notifications: Array<AppNotification & { read: boolean }>;
  unreadCount: number;
  refLink: string;
  error?: string;
}
