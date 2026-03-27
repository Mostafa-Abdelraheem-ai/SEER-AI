import { useTranslation } from "react-i18next";

import AnalysisWorkspace from "../components/AnalysisWorkspace";
import { useSafetyAssistant } from "../hooks/useSafetyAssistant";

export default function LinkCheck() {
  const { t } = useTranslation();
  const assistant = useSafetyAssistant("link", { lockMode: true });
  return (
    <AnalysisWorkspace
      assistant={assistant}
      eyebrow={t("focusedTools.link.eyebrow")}
      title={t("focusedTools.link.title")}
      subtitle={t("focusedTools.link.subtitle")}
      inputLabel={t("focusedTools.link.inputLabel")}
      textPlaceholder={t("focusedTools.link.textPlaceholder")}
      emptyStateCopy={t("focusedTools.link.emptyState")}
    />
  );
}
