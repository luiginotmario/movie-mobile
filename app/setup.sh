#!/bin/bash

echo "Setting up MovieFriend Expo App..."

# Copy assets from frontend
echo "Copying assets..."
cp ../frontend/MovieLibrary/Assets.xcassets/Container.png ./assets/ 2>/dev/null || echo "Container.png not found"
cp ../frontend/MovieLibrary/Assets.xcassets/Logo.png ./assets/ 2>/dev/null || echo "Logo.png not found"

# Install dependencies
echo "Installing npm dependencies..."
npm install

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file from example..."
    cat > .env << EOL
# TMDB API Configuration
EXPO_PUBLIC_TMDB_API_KEY=

# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
EOL
    echo ".env file created. Please add your API keys."
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Add your API keys to the .env file"
echo "2. Run 'npm start' to start the development server"
echo "3. Run 'npm run ios' to open in iOS simulator"
