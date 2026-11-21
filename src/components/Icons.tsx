// Набор тонких линейных иконок интерфейса (в стиле циферблатов и погоды).

import Svg, { Circle, Path } from 'react-native-svg';
import { theme } from '../theme';

type IconProps = { size?: number; color?: string; width?: number };

const base = (d: string, { size = 22, color = theme.colors.text, width = 1.8 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d={d} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const CloseIcon = (p: IconProps) => base('M6 6l12 12M18 6L6 18', p);
export const CheckIcon = (p: IconProps) => base('M5 12.5l4.5 4.5L19 7.5', p);
export const ChevronRight = (p: IconProps) => base('M9 6l6 6-6 6', p);
export const ChevronLeft = (p: IconProps) => base('M15 6l-6 6 6 6', p);
export const PencilIcon = (p: IconProps) => base('M4 20h4L19 9l-4-4L4 16v4zM13.5 6.5l4 4', p);
export const NoteIcon = (p: IconProps) => base('M9 18V6l10-2v12M9 18a3 3 0 1 1-3-3 3 3 0 0 1 3 3zM19 16a3 3 0 1 1-3-3 3 3 0 0 1 3 3z', p);
export const BellIcon = (p: IconProps) =>
  base('M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15L6 16zM10 20a2 2 0 0 0 4 0', p);

export function PlayIcon({ size = 18, color = theme.colors.accent }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M8 5.5v13l11-6.5-11-6.5z" fill={color} />
    </Svg>
  );
}

export function PauseIcon({ size = 18, color = theme.colors.accent }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" fill={color} />
    </Svg>
  );
}

export function RadioDot({ on, size = 22 }: { on: boolean; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={12} cy={12} r={9} fill="none" stroke={on ? theme.colors.accent : 'rgba(27,27,36,0.25)'} strokeWidth={1.6} />
      {on && <Circle cx={12} cy={12} r={5} fill={theme.colors.accent} />}
    </Svg>
  );
}
