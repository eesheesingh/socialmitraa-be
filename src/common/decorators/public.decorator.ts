import { SetMetadata } from "@nestjs/common";

export const IS_PUBLIC_KEY = "isPublic";

// Marks a route as not requiring authentication. The AuthGuard still attaches
// the user when a valid session cookie is present (optional auth).
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
