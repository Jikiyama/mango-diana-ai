// app/questionnaire/step1.tsx
/* imports unchanged … */

export default function PersonalInfoStep() {
  /* … existing hooks & state … */

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    /* existing checks … */

    // NEW: ensure at least one medical‑condition checkbox picked
    if (medicalConditions.length === 0) {
      newErrors.medicalConditions =
        'Please select a medical condition or “None of the above”.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* render logic unchanged, but show possible error under section */
  /* … after checkboxGroup … */
          {errors.medicalConditions && (
            <Text style={styles.errorText}>{errors.medicalConditions}</Text>
          )}
  /* rest of file unchanged */
}
