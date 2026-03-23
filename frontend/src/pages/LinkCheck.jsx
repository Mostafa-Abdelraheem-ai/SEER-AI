import AnalysisWorkspace from "../components/AnalysisWorkspace";
import { useSafetyAssistant } from "../hooks/useSafetyAssistant";

export default function LinkCheck() {
  const assistant = useSafetyAssistant("link");
  return <AnalysisWorkspace assistant={assistant} title="Check a link or file hash before you trust it" subtitle="Paste a URL or hash and SEER-AI will explain the biggest warning signs and the limits of the result." />;
}
