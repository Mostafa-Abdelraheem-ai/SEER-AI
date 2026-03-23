import AnalysisWorkspace from "../components/AnalysisWorkspace";
import { useSafetyAssistant } from "../hooks/useSafetyAssistant";

export default function NewAnalysis() {
  const assistant = useSafetyAssistant("message");
  return <AnalysisWorkspace assistant={assistant} title="Analyze a message, email, file, image, or voice note" subtitle="Use one workspace for everything. Paste text, drop a file, or let SEER-AI detect the input type for you." />;
}
