"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteMeeting } from "@/lib/actions/meetings";

export function DeleteMeetingButton({ id, count }: { id: string; count: number }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function onClick() {
    const msg =
      count > 0
        ? `Hapus meeting ini beserta ${count} action item di dalamnya?`
        : "Hapus meeting ini?";
    if (!confirm(msg)) return;
    startTransition(async () => {
      const res = await deleteMeeting(id);
      if (!res.ok) alert(res.error ?? "Gagal menghapus");
      else router.refresh();
    });
  }

  return (
    <Button variant="ghost" size="icon-sm" onClick={onClick} disabled={pending} title="Hapus meeting">
      <Trash2 className="text-destructive" />
    </Button>
  );
}
