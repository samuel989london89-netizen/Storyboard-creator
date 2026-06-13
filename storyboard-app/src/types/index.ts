export type PanelSize = 'small' | 'medium' | 'large' | 'wide' | 'tall';

export interface PanelDefinition {
  id: string;
  colSpan: number; // 1-3
  rowSpan: number; // 1-2
  colStart?: number;
  rowStart?: number;
}

export interface LayoutPreset {
  id: string;
  name: string;
  description: string;
  columns: number;
  panels: PanelDefinition[];
  icon: string; // emoji or short label
}

export interface PanelContent {
  panelDefId: string;
  number: number;
  title: string;
  description: string;
  generationPrompt: string; // auto-built from description + character
  imageUrl?: string;
  imageStatus: 'empty' | 'generating' | 'done' | 'error';
}

export interface Character {
  id: string;
  name: string;
  description: string; // detailed visual description used in every prompt
  accentColor: string; // hex
  styleSeed: number;
  masterImages: string[]; // URLs of the 4 master reference views
  masterStatus: 'empty' | 'generating' | 'done';
}

export interface Storyboard {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  layoutId: string;
  character: Character;
  panels: PanelContent[];
}
