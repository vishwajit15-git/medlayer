import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import Login from './pages/Login';
import Register from './pages/Register';
import DashboardLayout from './components/DashboardLayout';
import ClinicSettings from './pages/ClinicSettings';
import DoctorList from './pages/DoctorList';
import PatientList from './pages/PatientList';
import Appointments from './pages/Appointments';
import DoctorSchedule from './pages/DoctorSchedule';
import AuditLogs from './pages/AuditLogs';
import StaffManagement from './pages/StaffManagement';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();
  
  if (loading) return <div className="flex-center" style={{ height: '100vh' }}>Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Appointments />} />
          <Route path="schedule" element={<DoctorSchedule />} />
          <Route path="settings" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <ClinicSettings />
            </ProtectedRoute>
          } />
          <Route path="doctors" element={
            <ProtectedRoute allowedRoles={['admin', 'receptionist']}>
              <DoctorList />
            </ProtectedRoute>
          } />
          <Route path="patients" element={<PatientList />} />
          <Route path="audit-logs" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AuditLogs />
            </ProtectedRoute>
          } />
          <Route path="staff" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <StaffManagement />
            </ProtectedRoute>
          } />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
