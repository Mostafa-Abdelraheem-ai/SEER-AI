from __future__ import annotations

import json
from pathlib import Path
import sys

import pandas as pd
import streamlit as st

PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from src.api.app import analyze_batch_frame, get_engine, get_report_agent, get_soc_agent
from src.config import METRICS_DIR, PLOTS_DIR
from src.explainability import explain_message


st.set_page_config(page_title="SEER-AI++ Dashboard", layout="wide")


def render_gauge(score: int) -> None:
    color = "#1f7a1f" if score < 45 else "#c98a00" if score < 75 else "#b00020"
    st.markdown(
        f"""
        <div style="padding:18px;border-radius:14px;background:linear-gradient(135deg,#0f172a,#1e293b);color:white;">
            <div style="font-size:14px;letter-spacing:0.08em;text-transform:uppercase;">Hybrid Risk Score</div>
            <div style="font-size:48px;font-weight:700;color:{color};">{score}</div>
            <div style="font-size:13px;opacity:0.8;">0-100 normalized hybrid score</div>
        </div>
        """,
        unsafe_allow_html=True,
    )


def load_plot(path: Path) -> None:
    if path.exists():
        st.image(str(path), use_container_width=True)
    else:
        st.info(f"Plot not found: {path.name}")


st.title("SEER-AI++: Social Engineering Early Response AI")
st.caption("SOC-oriented prototype for scam detection, explanation, retrieval, and analyst reporting.")

tab_single, tab_batch, tab_eval = st.tabs(["Single Message", "Batch Analysis", "Evaluation"])

with tab_single:
    text = st.text_area(
        "Analyze an email, SMS, or chat message",
        height=180,
        value="This is the CEO. Keep this confidential and send the payment today to avoid account suspension.",
    )
    if st.button("Analyze Message", type="primary"):
        engine = get_engine()
        analysis = engine.analyze(text)
        explanation = explain_message(text, analysis)
        analyst_summary = get_soc_agent().summarize(text, analysis)
        incident_report = get_report_agent().generate_report(text, analysis)

        left, right = st.columns([1, 2])
        with left:
            render_gauge(analysis["risk_score"])
            st.metric("Attack Prediction", analysis["attack_prediction"])
            st.metric("Tactic", analysis["tactic_prediction"])
            st.metric("Confidence", f"{analysis['confidence']:.2f}")
        with right:
            st.subheader("Explanation")
            st.write(analysis["explanation"])
            st.code(explanation["highlighted_text"])
            st.subheader("Triggered Rules")
            st.write(analysis["triggered_rules"] or ["No strong rules triggered"])
            st.subheader("Analyst Summary")
            st.write(analyst_summary)
            st.subheader("Incident Report")
            st.json(incident_report)
            st.subheader("Retrieved Knowledge")
            for chunk in analysis["retrieved_chunks"]:
                st.markdown(f"**{chunk['source']}**  |  score={chunk['score']}")
                st.write(chunk["text"])

with tab_batch:
    uploaded = st.file_uploader("Upload CSV with a `text` column", type=["csv"])
    if uploaded is not None:
        df = pd.read_csv(uploaded)
        if "text" not in df.columns:
            st.error("CSV must include a `text` column.")
        else:
            results = analyze_batch_frame(df)
            st.dataframe(results, use_container_width=True)
            st.download_button(
                "Download Results",
                data=results.to_csv(index=False).encode("utf-8"),
                file_name="seer_ai_pp_batch_results.csv",
                mime="text/csv",
            )

with tab_eval:
    st.subheader("Confusion Matrix Viewer")
    plot_choice = st.selectbox(
        "Select plot",
        [
            "attack_transformer_confusion_matrix.png",
            "tfidf_logreg_confusion_matrix.png",
            "tfidf_rf_confusion_matrix.png",
            "tactic_model_confusion_matrix.png",
        ],
    )
    load_plot(PLOTS_DIR / plot_choice)
    st.subheader("Model Comparison Tables")
    for metrics_file in ["attack_model_comparison.csv", "tactic_model_comparison.csv"]:
        path = METRICS_DIR / metrics_file
        if path.exists():
            st.write(metrics_file)
            st.dataframe(pd.read_csv(path), use_container_width=True)
        else:
            st.info(f"{metrics_file} not available yet.")
