-- Gestão Fretamento Pro — Migration inicial (baseline)
-- Extensões necessárias para gen_random_uuid() e busca
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- CreateTable
CREATE TABLE "tenants" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(200) NOT NULL,
    "trade_name" VARCHAR(200),
    "document" VARCHAR(20) NOT NULL,
    "plan" VARCHAR(50) NOT NULL DEFAULT 'STARTER',
    "status" VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    "settings" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "branches" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "city" VARCHAR(100) NOT NULL,
    "state" VARCHAR(2) NOT NULL,
    "address" TEXT,
    "zip_code" VARCHAR(10),
    "phone" VARCHAR(30),
    "status" VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "branches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "employee_id" UUID,
    "name" VARCHAR(200) NOT NULL,
    "email" VARCHAR(300) NOT NULL,
    "phone" VARCHAR(30),
    "password_hash" TEXT NOT NULL,
    "status" VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    "last_login_at" TIMESTAMPTZ(6),
    "failed_login_count" INTEGER NOT NULL DEFAULT 0,
    "locked_until" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "token_hash" TEXT NOT NULL,
    "family_id" UUID NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "revoked_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ip_address" INET,
    "user_agent" TEXT,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employees" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "branch_id" UUID,
    "role_id" UUID,
    "name" VARCHAR(200) NOT NULL,
    "document" VARCHAR(20),
    "phone" VARCHAR(30),
    "email" VARCHAR(300),
    "department" VARCHAR(100),
    "admission_date" TIMESTAMPTZ(6),
    "status" VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "employees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "department" VARCHAR(100),
    "hierarchy_level" INTEGER NOT NULL DEFAULT 0,
    "description" TEXT,
    "is_system" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permissions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "key" VARCHAR(100) NOT NULL,
    "module" VARCHAR(50) NOT NULL,
    "action" VARCHAR(50) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_permissions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "role_id" UUID NOT NULL,
    "permission_id" UUID NOT NULL,
    "scope" VARCHAR(50),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "branch_id" UUID,
    "plate" VARCHAR(10) NOT NULL,
    "prefix" VARCHAR(20),
    "type" VARCHAR(50) NOT NULL,
    "capacity" INTEGER NOT NULL,
    "brand" VARCHAR(100),
    "model" VARCHAR(100),
    "year" INTEGER,
    "fuel_type" VARCHAR(30),
    "current_odometer" DECIMAL(10,1),
    "status" VARCHAR(50) NOT NULL DEFAULT 'AVAILABLE',
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "drivers" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "employee_id" UUID,
    "license_number" VARCHAR(20) NOT NULL,
    "license_category" VARCHAR(10) NOT NULL,
    "license_expires_at" TIMESTAMPTZ(6) NOT NULL,
    "availability_status" VARCHAR(50) NOT NULL DEFAULT 'AVAILABLE',
    "preferred_vehicle_id" UUID,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "drivers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clients" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "document" VARCHAR(20),
    "contact_name" VARCHAR(200),
    "contact_email" VARCHAR(300),
    "contact_phone" VARCHAR(30),
    "address" TEXT,
    "notes" TEXT,
    "status" VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contracts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "client_id" UUID NOT NULL,
    "number" VARCHAR(50),
    "description" TEXT,
    "value" DECIMAL(19,4),
    "start_date" TIMESTAMPTZ(6),
    "end_date" TIMESTAMPTZ(6),
    "status" VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "contracts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "routes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "client_id" UUID,
    "name" VARCHAR(200) NOT NULL,
    "origin" VARCHAR(200) NOT NULL,
    "destination" VARCHAR(200) NOT NULL,
    "estimated_distance_km" DECIMAL(10,2),
    "estimated_duration_minutes" INTEGER,
    "status" VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "routes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "route_points" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "route_id" UUID NOT NULL,
    "sequence" INTEGER NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "address" TEXT,
    "latitude" DECIMAL(10,7),
    "longitude" DECIMAL(10,7),
    "planned_time" VARCHAR(5),
    "type" VARCHAR(30) NOT NULL DEFAULT 'STOP',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "route_points_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trips" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "client_id" UUID,
    "route_id" UUID,
    "vehicle_id" UUID,
    "driver_id" UUID,
    "scheduled_start_at" TIMESTAMPTZ(6) NOT NULL,
    "scheduled_end_at" TIMESTAMPTZ(6),
    "actual_start_at" TIMESTAMPTZ(6),
    "actual_end_at" TIMESTAMPTZ(6),
    "status" VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
    "passenger_count" INTEGER,
    "notes" TEXT,
    "cancel_reason" TEXT,
    "version" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "trips_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trip_passengers" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "trip_id" UUID NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "document" VARCHAR(20),
    "phone" VARCHAR(30),
    "boarding_point" VARCHAR(200),
    "status" VARCHAR(50) NOT NULL DEFAULT 'CONFIRMED',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "trip_passengers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "occurrences" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "trip_id" UUID,
    "vehicle_id" UUID,
    "driver_id" UUID,
    "client_id" UUID,
    "type" VARCHAR(100) NOT NULL,
    "severity" VARCHAR(30) NOT NULL DEFAULT 'LOW',
    "description" TEXT NOT NULL,
    "status" VARCHAR(50) NOT NULL DEFAULT 'OPEN',
    "responsible_user_id" UUID,
    "action_taken" TEXT,
    "resolved_at" TIMESTAMPTZ(6),
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "occurrences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fuel_stations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "address" TEXT,
    "city" VARCHAR(100),
    "state" VARCHAR(2),
    "cnpj" VARCHAR(20),
    "status" VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "fuel_stations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fuel_records" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "vehicle_id" UUID NOT NULL,
    "driver_id" UUID,
    "branch_id" UUID,
    "fuel_station_name" VARCHAR(200),
    "fuel_type" VARCHAR(30) NOT NULL,
    "liters" DECIMAL(10,3) NOT NULL,
    "unit_price" DECIMAL(19,4) NOT NULL,
    "total_amount" DECIMAL(19,4) NOT NULL,
    "odometer" DECIMAL(10,1) NOT NULL,
    "receipt_file_id" UUID,
    "supplied_at" TIMESTAMPTZ(6) NOT NULL,
    "anomaly_flag" BOOLEAN NOT NULL DEFAULT false,
    "anomaly_reason" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "fuel_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "maintenance_orders" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "vehicle_id" UUID NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "description" TEXT NOT NULL,
    "supplier_name" VARCHAR(200),
    "supplier_document" VARCHAR(20),
    "expected_start_at" TIMESTAMPTZ(6),
    "expected_end_at" TIMESTAMPTZ(6),
    "actual_end_at" TIMESTAMPTZ(6),
    "total_cost" DECIMAL(19,4),
    "status" VARCHAR(50) NOT NULL DEFAULT 'OPEN',
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "maintenance_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "maintenance_items" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "maintenance_order_id" UUID NOT NULL,
    "description" TEXT NOT NULL,
    "part_name" VARCHAR(200),
    "part_code" VARCHAR(50),
    "quantity" DECIMAL(10,2) NOT NULL DEFAULT 1,
    "unit_cost" DECIMAL(19,4) NOT NULL,
    "total_cost" DECIMAL(19,4) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "maintenance_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "entity_type" VARCHAR(50) NOT NULL,
    "entity_id" UUID NOT NULL,
    "document_type" VARCHAR(100) NOT NULL,
    "file_name" VARCHAR(300),
    "file_key" TEXT,
    "file_size_bytes" INTEGER,
    "mime_type" VARCHAR(100),
    "expires_at" TIMESTAMPTZ(6),
    "status" VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    "sensitivity_level" VARCHAR(30) NOT NULL DEFAULT 'CONFIDENTIAL',
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "type" VARCHAR(100) NOT NULL,
    "title" VARCHAR(300) NOT NULL,
    "body" TEXT NOT NULL,
    "entity_type" VARCHAR(50),
    "entity_id" UUID,
    "read_at" TIMESTAMPTZ(6),
    "data" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "actor_user_id" UUID,
    "action" VARCHAR(200) NOT NULL,
    "entity_type" VARCHAR(100),
    "entity_id" UUID,
    "before" JSONB,
    "after" JSONB,
    "ip_address" INET,
    "user_agent" TEXT,
    "trace_id" VARCHAR(64),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "outbox_events" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "aggregate_id" UUID NOT NULL,
    "event_type" VARCHAR(200) NOT NULL,
    "payload" JSONB NOT NULL,
    "status" VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    "retries" INTEGER NOT NULL DEFAULT 0,
    "last_error" TEXT,
    "published_at" TIMESTAMPTZ(6),
    "next_retry_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "outbox_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "idempotency_keys" (
    "key" VARCHAR(255) NOT NULL,
    "tenant_id" UUID NOT NULL,
    "endpoint" VARCHAR(200) NOT NULL,
    "response" JSONB NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "idempotency_keys_pkey" PRIMARY KEY ("key","tenant_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tenants_document_key" ON "tenants"("document");

-- CreateIndex
CREATE INDEX "branches_tenant_id_status_idx" ON "branches"("tenant_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "users_employee_id_key" ON "users"("employee_id");

-- CreateIndex
CREATE INDEX "users_tenant_id_status_idx" ON "users"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "users_tenant_id_email_idx" ON "users"("tenant_id", "email");

-- CreateIndex
CREATE UNIQUE INDEX "users_tenant_id_email_key" ON "users"("tenant_id", "email");

-- CreateIndex
CREATE INDEX "refresh_tokens_tenant_id_user_id_idx" ON "refresh_tokens"("tenant_id", "user_id");

-- CreateIndex
CREATE INDEX "refresh_tokens_token_hash_idx" ON "refresh_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "refresh_tokens_family_id_idx" ON "refresh_tokens"("family_id");

-- CreateIndex
CREATE INDEX "employees_tenant_id_status_idx" ON "employees"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "employees_tenant_id_branch_id_idx" ON "employees"("tenant_id", "branch_id");

-- CreateIndex
CREATE INDEX "roles_tenant_id_idx" ON "roles"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "roles_tenant_id_name_key" ON "roles"("tenant_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_key_key" ON "permissions"("key");

-- CreateIndex
CREATE INDEX "permissions_module_idx" ON "permissions"("module");

-- CreateIndex
CREATE INDEX "role_permissions_tenant_id_role_id_idx" ON "role_permissions"("tenant_id", "role_id");

-- CreateIndex
CREATE UNIQUE INDEX "role_permissions_tenant_id_role_id_permission_id_key" ON "role_permissions"("tenant_id", "role_id", "permission_id");

-- CreateIndex
CREATE INDEX "vehicles_tenant_id_status_idx" ON "vehicles"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "vehicles_tenant_id_branch_id_idx" ON "vehicles"("tenant_id", "branch_id");

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_tenant_id_plate_key" ON "vehicles"("tenant_id", "plate");

-- CreateIndex
CREATE UNIQUE INDEX "drivers_employee_id_key" ON "drivers"("employee_id");

-- CreateIndex
CREATE INDEX "drivers_tenant_id_availability_status_idx" ON "drivers"("tenant_id", "availability_status");

-- CreateIndex
CREATE UNIQUE INDEX "drivers_tenant_id_license_number_key" ON "drivers"("tenant_id", "license_number");

-- CreateIndex
CREATE INDEX "clients_tenant_id_status_idx" ON "clients"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "contracts_tenant_id_client_id_status_idx" ON "contracts"("tenant_id", "client_id", "status");

-- CreateIndex
CREATE INDEX "routes_tenant_id_status_idx" ON "routes"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "routes_tenant_id_client_id_idx" ON "routes"("tenant_id", "client_id");

-- CreateIndex
CREATE INDEX "route_points_tenant_id_route_id_sequence_idx" ON "route_points"("tenant_id", "route_id", "sequence");

-- CreateIndex
CREATE INDEX "trips_tenant_id_status_scheduled_start_at_idx" ON "trips"("tenant_id", "status", "scheduled_start_at" DESC);

-- CreateIndex
CREATE INDEX "trips_tenant_id_vehicle_id_idx" ON "trips"("tenant_id", "vehicle_id");

-- CreateIndex
CREATE INDEX "trips_tenant_id_driver_id_idx" ON "trips"("tenant_id", "driver_id");

-- CreateIndex
CREATE INDEX "trips_tenant_id_scheduled_start_at_idx" ON "trips"("tenant_id", "scheduled_start_at");

-- CreateIndex
CREATE INDEX "trip_passengers_tenant_id_trip_id_idx" ON "trip_passengers"("tenant_id", "trip_id");

-- CreateIndex
CREATE INDEX "occurrences_tenant_id_status_severity_created_at_idx" ON "occurrences"("tenant_id", "status", "severity", "created_at" DESC);

-- CreateIndex
CREATE INDEX "occurrences_tenant_id_trip_id_idx" ON "occurrences"("tenant_id", "trip_id");

-- CreateIndex
CREATE INDEX "occurrences_tenant_id_vehicle_id_idx" ON "occurrences"("tenant_id", "vehicle_id");

-- CreateIndex
CREATE INDEX "fuel_stations_tenant_id_status_idx" ON "fuel_stations"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "fuel_records_tenant_id_vehicle_id_supplied_at_idx" ON "fuel_records"("tenant_id", "vehicle_id", "supplied_at" DESC);

-- CreateIndex
CREATE INDEX "fuel_records_tenant_id_anomaly_flag_idx" ON "fuel_records"("tenant_id", "anomaly_flag");

-- CreateIndex
CREATE INDEX "fuel_records_tenant_id_supplied_at_idx" ON "fuel_records"("tenant_id", "supplied_at");

-- CreateIndex
CREATE INDEX "maintenance_orders_tenant_id_vehicle_id_status_idx" ON "maintenance_orders"("tenant_id", "vehicle_id", "status");

-- CreateIndex
CREATE INDEX "maintenance_orders_tenant_id_status_idx" ON "maintenance_orders"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "maintenance_items_tenant_id_maintenance_order_id_idx" ON "maintenance_items"("tenant_id", "maintenance_order_id");

-- CreateIndex
CREATE INDEX "documents_tenant_id_entity_type_entity_id_idx" ON "documents"("tenant_id", "entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "documents_tenant_id_expires_at_idx" ON "documents"("tenant_id", "expires_at");

-- CreateIndex
CREATE INDEX "notifications_tenant_id_user_id_read_at_idx" ON "notifications"("tenant_id", "user_id", "read_at");

-- CreateIndex
CREATE INDEX "notifications_tenant_id_created_at_idx" ON "notifications"("tenant_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "audit_logs_tenant_id_actor_user_id_created_at_idx" ON "audit_logs"("tenant_id", "actor_user_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "audit_logs_tenant_id_entity_type_entity_id_idx" ON "audit_logs"("tenant_id", "entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "audit_logs_tenant_id_action_created_at_idx" ON "audit_logs"("tenant_id", "action", "created_at" DESC);

-- CreateIndex
CREATE INDEX "outbox_events_status_created_at_idx" ON "outbox_events"("status", "created_at");

-- CreateIndex
CREATE INDEX "outbox_events_tenant_id_aggregate_id_idx" ON "outbox_events"("tenant_id", "aggregate_id");

-- CreateIndex
CREATE INDEX "idempotency_keys_expires_at_idx" ON "idempotency_keys"("expires_at");

-- AddForeignKey
ALTER TABLE "branches" ADD CONSTRAINT "branches_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roles" ADD CONSTRAINT "roles_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "drivers" ADD CONSTRAINT "drivers_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "drivers" ADD CONSTRAINT "drivers_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "drivers" ADD CONSTRAINT "drivers_preferred_vehicle_id_fkey" FOREIGN KEY ("preferred_vehicle_id") REFERENCES "vehicles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clients" ADD CONSTRAINT "clients_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "routes" ADD CONSTRAINT "routes_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "routes" ADD CONSTRAINT "routes_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "route_points" ADD CONSTRAINT "route_points_route_id_fkey" FOREIGN KEY ("route_id") REFERENCES "routes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trips" ADD CONSTRAINT "trips_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trips" ADD CONSTRAINT "trips_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trips" ADD CONSTRAINT "trips_route_id_fkey" FOREIGN KEY ("route_id") REFERENCES "routes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trips" ADD CONSTRAINT "trips_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trips" ADD CONSTRAINT "trips_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "drivers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trip_passengers" ADD CONSTRAINT "trip_passengers_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "trips"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "occurrences" ADD CONSTRAINT "occurrences_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "occurrences" ADD CONSTRAINT "occurrences_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "trips"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "occurrences" ADD CONSTRAINT "occurrences_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "occurrences" ADD CONSTRAINT "occurrences_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "drivers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "occurrences" ADD CONSTRAINT "occurrences_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fuel_records" ADD CONSTRAINT "fuel_records_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fuel_records" ADD CONSTRAINT "fuel_records_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fuel_records" ADD CONSTRAINT "fuel_records_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "drivers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fuel_records" ADD CONSTRAINT "fuel_records_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_orders" ADD CONSTRAINT "maintenance_orders_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_orders" ADD CONSTRAINT "maintenance_orders_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_items" ADD CONSTRAINT "maintenance_items_maintenance_order_id_fkey" FOREIGN KEY ("maintenance_order_id") REFERENCES "maintenance_orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "document_vehicle_fk" FOREIGN KEY ("entity_id") REFERENCES "vehicles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_user_id_fkey" FOREIGN KEY ("actor_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "outbox_events" ADD CONSTRAINT "outbox_events_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "idempotency_keys" ADD CONSTRAINT "idempotency_keys_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

