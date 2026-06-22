"use client";

import { useState } from "react";
import { LogOut, ChevronDown, User } from "lucide-react";
import { handleSignOut } from "@/lib/actions";

interface Props {
  name: string;
  email: string;
}

export default function UserMenu({ name, email }: Readonly<Props>) {
  const [open, setOpen] = useState(false);

  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-2 py-1 rounded transition-opacity hover:opacity-80"
      >
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
          style={{ backgroundColor: "#385F71" }}
        >
          {initials || <User size={14} />}
        </div>
        <span className="hidden sm:inline text-xs font-medium max-w-[120px] truncate" style={{ color: "#2B4162" }}>
          {name}
        </span>
        <ChevronDown size={13} style={{ color: "#8F754F" }} />
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
            onKeyDown={(e) => { if (e.key === "Escape") setOpen(false); }}
            role="presentation"
          />

          {/* Dropdown */}
          <div
            className="absolute right-0 top-full mt-1 w-52 rounded-lg shadow-xl z-50 overflow-hidden"
            style={{ backgroundColor: "#FEFEFE", border: "1px solid #E5E3F0" }}
          >
            {/* User info */}
            <div className="px-4 py-3" style={{ borderBottom: "1px solid #E5E3F0" }}>
              <p className="text-xs font-semibold truncate" style={{ color: "#2B4162" }}>{name}</p>
              <p className="text-xs truncate mt-0.5" style={{ color: "#8F754F" }}>{email}</p>
            </div>

            <div style={{ borderTop: "1px solid #E5E3F0" }} />

            {/* Logout */}
            <form action={handleSignOut}>
              <button
                type="submit"
                className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium transition-colors hover:bg-red-50"
                style={{ color: "#DC2626" }}
              >
                <LogOut size={14} />
                Sign Out
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
