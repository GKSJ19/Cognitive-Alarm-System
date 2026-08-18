import React, { useState } from 'react';
import { StyleSheet, View, Text, PanResponder } from 'react-native';

interface AlarmVolumeSliderProps {
  value: number; // 0 to 100
  onChange: (value: number) => void;
}

export const AlarmVolumeSlider: React.FC<AlarmVolumeSliderProps> = ({ value, onChange }) => {
  const [layoutWidth, setLayoutWidth] = useState<number>(280);

  const handleTouch = (evt: any) => {
    const touchX = evt.nativeEvent.locationX;
    if (layoutWidth > 0) {
      const percentage = Math.max(0, Math.min(100, Math.round((touchX / layoutWidth) * 100)));
      onChange(percentage);
    }
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (evt) => handleTouch(evt),
    onPanResponderMove: (evt) => handleTouch(evt),
  });

  const percent = Math.max(0, Math.min(100, value));

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>Alarm Volume</Text>
        <Text style={styles.valText}>{percent}%</Text>
      </View>

      <View
        style={styles.trackContainer}
        onLayout={(e) => setLayoutWidth(e.nativeEvent.layout.width)}
        {...panResponder.panHandlers}
      >
        <View style={styles.trackBackground}>
          <View style={[styles.trackActive, { width: `${percent}%` }]} />
          <View style={[styles.thumb, { left: `${percent}%` }]} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 10,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  valText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#A58BFF',
  },
  trackContainer: {
    height: 30,
    justifyContent: 'center',
    width: '100%',
  },
  trackBackground: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#262036',
    width: '100%',
    position: 'relative',
    justifyContent: 'center',
  },
  trackActive: {
    height: '100%',
    backgroundColor: '#A58BFF',
    borderRadius: 3,
  },
  thumb: {
    position: 'absolute',
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FFFFFF',
    marginLeft: -9,
    elevation: 4,
    shadowColor: '#A58BFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
});

export default AlarmVolumeSlider;
