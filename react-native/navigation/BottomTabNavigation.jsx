import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Dashboard from '../farmer/Dashboard';
import Crops from '../farmer/Crops';
import Orders from '../farmer/Orders';
import Profile from '../farmer/Profile';
import { useRoute } from '@react-navigation/native';
import VDashboard from '../vendor/VDashboard';
import VBuyCrops from '../vendor/VBuyCrops';
import VSellCrops from '../vendor/VSellCrops';
import VProfile from '../vendor/VProfile';
import CDashboard from '../consumer/CDashboard';
import CBuy from '../consumer/CBuy';
import COrders from '../consumer/COrders';
import CProfile from '../consumer/CProfile';
import ScreenWrapper from '../components/ScreenWrapper';

const Tab = createBottomTabNavigator();

// Wrapped components with FloatingChatBot
const WrappedDashboard = () => <ScreenWrapper><Dashboard /></ScreenWrapper>;
const WrappedCrops = () => <ScreenWrapper><Crops /></ScreenWrapper>;
const WrappedOrders = () => <ScreenWrapper><Orders /></ScreenWrapper>;
const WrappedProfile = () => <ScreenWrapper><Profile /></ScreenWrapper>;

const WrappedVDashboard = () => <ScreenWrapper><VDashboard /></ScreenWrapper>;
const WrappedVBuyCrops = () => <ScreenWrapper><VBuyCrops /></ScreenWrapper>;
const WrappedVSellCrops = () => <ScreenWrapper><VSellCrops /></ScreenWrapper>;
const WrappedVProfile = () => <ScreenWrapper><VProfile /></ScreenWrapper>;

const WrappedCDashboard = () => <ScreenWrapper><CDashboard /></ScreenWrapper>;
const WrappedCBuy = () => <ScreenWrapper><CBuy /></ScreenWrapper>;
const WrappedCOrders = () => <ScreenWrapper><COrders /></ScreenWrapper>;
const WrappedCProfile = () => <ScreenWrapper><CProfile /></ScreenWrapper>;

function BottomTabNavigation() {
  const route = useRoute();
  const role = route.params?.role;

  if (role === 'Farmer') {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Dashboard" component={WrappedDashboard} />
      <Tab.Screen name="Crops" component={WrappedCrops} />
      <Tab.Screen name="Orders" component={WrappedOrders} />
      <Tab.Screen name="Profile" component={WrappedProfile} />
      </Tab.Navigator>
  );
}
else if (role === 'Vendor') {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Dashboard" component={WrappedVDashboard} />
      <Tab.Screen name="Buy Crops" component={WrappedVBuyCrops} />
      <Tab.Screen name="Sell Crops" component={WrappedVSellCrops} />
      <Tab.Screen name="Profile" component={WrappedVProfile} />
    </Tab.Navigator>
  );
} else {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Dashboard" component={WrappedCDashboard} />
      <Tab.Screen name="Buy" component={WrappedCBuy} />
      <Tab.Screen name="Orders" component={WrappedCOrders} />
      <Tab.Screen name="Profile" component={WrappedCProfile} />
    </Tab.Navigator>
  );
}

}
export default BottomTabNavigation;