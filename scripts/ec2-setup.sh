#!/bin/bash
# ==============================================================================
# CollabNet — Automated EC2 Setup & Docker Deployment Script
# Target OS: Ubuntu 22.04 / 24.04 LTS (AWS EC2)
# ==============================================================================

set -e

echo "====================================================="
echo "🚀 Starting CollabNet EC2 Automated Docker Deployment"
echo "====================================================="

# 1. Update system packages
echo "📦 Updating system packages..."
sudo apt-get update -y
sudo apt-get upgrade -y
sudo apt-get install -y ca-certificates curl gnupg lsb-release ufw git

# 2. Setup 2GB Swap space (Prevents OOM during Vite build on t2/t3 instances)
if [ ! -f /swapfile ]; then
    echo "💾 Creating 2GB swap space for smooth build execution..."
    sudo fallocate -l 2G /swapfile
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
    echo "✅ Swap configured."
else
    echo "ℹ️ Swapfile already exists, skipping."
fi

# 3. Install Docker Engine and Docker Compose Plugin
if ! command -v docker &> /dev/null; then
    echo "🐳 Installing Docker Engine..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm -f get-docker.sh
    echo "✅ Docker installed successfully."
else
    echo "ℹ️ Docker is already installed."
fi

# 4. Detect EC2 Public IP
PUBLIC_IP=$(curl -s http://checkip.amazonaws.com || curl -s https://api.ipify.org || echo "localhost")
echo "🌐 Detected EC2 Public IP: ${PUBLIC_IP}"

# 5. Create or configure .env for the server
if [ ! -f server/.env ]; then
    echo "⚙️ Creating server/.env from template..."
    cp server/.env.example server/.env
    
    # Generate random 32-character session secret
    RANDOM_SECRET=$(openssl rand -hex 16)
    sed -i "s|CHANGE_ME_USE_CRYPTO_RANDOM_32_CHARS|${RANDOM_SECRET}|g" server/.env
    sed -i "s|CLIENT_URL=.*|CLIENT_URL=http://${PUBLIC_IP}:8080,http://${PUBLIC_IP}:80|g" server/.env
    sed -i "s|SERVER_URL=.*|SERVER_URL=http://${PUBLIC_IP}:3000|g" server/.env
    echo "✅ server/.env configured with Public IP ${PUBLIC_IP}"
fi

# 6. Build and launch Docker Compose
echo "🚀 Building and starting CollabNet containers via Docker Compose..."
export VITE_BACKEND_URL="http://${PUBLIC_IP}:3000"
export VITE_SERVER_URL="http://${PUBLIC_IP}:3000"
export CLIENT_URL="http://${PUBLIC_IP}:8080,http://${PUBLIC_IP}:80"
export SERVER_URL="http://${PUBLIC_IP}:3000"

docker compose up --build -d

echo ""
echo "====================================================="
echo "🎉 CollabNet is deployed and running on AWS EC2!"
echo "====================================================="
echo "👉 Frontend App:       http://${PUBLIC_IP}:8080"
echo "👉 Backend API:        http://${PUBLIC_IP}:3000/healthz"
echo "👉 Socket.IO Endpoint: http://${PUBLIC_IP}:3000/socket.io/"
echo ""
echo "Verify status with:    docker compose ps"
echo "View live logs with:   docker compose logs -f"
echo "====================================================="
