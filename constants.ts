
import type { StyleOption, AspectRatioOption } from './types';

export const STYLE_OPTIONS: StyleOption[] = [
  { id: 'realista', label: 'Realista' },
  { id: 'artístico', label: 'Artístico' },
  { id: 'minimalista', label: 'Minimalista' },
  { id: 'corporativo', label: 'Corporativo' },
  { id: 'vintage', label: 'Vintage' },
  { id: 'cinematográfico', label: 'Cinematográfico' },
  { id: 'cyberpunk', label: 'Cyberpunk' },
  { id: 'fantasia-epica', label: 'Fantasía Épica' },
  { id: 'acuarela', label: 'Acuarela' },
  { id: 'dibujo-a-lapiz', label: 'Dibujo a Lápiz' },
  { id: 'arte-abstracto', label: 'Arte Abstracto' },
];

export const ASPECT_RATIO_OPTIONS: AspectRatioOption[] = [
  { id: '1:1', label: 'Cuadrado (1:1)' },
  { id: '16:9', label: 'Horizontal (16:9)' },
  { id: '9:16', label: 'Vertical (9:16)' },
  { id: '4:3', label: 'Paisaje (4:3)' },
  { id: '3:4', label: 'Retrato (3:4)' },
];
