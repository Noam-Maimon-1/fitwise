import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSettings, updateSettings } from '../services/settingsService';
import './SettingsPage.css';

function SettingsPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: '',
    lastName:  '',
    email:     '',
    theme:     'light',
  });

  const [formErrors, setFormErrors] = useState({});  // field-level errors
  const [loading,    setLoading]    = useState(true); // true while fetching current settings
  const [saving,     setSaving]     = useState(false);// true while the PUT is in-flight
  const [apiError,   setApiError]   = useState('');   // error from the server
  const [success,    setSuccess]    = useState('');   // success message after save

  // Load the current settings when the page first opens
  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const data = await getSettings();
        const savedTheme = localStorage.getItem('theme'); // check localStorage first
        const theme = savedTheme || data.theme || 'light';
        const stored = JSON.parse(localStorage.getItem('user') || '{}');
        setForm({
          firstName: stored.firstName || '',
          lastName:  stored.lastName  || '',
          email:     data.email || stored.email || '',
          theme,
        });
        document.body.classList.toggle('dark-mode', theme === 'dark');
      } catch (err) {
        setApiError('Could not load settings. Make sure the backend is running on port 3000.');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  // One handler for all fields — `name` on the input tells us which key to update
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setSuccess('');
    // Immediately preview dark/light mode when theme changes
    if (name === 'theme') {
      document.body.classList.toggle('dark-mode', value === 'dark');
    }
  };

  // Client-side validation for required fields
  const validate = () => {
    const errs = {};
    const NAME_REGEX = /^[a-zA-Zא-ת '\-]*[a-zA-Zא-ת][a-zA-Zא-ת '\-]*$/;
    if (!form.firstName.trim()) {
      errs.firstName = 'First name is required';
    } else if (!NAME_REGEX.test(form.firstName.trim())) {
      errs.firstName = 'Name may only contain letters, spaces, hyphens, and apostrophes';
    }
    if (!form.lastName.trim()) {
      errs.lastName = 'Last name is required';
    } else if (!NAME_REGEX.test(form.lastName.trim())) {
      errs.lastName = 'Name may only contain letters, spaces, hyphens, and apostrophes';
    }
    if (!form.theme) {
      errs.theme = 'Theme is required';
    }
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    setApiError('');

    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setFormErrors(errs);
      return;
    }
    setFormErrors({});

    setSaving(true);
    try {
      await updateSettings({ firstName: form.firstName.trim(), lastName: form.lastName.trim(), theme: form.theme });
      const stored = JSON.parse(localStorage.getItem('user') || '{}');
      stored.firstName = form.firstName.trim();
      stored.lastName  = form.lastName.trim();
      localStorage.setItem('user', JSON.stringify(stored));
      localStorage.setItem('theme', form.theme);
      window.dispatchEvent(new Event('user-profile-updated'));
      setSuccess('Settings saved successfully!');
    } catch (err) {
      setApiError(err.message || 'Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
  const initials = (
    `${(storedUser.firstName || '')[0] || ''}${(storedUser.lastName || '')[0] || ''}`.toUpperCase() || '?'
  );

  return (
    <div className="settings-page">
      <div className="settings-avatar">
        <div className="settings-avatar-circle">{initials}</div>
        <div>
          <div className="settings-avatar-name">{storedUser.firstName} {storedUser.lastName}</div>
          <div className="settings-avatar-role">{storedUser.userRole}</div>
        </div>
      </div>

      <div className="settings-header">
        <h1>Settings</h1>
        <p>Manage your profile and preferences</p>
      </div>

      {/* Loading state while GET /api/settings is in-flight */}
      {loading && <p className="loading">Loading settings…</p>}

      {!loading && (
        <>
        <form className="settings-form" onSubmit={handleSubmit} noValidate>

          {/* ── First Name ── */}
          <div className="form-group">
            <label htmlFor="firstName">First Name</label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              value={form.firstName}
              onChange={handleChange}
              placeholder="Your first name"
              className={formErrors.firstName ? 'input-error' : ''}
            />
            {formErrors.firstName && (
              <span className="error-msg">{formErrors.firstName}</span>
            )}
          </div>

          {/* ── Last Name ── */}
          <div className="form-group">
            <label htmlFor="lastName">Last Name</label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              value={form.lastName}
              onChange={handleChange}
              placeholder="Your last name"
              className={formErrors.lastName ? 'input-error' : ''}
            />
            {formErrors.lastName && (
              <span className="error-msg">{formErrors.lastName}</span>
            )}
          </div>

          {/* ── Display-only: Email ── */}
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              readOnly
              className="input-readonly"
            />
          </div>

          {/* ── Required field 3: Theme preference ── */}
          <div className="form-group">
            <label htmlFor="theme">Theme Preference</label>
            <select
              id="theme"
              name="theme"
              value={form.theme}
              onChange={handleChange}
              className={formErrors.theme ? 'input-error' : ''}
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
            {formErrors.theme && (
              <span className="error-msg">{formErrors.theme}</span>
            )}
          </div>

          {/* Server error */}
          {apiError && <div className="api-error">{apiError}</div>}

          {/* Success message */}
          {success && <div className="success-msg">{success}</div>}

          <button type="submit" className="save-btn" disabled={saving}>
            {saving ? 'Saving…' : 'Save Settings'}
          </button>
        </form>

        {/* ── Fitness Plan ── */}
        <div className="replan-section">
          <h2 className="replan-title">Fitness Plan</h2>
          <p className="replan-desc">
            Want to switch goals or adjust your training intensity? Generate a fresh
            workout and meal plan based on updated preferences.
          </p>
          <button
            className="replan-btn"
            onClick={() => navigate('/onboarding?mode=replan')}
          >
            Create New Plan
          </button>
        </div>
      </>
      )}
    </div>
  );
}

export default SettingsPage;
