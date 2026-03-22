import { View, Text } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { Colors } from '../../constants/colors';
import { useTheme } from '../../context/ThemeContext';

interface Props {
  eaten: number;
  burned: number;
  goal: number;
}

export default function CalorieRing({ eaten, burned, goal }: Props) {
  const { theme } = useTheme();
  const left = goal - eaten + burned;
  const isOver = left < 0;
  const pct = Math.min(1, eaten / (goal || 1));
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - pct);

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 16 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
        {/* Left label - Eaten */}
        <View style={{ alignItems: 'center', width: 70 }}>
          <Text style={{
            fontFamily: 'Inter_600SemiBold', fontSize: 9, color: theme.textSecondary,
            letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 4,
          }}>
            Eaten
          </Text>
          <Text style={{ fontFamily: 'Inter_800ExtraBold', fontSize: 18, color: theme.text }}>
            {Math.round(eaten).toLocaleString()}
          </Text>
        </View>

        {/* Ring */}
        <View style={{ width: 200, height: 200, alignItems: 'center', justifyContent: 'center' }}>
          <Svg width={200} height={200} style={{ transform: [{ rotate: '-90deg' }] }}>
            <Defs>
              <LinearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <Stop offset="0%" stopColor={Colors.primary} />
                <Stop offset="100%" stopColor="#60a5fa" />
              </LinearGradient>
            </Defs>
            {/* Track */}
            <Circle
              cx={100} cy={100} r={radius}
              stroke={theme.surface3}
              strokeWidth={10}
              fill="transparent"
            />
            {/* Progress */}
            <Circle
              cx={100} cy={100} r={radius}
              stroke={isOver ? '#ef4444' : 'url(#ringGrad)'}
              strokeWidth={10}
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={isOver ? 0 : strokeDashoffset}
              strokeLinecap="round"
            />
          </Svg>
          <View style={{ position: 'absolute', alignItems: 'center' }}>
            <Text style={{
              fontFamily: 'Inter_900Black', fontSize: 38, color: isOver ? '#ef4444' : theme.text, letterSpacing: -1.5,
            }}>
              {Math.round(left).toLocaleString()}
            </Text>
            <Text style={{
              fontFamily: 'Inter_600SemiBold', fontSize: 10, color: isOver ? '#ef4444' : theme.textTertiary,
              letterSpacing: 2, textTransform: 'uppercase', marginTop: 2,
            }}>
              {isOver ? 'Over' : 'Left'}
            </Text>
          </View>
        </View>

        {/* Right label - Burned */}
        <View style={{ alignItems: 'center', width: 70 }}>
          <Text style={{
            fontFamily: 'Inter_600SemiBold', fontSize: 9, color: theme.textSecondary,
            letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 4,
          }}>
            Burned
          </Text>
          <Text style={{ fontFamily: 'Inter_800ExtraBold', fontSize: 18, color: Colors.tertiary }}>
            {Math.round(burned).toLocaleString()}
          </Text>
        </View>
      </View>
    </View>
  );
}
