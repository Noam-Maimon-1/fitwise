import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import DataTable from '../components/DataTable';
import { getCheckIns, createCheckIn } from '../services/checkInService';
import { getAIRecommendations, generateAIRecommendations } from '../services/aiService';
import './CheckInsPage.css';

const EMPTY_FORM = { weight: '', workoutsCompleted: '', feedback: '', checkInDate: '' };
const AI_MIN_CHECKINS = 3;

const CHECK_IN_DETAIL_COLUMNS = [
  { key: 'checkInDate',       label: 'Date' },
  { key: 'weight',            label: 'Weight (kg)' },
  {
    key: 'weightChange',
    label: 'Change',
    render: (v) => {
      if (v === null) return <span className="badge badge-neutral">First entry</span>;
      if (v < 0)  return <span className="badge badge-success">{v.toFixed(1)} kg</span>;
      if (v > 0)  return <span className="badge badge-danger">+{v.toFixed(1)} kg</span>;
      return <span className="badge badge-neutral">±0.0 kg</span>;
    },
  },
  { key: 'workoutsCompleted', label: 'Workouts' },
  { key: 'feedback',          label: 'Feedback' },
];

function CheckInsPage() {
  const [checkIns,     setCheckIns]      = useState([]);
  const [loading,      setLoading]       = useState(true);
  const [error,        setError]         = useState('');
  const [showForm,     setShowForm]      = useState(false);
  const [form,         setForm]          = useState(EMPTY_FORM);
  const [formErrors,   setFormErrors]    = useState({});
  const [submitting,   setSubmitting]    = useState(false);
  const [submitError,  setSubmitError]   = useState('');
  const [submitSuccess,setSubmitSuccess] = useState('');

  const [aiRec,     setAiRec]     = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError,   setAiError]   = useState('');

  useEffect(() => {
    const fetchCheckIns = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getCheckIns();
        setCheckIns(data || []);
      } catch (err) {
        setError('Could not load check-ins. Make sure the backend is running on port 3000.');
      } finally {
        setLoading(false);
      }
    };
    fetchCheckIns();
    loadAIRecommendations();
  }, []);

  const loadAIRecommendations = async () => {
    try {
      const data = await getAIRecommendations();
      setAiRec(data && data.length > 0 ? data[0] : null);
    } catch {
      // Silently ignore — the section renders an empty state instead
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setSubmitSuccess('');
  };

  const validate = () => {
    const errs = {};

    const weight = Number(form.weight);
    if (form.weight === '' || isNaN(weight) || weight < 30 || weight > 300) {
      errs.weight = 'Weight must be a number between 30 and 300 kg';
    }

    const workouts = Number(form.workoutsCompleted);
    if (form.workoutsCompleted === '' || !Number.isInteger(workouts) || workouts < 0 || workouts > 7) {
      errs.workoutsCompleted = 'Workouts completed must be a whole number between 0 and 7';
    }

    if (!form.checkInDate) {
      errs.checkInDate = 'Date is required';
    } else {
      const todayStr = new Date().toISOString().split('T')[0];
      if (form.checkInDate < '2000-01-01') {
        errs.checkInDate = 'Date must not be before 2000-01-01';
      } else if (form.checkInDate > todayStr) {
        errs.checkInDate = 'Date must not be in the future';
      }
    }

    if (form.feedback) {
      if (form.feedback.length > 500) {
        errs.feedback = 'Feedback must be 500 characters or fewer';
      } else if (form.feedback.trim() !== '' && !isNaN(Number(form.feedback))) {
        errs.feedback = 'Feedback must not be only numbers';
      }
    }

    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitSuccess('');
    setSubmitError('');

    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setFormErrors(errs);
      return;
    }
    setFormErrors({});

    const payload = {
      weight:            Number(form.weight),
      workoutsCompleted: Number(form.workoutsCompleted),
      feedback:          form.feedback,
      checkInDate:       form.checkInDate
    };

    setSubmitting(true);
    try {
      const newCheckIn = await createCheckIn(payload);
      setCheckIns(prev => [...prev, newCheckIn]);
      setForm(EMPTY_FORM);
      setShowForm(false);
      setSubmitSuccess('Check-in recorded successfully!');
    } catch (err) {
      setSubmitError(err.message || 'Failed to save check-in.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGenerateAI = async () => {
    setAiLoading(true);
    setAiError('');
    try {
      const result = await generateAIRecommendations();
      setAiRec(result);
    } catch (err) {
      setAiError(err.message || 'AI analysis failed. Please try again.');
    } finally {
      setAiLoading(false);
    }
  };

  const renderRecommendationItem = (item, i) => {
    if (typeof item === 'string') return <li key={i}>{item}</li>;
    if (item && typeof item === 'object') {
      const label = item.change || item.recommendation || item.text || item.message;
      const reason = item.reason;
      return (
        <li key={i}>
          {label}
          {reason && <span className="ai-rec-reason"> — {reason}</span>}
        </li>
      );
    }
    return null;
  };

  const hasEnoughCheckIns = checkIns.length >= AI_MIN_CHECKINS;
  const actionsApplied = aiRec?.actionsApplied ?? null;
  const hasCaloricAdjustment = actionsApplied !== null &&
    actionsApplied.caloricTargetAdjustment !== null &&
    actionsApplied.caloricTargetAdjustment !== 0;
  const hasExerciseAdjustments = actionsApplied !== null &&
    actionsApplied.exerciseAdjustmentsCount > 0;

  const sortedDesc = [...checkIns].sort(
    (a, b) => new Date(b.checkInDate) - new Date(a.checkInDate)
  );

  const detailTableData = sortedDesc.map((ci, i) => {
    const prev = sortedDesc[i + 1];
    return {
      ...ci,
      weightChange: prev != null ? parseFloat((ci.weight - prev.weight).toFixed(2)) : null,
    };
  });

  return (
    <div className="check-ins-page">
      <div className="page-header">
        <h1>Check-Ins</h1>
        <p>Monitor your weekly progress</p>
      </div>

      {loading && <p className="loading">Loading check-ins…</p>}
      {error   && <div className="error-banner">{error}</div>}

      {!loading && (
        <>
          {/* Progress Summary Card */}
          <Card
            title="Progress Summary"
            subtitle={`${checkIns.length} check-in${checkIns.length !== 1 ? 's' : ''} recorded`}
            badge={hasEnoughCheckIns ? 'AI Ready' : `${checkIns.length} / ${AI_MIN_CHECKINS}`}
            accentColor={hasEnoughCheckIns ? '#00b894' : '#fdcb6e'}
            stats={[
              { label: 'Total Check-Ins', value: checkIns.length },
              { label: 'Latest Weight',   value: sortedDesc.length ? `${sortedDesc[0].weight} kg` : '—' },
            ]}
          />

          {/* Add check-in toggle */}
          <div className="add-checkin-toggle">
            <button
              className="toggle-btn"
              onClick={() => { setShowForm(prev => !prev); setSubmitError(''); setSubmitSuccess(''); }}
            >
              {showForm ? '— Cancel' : '+ Add Check-In'}
            </button>
          </div>

          {submitSuccess && <div className="success-msg">{submitSuccess}</div>}

          {/* Form */}
          {showForm && (
            <form className="checkin-form" onSubmit={handleSubmit} noValidate>

              <div className="form-group">
                <label htmlFor="weight">Weight (kg)</label>
                <input
                  id="weight" name="weight" type="number" step="0.1"
                  value={form.weight} onChange={handleChange} min="1"
                  placeholder="e.g. 75.5"
                  className={formErrors.weight ? 'input-error' : ''}
                />
                {formErrors.weight && <span className="error-msg">{formErrors.weight}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="workoutsCompleted">Workouts Completed This Week</label>
                <input
                  id="workoutsCompleted" name="workoutsCompleted" type="number"
                  value={form.workoutsCompleted} onChange={handleChange} min="0"
                  placeholder="e.g. 3"
                  className={formErrors.workoutsCompleted ? 'input-error' : ''}
                />
                {formErrors.workoutsCompleted && <span className="error-msg">{formErrors.workoutsCompleted}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="checkInDate">Date</label>
                <input
                  id="checkInDate" name="checkInDate" type="date"
                  value={form.checkInDate} onChange={handleChange}
                  className={formErrors.checkInDate ? 'input-error' : ''}
                />
                {formErrors.checkInDate && <span className="error-msg">{formErrors.checkInDate}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="feedback">Feedback (optional)</label>
                <input
                  id="feedback" name="feedback" type="text"
                  value={form.feedback} onChange={handleChange}
                  placeholder="How did your week go?"
                  className={formErrors.feedback ? 'input-error' : ''}
                />
                {formErrors.feedback && <span className="error-msg">{formErrors.feedback}</span>}
              </div>

              {submitError && <div className="api-error">{submitError}</div>}

              <button type="submit" className="submit-btn" disabled={submitting}>
                {submitting ? 'Saving…' : 'Save Check-In'}
              </button>
            </form>
          )}

          {/* Weight Journey Timeline */}
          {sortedDesc.length > 0 && (
            <div className="ci-timeline-section">
              <div className="ci-journey-header">
                <h2 className="ci-journey-title">Weight Journey</h2>
                <span className="badge badge-brand">
                  {checkIns.length} check-in{checkIns.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="ci-timeline">
                {sortedDesc.map((ci, i) => {
                  const prev     = sortedDesc[i + 1];
                  const delta    = prev != null ? ci.weight - prev.weight : null;
                  const deltaCls = delta === null ? '' : delta < 0 ? 'badge-success' : delta > 0 ? 'badge-warning' : 'badge-neutral';
                  return (
                    <div key={i} className="ci-node">
                      <div className="ci-node-line">
                        <div className="ci-node-dot" />
                        {i < sortedDesc.length - 1 && <div className="ci-node-track" />}
                      </div>
                      <div className="ci-node-body">
                        <div className="ci-node-head">
                          <span className="ci-node-date">{ci.checkInDate}</span>
                          <span className="ci-node-weight">{ci.weight} kg</span>
                          {delta !== null && (
                            <span className={`badge ${deltaCls}`} style={{ fontSize: '0.65rem' }}>
                              {delta >= 0 ? '+' : ''}{delta.toFixed(1)} kg
                            </span>
                          )}
                        </div>
                        <div className="ci-node-meta">
                          <span className="ci-node-workouts">
                            💪 {ci.workoutsCompleted} workout{ci.workoutsCompleted !== 1 ? 's' : ''}
                          </span>
                          {ci.feedback && (
                            <span className="ci-node-feedback">"{ci.feedback}"</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Detailed History Table */}
          {detailTableData.length > 0 && (
            <div className="ci-detail-section">
              <div className="ci-detail-header">
                <h3 className="ci-detail-title">📊 Detailed History</h3>
                <span className="badge badge-neutral">{detailTableData.length} entries</span>
              </div>
              <DataTable
                columns={CHECK_IN_DETAIL_COLUMNS}
                data={detailTableData}
                caption="Full check-in record — newest first"
              />
            </div>
          )}

          {/* AI Coach Analysis */}
          <section className="ai-section">
            <div className="ai-section-banner">
              <div className="ai-section-banner-icon">✨</div>
              <div>
                <h2 className="ai-section-banner-title">AI Coach Analysis</h2>
                <p className="ai-section-banner-subtitle">
                  Reviews your accumulated check-in data and may update your workout and meal plans based on your progress trends.
                </p>
              </div>
            </div>

            {aiLoading && (
              <div className="ai-loading">
                <div className="ai-spinner" />
                <p>Analyzing your progress. This may take a few seconds…</p>
              </div>
            )}

            {aiError && !aiLoading && (
              <div className="error-banner ai-error-banner">{aiError}</div>
            )}

            {!aiLoading && aiRec && (
              <div className="ai-result">
                <p className="ai-generated-at">
                  Last analyzed: {new Date(aiRec.generatedAt).toLocaleString()}
                </p>

                <div className="ai-assessments">
                  <div className="ai-assessment-card">
                    <h3>Weight Analysis</h3>
                    <p>{aiRec.weightAssessment}</p>
                  </div>
                  <div className="ai-assessment-card">
                    <h3>Workout Analysis</h3>
                    <p>{aiRec.workoutAssessment}</p>
                  </div>
                  <div className="ai-assessment-card">
                    <h3>Nutrition Analysis</h3>
                    <p>{aiRec.nutritionAssessment}</p>
                  </div>
                </div>

                {Array.isArray(aiRec.recommendations) && aiRec.recommendations.length > 0 && (
                  <div className="ai-recommendations-list">
                    <h3>Recommendations</h3>
                    <ul>
                      {aiRec.recommendations.map(renderRecommendationItem)}
                    </ul>
                  </div>
                )}

                {/* Plan updates — only present on POST response, never on GET */}
                {actionsApplied && (
                  <div className="ai-actions-applied">
                    <h3>Plan Updates Applied</h3>
                    {hasCaloricAdjustment && (
                      <div className="ai-action-item">
                        <span className="ai-action-check">✓</span>
                        Caloric target adjusted by{' '}
                        <strong>
                          {actionsApplied.caloricTargetAdjustment > 0 ? '+' : ''}
                          {actionsApplied.caloricTargetAdjustment} kcal
                        </strong>
                      </div>
                    )}
                    {hasExerciseAdjustments && (
                      <div className="ai-action-item">
                        <span className="ai-action-check">✓</span>
                        <strong>{actionsApplied.exerciseAdjustmentsCount}</strong>{' '}
                        exercise adjustment{actionsApplied.exerciseAdjustmentsCount !== 1 ? 's' : ''} applied
                      </div>
                    )}
                    {!hasCaloricAdjustment && !hasExerciseAdjustments && (
                      <p className="ai-no-actions">No plan adjustments were needed at this time.</p>
                    )}
                  </div>
                )}
              </div>
            )}

            {!aiLoading && !aiRec && !aiError && (
              <p className="ai-empty-state">
                No analysis yet. Submit at least {AI_MIN_CHECKINS} check-ins to build up progress data, then review your coaching insights.
              </p>
            )}

            {/* Minimum check-ins gate */}
            {!hasEnoughCheckIns && (
              <div className="ai-gate">
                <p className="ai-gate-message">
                  You need at least {AI_MIN_CHECKINS} check-ins before generating an AI progress review.
                </p>
                <p className="ai-gate-progress">
                  Current progress: <strong>{checkIns.length} / {AI_MIN_CHECKINS}</strong> check-ins
                </p>
              </div>
            )}

            <button
              className="ai-btn"
              onClick={handleGenerateAI}
              disabled={aiLoading || !hasEnoughCheckIns}
            >
              {aiLoading
                ? 'Analyzing…'
                : aiRec
                  ? 'Regenerate Analysis'
                  : 'Review Progress With AI'}
            </button>
          </section>
        </>
      )}
    </div>
  );
}

export default CheckInsPage;
