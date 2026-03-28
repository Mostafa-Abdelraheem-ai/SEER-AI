import { useTranslation } from "react-i18next";

import AnalysisWorkspace from "../components/AnalysisWorkspace";
import { useSafetyAssistant } from "../hooks/useSafetyAssistant";

export default function ImagePrivacyCheck() {
  const { t } = useTranslation();
  const assistant = useSafetyAssistant("image", { lockMode: true });
  return (
    <AnalysisWorkspace
      assistant={assistant}
      eyebrow={t("focusedTools.image.eyebrow")}
      title={t("focusedTools.image.title")}
      subtitle={t("focusedTools.image.subtitle")}
      inputLabel={t("focusedTools.image.inputLabel")}
      fileOnlyPlaceholder={t("focusedTools.image.fileOnlyPlaceholder")}
      uploadLabel={t("focusedTools.image.uploadLabel")}
      uploadHint={t("focusedTools.image.uploadHint")}
      emptyStateCopy={t("focusedTools.image.emptyState")}
    />
  );
}
