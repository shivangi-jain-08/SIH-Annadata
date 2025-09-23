import { icons } from 'lucide-react-native';

const Icon = ({ name, color, size }) => {
  const LucideIcon = icons[name];

  if (!LucideIcon) {
    console.warn(`Icon "${name}" not found in lucide-react-native`);  // Debug log
    return null;  // Or render a placeholder like <Text>?</Text>
  }

  return <LucideIcon color={color} size={size} />;
};

export default Icon;