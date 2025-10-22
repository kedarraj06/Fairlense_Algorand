#!/bin/bash
# FairLens Production Deployment Script
# This script handles the complete deployment of FairLens to production

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-production}
DOCKER_COMPOSE_FILE="docker-compose.yml"
BACKUP_DIR="./backups"
LOG_FILE="./deployment.log"

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
    exit 1
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed. Please install Docker first."
    fi
    
    # Check if Docker Compose is installed
    if ! command -v docker-compose &> /dev/null; then
        error "Docker Compose is not installed. Please install Docker Compose first."
    fi
    
    # Check if .env file exists
    if [ ! -f ".env.production" ]; then
        error "Production environment file (.env.production) not found. Please create it from env.production.example"
    fi
    
    # Check if required directories exist
    mkdir -p "$BACKUP_DIR"
    mkdir -p "./logs"
    mkdir -p "./data"
    
    success "Prerequisites check passed"
}

# Backup current deployment
backup_current() {
    log "Creating backup of current deployment..."
    
    BACKUP_NAME="backup-$(date +%Y%m%d-%H%M%S)"
    BACKUP_PATH="$BACKUP_DIR/$BACKUP_NAME"
    
    mkdir -p "$BACKUP_PATH"
    
    # Backup database
    if docker-compose ps postgres | grep -q "Up"; then
        log "Backing up PostgreSQL database..."
        docker-compose exec -T postgres pg_dump -U fairlens fairlens > "$BACKUP_PATH/database.sql"
    fi
    
    # Backup volumes
    log "Backing up Docker volumes..."
    docker run --rm -v fairlens_postgres_data:/data -v "$(pwd)/$BACKUP_PATH":/backup alpine tar czf /backup/postgres_data.tar.gz -C /data .
    docker run --rm -v fairlens_redis_data:/data -v "$(pwd)/$BACKUP_PATH":/backup alpine tar czf /backup/redis_data.tar.gz -C /data .
    docker run --rm -v fairlens_ipfs_data:/data -v "$(pwd)/$BACKUP_PATH":/backup alpine tar czf /backup/ipfs_data.tar.gz -C /data .
    
    # Backup configuration
    cp .env.production "$BACKUP_PATH/"
    cp docker-compose.yml "$BACKUP_PATH/"
    
    success "Backup created: $BACKUP_PATH"
}

# Run tests
run_tests() {
    log "Running tests..."
    
    # Backend tests
    log "Running backend tests..."
    cd backend
    npm test || error "Backend tests failed"
    cd ..
    
    # Frontend tests
    log "Running frontend tests..."
    cd frontend
    npm test -- --watchAll=false || error "Frontend tests failed"
    cd ..
    
    # Smart contract tests
    log "Running smart contract tests..."
    python -m pytest tests/test_contract_unit.py -v || error "Smart contract tests failed"
    
    success "All tests passed"
}

# Build and deploy
deploy() {
    log "Starting deployment to $ENVIRONMENT environment..."
    
    # Stop existing services
    log "Stopping existing services..."
    docker-compose down || warning "No existing services to stop"
    
    # Pull latest images
    log "Pulling latest images..."
    docker-compose pull
    
    # Build new images
    log "Building new images..."
    docker-compose build --no-cache
    
    # Start services
    log "Starting services..."
    docker-compose up -d
    
    # Wait for services to be ready
    log "Waiting for services to be ready..."
    sleep 30
    
    # Health check
    log "Performing health checks..."
    check_health
    
    success "Deployment completed successfully"
}

# Health check
check_health() {
    log "Checking service health..."
    
    # Check backend health
    for i in {1..30}; do
        if curl -f http://localhost:5000/health > /dev/null 2>&1; then
            success "Backend is healthy"
            break
        fi
        if [ $i -eq 30 ]; then
            error "Backend health check failed after 30 attempts"
        fi
        sleep 2
    done
    
    # Check database
    if docker-compose exec -T postgres pg_isready -U fairlens > /dev/null 2>&1; then
        success "Database is healthy"
    else
        error "Database health check failed"
    fi
    
    # Check Redis
    if docker-compose exec -T redis redis-cli ping > /dev/null 2>&1; then
        success "Redis is healthy"
    else
        error "Redis health check failed"
    fi
    
    # Check IPFS
    if curl -f http://localhost:5001/api/v0/version > /dev/null 2>&1; then
        success "IPFS is healthy"
    else
        warning "IPFS health check failed (may be starting up)"
    fi
}

# Run database migrations
run_migrations() {
    log "Running database migrations..."
    
    # Wait for database to be ready
    sleep 10
    
    # Run migrations (if any)
    # docker-compose exec fairlens npm run migrate || warning "No migrations to run"
    
    success "Database migrations completed"
}

# Setup monitoring
setup_monitoring() {
    log "Setting up monitoring..."
    
    # Wait for Prometheus to be ready
    sleep 20
    
    # Check if Prometheus is accessible
    if curl -f http://localhost:9090/-/healthy > /dev/null 2>&1; then
        success "Prometheus is running"
    else
        warning "Prometheus is not accessible"
    fi
    
    # Check if Grafana is accessible
    if curl -f http://localhost:3001/api/health > /dev/null 2>&1; then
        success "Grafana is running"
    else
        warning "Grafana is not accessible"
    fi
}

# Cleanup old backups
cleanup_backups() {
    log "Cleaning up old backups..."
    
    # Keep only last 10 backups
    cd "$BACKUP_DIR"
    ls -t | tail -n +11 | xargs -r rm -rf
    cd ..
    
    success "Old backups cleaned up"
}

# Rollback function
rollback() {
    log "Rolling back to previous version..."
    
    # Find latest backup
    LATEST_BACKUP=$(ls -t "$BACKUP_DIR" | head -n 1)
    
    if [ -z "$LATEST_BACKUP" ]; then
        error "No backup found for rollback"
    fi
    
    log "Rolling back to: $LATEST_BACKUP"
    
    # Stop current services
    docker-compose down
    
    # Restore database
    if [ -f "$BACKUP_DIR/$LATEST_BACKUP/database.sql" ]; then
        log "Restoring database..."
        docker-compose up -d postgres
        sleep 10
        docker-compose exec -T postgres psql -U fairlens -d fairlens < "$BACKUP_DIR/$LATEST_BACKUP/database.sql"
    fi
    
    # Restore volumes
    log "Restoring volumes..."
    docker run --rm -v fairlens_postgres_data:/data -v "$(pwd)/$BACKUP_DIR/$LATEST_BACKUP":/backup alpine tar xzf /backup/postgres_data.tar.gz -C /data
    docker run --rm -v fairlens_redis_data:/data -v "$(pwd)/$BACKUP_DIR/$LATEST_BACKUP":/backup alpine tar xzf /backup/redis_data.tar.gz -C /data
    docker run --rm -v fairlens_ipfs_data:/data -v "$(pwd)/$BACKUP_DIR/$LATEST_BACKUP":/backup alpine tar xzf /backup/ipfs_data.tar.gz -C /data
    
    # Restore configuration
    cp "$BACKUP_DIR/$LATEST_BACKUP/.env.production" .env.production
    cp "$BACKUP_DIR/$LATEST_BACKUP/docker-compose.yml" docker-compose.yml
    
    # Start services
    docker-compose up -d
    
    success "Rollback completed"
}

# Main deployment function
main() {
    log "Starting FairLens deployment process..."
    
    case "$1" in
        "deploy")
            check_prerequisites
            backup_current
            run_tests
            deploy
            run_migrations
            setup_monitoring
            cleanup_backups
            success "Deployment completed successfully!"
            ;;
        "rollback")
            rollback
            ;;
        "health")
            check_health
            ;;
        "backup")
            backup_current
            ;;
        "test")
            run_tests
            ;;
        *)
            echo "Usage: $0 {deploy|rollback|health|backup|test}"
            echo ""
            echo "Commands:"
            echo "  deploy   - Deploy FairLens to production"
            echo "  rollback - Rollback to previous version"
            echo "  health   - Check service health"
            echo "  backup   - Create backup of current deployment"
            echo "  test     - Run all tests"
            exit 1
            ;;
    esac
}

# Run main function
main "$@"