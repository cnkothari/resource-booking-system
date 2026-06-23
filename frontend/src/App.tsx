import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import DashboardPage from './pages/DashboardPage';
import ResourceListPage from './pages/ResourceListPage';
import ResourceDetailPage from './pages/ResourceDetailPage';
import ResourceFormPage from './pages/ResourceFormPage';
import BookingListPage from './pages/BookingListPage';
import BookingViewPage from './pages/BookingViewPage';
import BookingFormPage from './pages/BookingFormPage';
import UserListPage from './pages/UserListPage';
import NotFoundPage from './pages/NotFoundPage';

const App = () => (
  <Routes>
    <Route element={<Layout />}>
      <Route index element={<DashboardPage />} />

      <Route path="resources" element={<ResourceListPage />} />
      <Route path="resources/new" element={<ResourceFormPage />} />
      <Route path="resources/:id" element={<ResourceDetailPage />} />
      <Route path="resources/:id/edit" element={<ResourceFormPage />} />

      <Route path="bookings" element={<BookingListPage />} />
      <Route path="bookings/new" element={<BookingFormPage />} />
      <Route path="bookings/:id" element={<BookingViewPage />} />
      <Route path="bookings/:id/edit" element={<BookingFormPage />} />

      <Route path="users" element={<UserListPage />} />

      <Route path="*" element={<NotFoundPage />} />
    </Route>
  </Routes>
);

export default App;
