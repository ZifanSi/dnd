// World coordinate system shared by every module.
//
// The map lies on the XZ ground plane (y is up), centered on the origin.
// +x = east, +z = south, so a camera looking straight down with no rotation
// shows north at the top of the screen, exactly like the source image.
// 1 world unit ≈ 1 pixel of the 10200 x 6600 source map.

export const WORLD_W = 10000;
export const WORLD_H = WORLD_W * 6600 / 10200;

/** Size of the source map image, whose pixel coordinates the road graph uses. */
export const SOURCE_W = 10200, SOURCE_H = 6600;

/** Convert a location's x/y percentages (0-100 of the source image) to world x/z. */
export function toWorld(loc) {
  return {
    x: (loc.x / 100 - 0.5) * WORLD_W,
    z: (loc.y / 100 - 0.5) * WORLD_H
  };
}

/** Convert source-image pixel coordinates (as used by data/road-graph.js) to world x/z. */
export function pxToWorld(px, py) {
  return { x: (px / SOURCE_W - 0.5) * WORLD_W, z: (py / SOURCE_H - 0.5) * WORLD_H };
}

export const TYPE_COLORS = {
  city: "#e6483c",
  town: "#f0973a",
  forest: "#3fa35a",
  mountain: "#9a9a9a",
  river: "#3d8fe0",
  region: "#a662d6",
  island: "#22b9ad"
};

export const TYPE_LABELS_ZH = {
  city: "城市 City",
  town: "城镇 Town",
  forest: "森林 Forest",
  mountain: "山脉 Mountain",
  river: "河流 River",
  region: "地区 Region",
  island: "岛屿 Island"
};

/** How close the camera parks when you fly to a place of this type. */
export const FLY_DISTANCE = {
  city: 230,
  town: 160,
  forest: 900,
  mountain: 900,
  river: 900,
  region: 2600,
  island: 700
};
