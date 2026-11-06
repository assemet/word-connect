/* eslint-disable @typescript-eslint/no-explicit-any */
// Browser-only: draws a game-styled share card on a canvas and shares it via the system sheet (Telegram included).

type Card =
  | { kind: "win"; level: number; world: string; stars: number; bg?: string }
  | { kind: "help"; level: number; world: string; letters: string; words: string[]; found: string[]; bg?: string };

const W = 1080, H = 1920;
const GOLD = "#ffd34d", NAVY = "#1d2b53", IVORY = "#fff8e7";

function loadImg(src: string): Promise<HTMLImageElement | null> {
  return new Promise((r) => {
    const i = new Image();
    i.crossOrigin = "anonymous";
    i.onload = () => r(i); i.onerror = () => r(null);
    i.src = src;
  });
}

function rr(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  g.beginPath(); g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
}

function text(g: CanvasRenderingContext2D, s: string, x: number, y: number, font: string, fill: string, stroke?: string) {
  g.font = font; g.textAlign = "center"; g.textBaseline = "middle";
  if (stroke) { g.lineJoin = "round"; g.lineWidth = 14; g.strokeStyle = stroke; g.strokeText(s, x, y); }
  g.fillStyle = fill; g.fillText(s, x, y);
}

function star(g: CanvasRenderingContext2D, cx: number, cy: number, r: number, on: boolean) {
  g.save(); g.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5, rad = i % 2 ? r * 0.45 : r;
    g.lineTo(cx + Math.cos(a) * rad, cy + Math.sin(a) * rad);
  }
  g.closePath();
  if (on) {
    const gr = g.createLinearGradient(cx, cy - r, cx, cy + r);
    gr.addColorStop(0, "#fff3a0"); gr.addColorStop(0.5, GOLD); gr.addColorStop(1, "#e08a00");
    g.shadowColor = "rgba(255,200,0,0.8)"; g.shadowBlur = 40; g.fillStyle = gr;
  } else g.fillStyle = "rgba(255,255,255,0.25)";
  g.fill(); g.shadowBlur = 0; g.lineWidth = 8; g.strokeStyle = on ? "#a35a00" : "rgba(0,0,0,0.3)"; g.stroke();
  g.restore();
}

async function draw(card: Card): Promise<HTMLCanvasElement> {
  const c = document.createElement("canvas");
  c.width = W; c.height = H;
  const g = c.getContext("2d")!;
  g.imageSmoothingQuality = "high";

  const img = card.bg ? await loadImg(card.bg) : null;
  if (img) {
    const s = Math.max(W / img.width, H / img.height);
    g.drawImage(img, (W - img.width * s) / 2, (H - img.height * s) / 2, img.width * s, img.height * s);
  } else {
    const bg = g.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, NAVY); bg.addColorStop(1, "#3b2a6b"); g.fillStyle = bg; g.fillRect(0, 0, W, H);
  }
  const shade = g.createLinearGradient(0, 0, 0, H);
  shade.addColorStop(0, "rgba(10,15,40,0.55)"); shade.addColorStop(0.5, "rgba(10,15,40,0.25)"); shade.addColorStop(1, "rgba(10,15,40,0.6)");
  g.fillStyle = shade; g.fillRect(0, 0, W, H);

  text(g, "WORD CONNECT", W / 2, 150, "900 96px sans-serif", GOLD, NAVY);
  g.fillStyle = "rgba(29,43,83,0.8)"; rr(g, W / 2 - 330, 225, 660, 80, 40); g.fill();
  text(g, `${card.world} · Level ${card.level}`, W / 2, 266, "700 42px sans-serif", "#fff");

  if (card.kind === "win") {
    const rays = g.createRadialGradient(W / 2, 820, 50, W / 2, 820, 520);
    rays.addColorStop(0, "rgba(255,220,100,0.55)"); rays.addColorStop(1, "rgba(255,220,100,0)");
    g.fillStyle = rays; g.fillRect(0, 300, W, 1100);
    text(g, "Level Complete!", W / 2, 560, "900 110px sans-serif", "#fff", NAVY);
    star(g, W / 2 - 260, 860, 120, card.stars >= 1);
    star(g, W / 2, 800, 160, card.stars >= 2);
    star(g, W / 2 + 260, 860, 120, card.stars >= 3);
    g.fillStyle = IVORY; g.shadowColor = "rgba(0,0,0,0.4)"; g.shadowBlur = 30;
    rr(g, 140, 1250, W - 280, 240, 50); g.fill(); g.shadowBlur = 0;
    text(g, "Can you beat me?", W / 2, 1330, "900 72px sans-serif", NAVY);
    text(g, "Play Word Connect on Telegram 🎮", W / 2, 1420, "600 40px sans-serif", "#6b5a2a");
  } else {
    text(g, "Help me! 🆘", W / 2, 420, "900 100px sans-serif", "#fff", NAVY);
    const left = card.words.filter((w) => !card.found.includes(w)).length;
    text(g, `${left} word${left === 1 ? "" : "s"} left`, W / 2, 520, "700 44px sans-serif", GOLD, NAVY);

    // Word grid in a glass panel
    const rows = card.words.slice(0, 12);
    const maxLen = Math.max(...rows.map((w) => w.length), 3);
    const cols = rows.length > 6 ? 2 : 1;
    const colW = (W - 160) / cols;
    const size = Math.min(78, (colW - 40) / maxLen - 10);
    const perCol = Math.ceil(rows.length / cols);
    const gridH = perCol * (size + 14);
    const top = 600;
    g.fillStyle = "rgba(255,255,255,0.18)"; rr(g, 60, top - 30, W - 120, gridH + 60, 40); g.fill();
    rows.forEach((w, idx) => {
      const col = Math.floor(idx / perCol), r = idx % perCol;
      const cx = 80 + col * colW + colW / 2;
      const y = top + r * (size + 14);
      const x0 = cx - (w.length * (size + 10) - 10) / 2;
      const solved = card.found.includes(w);
      w.split("").forEach((ch, i) => {
        const x = x0 + i * (size + 10);
        g.fillStyle = "rgba(0,0,0,0.3)"; rr(g, x, y + 6, size, size, 14); g.fill();
        const tg = g.createLinearGradient(0, y, 0, y + size);
        if (solved) { tg.addColorStop(0, "#ffe27a"); tg.addColorStop(1, "#f2a900"); }
        else { tg.addColorStop(0, "#ffffff"); tg.addColorStop(1, "#efe3c4"); }
        g.fillStyle = tg; rr(g, x, y, size, size, 14); g.fill();
        if (solved) text(g, ch, x + size / 2, y + size / 2 + 3, `900 ${size * 0.62}px sans-serif`, NAVY);
      });
    });

    // Letter wheel
    const wy = Math.max(top + gridH + 380, 1450), R = 290;
    const disc = g.createRadialGradient(W / 2, wy - 60, 40, W / 2, wy, R);
    disc.addColorStop(0, "rgba(255,255,255,0.6)"); disc.addColorStop(1, "rgba(255,255,255,0.22)");
    g.shadowColor = "rgba(0,0,0,0.4)"; g.shadowBlur = 40;
    g.fillStyle = disc; g.beginPath(); g.arc(W / 2, wy, R, 0, Math.PI * 2); g.fill(); g.shadowBlur = 0;
    g.lineWidth = 12; g.strokeStyle = GOLD; g.stroke();
    const L = card.letters.split("");
    const lr = L.length > 6 ? 62 : 72;
    L.forEach((ch, i) => {
      const a = -Math.PI / 2 + (i * 2 * Math.PI) / L.length;
      const x = W / 2 + Math.cos(a) * (R - lr - 30), y = wy + Math.sin(a) * (R - lr - 30);
      g.fillStyle = "rgba(0,0,0,0.35)"; g.beginPath(); g.arc(x, y + 8, lr, 0, Math.PI * 2); g.fill();
      const bg = g.createLinearGradient(0, y - lr, 0, y + lr);
      bg.addColorStop(0, "#ffffff"); bg.addColorStop(1, "#f1dfb0");
      g.fillStyle = bg; g.beginPath(); g.arc(x, y, lr, 0, Math.PI * 2); g.fill();
      text(g, ch, x, y + 4, `900 ${lr * 1.1}px sans-serif`, NAVY);
    });
  }
  return c;
}

export async function shareCard(card: Card): Promise<"shared" | "downloaded" | "cancelled"> {
  const text = card.kind === "win"
    ? `I beat Level ${card.level} in Word Connect with ${card.stars}★! Can you beat me? 🎮`
    : `I'm stuck on Level ${card.level} in Word Connect! Letters: ${card.letters.split("").join(", ")}. Can you help me find the words? 🧩`;
  const canvas = await draw(card);
  const blob: Blob = await new Promise((r) => canvas.toBlob((b) => r(b!), "image/png"));
  const file = new File([blob], `word-connect-level-${card.level}.png`, { type: "image/png" });
  const nav: any = navigator;
  if (nav.canShare?.({ files: [file] })) {
    try { await nav.share({ files: [file], text }); return "shared"; }
    catch { return "cancelled"; }
  }
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob); a.download = file.name; a.click();
  const url = `https://t.me/share/url?url=${encodeURIComponent(location.href)}&text=${encodeURIComponent(text)}`;
  const tg = (window as any).Telegram?.WebApp;
  if (tg?.openTelegramLink) tg.openTelegramLink(url); else window.open(url, "_blank");
  return "downloaded";
}
