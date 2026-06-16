import { NextRequest, NextResponse } from "next/server";

const DEFAULT_NOMINATIM_BASE_URL = "https://nominatim.openstreetmap.org";
const DEFAULT_USER_AGENT = "celiac-nz-mvp/1.0 (https://github.com/kiwikierab/celiac)";
const NZ_MIN_LAT = -53;
const NZ_MAX_LAT = -34;
const NZ_MIN_LNG = 166;
const NZ_MAX_LNG = 179;

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
  address?: {
    house_number?: string;
    road?: string;
    pedestrian?: string;
    footway?: string;
    path?: string;
    suburb?: string;
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    county?: string;
    postcode?: string;
  };
}

export async function GET(request: NextRequest) {
  const address = request.nextUrl.searchParams.get("address")?.trim();
  if (!address) {
    return NextResponse.json({ error: "Address is required." }, { status: 400 });
  }

  const baseUrl = (process.env.NOMINATIM_BASE_URL || DEFAULT_NOMINATIM_BASE_URL).trim();
  const userAgent = (process.env.NOMINATIM_USER_AGENT || DEFAULT_USER_AGENT).trim();
  const email = process.env.NOMINATIM_EMAIL?.trim();

  const searchUrl = new URL("/search", baseUrl);
  searchUrl.searchParams.set("q", address);
  searchUrl.searchParams.set("format", "jsonv2");
  searchUrl.searchParams.set("addressdetails", "1");
  searchUrl.searchParams.set("countrycodes", "nz");
  searchUrl.searchParams.set("limit", "5");
  if (email) {
    searchUrl.searchParams.set("email", email);
  }

  try {
    const response = await fetch(searchUrl.toString(), {
      headers: {
        Accept: "application/json",
        "Accept-Language": "en-NZ,en",
        "User-Agent": userAgent,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json({ error: "Address lookup failed." }, { status: 502 });
    }

    const payload = (await response.json()) as NominatimResult[];
    const matches = Array.isArray(payload) ? payload : [];
    const validMatch = matches.find((item) => {
      const lat = Number(item.lat);
      const lng = Number(item.lon);
      return Number.isFinite(lat) && Number.isFinite(lng) && isWithinNzBounds(lat, lng);
    });

    if (!validMatch) {
      return NextResponse.json(
        { error: "No New Zealand address match found." },
        { status: 404 }
      );
    }

    const streetName =
      validMatch.address?.road ||
      validMatch.address?.pedestrian ||
      validMatch.address?.footway ||
      validMatch.address?.path;
    const streetAddress = [validMatch.address?.house_number, streetName]
      .filter(Boolean)
      .join(" ")
      .trim();
    const city =
      validMatch.address?.city ||
      validMatch.address?.town ||
      validMatch.address?.village ||
      validMatch.address?.municipality ||
      validMatch.address?.county ||
      "";

    return NextResponse.json({
      address: streetAddress || validMatch.display_name.split(",")[0]?.trim() || "",
      suburb: validMatch.address?.suburb || "",
      city,
      postcode: validMatch.address?.postcode || "",
      lat: Number(validMatch.lat),
      lng: Number(validMatch.lon),
      formattedAddress: validMatch.display_name,
      country: "New Zealand",
    });
  } catch {
    return NextResponse.json({ error: "Address lookup failed." }, { status: 502 });
  }
}

function isWithinNzBounds(lat: number, lng: number) {
  return lat >= NZ_MIN_LAT && lat <= NZ_MAX_LAT && lng >= NZ_MIN_LNG && lng <= NZ_MAX_LNG;
}
