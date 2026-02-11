import { UserRole } from "@hmarepanditji/db";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        phone: string;
        role: UserRole;
        isPhoneVerified: boolean;
      };
    }
  }
}

export {};
