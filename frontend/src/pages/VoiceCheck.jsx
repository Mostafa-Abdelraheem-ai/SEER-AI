import AnalysisWorkspace from "../components/AnalysisWorkspace";
import { useSafetyAssistant } from "../hooks/useSafetyAssistant";

export default function VoiceCheck() {
  const assistant = useSafetyAssistant("voice");
  return <AnalysisWorkspace assistant={assistant} title="Check a voice note for pressure, urgency, or manipulation" subtitle="Upload a recording to combine transcript understanding with tone and acoustic pressure signals." />;
}
