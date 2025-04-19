import Link from 'next/link';

const Navigation = () => {
    return (
      <nav className="bg-white shadow-md">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="text-2xl font-bold text-indigo-600">
            JobAlerts
          </Link>
          <div className="space-x-4">
            <Link href="/dashboard" className="text-gray-700 hover:text-indigo-600">Dashboard</Link>
            <Link href="/create-alert" className="text-gray-700 hover:text-indigo-600">Create Alert</Link>
          </div>
        </div>
      </nav>
    );
  };
  
  export default Navigation;