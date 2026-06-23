import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useAppDispatch } from '../app/hooks';
import { fetchAvailableUsers } from '../features/currentUser/currentUserSlice';
import { fetchResourceTypes } from '../features/resourceTypes/resourceTypesSlice';

/**
 * App shell: sidebar + topbar + routed page content. Loads the data needed
 * app-wide (user switcher list + resource types) once on mount.
 */
const Layout = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    void dispatch(fetchAvailableUsers());
    void dispatch(fetchResourceTypes());
  }, [dispatch]);

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
