import { create } from "zustand";

/**
 * State bersama untuk brushing & linking.
 * selected : wilayah yang diklik (kode 35xx) → disorot di semua visual.
 * hovered  : wilayah yang sedang di-hover.
 * brushed  : hasil brushing parallel coordinates (null = tidak ada filter).
 */
type SelectionState = {
  selected: string | null;
  hovered: string | null;
  brushed: string[] | null;
  setSelected: (kode: string | null) => void;
  toggleSelected: (kode: string) => void;
  setHovered: (kode: string | null) => void;
  setBrushed: (kodes: string[] | null) => void;
};

export const useSelection = create<SelectionState>((set) => ({
  selected: null,
  hovered: null,
  brushed: null,
  setSelected: (selected) => set({ selected }),
  toggleSelected: (kode) => set((s) => ({ selected: s.selected === kode ? null : kode })),
  setHovered: (hovered) => set({ hovered }),
  setBrushed: (brushed) => set({ brushed }),
}));

/** Status visual sebuah wilayah dalam konteks linking. */
export function useRegionState(kode: string) {
  const { selected, hovered, brushed } = useSelection();
  return {
    isSelected: selected === kode,
    isHovered: hovered === kode,
    isDimmed: (brushed !== null && !brushed.includes(kode)) || (selected !== null && selected !== kode),
  };
}
