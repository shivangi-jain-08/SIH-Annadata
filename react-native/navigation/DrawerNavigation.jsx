import { createDrawerNavigator } from '@react-navigation/drawer';
import BottomTabNavigation from './BottomTabNavigation';

const Drawer = createDrawerNavigator();

function DrawerNavigation() {
  return (
    <Drawer.Navigator screenOptions={{ headerShown: false }}>
      <Drawer.Screen name="BottomTab" component={BottomTabNavigation} />
    </Drawer.Navigator>
  );
}

export default DrawerNavigation