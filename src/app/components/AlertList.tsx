
// /components/AlertList.tsx
import Link from 'next/link';

interface Alert {
  id: number;
  jobTitle: string;
  keywords: string;
}

const AlertList = ({ alerts }: { alerts: Alert[] }) => {
  return (
    <div className="space-y-4">
      {alerts.map((alert) => (
        <div key={alert.id} className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold text-gray-800">{alert.jobTitle}</h2>
          <p className="text-gray-600">Keywords: {alert.keywords}</p>
          <div className="flex space-x-4 mt-4">
            <Link href={`/edit-alert/${alert.id}`}>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg">Edit</button>
            </Link>
            <button className="bg-red-600 text-white px-4 py-2 rounded-lg">Delete</button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AlertList;