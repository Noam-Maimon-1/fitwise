import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../services/authService';
import PlanGeneratingOverlay from '../components/PlanGeneratingOverlay';
import './RegisterPage.css';

const INITIAL_FORM = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
  age: '',
  gender: '',
  height: '',
  weight: '',
  fitnessGoal: '',
  activityLevel: '',
  workoutsPerWeek: '',
  mealsPerDay: '',
};

function RegisterPage() {
  const navigate = useNavigate();
  const [form,     setForm]     = useState(INITIAL_FORM);
  const [errors,   setErrors]   = useState({});
  const [apiError, setApiError] = useState('');

  // 'idle' | 'generating' | 'done'
  const [generatingStatus, setGeneratingStatus] = useState('idle');

  useEffect(() => {
    if (localStorage.getItem('user')) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!form.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (!/^[a-zA-Zא-ת '\-]*[a-zA-Zא-ת][a-zA-Zא-ת '\-]*$/.test(form.firstName.trim())) {
      newErrors.firstName = 'Name may only contain letters, spaces, hyphens, and apostrophes';
    }
    if (!form.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (!/^[a-zA-Zא-ת '\-]*[a-zA-Zא-ת][a-zA-Zא-ת '\-]*$/.test(form.lastName.trim())) {
      newErrors.lastName = 'Name may only contain letters, spaces, hyphens, and apostrophes';
    }
    if (!form.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(form.email)) {
      newErrors.email = 'Enter a valid email address (e.g. jane@example.com)';
    }
    if (!form.password) {
      newErrors.password = 'Password is required';
    } else if (form.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (!form.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (form.confirmPassword !== form.password) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!form.age) {
      newErrors.age = 'Age is required';
    } else if (!Number.isInteger(Number(form.age)) || Number(form.age) < 13 || Number(form.age) > 120) {
      newErrors.age = 'Age must be a whole number between 13 and 120';
    }
    if (!form.gender) newErrors.gender = 'Gender is required';
    if (!form.height) {
      newErrors.height = 'Height is required';
    } else if (Number.isNaN(Number(form.height)) || Number(form.height) < 100 || Number(form.height) > 250) {
      newErrors.height = 'Height must be between 100 and 250 cm';
    }
    if (!form.weight) {
      newErrors.weight = 'Weight is required';
    } else if (Number.isNaN(Number(form.weight)) || Number(form.weight) < 30 || Number(form.weight) > 300) {
      newErrors.weight = 'Weight must be between 30 and 300 kg';
    }

    if (!form.fitnessGoal) newErrors.fitnessGoal = 'Please select a fitness goal';
    if (!form.activityLevel) newErrors.activityLevel = 'Please select an activity level';
    if (!form.workoutsPerWeek) {
      newErrors.workoutsPerWeek = 'Workouts per week is required';
    } else if (!Number.isInteger(Number(form.workoutsPerWeek)) || Number(form.workoutsPerWeek) < 1 || Number(form.workoutsPerWeek) > 7) {
      newErrors.workoutsPerWeek = 'Must be a whole number between 1 and 7';
    }
    if (!form.mealsPerDay) {
      newErrors.mealsPerDay = 'Meals per day is required';
    } else if (!Number.isInteger(Number(form.mealsPerDay)) || Number(form.mealsPerDay) < 1 || Number(form.mealsPerDay) > 8) {
      newErrors.mealsPerDay = 'Must be a whole number between 1 and 8';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Guard against re-entry if somehow triggered while generating
    if (generatingStatus !== 'idle') return;

    setApiError('');

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      const firstField = Object.keys(validationErrors)[0];
      const el = document.getElementById(firstField);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    setErrors({});

    setGeneratingStatus('generating');
    try {
      const user = await register({
        firstName:       form.firstName.trim(),
        lastName:        form.lastName.trim(),
        email:           form.email.trim(),
        password:        form.password,
        age:             Number(form.age),
        gender:          form.gender,
        height:          Number(form.height),
        weight:          Number(form.weight),
        fitnessGoal:     form.fitnessGoal,
        activityLevel:   form.activityLevel,
        workoutsPerWeek: Number(form.workoutsPerWeek),
        mealsPerDay:     Number(form.mealsPerDay),
      });
      localStorage.setItem('user', JSON.stringify(user));
      // Hand off to overlay — it will call handlePlanReady after the success animation
      setGeneratingStatus('done');
    } catch (err) {
      setGeneratingStatus('idle');
      setApiError(err.message || 'Registration failed. Please try again.');
    }
  };

  // Called by PlanGeneratingOverlay after its success animation completes
  const handlePlanReady = useCallback(() => {
    navigate('/dashboard');
  }, [navigate]);

  const isGenerating = generatingStatus !== 'idle';

  return (
    <>
      {/* Page — blurred and non-interactive while overlay is active */}
      <div
        className={`register-page${isGenerating ? ' register-page--generating' : ''}`}
        aria-hidden={isGenerating ? 'true' : undefined}
      >
        <div className="register-card">

          <div className="register-header">
            <span className="register-logo">🏋️</span>
            <h1>Adaptive Bio-Coach</h1>
            <p>Create your account and receive a personalized fitness and nutrition plan.</p>
          </div>

          <form className="register-form" onSubmit={handleSubmit} noValidate>
            <h2>Create Your Account</h2>

            {/* ── Section 1: Account Information ── */}
            <div className="form-section">
              <h3 className="section-title">Account Information</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="firstName">First Name</label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    value={form.firstName}
                    onChange={handleChange}
                    placeholder="Jane"
                    className={errors.firstName ? 'input-error' : ''}
                  />
                  {errors.firstName && <span className="error-msg">{errors.firstName}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="lastName">Last Name</label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    value={form.lastName}
                    onChange={handleChange}
                    placeholder="Doe"
                    className={errors.lastName ? 'input-error' : ''}
                  />
                  {errors.lastName && <span className="error-msg">{errors.lastName}</span>}
                </div>

                <div className="form-group form-group--full">
                  <label htmlFor="email">Email</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="jane@example.com"
                    className={errors.email ? 'input-error' : ''}
                    autoComplete="email"
                  />
                  {errors.email && <span className="error-msg">{errors.email}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="password">Password</label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="At least 6 characters"
                    className={errors.password ? 'input-error' : ''}
                    autoComplete="new-password"
                  />
                  {errors.password && <span className="error-msg">{errors.password}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm Password</label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    placeholder="Repeat your password"
                    className={errors.confirmPassword ? 'input-error' : ''}
                    autoComplete="new-password"
                  />
                  {errors.confirmPassword && <span className="error-msg">{errors.confirmPassword}</span>}
                </div>
              </div>
            </div>

            {/* ── Section 2: Personal Information ── */}
            <div className="form-section">
              <h3 className="section-title">Personal Information</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="age">Age</label>
                  <input
                    id="age"
                    name="age"
                    type="number"
                    value={form.age}
                    onChange={handleChange}
                    placeholder="e.g. 25"
                    min="13"
                    max="120"
                    className={errors.age ? 'input-error' : ''}
                  />
                  {errors.age && <span className="error-msg">{errors.age}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="gender">Gender</label>
                  <select
                    id="gender"
                    name="gender"
                    value={form.gender}
                    onChange={handleChange}
                    className={errors.gender ? 'input-error' : ''}
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                  {errors.gender && <span className="error-msg">{errors.gender}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="height">Height (cm)</label>
                  <input
                    id="height"
                    name="height"
                    type="number"
                    value={form.height}
                    onChange={handleChange}
                    placeholder="e.g. 170"
                    min="100"
                    max="250"
                    className={errors.height ? 'input-error' : ''}
                  />
                  {errors.height && <span className="error-msg">{errors.height}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="weight">Weight (kg)</label>
                  <input
                    id="weight"
                    name="weight"
                    type="number"
                    value={form.weight}
                    onChange={handleChange}
                    placeholder="e.g. 70"
                    min="30"
                    max="300"
                    className={errors.weight ? 'input-error' : ''}
                  />
                  {errors.weight && <span className="error-msg">{errors.weight}</span>}
                </div>
              </div>
            </div>

            {/* ── Section 3: Fitness Goals & Preferences ── */}
            <div className="form-section">
              <h3 className="section-title">Fitness Goals &amp; Preferences</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="fitnessGoal">Fitness Goal</label>
                  <select
                    id="fitnessGoal"
                    name="fitnessGoal"
                    value={form.fitnessGoal}
                    onChange={handleChange}
                    className={errors.fitnessGoal ? 'input-error' : ''}
                  >
                    <option value="">Select your goal</option>
                    <option value="weight_loss">Weight Loss</option>
                    <option value="muscle_gain">Muscle Gain</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                  {errors.fitnessGoal && <span className="error-msg">{errors.fitnessGoal}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="activityLevel">Activity Level</label>
                  <select
                    id="activityLevel"
                    name="activityLevel"
                    value={form.activityLevel}
                    onChange={handleChange}
                    className={errors.activityLevel ? 'input-error' : ''}
                  >
                    <option value="">Select activity level</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                  {errors.activityLevel && <span className="error-msg">{errors.activityLevel}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="workoutsPerWeek">Workouts Per Week</label>
                  <input
                    id="workoutsPerWeek"
                    name="workoutsPerWeek"
                    type="number"
                    value={form.workoutsPerWeek}
                    onChange={handleChange}
                    placeholder="1 – 7"
                    min="1"
                    max="7"
                    className={errors.workoutsPerWeek ? 'input-error' : ''}
                  />
                  {errors.workoutsPerWeek && <span className="error-msg">{errors.workoutsPerWeek}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="mealsPerDay">Meals Per Day</label>
                  <input
                    id="mealsPerDay"
                    name="mealsPerDay"
                    type="number"
                    value={form.mealsPerDay}
                    onChange={handleChange}
                    placeholder="1 – 8"
                    min="1"
                    max="8"
                    className={errors.mealsPerDay ? 'input-error' : ''}
                  />
                  {errors.mealsPerDay && <span className="error-msg">{errors.mealsPerDay}</span>}
                </div>
              </div>
            </div>

            {apiError && (
              <div className="api-error" role="alert">
                {apiError}
              </div>
            )}

            <button
              type="submit"
              className="register-btn"
              disabled={isGenerating}
            >
              Generate My Plan
            </button>

            <div className="register-nav-link">
              Already have an account? <Link to="/">Log in</Link>
            </div>
          </form>

        </div>
      </div>

      {/* Overlay — sibling of page div so aria-hidden on page does not affect it */}
      <PlanGeneratingOverlay
        visible={isGenerating}
        status={generatingStatus}
        firstName={form.firstName.trim()}
        onNavigate={handlePlanReady}
      />
    </>
  );
}

export default RegisterPage;
