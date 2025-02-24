// eslint-disable-next-line @typescript-eslint/no-unused-vars
import NextAuth, { DefaultSession } from "next-auth";
import "next-auth/jwt";

export declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      /** The user's postal address. */
      id: string;
      name: string;
      email: string;
      role: string;
    } & DefaultSession["user"];
  }
  interface User {
    id: string;
    name: string;
    email: string;
    role: string;
  }
}

// Read more at: https://next-auth.js.org/getting-started/typescript#module-augmentation

export declare module "next-auth/jwt" {
  interface JWT {
    /** The user's role. */
    id: string;
    role: string;
    userRole?: "admin";
  }
}
