// Tiny pub/sub that lets page sections steer the shared particle field
// (shape morphs, placement, visibility) without React re-renders.

export type FieldShape = "globe" | "helix" | "knot" | "crystal" | "galaxy";

export type FieldState = {
  shape: FieldShape;
  /** horizontal placement: -1 = far left, 1 = far right (desktop) */
  x: number;
  scale: number;
  opacity: number;
};

type Listener = (state: FieldState) => void;

let state: FieldState = { shape: "globe", x: 0.5, scale: 1, opacity: 0 };
const listeners = new Set<Listener>();

export const fieldStore = {
  get: () => state,
  set(patch: Partial<FieldState>) {
    state = { ...state, ...patch };
    listeners.forEach((l) => l(state));
  },
  subscribe(fn: Listener) {
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  },
};

/** Extra yaw velocity (radians per frame) for direct manipulation, e.g. dragging the Earth. Decays on its own. */
export const fieldSpin = { v: 0 };
