import { Link } from 'react-router-dom';

const NotFoundPage = () => (
  <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
    <p className="text-6xl font-bold text-brand-600">404</p>
    <h1 className="text-xl font-semibold text-slate-800">Page not found</h1>
    <p className="max-w-md text-sm text-slate-500">
      The page you are looking for doesn’t exist or may have been moved.
    </p>
    <Link to="/" className="btn-primary">
      Back to dashboard
    </Link>
  </div>
);

export default NotFoundPage;
