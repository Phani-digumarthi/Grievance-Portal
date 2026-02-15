"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminProtected({ children }) {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      router.replace("/admin/login");
    }
  }, []);

  return children;
}
