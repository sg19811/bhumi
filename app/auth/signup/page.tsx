"use client";

import { useState } from "react";
import { supabase } from "@/app/lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { data, error: authError } = await supabase.auth.signUp({ email, password });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      await supabase.from("profiles").insert({
        user_id: data.user.id,
        full_name: fullName,
        phone,
      });
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <Link href="/" className="text-2xl font-bold text-green-800 block text-center mb-8">Bhūmi</Link>
        <h1 className="text-2xl font-bold mb-6 text-center">Create account</h1>

        {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" placeholder="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)}
            required className="w-full border rounded-lg px-4 py-2 outline-none focus:border-green-600" />
          <input type="tel" placeholder="Phone number" value={phone} onChange={(e) => setPhone(e.target.value)}
            className="w-full border rounded-lg px-4 py-2 outline-none focus:border-green-600" />
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}
            required className="w-full border rounded-lg px-4 py-2 outline-none focus:border-green-600" />
          <input type="password" placeholder="Password (min 6 characters)" value={password} onChange={(e) => setPassword(e.target.value)}
            required minLength={6} className="w-full border rounded-lg px-4 py-2 outline-none focus:border-green-600" />
          <button type="submit" disabled={loading}
            className="w-full bg-green-700 text-white py-2 rounded-lg hover:bg-green-800 disabled:opacity-50">
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account? <Link href="/auth/signin" className="text-green-700 hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
