import { useTranslation } from "react-i18next";

import AnalysisWorkspace from "../components/AnalysisWorkspace";
import { useSafetyAssistant } from "../hooks/useSafetyAssistant";

export default function VoiceCheck() {
  const { t } = useTranslation();
  const assistant = useSafetyAssistant("voice", { lockMode: true });
  return (
    <AnalysisWorkspace
      assistant={assistant}
      eyebrow={t("focusedTools.voice.eyebrow")}
      title={t("focusedTools.voice.title")}
      subtitle={t("focusedTools.voice.subtitle")}
      inputLabel={t("focusedTools.voice.inputLabel")}
      fileOnlyPlaceholder={t("focusedTools.voice.fileOnlyPlaceholder")}
      uploadLabel={t("focusedTools.voice.uploadLabel")}
      uploadHint={t("focusedTools.voice.uploadHint")}
      emptyStateCopy={t("focusedTools.voice.emptyState")}
    />
  );
}
