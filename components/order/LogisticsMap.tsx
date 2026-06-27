"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  address: {
    province?: string | null;
    city?: string | null;
    district?: string | null;
    detail?: string | null;
  };
  trackingNo?: string | null;
  logisticsCompany?: string | null;
}

export default function LogisticsMap({ address, trackingNo, logisticsCompany }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");

  const fullAddress = [address.province, address.city, address.district, address.detail]
    .filter(Boolean)
    .join("");

  useEffect(() => {
    if (!fullAddress || loaded || containerRef.current?.children.length) return;

    // Security config for AMap 2.0
    (window as any)._AMapSecurityConfig = {
      securityJsCode: process.env.NEXT_PUBLIC_AMAP_SECURITY_CODE || "",
    };

    const key = process.env.NEXT_PUBLIC_AMAP_KEY;
    if (!key) {
      setError("地图 Key 未配置");
      return;
    }

    // Load AMap SDK
    const script = document.createElement("script");
    script.src = `https://webapi.amap.com/maps?v=2.0&key=${key}&plugin=AMap.Geocoder,AMap.Marker`;
    script.async = true;
    script.onload = () => {
      const AMap = (window as any).AMap;
      if (!AMap || !containerRef.current) return;

      try {
        const map = new AMap.Map(containerRef.current, {
          zoom: 13,
          center: [116.397428, 39.90923], // default center
          mapStyle: "amap://styles/whitesmoke",
        });
        mapRef.current = map;

        // Geocode the address
        const geocoder = new AMap.Geocoder({ map });
        geocoder.getLocation(fullAddress, (status: string, result: any) => {
          const geocodes: any[] = result?.geocodes || [];
          const loc = geocodes[0]?.location || { lng: 116.397428, lat: 39.90923 };

          if (status === "complete" && result?.info === "OK" && geocodes.length > 0) {
            map.setCenter([loc.lng, loc.lat]);
            map.setZoom(15);

            new AMap.Marker({
              map,
              position: [loc.lng, loc.lat],
              title: geocodes[0].formattedAddress,
              label: { content: "收", offset: { x: 0, y: -5 } },
            });
          }

          if (trackingNo) {
            try {
              new AMap.Marker({
                map,
                position: [loc.lng, loc.lat],
                title: "当前快件位置",
                icon: new AMap.Icon({
                  size: new AMap.Size(24, 24),
                  image: "https://webapi.amap.com/theme/v1.3/markers/n/mark_b.png",
                  imageSize: new AMap.Size(24, 24),
                }),
              });
            } catch (_) {
              // silent
            }
          }
        });
      } catch (e: any) {
        setError(e.message || "地图加载失败");
      }
    };
    script.onerror = () => setError("地图 SDK 加载失败");

    document.head.appendChild(script);
    setLoaded(true);

    return () => {
      if (script.parentNode) script.parentNode.removeChild(script);
      if (mapRef.current) {
        mapRef.current.destroy();
        mapRef.current = null;
      }
    };
  }, [fullAddress, trackingNo, loaded]);

  if (error) {
    return (
      <div className="rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center h-48 text-sm text-gray-400">
        {error}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-50 p-5 mb-4">
      <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-1.5">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
        物流地图
      </h3>
      <div ref={containerRef} className="w-full h-56 rounded-xl bg-gray-100" />
      {trackingNo && logisticsCompany && (
        <p className="text-xs text-gray-400 mt-2">
          {logisticsCompany} · 运单号：{trackingNo}
        </p>
      )}
    </div>
  );
}
