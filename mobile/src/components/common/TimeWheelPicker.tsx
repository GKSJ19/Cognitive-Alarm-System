import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Modal, TextInput } from 'react-native';
import { IconButton, Button } from 'react-native-paper';

interface TimeWheelPickerProps {
  value: string; // HH:MM in 24h format, e.g. "05:06"
  onChange: (time24h: string) => void;
}

export const TimeWheelPicker: React.FC<TimeWheelPickerProps> = ({ value, onChange }) => {
  const [hour12, setHour12] = useState(5);
  const [minute, setMinute] = useState(6);
  const [period, setPeriod] = useState<'am' | 'pm'>('am');
  const [isManualInputVisible, setIsManualInputVisible] = useState(false);
  const [inputTimeStr, setInputTimeStr] = useState('');

  // Parse 24h string to 12h state
  useEffect(() => {
    if (value && /^\d{2}:\d{2}$/.test(value)) {
      const [hStr, mStr] = value.split(':');
      let h = parseInt(hStr, 10);
      const m = parseInt(mStr, 10);
      let p: 'am' | 'pm' = 'am';

      if (h >= 12) {
        p = 'pm';
        if (h > 12) h -= 12;
      } else if (h === 0) {
        h = 12;
      }
      setHour12(h);
      setMinute(m);
      setPeriod(p);
    }
  }, [value]);

  const updateTime = (h: number, m: number, p: 'am' | 'pm') => {
    let newH = h;
    let newM = m;

    if (newH > 12) newH = 1;
    if (newH < 1) newH = 12;
    if (newM >= 60) newM = 0;
    if (newM < 0) newM = 59;

    setHour12(newH);
    setMinute(newM);
    setPeriod(p);

    // Convert to 24h format for parent
    let h24 = newH;
    if (p === 'pm' && newH < 12) h24 += 12;
    if (p === 'am' && newH === 12) h24 = 0;

    const formatted24 = `${String(h24).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;
    onChange(formatted24);
  };

  const incrementHour = (delta: number) => {
    let nextH = hour12 + delta;
    if (nextH > 12) nextH = 1;
    if (nextH < 1) nextH = 12;
    updateTime(nextH, minute, period);
  };

  const incrementMinute = (delta: number) => {
    let nextM = minute + delta;
    let nextH = hour12;
    if (nextM >= 60) {
      nextM = 0;
      nextH = hour12 === 12 ? 1 : hour12 + 1;
    } else if (nextM < 0) {
      nextM = 59;
      nextH = hour12 === 1 ? 12 : hour12 - 1;
    }
    updateTime(nextH, nextM, period);
  };

  const togglePeriod = () => {
    const nextP = period === 'am' ? 'pm' : 'am';
    updateTime(hour12, minute, nextP);
  };

  // Helper strings for drum wheel display
  const prevH = hour12 === 1 ? 12 : hour12 - 1;
  const prevM = minute === 0 ? 59 : minute - 1;
  const nextH = hour12 === 12 ? 1 : hour12 + 1;
  const nextM = minute === 59 ? 0 : minute + 1;
  const otherPeriod = period === 'am' ? 'pm' : 'am';

  const format2Digits = (num: number) => String(num).padStart(2, '0');

  const handleApplyManualInput = () => {
    if (/^\d{1,2}:\d{2}$/.test(inputTimeStr.trim())) {
      const [hStr, mStr] = inputTimeStr.trim().split(':');
      let h = parseInt(hStr, 10);
      const m = parseInt(mStr, 10);
      if (h >= 0 && h <= 23 && m >= 0 && m <= 59) {
        const formatted = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
        onChange(formatted);
        setIsManualInputVisible(false);
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* Top Faded Row (Previous Time) */}
        <TouchableOpacity style={styles.fadedRow} onPress={() => incrementHour(-1)}>
          <Text style={styles.fadedText}>
            {format2Digits(prevH)}  :  {format2Digits(prevM)}
          </Text>
        </TouchableOpacity>

        {/* Center Main Highlighted Row */}
        <View style={styles.mainRow}>
          <TouchableOpacity style={styles.timeDigitBtn} onPress={() => incrementHour(1)}>
            <Text style={styles.mainTimeText}>{format2Digits(hour12)}</Text>
          </TouchableOpacity>

          <Text style={styles.colonText}>:</Text>

          <TouchableOpacity style={styles.timeDigitBtn} onPress={() => incrementMinute(1)}>
            <Text style={styles.mainTimeText}>{format2Digits(minute)}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.periodBadge} onPress={togglePeriod}>
            <Text style={styles.periodText}>{period}</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Faded Row (Next Time) */}
        <TouchableOpacity style={styles.fadedRow} onPress={() => incrementHour(1)}>
          <Text style={styles.fadedText}>
            {format2Digits(nextH)}  :  {format2Digits(nextM)}  {otherPeriod}
          </Text>
        </TouchableOpacity>

        {/* Quick Fine-Tuning Controls */}
        <View style={styles.quickControls}>
          <TouchableOpacity style={styles.stepBtn} onPress={() => incrementMinute(-5)}>
            <Text style={styles.stepBtnText}>-5m</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.stepBtn} onPress={() => incrementMinute(-1)}>
            <Text style={styles.stepBtnText}>-1m</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.stepBtn} onPress={() => { setInputTimeStr(value); setIsManualInputVisible(true); }}>
            <Text style={styles.stepBtnText}>⌨ Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.stepBtn} onPress={() => incrementMinute(1)}>
            <Text style={styles.stepBtnText}>+1m</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.stepBtn} onPress={() => incrementMinute(5)}>
            <Text style={styles.stepBtnText}>+5m</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Manual Time Input Modal */}
      <Modal
        visible={isManualInputVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsManualInputVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Set Alarm Time</Text>
            <Text style={styles.modalSub}>Enter time in 24-hour format (HH:MM)</Text>
            <TextInput
              style={styles.modalInput}
              value={inputTimeStr}
              onChangeText={setInputTimeStr}
              placeholder="05:06"
              placeholderTextColor="#A098BA"
              keyboardType="numbers-and-punctuation"
              autoFocus
            />
            <View style={styles.modalBtnRow}>
              <Button mode="outlined" onPress={() => setIsManualInputVisible(false)} textColor="#A58BFF" style={{ flex: 1, marginRight: 8 }}>
                Cancel
              </Button>
              <Button mode="contained" onPress={handleApplyManualInput} buttonColor="#A58BFF" textColor="#0D0B14" style={{ flex: 1, marginLeft: 8 }}>
                Set
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    marginVertical: 8,
  },
  card: {
    width: '100%',
    backgroundColor: 'rgba(26, 22, 38, 0.85)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(165, 139, 255, 0.15)',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
    elevation: 4,
    shadowColor: '#A58BFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  fadedRow: {
    paddingVertical: 4,
    opacity: 0.35,
  },
  fadedText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#A098BA',
    letterSpacing: 2,
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  timeDigitBtn: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  mainTimeText: {
    fontSize: 42,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  colonText: {
    fontSize: 38,
    fontWeight: '800',
    color: '#FFFFFF',
    marginHorizontal: 4,
  },
  periodBadge: {
    marginLeft: 14,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 14,
    backgroundColor: 'rgba(165, 139, 255, 0.15)',
  },
  periodText: {
    fontSize: 26,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  quickControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    gap: 8,
  },
  stepBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#262036',
    borderWidth: 1,
    borderColor: 'rgba(165, 139, 255, 0.2)',
  },
  stepBtnText: {
    color: '#A58BFF',
    fontSize: 12,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(13, 11, 20, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalBox: {
    width: '90%',
    backgroundColor: '#1A1626',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(165, 139, 255, 0.2)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  modalSub: {
    fontSize: 13,
    color: '#A098BA',
    marginBottom: 16,
  },
  modalInput: {
    backgroundColor: '#262036',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#A58BFF',
  },
  modalBtnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export default TimeWheelPicker;
