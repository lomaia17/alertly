// /app/edit-alert/[id]/page.tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { fetchAlertById, updateAlert } from '../../lib/api';

const EditAlert = () => {
  const [alert, setAlert] = useState<any | null>(null);
  const [error, setError] = useState('');
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    const loadAlert = async () => {
      if (id) {
        const alertData = await fetchAlertById(id as string);
        setAlert(alertData);
      }
    };

    loadAlert();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updateAlert(id as string, alert);
      router.push('/dashboard');
    } catch (error) {
      setError('Failed to update job alert');
    }
  };

  if (!alert) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto p-8">
        <h1 className="text-4xl font-semibold text-gray-800 mb-6">Edit Job Alert</h1>

        {error && <div className="text-red-500 mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-lg">
          {/* Form Fields */}
          {/* Use similar fields as Create Alert, but pre-fill with existing data */}
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Keywords</label>
            <input
              type="text"
              value={alert.keywords}
              onChange={(e) => setAlert({ ...alert, keywords: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:text-white"
              required
            />
          </div>
          {/* Add other form fields similarly */}
          
          <button
            type="submit"
            className="w-full py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Update Alert
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditAlert;
