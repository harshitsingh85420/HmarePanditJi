import { Role } from "@hmarepanditji/db";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        phone: string;
        role: Role;
        isVerified: boolean;
        name?: string;
      };
    }
  }
}

export {};
