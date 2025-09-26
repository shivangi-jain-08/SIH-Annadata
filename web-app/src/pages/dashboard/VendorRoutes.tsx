import { Routes, Route, Navigate } from 'react-router-dom';
import { VendorDashboard } from './VendorDashboard';
import { ProductManagement } from '@/components/vendor/ProductManagement';
import { LocationAvailabilityManager } from '@/components/vendor/LocationAvailabilityManager';
import { LiveLocationDashboard } from '@/components/vendor/LiveLocationDashboard';
import { BuyFromFarmers } from '@/pages/vendor/BuyFromFarmers';
import { ConsumerOrders } from '@/pages/vendor/ConsumerOrders';

export function VendorRoutes() {
  return (
    <Routes>
      <Route index element={<VendorDashboard />} />
      <Route path="products" element={<ProductManagement />} />
      <Route path="location" element={<LocationAvailabilityManager />} />
      <Route path="live-location" element={<LiveLocationDashboard />} />
      <Route path="buy" element={<BuyFromFarmers />} />
      <Route path="consumer-orders" element={<ConsumerOrders />} />
      <Route path="*" element={<Navigate to="/dashboard/vendor" replace />} />
    </Routes>
  );
}