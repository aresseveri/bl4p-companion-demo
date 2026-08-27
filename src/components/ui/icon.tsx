/**
 * Line icons drawn to match the weight of her site's iconography.
 * Stroke-based, 1.8px at 24px, rounded caps.
 */

import Svg, { Circle, Path } from 'react-native-svg';

import { color } from '@/constants/theme';

export type IconName =
  | 'home'
  | 'camera'
  | 'play'
  | 'cart'
  | 'chevron-right'
  | 'chevron-left'
  | 'check'
  | 'clock'
  | 'flame'
  | 'paw'
  | 'plus'
  | 'info'
  | 'external';

export interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  /** Filled variant for active tab states. */
  filled?: boolean;
}

export function Icon({ name, size = 24, color: c = color.text, filled }: IconProps) {
  const sw = 1.8;
  const common = {
    stroke: c,
    strokeWidth: sw,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    fill: 'none',
  };

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {name === 'home' && (
        <>
          <Path d="M3 10.5 12 3l9 7.5" {...common} />
          <Path
            d="M5.5 9.5V20a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1V9.5"
            {...common}
            fill={filled ? c : 'none'}
          />
        </>
      )}

      {name === 'camera' && (
        <>
          <Path
            d="M3 8.5a2 2 0 0 1 2-2h2.2l1.2-2h7.2l1.2 2H19a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-9Z"
            {...common}
            fill={filled ? c : 'none'}
          />
          <Circle cx="12" cy="13" r="3.6" {...common} fill={filled ? color.bg : 'none'} />
        </>
      )}

      {name === 'play' && (
        <>
          <Circle cx="12" cy="12" r="9.2" {...common} fill={filled ? c : 'none'} />
          <Path
            d="M10.2 8.8 15.4 12l-5.2 3.2V8.8Z"
            stroke={filled ? color.bg : c}
            strokeWidth={sw}
            strokeLinejoin="round"
            fill={filled ? color.bg : 'none'}
          />
        </>
      )}

      {name === 'cart' && (
        <>
          <Path d="M2.8 3.5h2.4l2.2 10.4h9.6" {...common} />
          <Path
            d="M7.9 11.4h9.7l1.7-5.6H6.7"
            {...common}
            fill={filled ? c : 'none'}
          />
          <Circle cx="9.4" cy="18.6" r="1.5" {...common} fill={c} />
          <Circle cx="16.6" cy="18.6" r="1.5" {...common} fill={c} />
        </>
      )}

      {name === 'chevron-right' && <Path d="m9.5 5 7 7-7 7" {...common} />}
      {name === 'chevron-left' && <Path d="m14.5 5-7 7 7 7" {...common} />}
      {name === 'check' && <Path d="m4.5 12.5 5 5 10-11" {...common} strokeWidth={2.4} />}

      {name === 'clock' && (
        <>
          <Circle cx="12" cy="12" r="9" {...common} />
          <Path d="M12 6.8V12l3.4 2" {...common} />
        </>
      )}

      {name === 'flame' && (
        <Path
          d="M12 2.8s5.2 4 5.2 8.7a5.2 5.2 0 0 1-10.4 0c0-1.7.9-3 .9-3s.6 1.4 1.7 1.7c0-3.3 2.6-5.2 2.6-7.4Z"
          {...common}
          fill={filled ? c : 'none'}
        />
      )}

      {name === 'paw' && (
        <>
          <Circle cx="7" cy="8.4" r="2" fill={c} />
          <Circle cx="12" cy="6.7" r="2.1" fill={c} />
          <Circle cx="17" cy="8.4" r="2" fill={c} />
          <Path
            d="M12 11.2c2.6 0 4.7 2.1 4.7 4.4 0 1.9-1.6 2.9-3.2 2.9h-3c-1.6 0-3.2-1-3.2-2.9 0-2.3 2.1-4.4 4.7-4.4Z"
            fill={c}
          />
        </>
      )}

      {name === 'plus' && <Path d="M12 5v14M5 12h14" {...common} strokeWidth={2.2} />}

      {name === 'info' && (
        <>
          <Circle cx="12" cy="12" r="9" {...common} />
          <Path d="M12 11v5.2" {...common} />
          <Circle cx="12" cy="7.9" r="1.05" fill={c} />
        </>
      )}

      {name === 'external' && (
        <>
          <Path d="M14 4h6v6" {...common} />
          <Path d="M20 4 11 13" {...common} />
          <Path d="M18.5 14v5a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 19V7A1.5 1.5 0 0 1 5 5.5h5" {...common} />
        </>
      )}
    </Svg>
  );
}

export default Icon;
