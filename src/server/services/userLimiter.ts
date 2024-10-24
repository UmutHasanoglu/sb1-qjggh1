interface UserConversions {
  count: number;
  lastReset: Date;
}

export class UserLimiter {
  private static instance: UserLimiter;
  private userConversions: Map<string, UserConversions> = new Map();
  private readonly FREE_LIMIT = 10;
  
  private constructor() {}

  static getInstance(): UserLimiter {
    if (!UserLimiter.instance) {
      UserLimiter.instance = new UserLimiter();
    }
    return UserLimiter.instance;
  }

  checkLimit(userId: string): boolean {
    const now = new Date();
    const userStats = this.userConversions.get(userId) || { count: 0, lastReset: now };

    // Reset count if it's a new month
    if (this.isNewMonth(userStats.lastReset, now)) {
      userStats.count = 0;
      userStats.lastReset = now;
    }

    return userStats.count < this.FREE_LIMIT;
  }

  incrementCount(userId: string): void {
    const now = new Date();
    const userStats = this.userConversions.get(userId) || { count: 0, lastReset: now };

    if (this.isNewMonth(userStats.lastReset, now)) {
      userStats.count = 1;
      userStats.lastReset = now;
    } else {
      userStats.count++;
    }

    this.userConversions.set(userId, userStats);
  }

  getRemainingConversions(userId: string): number {
    const userStats = this.userConversions.get(userId);
    if (!userStats) return this.FREE_LIMIT;

    if (this.isNewMonth(userStats.lastReset, new Date())) {
      return this.FREE_LIMIT;
    }

    return Math.max(0, this.FREE_LIMIT - userStats.count);
  }

  private isNewMonth(lastReset: Date, now: Date): boolean {
    return lastReset.getMonth() !== now.getMonth() || 
           lastReset.getFullYear() !== now.getFullYear();
  }
}
