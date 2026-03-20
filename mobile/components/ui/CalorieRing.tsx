import { View, Text } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { Colors } from '../../constants/colors';

interface Props {
  eaten: number;
  burned: number;
  goal: number;
}

export default function CalorieRing({ eaten, burned, goal }: Props) {
  const left = Math.max(0, goal - eaten + burned);
  const pct = Math.min(1, eaten / (goal || 1));
  const radius = 95;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - pct);

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 8 }}>
      {/* Left label */}
      <View style={{ alignItems: 'center', width: 72 }}>
        <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 10, color: '#a3a3a3', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>Eaten</Text>
        <Text style={{ fontFamily: 'Inter_900Black', fontSize: 18, color: '#fff' }}>{Math.round(eaten).toLocaleString()}</Text>
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
          <Circle cx={100} cy={100} r={radius} stroke="rgba(255,255,255,0.05)" strokeWidth={12} fill="transparent" />
          {/* Progress */}
          <Circle
            cx={100} cy={100} r={radius}
            stroke="url(#ringGrad)"
            strokeWidth={12}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </Svg>
        <View style={{ position: 'absolute', alignItems: 'center' }}>
          <Text style={{ fontFamily: 'Inter_900Black', fontSize: 36, color: '#fff', letterSpacing: -1 }}>
            {Math.round(left).toLocaleString()}
          </Text>
          <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 10, color: '#a3a3a3', letterSpacing: 2, textTransform: 'uppercase' }}>Left</Text>
        </View>
      </View>

      {/* Right label */}
      <View style={{ alignItems: 'center', width: 72 }}>
        <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 10, color: '#a3a3a3', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>Burned</Text>
        <Text style={{ fontFamily: 'Inter_900Black', fontSize: 18, color: Colors.tertiary }}>{Math.round(burned).toLocaleString()}</Text>
      </View>
    </View>
  );
}
