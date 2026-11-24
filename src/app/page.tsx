"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import LoginModal from "@/components/LoginModal";
import Footer from "@/components/Footer";
import type { PrivateData } from "@/components/MemberPanel";

type Tab = "list" | "prices" | "communication";

export default function HomePage() {
  const [member, setMember] = useState<string | null>(null);
  const [data, setData] = useState<PrivateData | null>(null);
  const [tab, setTab] = useState<Tab>("list");
  const [modalOpen, setModalOpen] = useState(false);
  // Remembers which locked section the visitor clicked so it opens right after login.
  const pendingTab = useRef<Tab | null>(null);

  // Asks the server whether there is a valid session; private data only arrives if there is.
  const loadSession = useCallback(async () => {
    try {
      const res = await fetch("/api/private", { cache: "no-store" });
      const json = (await res.json()) as { authenticated: boolean; member?: string; data?: PrivateData };
      if (json.authenticated && json.data) {
        setMember(json.member ?? null);
        setData(json.data);
        return true;
      }
    } catch {
      // Treat any failure as "not logged in".
    }
    setMember(null);
    setData(null);
    return false;
  }, []);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  const closeModal = useCallback(() => setModalOpen(false), []);

  function openLogin(requested?: Tab) {
    pendingTab.current = requested ?? null;
    setModalOpen(true);
  }

  async function handleLoginSuccess() {
    const ok = await loadSession();
    if (!ok) return;
    setTab(pendingTab.current ?? "list");
    pendingTab.current = null;
    setModalOpen(false);
  }

  async function handleLogout() {
    try {
      await fetch("/api/logout", { method: "POST" });
    } finally {
      setMember(null);
      setData(null);
      setTab("list");
    }
  }

  return (
    <>
      <Navbar
        member={member}
        activeTab={tab}
        onSelectTab={setTab}
        onLoginClick={openLogin}
        onLogout={handleLogout}
      />
      <Hero data={data} activeTab={tab} onSelectTab={setTab} />
      <Footer />
      <LoginModal open={modalOpen} onClose={closeModal} onSuccess={handleLoginSuccess} />
    </>
  );
}
