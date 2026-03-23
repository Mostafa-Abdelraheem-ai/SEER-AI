import AnalysisWorkspace from "../components/AnalysisWorkspace";
import { useSafetyAssistant } from "../hooks/useSafetyAssistant";

export default function ImagePrivacyCheck() {
  const assistant = useSafetyAssistant("image");
  return <AnalysisWorkspace assistant={assistant} title="Check an image before you share it" subtitle="Preview the image, run OCR, and highlight private details that may need to be hidden first." />;
}
