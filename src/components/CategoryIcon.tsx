// Иконка раздела звуков (PNG-рисунок, перекрашиваем через tintColor)

import { Image } from 'react-native';
import { theme } from '../theme';
import { CategoryId, getCategory } from '../melodies';

export function CategoryIcon({ id, size = 24, color = theme.colors.accent }: { id: CategoryId; size?: number; color?: string }) {
  return <Image source={getCategory(id).icon} style={{ width: size, height: size, tintColor: color }} resizeMode="contain" />;
}
