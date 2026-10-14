// Draws the hacker badge artwork (front, back, strap) onto canvases so the 3D
// card can use them as textures. The code on the badge is generated from the
// name for decoration; it is not a ticket or registration number.

export const BADGE_W = 800;
export const BADGE_H = 1125;

const LAV = "#d4c4ff";

function hash(str: string) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function badgeCode(name: string) {
  const h = hash(name.trim().toLowerCase() || "hacker").toString(16).toUpperCase().padStart(8, "0");
  return `HU-8-${h.slice(0, 4)}`;
}

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function fit(ctx: CanvasRenderingContext2D, text: string, maxW: number, start: number, min: number, font: (s: number) => string) {
  let size = start;
  ctx.font = font(size);
  while (ctx.measureText(text).width > maxW && size > min) {
    size -= 4;
    ctx.font = font(size);
  }
  return size;
}

function background(ctx: CanvasRenderingContext2D) {
  const g = ctx.createLinearGradient(0, 0, 0, BADGE_H);
  g.addColorStop(0, "#14111d");
  g.addColorStop(0.55, "#09090c");
  g.addColorStop(1, "#050507");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, BADGE_W, BADGE_H);

  // dot lattice
  ctx.fillStyle = "rgba(255,255,255,0.07)";
  for (let y = 40; y < BADGE_H; y += 34) for (let x = 40; x < BADGE_W; x += 34) ctx.fillRect(x, y, 2, 2);

  const r = ctx.createRadialGradient(BADGE_W / 2, 330, 20, BADGE_W / 2, 330, 460);
  r.addColorStop(0, "rgba(212,196,255,0.22)");
  r.addColorStop(1, "rgba(212,196,255,0)");
  ctx.fillStyle = r;
  ctx.fillRect(0, 0, BADGE_W, BADGE_H);

  ctx.strokeStyle = "rgba(212,196,255,0.28)";
  ctx.lineWidth = 3;
  ctx.strokeRect(22, 22, BADGE_W - 44, BADGE_H - 44);
}

export async function drawFront(name: string, family: { display: string; mono: string }): Promise<HTMLCanvasElement> {
  const cv = document.createElement("canvas");
  cv.width = BADGE_W;
  cv.height = BADGE_H;
  const ctx = cv.getContext("2d")!;
  background(ctx);

  const label = name.trim();
  const shown = label || "Your name";

  // header (the 3D card has a lanyard slot cut near the top, so keep it clear)
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = LAV;
  ctx.font = `500 30px ${family.mono}`;
  ctx.textAlign = "left";
  ctx.fillText("UNITED HACKS V8", 70, 190);
  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.textAlign = "right";
  ctx.fillText("JAN 8-10, 2027", BADGE_W - 70, 190);

  // globe mark
  const logo = await loadImage("/images/globe-icon.png");
  if (logo) {
    const s = 330;
    ctx.drawImage(logo, BADGE_W / 2 - s / 2, 235, s, s);
  }

  // name
  ctx.textAlign = "left";
  ctx.fillStyle = label ? "#ffffff" : "rgba(255,255,255,0.32)";
  const words = shown.split(/\s+/);
  const lines: string[] = [];
  if (words.length > 1 && shown.length > 11) {
    const mid = Math.ceil(words.length / 2);
    lines.push(words.slice(0, mid).join(" "), words.slice(mid).join(" "));
  } else lines.push(shown);
  const fontFn = (s: number) => `700 ${s}px ${family.display}`;
  const size = Math.min(...lines.map((l) => fit(ctx, l, 660, lines.length > 1 ? 118 : 150, 54, fontFn)));
  ctx.font = fontFn(size);
  const baseY = lines.length > 1 ? 770 : 800;
  lines.forEach((l, i) => ctx.fillText(l, 70, baseY + i * size * 0.95));

  // role pill
  const pillY = baseY + (lines.length - 1) * size * 0.95 + 56;
  ctx.font = `500 28px ${family.mono}`;
  const role = "HACKER";
  const tw = ctx.measureText(role).width + 44;
  ctx.strokeStyle = LAV;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(70, pillY, tw, 54, 27);
  ctx.stroke();
  ctx.fillStyle = LAV;
  ctx.textAlign = "left";
  ctx.fillText(role, 92, pillY + 37);

  // decorative scan code derived from the name
  const code = badgeCode(label);
  let seed = hash(code);
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  let x = 70;
  while (x < BADGE_W - 250) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    const w = 3 + (seed % 5);
    const gap = 3 + ((seed >> 4) % 4);
    ctx.fillRect(x, BADGE_H - 150, w, 70);
    x += w + gap;
  }
  ctx.font = `500 26px ${family.mono}`;
  ctx.fillStyle = "rgba(255,255,255,0.6)";
  ctx.textAlign = "right";
  ctx.fillText(code, BADGE_W - 70, BADGE_H - 100);
  ctx.textAlign = "left";
  ctx.fillStyle = "rgba(255,255,255,0.4)";
  ctx.font = `500 24px ${family.mono}`;
  ctx.fillText("hackunited.org", 70, BADGE_H - 62);
  return cv;
}

export async function drawBack(family: { display: string; mono: string }): Promise<HTMLCanvasElement> {
  const cv = document.createElement("canvas");
  cv.width = BADGE_W;
  cv.height = BADGE_H;
  const ctx = cv.getContext("2d")!;
  background(ctx);
  const logo = await loadImage("/images/globe-icon.png");
  if (logo) ctx.drawImage(logo, BADGE_W / 2 - 220, 300, 440, 440);
  ctx.textAlign = "center";
  ctx.fillStyle = "#ffffff";
  ctx.font = `700 76px ${family.display}`;
  ctx.fillText("Hack United", BADGE_W / 2, 850);
  ctx.fillStyle = LAV;
  ctx.font = `500 28px ${family.mono}`;
  ctx.fillText("FREE HACKATHONS FOR STUDENTS", BADGE_W / 2, 910);
  return cv;
}

export function drawStrap(family: { display: string; mono: string }): HTMLCanvasElement {
  const cv = document.createElement("canvas");
  cv.width = 128;
  cv.height = 1024;
  const ctx = cv.getContext("2d")!;
  ctx.fillStyle = "#0b0a10";
  ctx.fillRect(0, 0, 128, 1024);
  ctx.fillStyle = LAV;
  ctx.fillRect(0, 0, 6, 1024);
  ctx.fillRect(122, 0, 6, 1024);
  ctx.save();
  ctx.translate(64, 512);
  ctx.rotate(-Math.PI / 2);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `700 54px ${family.display}`;
  ctx.fillStyle = "rgba(212,196,255,0.9)";
  const unit = "HACK UNITED   ";
  ctx.fillText(unit.repeat(4), 0, 0);
  ctx.restore();
  return cv;
}
