import type {
  CornerBallStyle,
  CornerFrameStyle,
  DotStyle,
  Fill,
  QRStyleConfig,
} from "./types";
import { isInFinder, type QRMatrix } from "./matrix";

type Radii = [number, number, number, number];

function f(n: number) {
  return String(Math.round(n * 1000) / 1000);
}

function roundedRectPath(x: number, y: number, w: number, h: number, radii: Radii) {
  const maxR = Math.min(w, h) / 2;
  const [r0, r1, r2, r3] = radii.map((r) => Math.max(0, Math.min(r, maxR)));
  return (
    `M${f(x + r0)} ${f(y)}` +
    `H${f(x + w - r1)}` +
    (r1 > 0 ? `A${f(r1)} ${f(r1)} 0 0 1 ${f(x + w)} ${f(y + r1)}` : "") +
    `V${f(y + h - r2)}` +
    (r2 > 0 ? `A${f(r2)} ${f(r2)} 0 0 1 ${f(x + w - r2)} ${f(y + h)}` : "") +
    `H${f(x + r3)}` +
    (r3 > 0 ? `A${f(r3)} ${f(r3)} 0 0 1 ${f(x)} ${f(y + h - r3)}` : "") +
    `V${f(y + r0)}` +
    (r0 > 0 ? `A${f(r0)} ${f(r0)} 0 0 1 ${f(x + r0)} ${f(y)}` : "") +
    "Z"
  );
}

function circlePath(cx: number, cy: number, r: number) {
  return (
    `M${f(cx - r)} ${f(cy)}` +
    `A${f(r)} ${f(r)} 0 1 0 ${f(cx + r)} ${f(cy)}` +
    `A${f(r)} ${f(r)} 0 1 0 ${f(cx - r)} ${f(cy)}Z`
  );
}

function diamondPath(x: number, y: number, s: number, inset = 0) {
  const cx = x + s / 2;
  const cy = y + s / 2;
  const hw = (s / 2) * (1 - inset);
  const hh = (s / 2) * (1 - inset);
  return (
    `M${f(cx)} ${f(cy - hh)}` +
    `L${f(cx + hw)} ${f(cy)}` +
    `L${f(cx)} ${f(cy + hh)}` +
    `L${f(cx - hw)} ${f(cy)}Z`
  );
}

const DOT_ROUND_FRACTION: Record<string, number> = {
  rounded: 0.5,
  "extra-rounded": 1,
};

function dotPath(
  style: DotStyle,
  r: number,
  c: number,
  x: number,
  y: number,
  s: number,
  hasUp: boolean,
  hasLeft: boolean,
  hasDown: boolean,
  hasRight: boolean
): string {
  switch (style) {
    case "square":
      return `M${f(x)} ${f(y)}h${f(s)}v${f(s)}h${f(-s)}Z`;
    case "dots":
      return circlePath(x + s / 2, y + s / 2, s * 0.44);
    case "diamond":
      return diamondPath(x, y, s, 0.04);
    case "rounded":
    case "extra-rounded": {
      const fr = DOT_ROUND_FRACTION[style];
      const rtl = !hasUp && !hasLeft ? fr * s : 0;
      const rtr = !hasUp && !hasRight ? fr * s : 0;
      const rbr = !hasDown && !hasRight ? fr * s : 0;
      const rbl = !hasDown && !hasLeft ? fr * s : 0;
      return roundedRectPath(x, y, s, s, [rtl, rtr, rbr, rbl]);
    }
    case "classy":
    case "classy-rounded": {
      const fr = 1;
      const rtl = !hasUp && !hasLeft ? fr * s : 0;
      const rbr = !hasDown && !hasRight ? fr * s : 0;
      return roundedRectPath(x, y, s, s, [rtl, 0, rbr, 0]);
    }
  }
}

const FRAME_RADII: Record<Exclude<CornerFrameStyle, "dots">, Radii> = {
  square: [0, 0, 0, 0],
  rounded: [2, 2, 2, 2],
  "extra-rounded": [3, 3, 3, 3],
  leaf: [2.8, 0, 2.8, 0],
};

function framePath(
  style: CornerFrameStyle,
  fx: number,
  fy: number,
  flipX: boolean,
  flipY: boolean
): string {
  if (style === "dots") {
    return (
      circlePath(fx + 3.5, fy + 3.5, 3.45) +
      circlePath(fx + 3.5, fy + 3.5, 2.45)
    );
  }
  let radii = [...FRAME_RADII[style]] as Radii;
  if (style === "leaf") {
    if (flipX) radii = [radii[1], radii[0], radii[3], radii[2]];
    if (flipY) radii = [radii[3], radii[2], radii[1], radii[0]];
  }
  const holeRadii = radii.map((r) => Math.max(0, r - 1)) as Radii;
  const outer = roundedRectPath(fx, fy, 7, 7, radii);
  const hole = roundedRectPath(fx + 1, fy + 1, 5, 5, holeRadii);
  return outer + hole;
}

function ballPath(style: CornerBallStyle, fx: number, fy: number): string {
  const x = fx + 2;
  const y = fy + 2;
  switch (style) {
    case "square":
      return `M${f(x)} ${f(y)}h3v3h-3Z`;
    case "rounded":
      return roundedRectPath(x, y, 3, 3, [0.95, 0.95, 0.95, 0.95]);
    case "dots":
      return circlePath(x + 1.5, y + 1.5, 1.42);
    case "diamond":
      return diamondPath(x, y, 3);
  }
}

interface FillDefResult {
  def: string;
  ref: string;
}

function fillDef(fill: Fill, id: string): FillDefResult {
  if (fill.type === "solid") {
    return { def: "", ref: fill.color };
  }
  if (fill.type === "radial") {
    const stops = fill.stops
      .map(
        (s) =>
          `<stop offset="${s.offset}" stop-color="${s.color}" stop-opacity="1"/>`
      )
      .join("");
    return {
      def: `<radialGradient id="${id}" cx="0.5" cy="0.5" r="0.65">${stops}</radialGradient>`,
      ref: `url(#${id})`,
    };
  }
  const stops = fill.stops
    .map(
      (s) =>
        `<stop offset="${s.offset}" stop-color="${s.color}" stop-opacity="1"/>`
    )
    .join("");
  return {
    def: `<linearGradient id="${id}" x1="0" y1="0" x2="1" y2="0" gradientTransform="rotate(${fill.rotation} 0.5 0.5)">${stops}</linearGradient>`,
    ref: `url(#${id})`,
  };
}

export function renderSVG(
  matrix: QRMatrix,
  cfg: QRStyleConfig,
  idPrefix = "qr"
): string {
  const n = matrix.size;
  const m = cfg.margin;
  const total = n + m * 2;

  const dotFill = fillDef(cfg.dotFill, `${idPrefix}-dots`);
  const cornerFill = fillDef(cfg.cornerFill, `${idPrefix}-corners`);

  const center = n / 2;
  const logoOn =
    cfg.logo.enabled && !!cfg.logo.src;
  const bgSize = logoOn ? (n * cfg.logo.size) / 100 : 0;
  const padSize = logoOn ? (n * cfg.logo.padding) / 100 : 0;
  const hideHalf = logoOn ? (bgSize + padSize) / 2 : 0;

  const dotParts: string[] = [];
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (!matrix.isDark(r, c)) continue;
      if (isInFinder(r, c, n)) continue;
      if (logoOn && Math.abs(r + 0.5 - center) < hideHalf && Math.abs(c + 0.5 - center) < hideHalf)
        continue;
      dotParts.push(
        dotPath(
          cfg.dotStyle,
          r,
          c,
          c + m,
          r + m,
          1,
          r > 0 && matrix.isDark(r - 1, c),
          c > 0 && matrix.isDark(r, c - 1),
          r < n - 1 && matrix.isDark(r + 1, c),
          c < n - 1 && matrix.isDark(r, c + 1)
        )
      );
    }
  }

  const finders: Array<[number, number]> = [
    [m, m],
    [m, m + n - 7],
    [m + n - 7, m],
  ];
  const frameParts: string[] = [];
  const ballParts: string[] = [];
  finders.forEach(([fy, fx], i) => {
    const flipX = i === 1;
    const flipY = i === 2;
    frameParts.push(framePath(cfg.frameStyle, fx, fy, flipX, flipY));
    ballParts.push(ballPath(cfg.ballStyle, fx, fy));
  });

  let logoDefs = "";
  let logoBody = "";
  if (logoOn) {
    const boxW = bgSize + padSize;
    const boxX = m + center - boxW / 2;
    const imgSize = bgSize;
    const imgX = m + center - imgSize / 2;
    const shape = cfg.logo.shape;
    let bgEl = "";
    if (shape === "circle") {
      bgEl = `<circle cx="${f(m + center)}" cy="${f(m + center)}" r="${f(boxW / 2)}" fill="${cfg.logo.bgColor}"/>`;
    } else if (shape === "square") {
      const r = boxW * 0.22;
      bgEl = `<path d="${roundedRectPath(boxX, boxX, boxW, boxW, [r, r, r, r])}" fill="${cfg.logo.bgColor}"/>`;
    }
    let clipAttr = "";
    if (shape === "circle") {
      const clipId = `${idPrefix}-clip`;
      logoDefs += `<clipPath id="${clipId}"><circle cx="${f(m + center)}" cy="${f(m + center)}" r="${f(imgSize / 2)}"/></clipPath>`;
      clipAttr = ` clip-path="url(#${clipId})"`;
    }
    logoBody =
      bgEl +
      `<image href="${cfg.logo.src}" x="${f(imgX)}" y="${f(imgX)}" width="${f(imgSize)}" height="${f(imgSize)}"${clipAttr} preserveAspectRatio="xMidYMid slice"/>`;
  }

  const allDefs = dotFill.def + cornerFill.def + logoDefs;

  const bg = cfg.background.transparent
    ? ""
    : `<rect width="${total}" height="${total}" fill="${cfg.background.color}"/>`;

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${total} ${total}" width="100%" height="100%" role="img" aria-label="QR code">` +
    (allDefs ? `<defs>${allDefs}</defs>` : "") +
    bg +
    `<g fill="${cornerFill.ref}" fill-rule="evenodd">` +
    frameParts.map((d) => `<path d="${d}"/>`).join("") +
    ballParts.map((d) => `<path d="${d}"/>`).join("") +
    `</g>` +
    `<g fill="${dotFill.ref}"><path d="${dotParts.join("")}"/></g>` +
    logoBody +
    `</svg>`
  );
}
