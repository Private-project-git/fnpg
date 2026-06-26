#!/bin/bash
# setup-debian.sh
set -e

echo "=========================================================="
echo " Starting 8CTRL Cinematic Fan Experience Debian Host Setup"
echo "=========================================================="

# 1. Check/Install Docker & Compose Plugin
if ! [ -x "$(command -v docker)" ]; then
  echo "[Setup] Docker is not installed. Installing Docker engine..."
  sudo apt-get update
  sudo apt-get install -y apt-transport-https ca-certificates curl gnupg lsb-release
  sudo mkdir -p /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/debian/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
  sudo apt-get update
  sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
else
  echo "[Setup] Docker engine detected."
fi

# 2. Generate local environment file if it does not exist
if [ ! -f .env ]; then
  echo "[Setup] Generating production .env file..."
  JWT_KEY=$(openssl rand -base64 32 2>/dev/null || echo "productionfallbackjwtsecretkeysignhere")
  cat <<EOT > .env
DATABASE_URL="mysql://root:Oracle@123@db:3306/fanpage"
DB_ROOT_PASSWORD="Oracle@123"
DB_NAME="fanpage"
ADMIN_PASSWORD="admin"
JWT_SECRET="${JWT_KEY}"
NODE_ENV="production"
EOT
  echo "[Setup] .env generated."
fi

# 3. Pull, build, and spin up Docker containers
echo "[Setup] Building and starting services..."
sudo docker compose up -d --build

# 4. Wait for database container healthcheck to complete
echo "[Setup] Waiting for database initialization..."
until [ "$(sudo docker inspect -f '{{.State.Health.Status}}' fnpg-db)" == "healthy" ]; do
  printf '.'
  sleep 1
done
echo ""

# 5. Populate initial real data from iTunes artist lookup
echo "[Setup] Seeding the database..."
sudo docker compose exec web npx prisma db seed

echo "=========================================================="
echo " Setup Completed Successfully!"
echo " Web app is listening on: http://localhost:2020"
echo " CMS Admin dashboard:    http://localhost:2020/admin"
echo "=========================================================="
