'use client';
import { useEffect, useState } from 'react';
import { getAlerts, createAlert, deleteAlert, updateAlert } from '../lib/api';
import { Pencil, Trash2, Plus, X } from 'lucide-react';
import { MdWork, MdEmail, MdLocationOn, MdAccessTime } from 'react-icons/md';
import ProtectedRoute from '../components/ProtectedRoute';
import { useAuth } from '../context/AuthContext';
import JobScraping from '../components/JobScraping';

type Frequency = 'Daily' | 'Weekly';
interface Alert {
  id: string;
  jobTitle: string;
  keywords: string;
  category: string;
  frequency: string;
  email: string;
  city: string;
}

interface FormState {
  keywords: string;
  jobTitle: string;
  category: string;
  frequency: Frequency;
  email: string;
  city: string;
}

const Dashboard = () => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [form, setForm] = useState<FormState>({
    keywords: '',
    jobTitle: '',
    category: '',
    frequency: 'Daily',
    email: '',
    city: '',
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    document.title = 'Job Preferences Dashboard';
    if (user?.email) {
      loadAlerts(user.email);
    }
  }, [user]);

  const loadAlerts = async (email: string) => {
    try {
      const data = await getAlerts(email);
      setAlerts(data);
    } catch (error) {
      console.error("Error fetching alerts:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    try {
      if (editingId) {
        await updateAlert(editingId, form);
        setEditingId(null);
      } else {
        const response = await createAlert(form);
        console.log('Alert created:', response);  // Log the response to ensure success
      }
  
      setForm({
        keywords: '',
        jobTitle: '',
        category: '',
        frequency: 'Daily',
        email: '',
        city: '',
      });
  
      setShowForm(false);
      loadAlerts(user?.email || '');
    } catch (error) {
      console.error('Error creating alert:', error);
    }
  };
  const handleEdit = (alert: Alert) => {
    const { id, frequency, ...rest } = alert;
    setForm({
      ...rest,
      frequency: frequency as Frequency,
    });
    setEditingId(id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    await deleteAlert(id);
    loadAlerts(user?.email || '');
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-100 py-6 px-4 sm:px-6 md:px-8 lg:px-20">
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex justify-between items-center mb-4 flex-wrap">
            <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800 w-full sm:w-auto">Job Preferences Dashboard</h2>
            <div className="flex gap-4 items-center mt-4 sm:mt-0">
              <JobScraping />
              <button
                onClick={() => {
                  setShowForm(!showForm);
                  setForm({
                    keywords: '',
                    jobTitle: '',
                    category: '',
                    frequency: 'Daily',
                    email: '',
                    city: '',
                  });
                  setEditingId(null);
                }}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-md transition-all ease-in-out cursor-pointer"
              >
                {showForm ? <X size={18} /> : <Plus size={18} />}
                {showForm ? 'Cancel' : 'New Job Preference'}
              </button>
            </div>
          </div>
        </div>

        {showForm && (
          <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-lg mb-8">
            <h3 className="text-2xl font-semibold mb-6 text-indigo-600">
              {editingId ? 'Edit Job Preference' : 'Create New Job Preference'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Job Title</label>
                <input
                  type="text"
                  value={form.jobTitle}
                  onChange={(e) => setForm({ ...form, jobTitle: e.target.value })}
                  className="mt-2 w-full px-4 py-3 border rounded-md border-gray-300 focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Keywords (Optional)</label>
                <input
                  type="text"
                  value={form.keywords}
                  onChange={(e) => setForm({ ...form, keywords: e.target.value })}
                  className="mt-2 w-full px-4 py-3 border rounded-md border-gray-300 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">City</label>
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="mt-2 w-full px-4 py-3 border rounded-md border-gray-300 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Frequency</label>
                <select
                  value={form.frequency}
                  onChange={(e) => setForm({ ...form, frequency: e.target.value as Frequency })}
                  className="mt-2 w-full px-4 py-3 border rounded-md border-gray-300 focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Daily">Daily</option>
                  <option value="Weekly">Weekly</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="mt-2 w-full px-4 py-3 border rounded-md border-gray-300 focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="flex gap-4 items-center flex-wrap mt-6">
                <button
                  type="submit"
                  className="bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {editingId ? 'Update Alert' : 'Create Alert'}
                </button>
                {editingId && (
                  <button
                    type="button"
                    className="text-gray-500 underline text-sm hover:text-gray-700"
                    onClick={() => {
                      setEditingId(null);
                      setForm({
                        keywords: '',
                        jobTitle: '',
                        category: '',
                        frequency: 'Daily',
                        email: '',
                        city: '',
                      });
                      setShowForm(false);
                    }}
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

        <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-6">Your Preferences</h3>
          {alerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center text-gray-500 py-12">
              <svg
                className="w-16 h-16 mb-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.054 0 1.635-1.14 1.078-2L13.078 4c-.527-.88-1.629-.88-2.156 0L3.004 17c-.557.86.024 2 1.078 2z"
                />
              </svg>
              <p className="text-lg font-medium text-gray-700">No alerts found</p>
              <p className="text-sm text-gray-500 mt-2">Create a new job alert to get started.</p>
            </div>
          ) : (
            alerts.map((alert) => (
              <div
                key={alert.id}
                className="bg-white border border-gray-200 shadow-sm rounded-lg p-6 mb-4 overflow-y-scroll"
              >
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-3">
                    <MdWork size={20} className="text-gray-600" />
                    <span className="font-semibold text-lg text-gray-800">{alert.jobTitle}</span>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => handleEdit(alert)} title="Edit" className="text-indigo-600 hover:text-indigo-700 cursor-pointer">
                      <Pencil size={20} />
                    </button>
                    <button onClick={() => handleDelete(alert.id)} title="Delete" className="text-red-600 hover:text-red-700 cursor-pointer">
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
                <div className="flex gap-6 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <MdLocationOn size={18} />
                    <span>{alert.city || "Remote"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MdEmail size={18} />
                    <span>{alert.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MdAccessTime size={18} />
                    <span>{alert.frequency}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Dashboard;
