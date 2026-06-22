"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteAction } from "@/lib/actions/actionItems";

export function DeleteActionButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function onClick() {
    if (!confirm("Hapus action item ini?")) return;
    startTransition(async () => {
      const res = await deleteAction(id);
      if (!res.ok) alert(res.error ?? "Gagal menghapus");
      else router.refresh();
    });
  }

  return (
    <Button variant="ghost" size="icon-sm" onClick={onClick} disabled={pending} title="Hapus">
      <Trash2 className="text-destructive" />
    </Button>
  );
}
