import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Dashboard from '../farmer/Dashboard';
import Crops from '../farmer/Crops';
import Orders from '../farmer/Orders';
import Profile from '../farmer/Profile';
import { useRoute } from '@react-navigation/native';
import VDashboard from '../vendor/VDashboard';
import VBuyCrops from '../vendor/VBuyCrops';
import VSellCrops from '../vendor/VSellCrops';
import VOrders from '../vendor/VOrders';
import VProfile from '../vendor/VProfile';
import CDashboard from '../consumer/CDashboard';
import CBuy from '../consumer/CBuy';
import COrders from '../consumer/COrders';
import CProfile from '../consumer/CProfile';
import ScreenWrapper from '../components/ScreenWrapper';
import Icon from '../Icon';

const Tab = createBottomTabNavigator();

// Wrapped components with FloatingChatBot
const WrappedDashboard = () => <ScreenWrapper><Dashboard /></ScreenWrapper>;
const WrappedCrops = () => <ScreenWrapper><Crops /></ScreenWrapper>;
const WrappedOrders = () => <ScreenWrapper><Orders /></ScreenWrapper>;
const WrappedProfile = () => <ScreenWrapper><Profile /></ScreenWrapper>;

const WrappedVDashboard = () => <ScreenWrapper><VDashboard /></ScreenWrapper>;
const WrappedVBuyCrops = () => <ScreenWrapper><VBuyCrops /></ScreenWrapper>;
const WrappedVSellCrops = () => <ScreenWrapper><VSellCrops /></ScreenWrapper>;
const WrappedVOrders = () => <ScreenWrapper><VOrders /></ScreenWrapper>;
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
    <Tab.Navigator 
      screenOptions={{ 
        headerShown: false,
        tabBarActiveTintColor: '#4CAF50',
        tabBarInactiveTintColor: '#666',
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopWidth: 1,
          borderTopColor: '#E0E0E0',
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
      }}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={WrappedDashboard}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="LayoutDashboard" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="Crops" 
        component={WrappedCrops}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="Wheat" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="Orders" 
        component={WrappedOrders}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="ShoppingBag" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={WrappedProfile}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="User" color={color} size={size} />
          ),
        }}
      />
      </Tab.Navigator>
  );
}
else if (role === 'Vendor') {
  return (
    <Tab.Navigator 
      screenOptions={{ 
        headerShown: false,
        tabBarActiveTintColor: '#FF9800',
        tabBarInactiveTintColor: '#666',
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopWidth: 1,
          borderTopColor: '#E0E0E0',
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
      }}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={WrappedVDashboard}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="LayoutDashboard" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="Buy Crops" 
        component={WrappedVBuyCrops}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="ShoppingCart" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="My Orders" 
        component={WrappedVOrders}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="Package" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="Sell Crops" 
        component={WrappedVSellCrops}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="Store" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={WrappedVProfile}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="User" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
 } else {
  return (
    <Tab.Navigator 
      screenOptions={{ 
        headerShown: false,
        tabBarActiveTintColor: '#2196F3',
        tabBarInactiveTintColor: '#666',
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopWidth: 1,
          borderTopColor: '#E0E0E0',
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
      }}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={WrappedCDashboard}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="LayoutDashboard" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="Buy" 
        component={WrappedCBuy}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="ShoppingCart" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="Orders" 
        component={WrappedCOrders}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="Package" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={WrappedCProfile}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="User" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}}
export default BottomTabNavigation;