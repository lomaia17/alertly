'use client';
import { useEffect, useState } from 'react';
import { getAlerts, createAlert, deleteAlert, updateAlert } from '../lib/api';
import { Pencil, Trash2, Plus, X } from 'lucide-react';
import { MdWork, MdEmail, MdLocationOn, MdAccessTime } from 'react-icons/md';
import ProtectedRoute from '../components/ProtectedRoute';
import { useAuth } from '../context/AuthContext'; // Assuming this is where you handle authentication context

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
  const { user } = useAuth();  // Getting user from context
  const [alerts, setAlerts] = useState<Alert[]>([]); // alerts is now typed as an array of Alert objects
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
    if (user?.email) {  // Make sure the user is authenticated and has an email
      loadAlerts(user.email);  // Pass email to getAlerts
    }
  }, [user]);  // Re-run when user changes

  const loadAlerts = async (email: string) => {
    try {
      const data = await getAlerts(email);  // Pass email here
      setAlerts(data);
    } catch (error) {
      console.error("Error fetching alerts:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingId) {
      await updateAlert(editingId, form);
      setEditingId(null);
    } else {
      await createAlert(form);
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
    loadAlerts(user?.email || '');  // Pass email to reload alerts after submission
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
    loadAlerts(user?.email || '');  // Pass email to reload alerts after delete
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-100 py-10 px-4 md:px-20">
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
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
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md cursor-pointer"
            >
              {showForm ? <X size={18} /> : <Plus size={18} />}
              {showForm ? 'Cancel' : 'New Job Alert'}
            </button>
          </div>
        </div>

        {showForm && (
          <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md mb-8">
            <h3 className="text-xl font-semibold mb-4">
              {editingId ? 'Edit Job Alert' : 'Create New Job Alert'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium">Job Title</label>
                <input
                  type="text"
                  value={form.jobTitle}
                  onChange={(e) => setForm({ ...form, jobTitle: e.target.value })}
                  className="mt-1 w-full px-4 py-2 border rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Keywords (Optional)</label>
                <input
                  type="text"
                  value={form.keywords}
                  onChange={(e) => setForm({ ...form, keywords: e.target.value })}
                  className="mt-1 w-full px-4 py-2 border rounded-md"
                />
              </div>
              {/* <div>
                <label className="block text-sm font-medium">Category (Optional)</label>
                <input
                  type="text"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="mt-1 w-full px-4 py-2 border rounded-md"
                />
              </div> */}
              <div>
                <label className="block text-sm font-medium">City</label>
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="mt-1 w-full px-4 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Frequency</label>
                <select
                    value={form.frequency}
                    onChange={(e) => setForm({ ...form, frequency: e.target.value as Frequency })}
                    className="mt-1 w-full px-4 py-2 border rounded-md"
                  >
                  <option value="Daily">Daily</option>
                  <option value="Weekly">Weekly</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="mt-1 w-full px-4 py-2 border rounded-md"
                  required
                />
              </div>

              <div className="flex gap-4 items-center">
                <button
                  type="submit"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                >
                  {editingId ? 'Update Alert' : 'Create Alert'}
                </button>
                {editingId && (
                  <button
                    type="button"
                    className="text-gray-500 underline text-sm"
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
          <h3 className="text-xl font-semibold mb-4">Your Alerts</h3>
          {alerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center text-gray-500 py-10">
              <svg
                className="w-12 h-12 mb-4 text-gray-400"
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
              <p className="text-lg font-medium">No alerts found</p>
              <p className="text-sm mt-1">Create a new job alert to get started.</p>
            </div>
          ) : (
            alerts.map((alert) => (
              <div
                key={alert.id}
                className="border-b py-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <MdWork size={18} className="text-gray-600" />
                    <span className="font-semibold text-lg">{alert.jobTitle}</span>
                  </div>
                  <div className="flex gap-4">
                    <button onClick={() => handleEdit(alert)} title="Edit">
                      <Pencil size={20} className="text-gray-500 hover:text-indigo-600" />
                    </button>
                    <button onClick={() => handleDelete(alert.id)} title="Delete">
                      <Trash2 size={20} className="text-gray-500 hover:text-red-600" />
                    </button>
                  </div>
                </div>
                <div className="flex gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <MdLocationOn size={18} />
                    <span>{alert.city ? alert.city : "Remote"}</span>
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
