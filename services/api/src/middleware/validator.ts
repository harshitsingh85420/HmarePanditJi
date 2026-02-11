import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";

type ValidateTarget = "body" | "query" | "params";

/**
 * Middleware factory — validates request body/query/params against a Zod schema.
 * On failure, passes a ZodError to errorHandler which formats it as 422.
 *
 * @example
 *   router.post("/auth/request-otp", validate(requestOtpSchema), handler)
 *   router.get("/pandits", validate(listPanditsSchema, "query"), handler)
 */
export function validate(schema: ZodSchema, target: ValidateTarget = "body") {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const parsed = schema.parse(req[target]);
      // Replace raw input with the parsed (coerced + stripped) value
      req[target] = parsed;
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        next(err);
      } else {
        next(err);
      }
    }
  };
}
