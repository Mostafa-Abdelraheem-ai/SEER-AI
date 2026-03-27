import { useTranslation } from "react-i18next";

import AnalysisWorkspace from "../components/AnalysisWorkspace";
import { useSafetyAssistant } from "../hooks/useSafetyAssistant";

export default function MessageCheck() {
  const { t } = useTranslation();
  const assistant = useSafetyAssistant("message", { lockMode: true });
  return (
    <AnalysisWorkspace
      assistant={assistant}
      eyebrow={t("focusedTools.message.eyebrow")}
      title={t("focusedTools.message.title")}
      subtitle={t("focusedTools.message.subtitle")}
      inputLabel={t("focusedTools.message.inputLabel")}
      textPlaceholder={t("focusedTools.message.textPlaceholder")}
      emptyStateCopy={t("focusedTools.message.emptyState")}
    />
  );
}
