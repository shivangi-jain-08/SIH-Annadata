#!/bin/bash

echo "🧹 Clearing ALL caches for React Native..."

# Kill Metro bundler
echo "⚠️  Killing Metro bundler processes..."
pkill -f "react-native" || true
pkill -f "expo" || true
pkill -f "metro" || true

# Clear Metro cache
echo "📦 Clearing Metro bundler cache..."
rm -rf node_modules/.cache
rm -rf $TMPDIR/metro-* || true
rm -rf $TMPDIR/react-* || true
rm -rf $TMPDIR/haste-* || true

# Clear Expo cache
echo "🔄 Clearing Expo cache..."
rm -rf .expo

# Clear Watchman watches
echo "👁️  Clearing Watchman..."
watchman watch-del-all 2>/dev/null || true

# Clear iOS build (if exists)
echo "🍎 Clearing iOS build..."
rm -rf ios/build 2>/dev/null || true

# Clear Android build (if exists)  
echo "🤖 Clearing Android build..."
rm -rf android/app/build 2>/dev/null || true
rm -rf android/build 2>/dev/null || true

# Clear npm cache for this project
echo "📦 Clearing npm cache..."
npm cache clean --force 2>/dev/null || true

echo ""
echo "✅ All caches cleared!"
echo ""
echo "📝 Current .env file:"
cat .env | grep GEMINI
echo ""
echo "🚀 Now run: npm start -- --reset-cache"
echo "   Then press 'a' for Android or 'i' for iOS"
echo "   You may need to uninstall and reinstall the app on your device/simulator"
