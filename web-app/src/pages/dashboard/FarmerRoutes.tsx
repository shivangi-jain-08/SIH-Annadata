import { Routes, Route, Navigate } from 'react-router-dom';
import { FarmerDashboard } from './FarmerDashboard';
import { CropAdvisory } from './CropAdvisory';
import { DiseaseDetection } from './DiseaseDetection';
import { Products } from './Products';
import { Orders } from './Orders';

const NewProduct = () => (
  <div className="space-y-6">
    <h1 className="text-2xl font-bold">Add New Product</h1>
    <p className="text-muted-foreground">List a new product for sale in the marketplace.</p>
  </div>
);

const Analytics = () => (
  <div className="space-y-6">
    <h1 className="text-2xl font-bold">Analytics</h1>
    <p className="text-muted-foreground">View your farm performance and sales analytics.</p>
  </div>
);

const Settings = () => (
  <div className="space-y-6">
    <h1 className="text-2xl font-bold">Settings</h1>
    <p className="text-muted-foreground">Manage your account and farm settings.</p>
  </div>
);

export function FarmerRoutes() {
  return (
    <Routes>
      <Route index element={<FarmerDashboard />} />
      <Route path="crop-advisory" element={<CropAdvisory />} />
      <Route path="disease-detection" element={<DiseaseDetection />} />
      <Route path="products" element={<Products />} />
      <Route path="products/new" element={<NewProduct />} />
      <Route path="orders" element={<Orders />} />
      <Route path="analytics" element={<Analytics />} />
      <Route path="settings" element={<Settings />} />
      <Route path="*" element={<Navigate to="/dashboard/farmer" replace />} />
    </Routes>
  );
}