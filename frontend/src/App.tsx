import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { LandingPage } from "./components/LandingPage";
import { Navigation } from "./components/Navigation";
import { FarmerDashboard } from "./components/FarmerDashboard";
import { VendorDashboard} from "./components/VendorDashboard";
import { ConsumerDashboard } from "./components/ConsumerDashboard";
import { Toaster } from "./components/Toaster";

type UserRole = 'farmer' | 'vendor' | 'consumer' | null;

export default function App() {
  const [currentRole, setCurrentRole] = useState<UserRole>(null);
  const [currentView, setCurrentView] = useState('dashboard');

  const handleRoleSelect = (role: 'farmer' | 'vendor' | 'consumer') => {
    setCurrentRole(role);
    setCurrentView(role === 'consumer' ? 'marketplace' : 'dashboard');
  };

  const handleRoleChange = () => {
    setCurrentRole(null);
    setCurrentView('dashboard');
  };

  const handleViewChange = (view: string) => {
    setCurrentView(view);
  };

  const renderDashboard = () => {
    switch (currentRole) {
      case 'farmer':
        return <FarmerDashboard currentView={currentView} onViewChange={handleViewChange} />;
      case 'vendor':
        return <VendorDashboard currentView={currentView} onViewChange={handleViewChange} />;
      case 'consumer':
        return <ConsumerDashboard currentView={currentView} onViewChange={handleViewChange} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AnimatePresence mode="wait">
        {!currentRole ? (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <LandingPage onRoleSelect={handleRoleSelect} />
          </motion.div>
        ) : (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen"
          >
            <Navigation 
              currentRole={currentRole}
              currentView={currentView}
              onViewChange={handleViewChange}
              onRoleChange={handleRoleChange}
            />
            <main className="max-w-7xl mx-auto px-6 py-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentView}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {renderDashboard()}
                </motion.div>
              </AnimatePresence>
            </main>
          </motion.div>
        )}
      </AnimatePresence>
      <Toaster />
    </div>
  );
}