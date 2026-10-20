"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/api-client";
import { RADIUS_OPTIONS_KM, type LatLng } from "@/lib/geo";

type Props = {
  initial: { neighborhoodName: string | null; lat: number | null; lng: number | null; radiusKm: number };
};

export function LocationPicker({ initial }: Props) {
  const router = useRouter();
  const [coords, setCoords] = useState<LatLng | null>(
    initial.lat != null && initial.lng != null ? { lat: initial.lat, lng: initial.lng } : null,
  );
  const [name, setName] = useState(initial.neighborhoodName ?? "");
  const [radiusKm, setRadiusKm] = useState(initial.radiusKm);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  function locate() {
    setError("");
    if (!navigator.geolocation) {
      setError("이 브라우저는 위치 정보를 지원하지 않아요.");
      return;
    }
    setStatus("현재 위치를 찾는 중…");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setStatus("");
      },
      () => {
        setStatus("");
        setError("위치 권한을 허용해주세요.");
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  async function save() {
    if (!coords) return;
    setPending(true);
    setError("");
    try {
      await api("/api/me/location", "PUT", { neighborhoodName: name, radiusKm, ...coords });
      router.replace("/");
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
      setPending(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <h2 className="font-semibold">1. 내 위치 확인</h2>
        <button type="button" onClick={locate} className="w-full rounded-lg border border-brand py-3 font-semibold text-brand">
          📍 현재 위치로 찾기
        </button>
        {status && <p className="text-sm text-muted">{status}</p>}
        {coords && (
          <p className="text-sm text-muted" data-testid="coords">
            위도 {coords.lat.toFixed(4)}, 경도 {coords.lng.toFixed(4)}
          </p>
        )}
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold">2. 동네 이름</h2>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="예: 역삼동"
          className="input"
          aria-label="동네 이름"
        />
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold">3. 이웃 범위</h2>
        <div className="grid grid-cols-4 gap-2">
          {RADIUS_OPTIONS_KM.map((km) => (
            <button
              key={km}
              type="button"
              onClick={() => setRadiusKm(km)}
              className={`rounded-lg border py-2 text-sm ${
                radiusKm === km ? "border-brand bg-brand text-white" : "border-border"
              }`}
            >
              {km}km
            </button>
          ))}
        </div>
        <p className="text-sm text-muted">내 위치에서 {radiusKm}km 안의 이웃 글을 볼 수 있어요.</p>
      </section>

      {error && <p className="text-sm text-red-500">{error}</p>}
      <button type="button" onClick={save} disabled={!coords || !name.trim() || pending} className="btn-primary">
        이 동네로 설정하기
      </button>
    </div>
  );
}
