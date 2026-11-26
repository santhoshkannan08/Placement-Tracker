import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';

export default function SettingsPage() {
  const { user, updateProfile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { addToast } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [emailRemindersEnabled, setEmailRemindersEnabled] = useState(
    Boolean(user?.emailRemindersEnabled)
  );
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { name, emailRemindersEnabled };
      if (newPassword) {
        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword;
      }
      await updateProfile(payload);
      addToast('Profile & settings updated.', 'success');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update profile.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100';

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Profile &amp; Settings
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Manage your account details, password, appearance, and email reminder preferences
        </p>
      </div>

      <form
        onSubmit={handleSaveProfile}
        className="space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
      >
        <div>
          <label htmlFor="profileName" className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
            Full Name
          </label>
          <input
            id="profileName"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="profileEmail" className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
            Email Address
          </label>
          <input
            id="profileEmail"
            type="email"
            disabled
            value={user?.email || ''}
            className={`${inputClass} opacity-60 cursor-not-allowed`}
          />
        </div>

        <div className="flex items-center justify-between rounded-lg border border-slate-200 p-3.5 dark:border-slate-800">
          <div>
            <p className="text-sm font-medium text-slate-900 dark:text-white">
              Email Reminders
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Receive 24-hour deadline and interview reminder emails
            </p>
          </div>
          <input
            type="checkbox"
            aria-label="Enable email reminders"
            checked={emailRemindersEnabled}
            onChange={(e) => setEmailRemindersEnabled(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          />
        </div>

        <div className="border-t border-slate-200 pt-4 dark:border-slate-800">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
            Change Password (Optional)
          </h2>
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="currentPassword" className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                Current Password
              </label>
              <input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="newPassword" className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                New Password
              </label>
              <input
                id="newPassword"
                type="password"
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-slate-200 pt-4 dark:border-slate-800">
          <button
            type="button"
            onClick={toggleTheme}
            className="rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Theme: {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
          </button>

          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
