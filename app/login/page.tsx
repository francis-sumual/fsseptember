"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const router = useRouter();

  const { status } = useSession();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid email or password");
    } else {
      router.push("/dashboard");
    }
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="p-6 bg-white rounded shadow-md">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-6 bg-white rounded shadow-md w-96">
        <h1 className="text-2xl font-bold mb-4">Login</h1>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full">
            Log in
          </Button>
        </form>
        <p className="mt-4 text-center text-sm">
          Do not have an account?{" "}
          <Link href="/" className="text-blue-500 hover:underline">
            Cancel
          </Link>
        </p>
      </div>
    </div>
  );
}

// export default function LoginPage() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState("");
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const { status } = useSession();

//   useEffect(() => {
//     if (status === "authenticated") {
//       router.push("/dashboard");
//     }

//     if (searchParams?.get("registered") === "true") {
//       setSuccess("Registration successful. Please log in.");
//     }
//   }, [status, router, searchParams]);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError("");

//     const result = await signIn("credentials", {
//       email,
//       password,
//       redirect: false,
//     });

//     if (result?.error) {
//       setError("Invalid email or password");
//     } else {
//       router.push("/dashboard");
//     }
//   };

//   if (status === "loading") {
//     return (
//       <div className="flex items-center justify-center min-h-screen bg-gray-100">
//         <div className="p-6 bg-white rounded shadow-md">Loading...</div>
//       </div>
//     );
//   }

//   return (
//     <Suspense>
//       <div className="flex items-center justify-center min-h-screen bg-gray-100">
//         <div className="p-6 bg-white rounded shadow-md w-96">
//           <h1 className="text-2xl font-bold mb-4">Login</h1>
//           {error && (
//             <Alert variant="destructive" className="mb-4">
//               <AlertCircle className="h-4 w-4" />
//               <AlertTitle>Error</AlertTitle>
//               <AlertDescription>{error}</AlertDescription>
//             </Alert>
//           )}
//           {success && (
//             <Alert className="mb-4">
//               <CheckCircle2 className="h-4 w-4" />
//               <AlertTitle>Success</AlertTitle>
//               <AlertDescription>{success}</AlertDescription>
//             </Alert>
//           )}
//           <form onSubmit={handleSubmit} className="space-y-4">
//             <div>
//               <Label htmlFor="email">Email</Label>
//               <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
//             </div>
//             <div>
//               <Label htmlFor="password">Password</Label>
//               <Input
//                 id="password"
//                 type="password"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 required
//               />
//             </div>
//             <Button type="submit" className="w-full">
//               Log in
//             </Button>
//           </form>
//           <p className="mt-4 text-center text-sm">
//             Do not have an account?{" "}
//             <Link href="/" className="text-blue-500 hover:underline">
//               Cancel
//             </Link>
//           </p>
//         </div>
//       </div>
//     </Suspense>
//   );
// }
