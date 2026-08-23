export type EccLevel = "L" | "M" | "Q" | "H";

export type DotStyle =
  | "square"
  | "rounded"
  | "extra-rounded"
  | "dots"
  | "diamond"
  | "classy"
  | "classy-rounded";

export type CornerFrameStyle =
  | "square"
  | "rounded"
  | "extra-rounded"
  | "dots"
  | "leaf";

export type CornerBallStyle = "square" | "rounded" | "dots" | "diamond";

export interface GradientStop {
  offset: number;
  color: string;
}

export type Fill =
  | { type: "solid"; color: string }
  | {
      type: "linear" | "radial";
      rotation: number;
      stops: [GradientStop, GradientStop];
    };

export interface LogoConfig {
  enabled: boolean;
  src?: string;
  size: number;
  padding: number;
  shape: "none" | "square" | "circle";
  bgColor: string;
}

export interface QRStyleConfig {
  dotStyle: DotStyle;
  frameStyle: CornerFrameStyle;
  ballStyle: CornerBallStyle;
  dotFill: Fill;
  cornerFill: Fill;
  background: { transparent: boolean; color: string };
  margin: number;
  ecc: EccLevel;
  logo: LogoConfig;
}

export const DOT_STYLES: { value: DotStyle; label: string }[] = [
  { value: "square", label: "Square" },
  { value: "rounded", label: "Rounded" },
  { value: "extra-rounded", label: "Extra rounded" },
  { value: "dots", label: "Dots" },
  { value: "diamond", label: "Diamond" },
  { value: "classy", label: "Classy" },
  { value: "classy-rounded", label: "Classy rounded" },
];

export const FRAME_STYLES: { value: CornerFrameStyle; label: string }[] = [
  { value: "square", label: "Square" },
  { value: "rounded", label: "Rounded" },
  { value: "extra-rounded", label: "Extra rounded" },
  { value: "dots", label: "Circle" },
  { value: "leaf", label: "Leaf" },
];

export const BALL_STYLES: { value: CornerBallStyle; label: string }[] = [
  { value: "square", label: "Square" },
  { value: "rounded", label: "Rounded" },
  { value: "dots", label: "Circle" },
  { value: "diamond", label: "Diamond" },
];

export const DEFAULT_QR_CONFIG: QRStyleConfig = {
  dotStyle: "extra-rounded",
  frameStyle: "extra-rounded",
  ballStyle: "dots",
  dotFill: {
    type: "linear",
    rotation: 45,
    stops: [
      { offset: 0, color: "#18181b" },
      { offset: 1, color: "#3f3f46" },
    ],
  },
  cornerFill: { type: "solid", color: "#18181b" },
  background: { transparent: false, color: "#ffffff" },
  margin: 2,
  ecc: "Q",
  logo: {
    enabled: false,
    src: "",
    size: 22,
    padding: 4,
    shape: "square",
    bgColor: "#ffffff",
  },
};
