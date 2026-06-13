import type { LayoutPreset } from '../types';

export const LAYOUT_PRESETS: LayoutPreset[] = [
  {
    id: 'grid-2x3',
    name: 'Classic 2×3',
    description: '6 equal panels — great for step-by-step user flows',
    columns: 2,
    icon: '⊞',
    panels: [
      { id: 'p1', colSpan: 1, rowSpan: 1 },
      { id: 'p2', colSpan: 1, rowSpan: 1 },
      { id: 'p3', colSpan: 1, rowSpan: 1 },
      { id: 'p4', colSpan: 1, rowSpan: 1 },
      { id: 'p5', colSpan: 1, rowSpan: 1 },
      { id: 'p6', colSpan: 1, rowSpan: 1 },
    ],
  },
  {
    id: 'grid-3x2',
    name: 'Wide 3×2',
    description: '6 panels in 3 columns — landscape-friendly flow',
    columns: 3,
    icon: '▦',
    panels: [
      { id: 'p1', colSpan: 1, rowSpan: 1 },
      { id: 'p2', colSpan: 1, rowSpan: 1 },
      { id: 'p3', colSpan: 1, rowSpan: 1 },
      { id: 'p4', colSpan: 1, rowSpan: 1 },
      { id: 'p5', colSpan: 1, rowSpan: 1 },
      { id: 'p6', colSpan: 1, rowSpan: 1 },
    ],
  },
  {
    id: 'hero-plus-4',
    name: 'Hero + 4',
    description: 'One big opening scene, four supporting panels',
    columns: 2,
    icon: '◰',
    panels: [
      { id: 'p1', colSpan: 2, rowSpan: 1 }, // hero — full width
      { id: 'p2', colSpan: 1, rowSpan: 1 },
      { id: 'p3', colSpan: 1, rowSpan: 1 },
      { id: 'p4', colSpan: 1, rowSpan: 1 },
      { id: 'p5', colSpan: 1, rowSpan: 1 },
    ],
  },
  {
    id: 'mixed-editorial',
    name: 'Editorial Mix',
    description: 'Varied sizes like a magazine — emphasis on key moments',
    columns: 3,
    icon: '◱',
    panels: [
      { id: 'p1', colSpan: 2, rowSpan: 1 }, // wide
      { id: 'p2', colSpan: 1, rowSpan: 2 }, // tall right
      { id: 'p3', colSpan: 1, rowSpan: 1 },
      { id: 'p4', colSpan: 1, rowSpan: 1 },
      { id: 'p5', colSpan: 3, rowSpan: 1 }, // full-width bottom
    ],
  },
  {
    id: 'four-panel',
    name: '4-Panel',
    description: '4 equal panels — ideal for short narratives',
    columns: 2,
    icon: '▪',
    panels: [
      { id: 'p1', colSpan: 1, rowSpan: 1 },
      { id: 'p2', colSpan: 1, rowSpan: 1 },
      { id: 'p3', colSpan: 1, rowSpan: 1 },
      { id: 'p4', colSpan: 1, rowSpan: 1 },
    ],
  },
  {
    id: 'cinematic',
    name: 'Cinematic',
    description: '3 wide strips — movie-style scene progression',
    columns: 1,
    icon: '▬',
    panels: [
      { id: 'p1', colSpan: 1, rowSpan: 1 },
      { id: 'p2', colSpan: 1, rowSpan: 1 },
      { id: 'p3', colSpan: 1, rowSpan: 1 },
    ],
  },
];

export function getLayout(id: string): LayoutPreset {
  return LAYOUT_PRESETS.find(l => l.id === id) ?? LAYOUT_PRESETS[0];
}
