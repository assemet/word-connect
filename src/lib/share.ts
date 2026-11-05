/* eslint-disable @typescript-eslint/no-explicit-any */
// Browser-only: draws a share card on a canvas and shares it via the system sheet (Telegram included).

type Card =
  | { kind: "win"; level: number; world: string; stars: number }
  | { kind: "help"; level: number; world: string; letters: string; words: string[]; found: string[] };

function draw(card: Card): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = 1080; c.height = 1080;
  const g = c.getContext("2d")!;
  const bg = g.createLinearGradient(0, 0, 0, 1080);
  bg.addColorStop(0, "#1d2b53"); bg.addColorStop(1, "#3b2a6b");
  g.fillStyle = bg; g.fillRect(0, 0, 1080, 1080);
  g.textAlign = "center";
  g.fillStyle = "#ffd34d"; g.font = "bold 84px sans-serif"; g.fillText("WORD CONNECT", 540, 140);
  g.fillStyle = "#ffffff"; g.font = "600 46px sans-serif";
  g.fillText(`${card.world} · Level ${card.level}`, 540, 220);

  if (card.kind === "win") {
    g.font = "bold 110px sans-serif"; g.fillText("Level Complete!", 540, 480);
    g.font = "160px sans-serif";
    g.fillText([1, 2, 3].map((s) => (s <= card.stars ? "★" : "☆")).join(" "), 540, 700);
    g.fillStyle = "#ffd34d"; g.font = "600 50px sans-serif"; g.fillText("Can you beat me? 🎮", 540, 900);
  } else {
    g.font = "bold 80px sans-serif"; g.fillText("Help me! 🆘", 540, 330);
    const rows = card.words.slice(0, 10);
    rows.forEach((w, r) => {
      const size = Math.min(56, 700 / w.length);
      const y = 390 + r * (size + 12);
      const x0 = 540 - (w.length * (size + 8)) / 2;
      w.split("").forEach((ch, i) => {
        g.fillStyle = "#fff8e7";
        g.fillRect(x0 + i * (size + 8), y, size, size);
        if (card.found.includes(w)) {
          g.fillStyle = "#1d2b53"; g.font = `bold ${size * 0.7}px sans-serif`;
          g.fillText(ch, x0 + i * (size + 8) + size / 2, y + size * 0.75);
        }
      });
    });
    const L = card.letters.split("");
    L.forEach((ch, i) => {
      const x = 540 + (i - (L.length - 1) / 2) * 110, y = 990;
      g.fillStyle = "#ffd34d"; g.beginPath(); g.arc(x, y, 48, 0, Math.PI * 2); g.fill();
      g.fillStyle = "#1d2b53"; g.font = "bold 56px sans-serif"; g.fillText(ch, x, y + 20);
    });
  }
  return c;
}

export async function shareCard(card: Card): Promise<"shared" | "downloaded" | "cancelled"> {
  const text = card.kind === "win"
    ? `I beat Level ${card.level} in Word Connect with ${card.stars}★! Can you beat me? 🎮`
    : `I'm stuck on Level ${card.level} in Word Connect! Letters: ${card.letters.split("").join(", ")}. Can you help me find the words? 🧩`;
  const blob: Blob = await new Promise((r) => draw(card).toBlob((b) => r(b!), "image/png"));
  const file = new File([blob], `word-connect-level-${card.level}.png`, { type: "image/png" });
  const nav: any = navigator;
  if (nav.canShare?.({ files: [file] })) {
    try { await nav.share({ files: [file], text }); return "shared"; }
    catch { return "cancelled"; }
  }
  // Fallback: save the image and open Telegram's share sheet with the text.
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob); a.download = file.name; a.click();
  const url = `https://t.me/share/url?url=${encodeURIComponent(location.href)}&text=${encodeURIComponent(text)}`;
  const tg = (window as any).Telegram?.WebApp;
  if (tg?.openTelegramLink) tg.openTelegramLink(url); else window.open(url, "_blank");
  return "downloaded";
}
