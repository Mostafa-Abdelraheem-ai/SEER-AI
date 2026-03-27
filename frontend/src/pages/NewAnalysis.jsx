import { useTranslation } from "react-i18next";

import AnalysisWorkspace from "../components/AnalysisWorkspace";
import { useSafetyAssistant } from "../hooks/useSafetyAssistant";

export default function NewAnalysis() {
  const { t } = useTranslation();
  const assistant = useSafetyAssistant("message");
  return <AnalysisWorkspace assistant={assistant} title={t("topbar.assistant.title")} subtitle={t("topbar.assistant.subtitle")} />;
}
