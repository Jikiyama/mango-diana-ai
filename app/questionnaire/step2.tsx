// app/questionnaire/step2.tsx
/* imports unchanged … */

export default function DietPreferencesStep() {
  /* … existing state … */
  const [errors, setErrors] = useState<{ strictness?: string }>({});

  const validate = () => {
    const e: { strictness?: string } = {};
    if (!strictnessLevel) e.strictness = 'Please choose a strictness level.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (!validate()) return;

    updateDietPreferences({
      /* unchanged … */
    });

    nextStep();
    router.push('/questionnaire/step3');
  };

  /* … render → add inline error under strictness radio‑group */
  {errors.strictness && (
    <Text style={styles.errorText}>{errors.strictness}</Text>
  )}
}
