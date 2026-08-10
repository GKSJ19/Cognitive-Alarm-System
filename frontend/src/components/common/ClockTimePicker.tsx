import React, { useState, useRef, useCallback } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  PanResponder,
  GestureResponderEvent,
  Dimensions,
} from 'react-native';
import { Text, useTheme, IconButton, Portal, Modal, Button } from 'react-native-paper';

interface ClockTimePickerProps {
  value: string; // "HH:MM"
  onChange: (time: string) => void;
  error?: string | null;
}

type Mode = 'hour' | 'minute';
type Period = 'AM' | 'PM';

const CLOCK_SIZE = 260;
const CLOCK_RADIUS = CLOCK_SIZE / 2;
const NUMBER_RADIUS = CLOCK_RADIUS - 36;
const INNER_RADIUS = CLOCK_RADIUS - 66;

const pad = (n: number) => n.toString().padStart(2, '0');

const ClockTimePicker: React.FC<ClockTimePickerProps> = ({ value, onChange, error }) => {
  const theme = useTheme();
  const [visible, setVisible] = useState(false);

  // Parse initial value
  const parseTime = (v: string) => {
    const parts = v.split(':');
    let h = parseInt(parts[0] || '0', 10);
    let m = parseInt(parts[1] || '0', 10);
    if (isNaN(h)) h = 0;
    if (isNaN(m)) m = 0;
    return { h: h % 24, m: m % 60 };
  };

  const parsed = parseTime(value);
  const [hour24, setHour24] = useState(parsed.h);
  const [minute, setMinute] = useState(parsed.m);
  const [mode, setMode] = useState<Mode>('hour');
  const [period, setPeriod] = useState<Period>(parsed.h >= 12 ? 'PM' : 'AM');

  const displayHour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;

  const clockRef = useRef<View>(null);

  const getAngleFromPosition = useCallback((x: number, y: number) => {
    const dx = x - CLOCK_RADIUS;
    const dy = y - CLOCK_RADIUS;
    let angle = Math.atan2(dx, -dy) * (180 / Math.PI);
    if (angle < 0) angle += 360;
    return angle;
  }, []);

  const getDistanceFromCenter = useCallback((x: number, y: number) => {
    const dx = x - CLOCK_RADIUS;
    const dy = y - CLOCK_RADIUS;
    return Math.sqrt(dx * dx + dy * dy);
  }, []);

  const handleClockPress = useCallback((e: GestureResponderEvent) => {
    const { locationX, locationY } = e.nativeEvent;
    const angle = getAngleFromPosition(locationX, locationY);

    if (mode === 'hour') {
      let selectedHour = Math.round(angle / 30) % 12;
      if (selectedHour === 0) selectedHour = 12;

      let h24 = selectedHour;
      if (period === 'AM') {
        h24 = selectedHour === 12 ? 0 : selectedHour;
      } else {
        h24 = selectedHour === 12 ? 12 : selectedHour + 12;
      }
      setHour24(h24);
      // Auto switch to minute mode
      setTimeout(() => setMode('minute'), 300);
    } else {
      let selectedMin = Math.round(angle / 6) % 60;
      setMinute(selectedMin);
    }
  }, [mode, period, getAngleFromPosition]);

  const handlePeriodToggle = (p: Period) => {
    setPeriod(p);
    if (p === 'AM') {
      setHour24(hour24 >= 12 ? hour24 - 12 : hour24);
    } else {
      setHour24(hour24 < 12 ? hour24 + 12 : hour24);
    }
  };

  const handleConfirm = () => {
    const timeStr = `${pad(hour24)}:${pad(minute)}`;
    onChange(timeStr);
    setVisible(false);
  };

  const handleOpen = () => {
    const p = parseTime(value);
    setHour24(p.h);
    setMinute(p.m);
    setPeriod(p.h >= 12 ? 'PM' : 'AM');
    setMode('hour');
    setVisible(true);
  };

  // Calculate hand angle
  const handAngle = mode === 'hour'
    ? ((displayHour12 % 12) * 30)
    : (minute * 6);

  const handLength = mode === 'hour' ? NUMBER_RADIUS : NUMBER_RADIUS;

  // Generate numbers on the clock face
  const numbers = mode === 'hour'
    ? Array.from({ length: 12 }, (_, i) => i + 1)
    : [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

  const getNumberPosition = (num: number, index: number, total: number) => {
    const angle = ((index) / total) * 360 - 90;
    const rad = (angle * Math.PI) / 180;
    const r = NUMBER_RADIUS;
    return {
      x: CLOCK_RADIUS + r * Math.cos(rad) - 16,
      y: CLOCK_RADIUS + r * Math.sin(rad) - 16,
    };
  };

  const isSelected = (num: number) => {
    if (mode === 'hour') {
      return num === displayHour12;
    }
    return num === minute;
  };

  const displayTime = value && /^\d{2}:\d{2}$/.test(value) ? value : '--:--';

  return (
    <View>
      {/* Clickable time display field */}
      <TouchableOpacity onPress={handleOpen} activeOpacity={0.7}>
        <View style={[styles.timeDisplay, {
          backgroundColor: theme.colors.surfaceVariant,
          borderColor: error ? theme.colors.error : theme.colors.outline,
        }]}>
          <IconButton icon="clock-outline" size={22} iconColor={theme.colors.primary} style={{ margin: 0 }} />
          <Text style={[styles.timeDisplayText, { color: theme.colors.onSurface }]}>
            {displayTime}
          </Text>
          <Text style={[styles.tapHint, { color: theme.colors.onSurfaceVariant }]}>
            Tap to set
          </Text>
        </View>
      </TouchableOpacity>
      {error ? (
        <Text style={[styles.errorText, { color: theme.colors.error }]}>{error}</Text>
      ) : null}

      {/* Clock picker modal */}
      <Portal>
        <Modal
          visible={visible}
          onDismiss={() => setVisible(false)}
          contentContainerStyle={[styles.modal, { backgroundColor: theme.colors.surface }]}
        >
          {/* Time display header */}
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => setMode('hour')}>
              <Text style={[
                styles.headerTime,
                { color: mode === 'hour' ? theme.colors.primary : theme.colors.onSurfaceVariant },
              ]}>
                {pad(displayHour12)}
              </Text>
            </TouchableOpacity>
            <Text style={[styles.headerColon, { color: theme.colors.onSurfaceVariant }]}>:</Text>
            <TouchableOpacity onPress={() => setMode('minute')}>
              <Text style={[
                styles.headerTime,
                { color: mode === 'minute' ? theme.colors.primary : theme.colors.onSurfaceVariant },
              ]}>
                {pad(minute)}
              </Text>
            </TouchableOpacity>
            <View style={styles.periodColumn}>
              <TouchableOpacity
                onPress={() => handlePeriodToggle('AM')}
                style={[styles.periodBtn, {
                  backgroundColor: period === 'AM' ? theme.colors.primary : 'transparent',
                }]}
              >
                <Text style={{ color: period === 'AM' ? '#FFFFFF' : theme.colors.onSurfaceVariant, fontWeight: 'bold', fontSize: 13 }}>
                  AM
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handlePeriodToggle('PM')}
                style={[styles.periodBtn, {
                  backgroundColor: period === 'PM' ? theme.colors.primary : 'transparent',
                }]}
              >
                <Text style={{ color: period === 'PM' ? '#FFFFFF' : theme.colors.onSurfaceVariant, fontWeight: 'bold', fontSize: 13 }}>
                  PM
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text style={[styles.modeLabel, { color: theme.colors.onSurfaceVariant }]}>
            {mode === 'hour' ? 'Select hour' : 'Select minutes'}
          </Text>

          {/* Clock face */}
          <View style={styles.clockContainer}>
            <View
              ref={clockRef}
              style={[styles.clock, { backgroundColor: theme.colors.surfaceVariant }]}
              onStartShouldSetResponder={() => true}
              onResponderRelease={handleClockPress}
              onResponderMove={handleClockPress}
            >
              {/* Center dot */}
              <View style={[styles.centerDot, { backgroundColor: theme.colors.primary }]} />

              {/* Clock hand */}
              <View style={[
                styles.hand,
                {
                  backgroundColor: theme.colors.primary,
                  height: handLength,
                  transform: [
                    { translateX: -1 },
                    { translateY: -handLength / 2 },
                    { rotate: `${handAngle}deg` },
                    { translateY: handLength / 2 },
                  ],
                },
              ]} />

              {/* Hand circle at tip */}
              <View style={[
                styles.handTip,
                {
                  backgroundColor: theme.colors.primary,
                  transform: [
                    { translateX: -20 },
                    { translateY: -20 },
                    {
                      translateX: Math.sin((handAngle * Math.PI) / 180) * handLength,
                    },
                    {
                      translateY: -Math.cos((handAngle * Math.PI) / 180) * handLength,
                    },
                  ],
                },
              ]} />

              {/* Numbers */}
              {numbers.map((num, idx) => {
                const pos = getNumberPosition(num, idx, numbers.length);
                const sel = isSelected(num);
                return (
                  <View
                    key={num}
                    style={[
                      styles.numberContainer,
                      {
                        left: pos.x,
                        top: pos.y,
                      },
                    ]}
                  >
                    <Text style={[
                      styles.numberText,
                      {
                        color: sel ? '#FFFFFF' : theme.colors.onSurface,
                        fontWeight: sel ? 'bold' : '500',
                      },
                    ]}>
                      {mode === 'minute' ? pad(num) : num}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Action buttons */}
          <View style={styles.actionRow}>
            <Button onPress={() => setVisible(false)} textColor={theme.colors.onSurfaceVariant}>
              Cancel
            </Button>
            <Button mode="contained" onPress={handleConfirm} style={{ borderRadius: 20 }}>
              Set Time
            </Button>
          </View>
        </Modal>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  timeDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 14,
    marginBottom: 4,
  },
  timeDisplayText: {
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: 2,
    flex: 1,
    marginLeft: 8,
  },
  tapHint: {
    fontSize: 12,
  },
  errorText: {
    fontSize: 12,
    marginTop: 2,
    marginBottom: 8,
    marginLeft: 4,
  },
  modal: {
    margin: 24,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerTime: {
    fontSize: 48,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  headerColon: {
    fontSize: 48,
    fontWeight: 'bold',
    marginHorizontal: 4,
  },
  periodColumn: {
    marginLeft: 16,
    justifyContent: 'center',
  },
  periodBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 2,
  },
  modeLabel: {
    fontSize: 13,
    marginBottom: 12,
  },
  clockContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
  clock: {
    width: CLOCK_SIZE,
    height: CLOCK_SIZE,
    borderRadius: CLOCK_SIZE / 2,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    position: 'absolute',
    zIndex: 10,
  },
  hand: {
    position: 'absolute',
    width: 2,
    bottom: CLOCK_RADIUS,
    left: CLOCK_RADIUS - 1,
    transformOrigin: 'bottom center',
    zIndex: 5,
  },
  handTip: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    top: CLOCK_RADIUS,
    left: CLOCK_RADIUS,
    opacity: 0.25,
    zIndex: 4,
  },
  numberContainer: {
    position: 'absolute',
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 6,
  },
  numberText: {
    fontSize: 14,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    width: '100%',
    marginTop: 16,
    gap: 12,
  },
});

export default ClockTimePicker;
