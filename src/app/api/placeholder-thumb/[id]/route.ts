import { NextRequest, NextResponse } from "next/server";

const COLORS = [
  ["#1a1a2e", "#16213e"], ["#0f3460", "#533483"], ["#1b4332", "#2d6a4f"],
  ["#370617", "#6a040f"], ["#03045e", "#0077b6"], ["#2d00f7", "#6a00f4"],
  ["#1a237e", "#283593"], ["#4a148c", "#6a1b9a"], ["#b71c1c", "#c62828"],
  ["#006064", "#00838f"], ["#33691e", "#558b2f"], ["#e65100", "#ef6c00"],
  ["#1b5e20", "#2e7d32"], ["#880e4f", "#ad1457"], ["#004d40", "#00695c"],
  ["#01579b", "#0277bd"], ["#311b92", "#4527a0"], ["#bf360c", "#d84315"],
  ["#1a237e", "#283593"], ["#37474f", "#455a64"],
];

const ICONS = ["🎬", "📹", "🎥", "💻", "🌐", "⚙️", "🚀", "📊", "🎓", "🔧",
               "☁️", "🔒", "🧪", "⚡", "🏗️", "🔄", "🗄️", "📋", "🛡️", "📡"];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const idx = (parseInt(id) - 1) % COLORS.length;
  const [color1, color2] = COLORS[idx] ?? ["#1a1a2e", "#16213e"];
  const icon = ICONS[idx] ?? "🎬";

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${color1};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${color2};stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="1280" height="720" fill="url(#bg)"/>
  <rect x="40" y="40" width="1200" height="640" rx="12" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
  <text x="640" y="300" font-size="160" text-anchor="middle" dominant-baseline="middle">${icon}</text>
  <text x="640" y="460" font-family="system-ui, -apple-system, sans-serif" font-size="36" font-weight="700" fill="rgba(255,255,255,0.9)" text-anchor="middle">Creator Studio Demo</text>
  <text x="640" y="510" font-family="system-ui, -apple-system, sans-serif" font-size="22" fill="rgba(255,255,255,0.5)" text-anchor="middle">Demo Thumbnail #${id}</text>
  <rect x="540" y="540" width="200" height="4" rx="2" fill="rgba(255,255,255,0.2)"/>
</svg>`;

  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
