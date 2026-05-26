"use client";

import { useState } from "react";
import Image from "next/image";

export default function UserSidebarAvatar({
  avatar,
  name,
}: {
  avatar: string | null;
  name: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="w-10 h-10 rounded-full bg-sakura-100 flex items-center justify-center text-lg overflow-hidden flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
        onClick={() => avatar && setOpen(true)}
        aria-label={`查看${name}的头像`}
      >
        {avatar ? (
          <Image src={avatar} alt={`${name}的头像`} width={40} height={40} className="w-full h-full object-cover" unoptimized />
        ) : (
          <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" className="w-7 h-7">
            <circle cx="16" cy="16" r="16" fill="#fce4ec" />
            <g fill="#fff" opacity="0.55">
              <circle cx="16" cy="7.5" r="4.2" />
              <circle cx="23.5" cy="12.5" r="4.2" />
              <circle cx="20.6" cy="21.2" r="4.2" />
              <circle cx="11.4" cy="21.2" r="4.2" />
              <circle cx="8.5" cy="12.5" r="4.2" />
            </g>
            <circle cx="16" cy="16" r="5" fill="#f8bbd0" />
          </svg>
        )}
      </button>

      {open && avatar && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="头像预览"
        >
          <div className="relative max-w-lg w-full max-h-[80vh]">
            <Image
              src={avatar}
              alt={`${name}的头像`}
              width={600}
              height={600}
              className="w-full h-auto rounded-2xl object-contain"
              unoptimized
            />
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute -top-3 -right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-gray-50 transition-colors"
              aria-label="关闭预览"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
