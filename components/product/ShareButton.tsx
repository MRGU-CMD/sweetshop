"use client";

import { useToast } from "@/components/ui/Toast";

export default function ShareButton({ name }: { name: string }) {
  const { toast } = useToast();

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: name, url });
        return;
      } catch { /* user cancelled */ }
    }
    await navigator.clipboard.writeText(url);
    toast("链接已复制，快去分享吧~", "success");
  };

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-400 hover:border-sakura-300 hover:text-sakura-500 transition-all"
      title="分享"
    >
      <span>↗</span>
      <span>分享</span>
    </button>
  );
}
