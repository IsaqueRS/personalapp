"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { LogOut } from "lucide-react";
import { useState } from "react";

export default function LogoutButton() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="flex items-center gap-2 text-textMuted hover:text-primary transition-colors text-sm font-medium bg-surface border border-surfaceAlt rounded-xl px-3.5 py-2"
    >
      <LogOut size={16} />
      Sair
    </button>
  );
}
