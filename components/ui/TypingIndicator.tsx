import React from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

export const TypingIndicator = ({
  text = '',
  style = {},
  dotColor = '#3b5998',
  dotSize = 10,
  speed = 1500,
}: {
  text?: string;
  style?: object;
  dotColor?: string;
  dotSize?: number;
  speed?: number;
}) => {
  // Animated values for each dot
  const dots = [0, 1, 2].map(() => React.useRef(new Animated.Value(0.1)).current);

  React.useEffect(() => {
    const animations = dots.map((dot, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 200),
          Animated.timing(dot, {
            toValue: 1,
            duration: speed / 3,
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0.1,
            duration: (speed * 2) / 3,
            useNativeDriver: true,
          }),
        ])
      )
    );
    animations.forEach(anim => anim.start());
    return () => {
      animations.forEach(anim => anim.stop());
    };
  }, [dots, speed]);

  return (
    <View style={[styles.container, style]}>
      {text ? <Text style={styles.text}>{text}</Text> : null}
      <View style={styles.dotsRow}>
        {dots.map((opacity, i) => (
          <Animated.View
            key={i}
            style={[
              styles.dot,
              {
                backgroundColor: dotColor,
                width: dotSize,
                height: dotSize,
                marginLeft: i === 0 ? 0 : dotSize * 0.7,
                opacity,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  text: {
    fontSize: 14,
    color: '#888',
    marginBottom: 2,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 16,
  },
  dot: {
    borderRadius: 50,
  },
});

export default TypingIndicator;
