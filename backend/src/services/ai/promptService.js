class PromptService {
  /**
   * Generates a prompt for summarizing a medical record.
   */
  static getMedicalRecordSummaryPrompt(record) {
    return `
      You are an expert medical AI assistant.
      Please summarize the following medical record into a concise, easily readable paragraph for a doctor.
      Highlight any critical symptoms, diagnoses, or allergies.
      
      Diagnosis: ${record.diagnosis}
      Symptoms: ${record.symptoms.join(", ")}
      Medications: ${record.medications.join(", ")}
      Allergies: ${record.allergies.join(", ")}
      Notes: ${record.notes}
    `;
  }

  /**
   * Generates a prompt for explaining a lab report to a patient.
   */
  static getLabReportExplanationPrompt(report) {
    return `
      You are an empathetic and knowledgeable AI health assistant.
      Explain the following lab report results to a patient using simple, non-medical language.
      Do NOT provide medical advice or diagnoses. Just explain what the tests measure and if the numbers are generally considered normal.
      
      Report Name: ${report.reportName}
      Type: ${report.reportType}
      Doctor Remarks: ${report.doctorRemarks}
      Results: ${JSON.stringify(report.results)}
    `;
  }

  /**
   * Generates a prompt for OCR cleanup.
   */
  static getOCRCleanupPrompt(rawText) {
    return `
      You are an AI trained to clean up raw OCR text from medical documents.
      Fix spelling errors, remove artifacts, and format the text clearly.
      
      Raw OCR:
      ${rawText}
    `;
  }
}

export default PromptService;
