"use client";

import { useState } from "react";
import Image from "next/image";

export default function UserSidebarAvatar({ avatar, name }: { avatar: string | null; name: string }) {
  const [preview, setPreview] = useState(false);

  return (
    <>
      <div className="flex items-center gap-3 px-4 pt-4 pb-3">
        {avatar ? (
          <button
            onClick={() => setPreview(true)}
            className="w-10 h-10 rounded-full bg-sakura-100 flex items-center justify-center text-lg overflow-hidden flex-shrink-0 cursor-pointer hover:ring-2 hover:ring-sakura-300 transition-all"
            title="查看头像大图"
          >
            <Image src={avatar} alt="" width={40} height={40} className="w-full h-full object-cover" unoptimized />
          </button>
        ) : (
          <div className="w-10 h-10 rounded-full bg-sakura-100 flex items-center justify-center text-lg overflow-hidden flex-shrink-0">
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
          </div>
        )}
        <div>
          <p className="text-sm font-medium text-gray-700 truncate">{name}</p>
        </div>
      </div>

      {preview && avatar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setPreview(false)}>
          <button
            onClick={() => setPreview(false)}
            className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white text-xl flex items-center justify-center transition-colors"
            aria-label="关闭"
          >
            ✕
          </button>
          <div className="relative max-w-2xl max-h-[80vh] w-full aspect-square" onClick={(e) => e.stopPropagation()}>
            <Image
              src={avatar}
              alt={name + "的头像"}
              fill
              className="object-contain"
              unoptimized
              sizes="(max-width: 768px) 90vw, 600px"
            />
          </div>
        </div>
      )}
    </>
  );
}
