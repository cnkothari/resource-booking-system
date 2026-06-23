import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchDashboardSummary } from '../features/dashboard/dashboardSlice';
import PageHeader from '../components/PageHeader';
import Spinner from '../components/Spinner';
import ErrorMessage from '../components/ErrorMessage';

interface StatCardProps {
  label: string;
  value: number;
  accent: string;
  to: string;
  icon: string;
}

const StatCard = ({ label, value, accent, to, icon }: StatCardProps) => (
  <Link to={to} className="card transition hover:shadow-md">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <p className="mt-2 text-3xl font-semibold text-slate-800">{value}</p>
      </div>
      <span className={`flex h-12 w-12 items-center justify-center rounded-lg text-2xl ${accent}`}>
        {icon}
      </span>
    </div>
  </Link>
);

const DashboardPage = () => {
  const dispatch = useAppDispatch();
  const { summary, status, error } = useAppSelector((state) => state.dashboard);

  useEffect(() => {
    void dispatch(fetchDashboardSummary());
  }, [dispatch]);

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Overview of company resources and bookings"
        actions={
          <Link to="/bookings/new" className="btn-primary">
            + New booking
          </Link>
        }
      />

      {status === 'loading' && <Spinner label="Loading dashboard…" />}
      {status === 'failed' && (
        <ErrorMessage
          message={error ?? 'Failed to load dashboard'}
          onRetry={() => dispatch(fetchDashboardSummary())}
        />
      )}

      {summary && status !== 'loading' && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Total Resources"
              value={summary.totalResources}
              accent="bg-brand-50 text-brand-600"
              to="/resources"
              icon="🏢"
            />
            <StatCard
              label="Active / Upcoming Bookings"
              value={summary.activeUpcomingBookings}
              accent="bg-emerald-50 text-emerald-600"
              to="/bookings?tag=upcoming"
              icon="📅"
            />
            <StatCard
              label="Cancelled Bookings"
              value={summary.cancelledBookings}
              accent="bg-red-50 text-red-600"
              to="/bookings?tag=cancelled"
              icon="🚫"
            />
            <StatCard
              label="Total Users"
              value={summary.totalUsers}
              accent="bg-amber-50 text-amber-600"
              to="/users"
              icon="👥"
            />
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="card">
              <p className="text-sm font-medium text-slate-500">Past Bookings</p>
              <p className="mt-2 text-2xl font-semibold text-slate-800">{summary.pastBookings}</p>
            </div>
            <div className="card">
              <p className="text-sm font-medium text-slate-500">Total Bookings</p>
              <p className="mt-2 text-2xl font-semibold text-slate-800">{summary.totalBookings}</p>
            </div>
            <div className="card flex flex-col justify-between">
              <p className="text-sm font-medium text-slate-500">Quick actions</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Link to="/resources" className="btn-secondary px-3 py-1.5">
                  View resources
                </Link>
                <Link to="/bookings" className="btn-secondary px-3 py-1.5">
                  View bookings
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardPage;
