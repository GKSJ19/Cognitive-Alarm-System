import { useEffect, useMemo, useState } from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import ChallengeShell from "@/components/challenges/ChallengeShell";
import AppText from "@/components/common/AppText";
import AppInput from "@/components/forms/AppInput";
import AppButton from "@/components/buttons/AppButton";
import EmptyState from "@/components/common/EmptyState";

import { useAppTheme } from "@/hooks/useAppTheme";
import { CHALLENGE_CATALOG, ChallengeType } from "@/types/challenge";
import {
  getImageSequence,
  getMemorySequence,
  getMultipleChoiceQuestion,
  getPatternQuestion,
  getWordQuestion,
  PATTERN_SHAPES,
  SEQUENCE_ICONS,
} from "@/data/mock/challenges";

/**
 * Single dynamic screen that renders any of the 8 wake-up challenge types.
 * Reached from the Alarm Ringing screen as
 * `/challenge/math`, `/challenge/logic`, `/challenge/word`, `/challenge/riddle`,
 * `/challenge/quiz`, `/challenge/memory-sequence`, `/challenge/image-sequence`,
 * `/challenge/pattern`.
 *
 * On success -> /challenge/success, on failure -> /challenge/failure.
 * Question generation is mocked in @/data/mock/challenges — swap those
 * functions for real API calls once a challenge-generation backend exists.
 */
export default function ChallengeScreen() {
  const { type: rawType, alarmId } = useLocalSearchParams<{ type: string; alarmId?: string }>();
  const type = rawType as ChallengeType;

  const meta = CHALLENGE_CATALOG.find((c) => c.type === type);

  if (!meta) {
    return (
      <EmptyState
        icon="alert-circle-outline"
        title="Unknown challenge"
        actionLabel="Back to Alarms"
        onActionPress={() => router.replace("/(app)/alarms")}
      />
    );
  }

  const goToResult = (success: boolean) => {
    router.replace({
      pathname: success ? "/challenge/success" : "/challenge/failure",
      params: { alarmId: alarmId ?? "" },
    });
  };

  if (type === "math" || type === "logic" || type === "riddle" || type === "quiz") {
    return <MultipleChoiceChallenge type={type} meta={meta} onDone={goToResult} />;
  }
  if (type === "word") {
    return <WordChallenge meta={meta} onDone={goToResult} />;
  }
  if (type === "memory-sequence") {
    return <MemorySequenceChallenge meta={meta} onDone={goToResult} />;
  }
  if (type === "image-sequence") {
    return <ImageSequenceChallenge meta={meta} onDone={goToResult} />;
  }
  return <PatternChallenge meta={meta} onDone={goToResult} />;
}

function MultipleChoiceChallenge({
  type,
  meta,
  onDone,
}: {
  type: ChallengeType;
  meta: (typeof CHALLENGE_CATALOG)[number];
  onDone: (success: boolean) => void;
}) {
  const { colors, spacing, radius } = useAppTheme();
  const question = useMemo(() => getMultipleChoiceQuestion(type), [type]);
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <ChallengeShell
      title={meta.title}
      instructions={meta.description}
      footer={
        <AppButton
          title="Submit Answer"
          onPress={() => onDone(selected === question.correctIndex)}
          disabled={selected === null}
        />
      }
    >
      <AppText variant="subtitle" style={{ marginBottom: spacing.lg }}>
        {question.prompt}
      </AppText>

      {question.options.map((option, index) => {
        const active = selected === index;
        return (
          <TouchableOpacity
            key={`${option}-${index}`}
            onPress={() => setSelected(index)}
            activeOpacity={0.8}
            style={[
              styles.option,
              {
                borderRadius: radius.md,
                borderColor: active ? colors.primary : colors.border,
                backgroundColor: active ? colors.primary + "1A" : "transparent",
              },
            ]}
          >
            <AppText variant="body" style={{ color: active ? colors.primary : colors.text }}>
              {option}
            </AppText>
          </TouchableOpacity>
        );
      })}
    </ChallengeShell>
  );
}

function WordChallenge({
  meta,
  onDone,
}: {
  meta: (typeof CHALLENGE_CATALOG)[number];
  onDone: (success: boolean) => void;
}) {
  const { colors, spacing, radius } = useAppTheme();
  const question = useMemo(() => getWordQuestion(), []);
  const [value, setValue] = useState("");

  return (
    <ChallengeShell
      title={meta.title}
      instructions={meta.description}
      footer={
        <AppButton
          title="Submit Answer"
          onPress={() => onDone(value.trim().toUpperCase() === question.answer)}
          disabled={value.trim().length === 0}
        />
      }
    >
      <View style={{ flexDirection: "row", justifyContent: "center", marginBottom: spacing.lg }}>
        {question.scrambled.split("").map((letter, index) => (
          <View
            key={index}
            style={[
              styles.letterTile,
              { borderRadius: radius.sm, backgroundColor: colors.primary + "1A", marginHorizontal: 3 },
            ]}
          >
            <AppText variant="subtitle" style={{ color: colors.primary }}>
              {letter}
            </AppText>
          </View>
        ))}
      </View>

      <AppInput
        placeholder="Type the unscrambled word"
        autoCapitalize="characters"
        value={value}
        onChangeText={setValue}
      />
    </ChallengeShell>
  );
}

function MemorySequenceChallenge({
  meta,
  onDone,
}: {
  meta: (typeof CHALLENGE_CATALOG)[number];
  onDone: (success: boolean) => void;
}) {
  const { colors, spacing, radius } = useAppTheme();
  const sequence = useMemo(() => getMemorySequence(5), []);
  const [phase, setPhase] = useState<"memorize" | "recall">("memorize");
  const [attempt, setAttempt] = useState<number[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => setPhase("recall"), 2500);
    return () => clearTimeout(timer);
  }, []);

  const pad = useMemo(() => Array.from({ length: 9 }, (_, i) => i + 1), []);

  return (
    <ChallengeShell
      title={meta.title}
      instructions={
        phase === "memorize"
          ? "Memorize the sequence below..."
          : "Now tap the numbers in the same order."
      }
      footer={
        phase === "recall" ? (
          <View style={{ gap: spacing.sm }}>
            <AppButton
              title="Submit Answer"
              onPress={() => onDone(JSON.stringify(attempt) === JSON.stringify(sequence))}
              disabled={attempt.length !== sequence.length}
            />
            <AppButton title="Clear" variant="outline" onPress={() => setAttempt([])} />
          </View>
        ) : undefined
      }
    >
      {phase === "memorize" ? (
        <View style={{ flexDirection: "row", justifyContent: "center", flexWrap: "wrap" }}>
          {sequence.map((n, i) => (
            <View
              key={i}
              style={[
                styles.memoryChip,
                { borderRadius: radius.md, backgroundColor: colors.primary, margin: 4 },
              ]}
            >
              <AppText variant="subtitle" style={{ color: "#FFFFFF" }}>
                {n}
              </AppText>
            </View>
          ))}
        </View>
      ) : (
        <View>
          <AppText variant="body" style={{ color: colors.textSecondary, marginBottom: spacing.md }}>
            Your answer: {attempt.join(" ") || "—"}
          </AppText>
          <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "center" }}>
            {pad.map((n) => (
              <TouchableOpacity
                key={n}
                onPress={() => setAttempt((prev) => [...prev, n])}
                style={[
                  styles.memoryChip,
                  { borderRadius: radius.md, backgroundColor: colors.card, borderWidth: 1.5, borderColor: colors.border, margin: 4 },
                ]}
              >
                <AppText variant="subtitle">{n}</AppText>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </ChallengeShell>
  );
}

function ImageSequenceChallenge({
  meta,
  onDone,
}: {
  meta: (typeof CHALLENGE_CATALOG)[number];
  onDone: (success: boolean) => void;
}) {
  const { colors, spacing, radius } = useAppTheme();
  const sequence = useMemo(() => getImageSequence(4), []);
  const [phase, setPhase] = useState<"memorize" | "recall">("memorize");
  const [attempt, setAttempt] = useState<number[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => setPhase("recall"), 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <ChallengeShell
      title={meta.title}
      instructions={
        phase === "memorize" ? "Memorize the order of these images..." : "Tap the icons in the order shown."
      }
      footer={
        phase === "recall" ? (
          <View style={{ gap: spacing.sm }}>
            <AppButton
              title="Submit Answer"
              onPress={() => onDone(JSON.stringify(attempt) === JSON.stringify(sequence))}
              disabled={attempt.length !== sequence.length}
            />
            <AppButton title="Clear" variant="outline" onPress={() => setAttempt([])} />
          </View>
        ) : undefined
      }
    >
      {phase === "memorize" ? (
        <View style={{ flexDirection: "row", justifyContent: "center" }}>
          {sequence.map((iconIndex, i) => (
            <View
              key={i}
              style={[styles.memoryChip, { borderRadius: radius.md, backgroundColor: colors.primary, margin: 4 }]}
            >
              <MaterialCommunityIcons name={SEQUENCE_ICONS[iconIndex]} size={26} color="#FFFFFF" />
            </View>
          ))}
        </View>
      ) : (
        <View>
          <View style={{ flexDirection: "row", justifyContent: "center", marginBottom: spacing.md }}>
            {attempt.map((iconIndex, i) => (
              <MaterialCommunityIcons
                key={i}
                name={SEQUENCE_ICONS[iconIndex]}
                size={22}
                color={colors.primary}
                style={{ marginHorizontal: 3 }}
              />
            ))}
          </View>
          <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "center" }}>
            {SEQUENCE_ICONS.map((icon, i) => (
              <TouchableOpacity
                key={icon}
                onPress={() => setAttempt((prev) => [...prev, i])}
                style={[
                  styles.memoryChip,
                  { borderRadius: radius.md, backgroundColor: colors.card, borderWidth: 1.5, borderColor: colors.border, margin: 4 },
                ]}
              >
                <MaterialCommunityIcons name={icon} size={24} color={colors.text} />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </ChallengeShell>
  );
}

function PatternChallenge({
  meta,
  onDone,
}: {
  meta: (typeof CHALLENGE_CATALOG)[number];
  onDone: (success: boolean) => void;
}) {
  const { colors, spacing, radius } = useAppTheme();
  const question = useMemo(() => getPatternQuestion(), []);
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <ChallengeShell
      title={meta.title}
      instructions={meta.description}
      footer={
        <AppButton
          title="Submit Answer"
          onPress={() => onDone(selected === question.correctIndex)}
          disabled={selected === null}
        />
      }
    >
      <View style={{ flexDirection: "row", justifyContent: "center", marginBottom: spacing.xl }}>
        {[...question.sequence, -1].map((shapeIndex, i) => (
          <View key={i} style={[styles.memoryChip, { borderRadius: radius.md, backgroundColor: colors.card, borderWidth: 1.5, borderColor: colors.border, margin: 4 }]}>
            {shapeIndex === -1 ? (
              <AppText variant="subtitle" style={{ color: colors.primary }}>
                ?
              </AppText>
            ) : (
              <MaterialCommunityIcons name={`${PATTERN_SHAPES[shapeIndex]}-outline` as any} size={24} color={colors.text} />
            )}
          </View>
        ))}
      </View>

      <View style={{ flexDirection: "row", justifyContent: "center", flexWrap: "wrap" }}>
        {question.options.map((shapeIndex, i) => {
          const active = selected === i;
          return (
            <TouchableOpacity
              key={i}
              onPress={() => setSelected(i)}
              style={[
                styles.memoryChip,
                {
                  borderRadius: radius.md,
                  margin: 4,
                  backgroundColor: active ? colors.primary : colors.card,
                  borderWidth: 1.5,
                  borderColor: active ? colors.primary : colors.border,
                },
              ]}
            >
              <MaterialCommunityIcons
                name={`${PATTERN_SHAPES[shapeIndex]}-outline` as any}
                size={24}
                color={active ? "#FFFFFF" : colors.text}
              />
            </TouchableOpacity>
          );
        })}
      </View>
    </ChallengeShell>
  );
}

const styles = StyleSheet.create({
  option: {
    borderWidth: 1.5,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  letterTile: {
    width: 36,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  memoryChip: {
    width: 52,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
  },
});
