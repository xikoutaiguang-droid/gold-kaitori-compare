import { NextRequest, NextResponse } from "next/server";
import { getCompanies } from "@/lib/companies";
import { isSameRootDomain } from "@/lib/domain";
import type { Company } from "@/lib/types";

export const runtime = "nodejs";

interface PlaceCandidate {
  id: string;
  displayName?: { text?: string };
  formattedAddress?: string;
  location?: { latitude: number; longitude: number };
  googleMapsUri?: string;
  websiteUri?: string;
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * 「会社名」だけのText Searchでは、同名の無関係な店舗(飲食店・別業種等)を誤って
 * 拾うことがある(実際に「ネクサス」→ネクサスクリニック、「銀座屋」→銀座屋酒店が混入した)。
 * 候補のwebsiteUriが会社の公式ドメインと一致するものだけを採用する。
 */
function isVerifiedMatch(company: Company, websiteUri: string | undefined) {
  if (!websiteUri) return false;
  return isSameRootDomain(websiteUri, company.officialUrl);
}

async function findNearestVerifiedStore(company: Company, lat: number, lng: number, apiKey: string) {
  const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask":
        "places.id,places.displayName,places.formattedAddress,places.location,places.googleMapsUri,places.websiteUri",
    },
    body: JSON.stringify({
      textQuery: company.name,
      languageCode: "ja",
      locationBias: {
        circle: { center: { latitude: lat, longitude: lng }, radius: 30000 },
      },
    }),
  });
  if (!res.ok) return null;
  const json = (await res.json()) as { places?: PlaceCandidate[] };
  const candidates = json.places ?? [];

  // 公式ドメインと一致する候補のうち、最も近いものを採用する。
  const verified = candidates.filter((p) => p.location && isVerifiedMatch(company, p.websiteUri));
  if (verified.length === 0) return null;

  return verified.reduce((nearest, p) => {
    const d1 = haversineKm(lat, lng, nearest.location!.latitude, nearest.location!.longitude);
    const d2 = haversineKm(lat, lng, p.location!.latitude, p.location!.longitude);
    return d2 < d1 ? p : nearest;
  });
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "サーバー側でGoogle Places APIキーが未設定です。" }, { status: 500 });
  }

  const body = await req.json().catch(() => null);
  const lat = Number(body?.lat);
  const lng = Number(body?.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json({ error: "現在地の情報が正しくありません。" }, { status: 400 });
  }

  const companies = getCompanies();

  const results = await Promise.all(
    companies.map(async (company) => {
      const place = await findNearestVerifiedStore(company, lat, lng, apiKey);
      if (!place?.location) return null;
      const distanceKm = haversineKm(lat, lng, place.location.latitude, place.location.longitude);
      // 半径30km圏内でヒットしなかった(=同名の遠方店舗しか見つからなかった)場合は
      // 「近くの店舗」として案内するには不適切なので除外する。
      if (distanceKm > 30) return null;
      return {
        companyId: company.id,
        companyName: company.name,
        storeName: place.displayName?.text ?? company.name,
        address: place.formattedAddress ?? "",
        distanceKm: Math.round(distanceKm * 10) / 10,
        mapsUrl: place.googleMapsUri ?? null,
      };
    })
  );

  const nearby = results.filter((r): r is NonNullable<typeof r> => r !== null).sort((a, b) => a.distanceKm - b.distanceKm);

  return NextResponse.json({ results: nearby });
}
