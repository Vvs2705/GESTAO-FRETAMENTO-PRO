-- AlterTable
ALTER TABLE "branches" ADD COLUMN     "latitude" DECIMAL(10,7),
ADD COLUMN     "longitude" DECIMAL(10,7),
ADD COLUMN     "type" VARCHAR(50) NOT NULL DEFAULT 'BRANCH';

-- CreateTable
CREATE TABLE "user_branch_scopes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_branch_scopes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fuel_products" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID,
    "code" VARCHAR(30) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "type" VARCHAR(30) NOT NULL,
    "unit" VARCHAR(10) NOT NULL DEFAULT 'liter',
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "fuel_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fuel_suppliers" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "legal_name" VARCHAR(200) NOT NULL,
    "trade_name" VARCHAR(200),
    "document" VARCHAR(20) NOT NULL,
    "contact_name" VARCHAR(200),
    "phone" VARCHAR(30),
    "email" VARCHAR(300),
    "address" TEXT,
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "status" VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "fuel_suppliers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fuel_tanks" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,
    "fuel_product_id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "code" VARCHAR(30) NOT NULL,
    "capacity_liters" DECIMAL(10,3) NOT NULL,
    "current_stock_liters" DECIMAL(10,3) NOT NULL DEFAULT 0,
    "minimum_stock_liters" DECIMAL(10,3) NOT NULL DEFAULT 0,
    "warning_stock_liters" DECIMAL(10,3) NOT NULL DEFAULT 0,
    "physical_location" VARCHAR(200),
    "status" VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    "last_calibration_at" TIMESTAMPTZ(6),
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "fuel_tanks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fuel_pumps" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,
    "fuel_tank_id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "code" VARCHAR(30) NOT NULL,
    "meter_type" VARCHAR(30) NOT NULL,
    "current_meter_reading" DECIMAL(12,3) NOT NULL DEFAULT 0,
    "status" VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    "last_inspection_at" TIMESTAMPTZ(6),
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "fuel_pumps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "internal_fuelings" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,
    "vehicle_id" UUID NOT NULL,
    "driver_id" UUID,
    "attendant_user_id" UUID NOT NULL,
    "fuel_tank_id" UUID NOT NULL,
    "fuel_pump_id" UUID,
    "fuel_product_id" UUID NOT NULL,
    "odometer" DECIMAL(10,1) NOT NULL,
    "hourmeter" DECIMAL(10,1),
    "liters" DECIMAL(10,3) NOT NULL,
    "meter_before" DECIMAL(12,3),
    "meter_after" DECIMAL(12,3),
    "unit_cost_calculated" DECIMAL(19,4),
    "total_cost_calculated" DECIMAL(19,4),
    "trip_id" UUID,
    "route_id" UUID,
    "occurred_at" TIMESTAMPTZ(6) NOT NULL,
    "latitude" DECIMAL(10,7),
    "longitude" DECIMAL(10,7),
    "status" VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
    "anomaly_flag" BOOLEAN NOT NULL DEFAULT false,
    "anomaly_reason" TEXT,
    "approved_by_user_id" UUID,
    "approved_at" TIMESTAMPTZ(6),
    "notes" TEXT,
    "client_generated_id" VARCHAR(100),
    "device_id" VARCHAR(100),
    "local_created_at" TIMESTAMPTZ(6),
    "sync_status" VARCHAR(30) NOT NULL DEFAULT 'SYNCED',
    "idempotency_key" VARCHAR(255),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "internal_fuelings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "internal_fueling_evidences" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "internal_fueling_id" UUID NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "file_url" TEXT NOT NULL,
    "metadata" JSONB,
    "uploaded_by_user_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "internal_fueling_evidences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "external_fuelings" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "branch_id" UUID,
    "vehicle_id" UUID NOT NULL,
    "driver_id" UUID NOT NULL,
    "fuel_station_id" UUID,
    "station_name_free" VARCHAR(200),
    "fuel_product_id" UUID NOT NULL,
    "odometer" DECIMAL(10,1) NOT NULL,
    "liters" DECIMAL(10,3) NOT NULL,
    "unit_price" DECIMAL(19,4) NOT NULL,
    "total_amount" DECIMAL(19,4) NOT NULL,
    "payment_method" VARCHAR(50) NOT NULL,
    "receipt_number" VARCHAR(100),
    "receipt_photo_url" TEXT,
    "receipt_access_key" VARCHAR(100),
    "occurred_at" TIMESTAMPTZ(6) NOT NULL,
    "latitude" DECIMAL(10,7),
    "longitude" DECIMAL(10,7),
    "trip_id" UUID,
    "status" VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
    "approved_by_user_id" UUID,
    "approved_at" TIMESTAMPTZ(6),
    "anomaly_flag" BOOLEAN NOT NULL DEFAULT false,
    "anomaly_reason" TEXT,
    "notes" TEXT,
    "client_generated_id" VARCHAR(100),
    "device_id" VARCHAR(100),
    "local_created_at" TIMESTAMPTZ(6),
    "idempotency_key" VARCHAR(255),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "external_fuelings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "external_fueling_evidences" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "external_fueling_id" UUID NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "file_url" TEXT NOT NULL,
    "metadata" JSONB,
    "uploaded_by_user_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "external_fueling_evidences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fuel_deliveries" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,
    "supplier_id" UUID NOT NULL,
    "fuel_product_id" UUID NOT NULL,
    "fuel_tank_id" UUID NOT NULL,
    "delivery_date" TIMESTAMPTZ(6) NOT NULL,
    "invoice_number" VARCHAR(100) NOT NULL,
    "invoice_access_key" VARCHAR(100),
    "contracted_liters" DECIMAL(10,3) NOT NULL,
    "declared_liters" DECIMAL(10,3) NOT NULL,
    "received_liters" DECIMAL(10,3),
    "accepted_liters" DECIMAL(10,3),
    "rejected_liters" DECIMAL(10,3),
    "unit_price" DECIMAL(19,4) NOT NULL,
    "total_amount" DECIMAL(19,4) NOT NULL,
    "carrier_name" VARCHAR(200),
    "carrier_document" VARCHAR(20),
    "tanker_plate" VARCHAR(10),
    "tanker_trailer_plate" VARCHAR(10),
    "tanker_driver_name" VARCHAR(200),
    "tanker_driver_document" VARCHAR(20),
    "seal_numbers" JSONB,
    "before_tank_level_liters" DECIMAL(10,3),
    "after_tank_level_liters" DECIMAL(10,3),
    "difference_liters" DECIMAL(10,3),
    "difference_percent" DECIMAL(5,2),
    "status" VARCHAR(50) NOT NULL DEFAULT 'SCHEDULED',
    "received_by_user_id" UUID,
    "approved_by_user_id" UUID,
    "approved_at" TIMESTAMPTZ(6),
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "fuel_deliveries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fuel_delivery_evidences" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "fuel_delivery_id" UUID NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "file_url" TEXT NOT NULL,
    "metadata" JSONB,
    "uploaded_by_user_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fuel_delivery_evidences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fuel_inventory_movements" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,
    "fuel_tank_id" UUID NOT NULL,
    "fuel_product_id" UUID NOT NULL,
    "movement_type" VARCHAR(50) NOT NULL,
    "source_type" VARCHAR(50) NOT NULL,
    "source_id" UUID NOT NULL,
    "quantity_liters" DECIMAL(10,3) NOT NULL,
    "unit_cost" DECIMAL(19,4),
    "total_cost" DECIMAL(19,4),
    "stock_before" DECIMAL(10,3) NOT NULL,
    "stock_after" DECIMAL(10,3) NOT NULL,
    "occurred_at" TIMESTAMPTZ(6) NOT NULL,
    "created_by_user_id" UUID NOT NULL,
    "approved_by_user_id" UUID,
    "reason" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fuel_inventory_movements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fuel_attendant_profiles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "employee_id" UUID,
    "allowed_branch_ids" JSONB NOT NULL,
    "allowed_tank_ids" JSONB NOT NULL,
    "allowed_pump_ids" JSONB NOT NULL,
    "shift" VARCHAR(30),
    "status" VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    "certification_expires_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "fuel_attendant_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fuel_incidents" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,
    "related_internal_fueling_id" UUID,
    "related_external_fueling_id" UUID,
    "related_fuel_delivery_id" UUID,
    "vehicle_id" UUID,
    "fuel_tank_id" UUID,
    "attendant_user_id" UUID,
    "severity" VARCHAR(20) NOT NULL DEFAULT 'LOW',
    "type" VARCHAR(100) NOT NULL,
    "description" TEXT NOT NULL,
    "status" VARCHAR(50) NOT NULL DEFAULT 'OPEN',
    "responsible_user_id" UUID,
    "resolution" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "resolved_at" TIMESTAMPTZ(6),

    CONSTRAINT "fuel_incidents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cost_centers" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "code" VARCHAR(30) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "cost_centers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fuel_daily_summaries" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,
    "fuel_product_id" UUID NOT NULL,
    "summary_date" DATE NOT NULL,
    "total_liters_in" DECIMAL(10,3) NOT NULL,
    "total_liters_out" DECIMAL(10,3) NOT NULL,
    "total_cost_out" DECIMAL(19,4) NOT NULL,
    "fueling_count" INTEGER NOT NULL DEFAULT 0,
    "anomaly_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "fuel_daily_summaries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tank_stock_snapshots" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "tank_id" UUID NOT NULL,
    "snapshot_date" DATE NOT NULL,
    "stock_liters" DECIMAL(10,3) NOT NULL,
    "stock_value" DECIMAL(19,4),
    "capacity_liters" DECIMAL(10,3) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tank_stock_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicle_fuel_efficiency_summaries" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "vehicle_id" UUID NOT NULL,
    "fuel_product_id" UUID NOT NULL,
    "period_month" INTEGER NOT NULL,
    "period_year" INTEGER NOT NULL,
    "total_liters" DECIMAL(10,3) NOT NULL,
    "total_km" DECIMAL(10,1) NOT NULL,
    "avg_km_per_liter" DECIMAL(10,3) NOT NULL,
    "total_cost" DECIMAL(19,4) NOT NULL,
    "fueling_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "vehicle_fuel_efficiency_summaries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendant_fuel_summaries" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "period_month" INTEGER NOT NULL,
    "period_year" INTEGER NOT NULL,
    "total_fuelings" INTEGER NOT NULL DEFAULT 0,
    "total_liters" DECIMAL(10,3) NOT NULL,
    "anomaly_count" INTEGER NOT NULL DEFAULT 0,
    "avg_liters_per_op" DECIMAL(10,3) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "attendant_fuel_summaries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_branch_scopes_tenant_id_user_id_idx" ON "user_branch_scopes"("tenant_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_branch_scopes_tenant_id_user_id_branch_id_key" ON "user_branch_scopes"("tenant_id", "user_id", "branch_id");

-- CreateIndex
CREATE INDEX "fuel_products_active_idx" ON "fuel_products"("active");

-- CreateIndex
CREATE UNIQUE INDEX "fuel_products_code_key" ON "fuel_products"("code");

-- CreateIndex
CREATE INDEX "fuel_suppliers_tenant_id_approved_status_idx" ON "fuel_suppliers"("tenant_id", "approved", "status");

-- CreateIndex
CREATE UNIQUE INDEX "fuel_suppliers_tenant_id_document_key" ON "fuel_suppliers"("tenant_id", "document");

-- CreateIndex
CREATE INDEX "fuel_tanks_tenant_id_branch_id_status_idx" ON "fuel_tanks"("tenant_id", "branch_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "fuel_tanks_tenant_id_code_key" ON "fuel_tanks"("tenant_id", "code");

-- CreateIndex
CREATE INDEX "fuel_pumps_tenant_id_branch_id_status_idx" ON "fuel_pumps"("tenant_id", "branch_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "fuel_pumps_tenant_id_code_key" ON "fuel_pumps"("tenant_id", "code");

-- CreateIndex
CREATE INDEX "internal_fuelings_tenant_id_vehicle_id_occurred_at_idx" ON "internal_fuelings"("tenant_id", "vehicle_id", "occurred_at" DESC);

-- CreateIndex
CREATE INDEX "internal_fuelings_tenant_id_branch_id_status_idx" ON "internal_fuelings"("tenant_id", "branch_id", "status");

-- CreateIndex
CREATE INDEX "internal_fuelings_tenant_id_anomaly_flag_idx" ON "internal_fuelings"("tenant_id", "anomaly_flag");

-- CreateIndex
CREATE UNIQUE INDEX "internal_fuelings_tenant_id_idempotency_key_key" ON "internal_fuelings"("tenant_id", "idempotency_key");

-- CreateIndex
CREATE INDEX "internal_fueling_evidences_tenant_id_internal_fueling_id_idx" ON "internal_fueling_evidences"("tenant_id", "internal_fueling_id");

-- CreateIndex
CREATE INDEX "external_fuelings_tenant_id_vehicle_id_occurred_at_idx" ON "external_fuelings"("tenant_id", "vehicle_id", "occurred_at" DESC);

-- CreateIndex
CREATE INDEX "external_fuelings_tenant_id_driver_id_occurred_at_idx" ON "external_fuelings"("tenant_id", "driver_id", "occurred_at" DESC);

-- CreateIndex
CREATE INDEX "external_fuelings_tenant_id_status_idx" ON "external_fuelings"("tenant_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "external_fuelings_tenant_id_idempotency_key_key" ON "external_fuelings"("tenant_id", "idempotency_key");

-- CreateIndex
CREATE INDEX "external_fueling_evidences_tenant_id_external_fueling_id_idx" ON "external_fueling_evidences"("tenant_id", "external_fueling_id");

-- CreateIndex
CREATE INDEX "fuel_deliveries_tenant_id_branch_id_status_idx" ON "fuel_deliveries"("tenant_id", "branch_id", "status");

-- CreateIndex
CREATE INDEX "fuel_deliveries_tenant_id_fuel_tank_id_idx" ON "fuel_deliveries"("tenant_id", "fuel_tank_id");

-- CreateIndex
CREATE UNIQUE INDEX "fuel_deliveries_tenant_id_supplier_id_invoice_number_key" ON "fuel_deliveries"("tenant_id", "supplier_id", "invoice_number");

-- CreateIndex
CREATE INDEX "fuel_delivery_evidences_tenant_id_fuel_delivery_id_idx" ON "fuel_delivery_evidences"("tenant_id", "fuel_delivery_id");

-- CreateIndex
CREATE INDEX "fuel_inventory_movements_tenant_id_fuel_tank_id_occurred_at_idx" ON "fuel_inventory_movements"("tenant_id", "fuel_tank_id", "occurred_at" DESC);

-- CreateIndex
CREATE INDEX "fuel_inventory_movements_tenant_id_source_type_source_id_idx" ON "fuel_inventory_movements"("tenant_id", "source_type", "source_id");

-- CreateIndex
CREATE INDEX "fuel_inventory_movements_tenant_id_movement_type_occurred_a_idx" ON "fuel_inventory_movements"("tenant_id", "movement_type", "occurred_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "fuel_attendant_profiles_user_id_key" ON "fuel_attendant_profiles"("user_id");

-- CreateIndex
CREATE INDEX "fuel_attendant_profiles_tenant_id_status_idx" ON "fuel_attendant_profiles"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "fuel_incidents_tenant_id_status_severity_created_at_idx" ON "fuel_incidents"("tenant_id", "status", "severity", "created_at" DESC);

-- CreateIndex
CREATE INDEX "fuel_incidents_tenant_id_branch_id_idx" ON "fuel_incidents"("tenant_id", "branch_id");

-- CreateIndex
CREATE INDEX "cost_centers_tenant_id_active_idx" ON "cost_centers"("tenant_id", "active");

-- CreateIndex
CREATE UNIQUE INDEX "cost_centers_tenant_id_code_key" ON "cost_centers"("tenant_id", "code");

-- CreateIndex
CREATE INDEX "fuel_daily_summaries_tenant_id_branch_id_summary_date_idx" ON "fuel_daily_summaries"("tenant_id", "branch_id", "summary_date" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "fuel_daily_summaries_tenant_id_branch_id_fuel_product_id_su_key" ON "fuel_daily_summaries"("tenant_id", "branch_id", "fuel_product_id", "summary_date");

-- CreateIndex
CREATE INDEX "tank_stock_snapshots_tenant_id_tank_id_snapshot_date_idx" ON "tank_stock_snapshots"("tenant_id", "tank_id", "snapshot_date" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "tank_stock_snapshots_tenant_id_tank_id_snapshot_date_key" ON "tank_stock_snapshots"("tenant_id", "tank_id", "snapshot_date");

-- CreateIndex
CREATE INDEX "vehicle_fuel_efficiency_summaries_tenant_id_vehicle_id_peri_idx" ON "vehicle_fuel_efficiency_summaries"("tenant_id", "vehicle_id", "period_year", "period_month");

-- CreateIndex
CREATE UNIQUE INDEX "vehicle_fuel_efficiency_summaries_tenant_id_vehicle_id_fuel_key" ON "vehicle_fuel_efficiency_summaries"("tenant_id", "vehicle_id", "fuel_product_id", "period_year", "period_month");

-- CreateIndex
CREATE INDEX "attendant_fuel_summaries_tenant_id_user_id_period_year_peri_idx" ON "attendant_fuel_summaries"("tenant_id", "user_id", "period_year", "period_month");

-- CreateIndex
CREATE UNIQUE INDEX "attendant_fuel_summaries_tenant_id_user_id_period_year_peri_key" ON "attendant_fuel_summaries"("tenant_id", "user_id", "period_year", "period_month");

-- CreateIndex
CREATE INDEX "branches_tenant_id_type_idx" ON "branches"("tenant_id", "type");

-- AddForeignKey
ALTER TABLE "fuel_tanks" ADD CONSTRAINT "fuel_tanks_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fuel_tanks" ADD CONSTRAINT "fuel_tanks_fuel_product_id_fkey" FOREIGN KEY ("fuel_product_id") REFERENCES "fuel_products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fuel_pumps" ADD CONSTRAINT "fuel_pumps_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fuel_pumps" ADD CONSTRAINT "fuel_pumps_fuel_tank_id_fkey" FOREIGN KEY ("fuel_tank_id") REFERENCES "fuel_tanks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "internal_fuelings" ADD CONSTRAINT "internal_fuelings_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "internal_fuelings" ADD CONSTRAINT "internal_fuelings_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "internal_fuelings" ADD CONSTRAINT "internal_fuelings_fuel_tank_id_fkey" FOREIGN KEY ("fuel_tank_id") REFERENCES "fuel_tanks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "internal_fuelings" ADD CONSTRAINT "internal_fuelings_fuel_pump_id_fkey" FOREIGN KEY ("fuel_pump_id") REFERENCES "fuel_pumps"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "internal_fuelings" ADD CONSTRAINT "internal_fuelings_fuel_product_id_fkey" FOREIGN KEY ("fuel_product_id") REFERENCES "fuel_products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "internal_fueling_evidences" ADD CONSTRAINT "internal_fueling_evidences_internal_fueling_id_fkey" FOREIGN KEY ("internal_fueling_id") REFERENCES "internal_fuelings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "external_fuelings" ADD CONSTRAINT "external_fuelings_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "external_fuelings" ADD CONSTRAINT "external_fuelings_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "external_fuelings" ADD CONSTRAINT "external_fuelings_fuel_product_id_fkey" FOREIGN KEY ("fuel_product_id") REFERENCES "fuel_products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "external_fueling_evidences" ADD CONSTRAINT "external_fueling_evidences_external_fueling_id_fkey" FOREIGN KEY ("external_fueling_id") REFERENCES "external_fuelings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fuel_deliveries" ADD CONSTRAINT "fuel_deliveries_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fuel_deliveries" ADD CONSTRAINT "fuel_deliveries_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "fuel_suppliers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fuel_deliveries" ADD CONSTRAINT "fuel_deliveries_fuel_product_id_fkey" FOREIGN KEY ("fuel_product_id") REFERENCES "fuel_products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fuel_deliveries" ADD CONSTRAINT "fuel_deliveries_fuel_tank_id_fkey" FOREIGN KEY ("fuel_tank_id") REFERENCES "fuel_tanks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fuel_delivery_evidences" ADD CONSTRAINT "fuel_delivery_evidences_fuel_delivery_id_fkey" FOREIGN KEY ("fuel_delivery_id") REFERENCES "fuel_deliveries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fuel_inventory_movements" ADD CONSTRAINT "fuel_inventory_movements_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fuel_inventory_movements" ADD CONSTRAINT "fuel_inventory_movements_fuel_tank_id_fkey" FOREIGN KEY ("fuel_tank_id") REFERENCES "fuel_tanks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fuel_inventory_movements" ADD CONSTRAINT "fuel_inventory_movements_fuel_product_id_fkey" FOREIGN KEY ("fuel_product_id") REFERENCES "fuel_products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fuel_incidents" ADD CONSTRAINT "fuel_incidents_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fuel_incidents" ADD CONSTRAINT "fuel_incidents_related_internal_fueling_id_fkey" FOREIGN KEY ("related_internal_fueling_id") REFERENCES "internal_fuelings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fuel_incidents" ADD CONSTRAINT "fuel_incidents_related_external_fueling_id_fkey" FOREIGN KEY ("related_external_fueling_id") REFERENCES "external_fuelings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fuel_incidents" ADD CONSTRAINT "fuel_incidents_related_fuel_delivery_id_fkey" FOREIGN KEY ("related_fuel_delivery_id") REFERENCES "fuel_deliveries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fuel_incidents" ADD CONSTRAINT "fuel_incidents_fuel_tank_id_fkey" FOREIGN KEY ("fuel_tank_id") REFERENCES "fuel_tanks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fuel_daily_summaries" ADD CONSTRAINT "fuel_daily_summaries_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fuel_daily_summaries" ADD CONSTRAINT "fuel_daily_summaries_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tank_stock_snapshots" ADD CONSTRAINT "tank_stock_snapshots_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tank_stock_snapshots" ADD CONSTRAINT "tank_stock_snapshots_tank_id_fkey" FOREIGN KEY ("tank_id") REFERENCES "fuel_tanks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_fuel_efficiency_summaries" ADD CONSTRAINT "vehicle_fuel_efficiency_summaries_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_fuel_efficiency_summaries" ADD CONSTRAINT "vehicle_fuel_efficiency_summaries_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendant_fuel_summaries" ADD CONSTRAINT "attendant_fuel_summaries_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendant_fuel_summaries" ADD CONSTRAINT "attendant_fuel_summaries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
