export type MetricKey = typeof METRIC_COLUMN_ORDER[number];

export const METRIC_COLUMN_ORDER = [
  // Speed & Efficiency
  "ClubSpeed", "BallSpeed", "SmashFactor",
  // Club Delivery
  "AttackAngle", "ClubPath", "FaceAngle", "FaceToPath", "SwingDirection", "DynamicLoft", "DynamicLie", "SwingPlane",
  // Launch & Spin
  "LaunchAngle", "LaunchDirection", "SpinRate", "SpinAxis", "SpinLoft",
  // Distance
  "Carry", "Total",
  // Dispersion
  "Side", "SideTotal", "CarrySide", "TotalSide", "Curve",
  // Ball Flight
  "Height", "MaxHeight", "LandingAngle", "HangTime",
  // Impact
  "LowPointDistance", "ImpactHeight", "ImpactOffset",
  // Other
  "Tempo",
] as const;

// Display names: canonical metric key -> human-readable CSV/TSV header.
export const METRIC_DISPLAY_NAMES: Record<string, string> = {
  ClubSpeed: "Club Speed",
  BallSpeed: "Ball Speed",
  SmashFactor: "Smash Factor",
  AttackAngle: "Attack Angle",
  ClubPath: "Club Path",
  FaceAngle: "Face Angle",
  FaceToPath: "Face To Path",
  SwingDirection: "Swing Direction",
  DynamicLoft: "Dynamic Loft",
  DynamicLie: "Dynamic Lie",
  SwingPlane: "Swing Plane",
  SpinRate: "Spin Rate",
  SpinAxis: "Spin Axis",
  SpinLoft: "Spin Loft",
  LaunchAngle: "Launch Angle",
  LaunchDirection: "Launch Direction",
  Carry: "Carry",
  Total: "Total",
  Side: "Side",
  SideTotal: "Side Total",
  CarrySide: "Carry Side",
  TotalSide: "Total Side",
  Height: "Height",
  MaxHeight: "Max Height",
  Curve: "Curve",
  LandingAngle: "Landing Angle",
  HangTime: "Hang Time",
  LowPointDistance: "Low Point",
  ImpactHeight: "Impact Height",
  ImpactOffset: "Impact Offset",
  Tempo: "Tempo",
};

export function isKnownReportMetric(metric: string): boolean {
  return metric in METRIC_DISPLAY_NAMES;
}

// GraphQL field aliases from Trackman portal responses to canonical metric keys.
// Unknown fields are intentionally handled by the portal parser's PascalCase fallback.
export const GRAPHQL_METRIC_ALIAS: Record<string, string> = {
  clubSpeed: "ClubSpeed",
  ballSpeed: "BallSpeed",
  smashFactor: "SmashFactor",
  attackAngle: "AttackAngle",
  clubPath: "ClubPath",
  faceAngle: "FaceAngle",
  faceToPath: "FaceToPath",
  swingDirection: "SwingDirection",
  swingPlane: "SwingPlane",
  dynamicLoft: "DynamicLoft",
  dynamicLie: "DynamicLie",
  spinRate: "SpinRate",
  ballSpin: "SpinRate",
  spinAxis: "SpinAxis",
  spinLoft: "SpinLoft",
  launchAngle: "LaunchAngle",
  launchDirection: "LaunchDirection",
  carry: "Carry",
  total: "Total",
  side: "Side",
  sideTotal: "SideTotal",
  carrySide: "CarrySide",
  totalSide: "TotalSide",
  height: "Height",
  maxHeight: "MaxHeight",
  curve: "Curve",
  landingAngle: "LandingAngle",
  hangTime: "HangTime",
  lowPointDistance: "LowPointDistance",
  impactHeight: "ImpactHeight",
  impactOffset: "ImpactOffset",
  tempo: "Tempo",
};

export const DISTANCE_METRICS: Record<string, true> = {
  Carry: true,
  Total: true,
  Side: true,
  SideTotal: true,
  CarrySide: true,
  TotalSide: true,
  Height: true,
  MaxHeight: true,
  Curve: true,
};

export const SMALL_DISTANCE_METRICS: Record<string, true> = {
  LowPointDistance: true,
};

export const MILLIMETER_METRICS: Record<string, true> = {
  ImpactHeight: true,
  ImpactOffset: true,
};

export const ANGLE_METRICS: Record<string, true> = {
  AttackAngle: true,
  ClubPath: true,
  FaceAngle: true,
  FaceToPath: true,
  DynamicLoft: true,
  DynamicLie: true,
  SwingPlane: true,
  LaunchAngle: true,
  LaunchDirection: true,
  LandingAngle: true,
};

export const SPEED_METRICS: Record<string, true> = {
  ClubSpeed: true,
  BallSpeed: true,
};

export const FIXED_UNIT_LABELS: Record<string, string> = {
  SpinRate: "rpm",
  HangTime: "s",
  Tempo: "s",
  ImpactHeight: "mm",
  ImpactOffset: "mm",
};

