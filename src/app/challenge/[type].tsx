import { useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { View } from "react-native";

import ChallengeShell from "@/components/challenges/ChallengeShell";
import AppText from "@/components/common/AppText";
import AppInput from "@/components/forms/AppInput";
import AppButton from "@/components/buttons/AppButton";

import { useAppTheme } from "@/hooks/useAppTheme";
import { getChallengeMeta } from "@/types/challenge";
import * as verificationApi from "@/services/api/verification.api";
import { ApiError } from "@/services/api/errors";

/**
 * Single screen that renders whichever challenge category the backend
 * generated (math, logic, memory, word_game, pattern, riddle, quiz). Every
 * category is a free-text question + free-text answer on this backend —
 * there is no multiple-choice, image, or sequence-recall data in the
 * response, so the UI is intentionally the same for all of them.
 *
 * Reached from the Alarm Ringing screen with `triggerId`, `challengeId`,
 * and `question` already fetched via POST /verify/trigger. Submitting
 * calls POST /verify/attempt, which is checked server-side — the correct
 * answer is never sent to the client.
 */
export default function ChallengeScreen() {
  const { type, alarmId, triggerId, challengeId, question } = useLocalSearchParams<{
    type: string;
    alarmId?: string;
    triggerId?: string;
    challengeId?: string;
    question?: string;
  }>();
  const { colors, spacing, radius } = useAppTheme();
  const meta = getChallengeMeta(type);

  const [answer, setAnswer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const goToResult = (success: boolean) => {
    router.replace({
      pathname: success ? "/challenge/success" : "/challenge/failure",
      params: { alarmId: alarmId ?? "" },
    });
  };

  const handleSubmit = async () => {
    if (!triggerId || !challengeId) {
      // Shouldn't happen from the normal ring -> trigger -> challenge flow,
      // but guards against this screen being opened without real backend data.
      setError("This challenge wasn't started properly. Go back and try again.");
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      const result = await verificationApi.verifyAttempt({
        trigger_id: triggerId,
        challenge_id: challengeId,
        submitted_answer: answer,
      });
      goToResult(result.is_correct);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't submit your answer. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ChallengeShell
      title={meta.title}
      instructions={meta.description}
      footer={
        <View style={{ gap: spacing.sm }}>
          {error && <AppText style={{ color: colors.error }}>{error}</AppText>}
          <AppButton
            title="Submit Answer"
            onPress={handleSubmit}
            disabled={answer.trim().length === 0}
            loading={isSubmitting}
          />
        </View>
      }
    >
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: spacing.lg }}>
        <MaterialCommunityIcons name={meta.icon as any} size={22} color={colors.primary} />
        <AppText variant="subtitle" style={{ marginLeft: spacing.sm, flex: 1 }}>
          {question ?? "Loading question..."}
        </AppText>
      </View>

      <AppInput
        placeholder="Type your answer"
        autoCapitalize="none"
        value={answer}
        onChangeText={setAnswer}
        onSubmitEditing={handleSubmit}
      />
    </ChallengeShell>
  );
}
