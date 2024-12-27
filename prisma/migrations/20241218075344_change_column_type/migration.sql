-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" VARCHAR(255) NOT NULL,
    "username" VARCHAR(50) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "role_id" INTEGER NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "warehouses" (
    "wh_name" VARCHAR(255) NOT NULL,
    "wh_type" VARCHAR(255) NOT NULL,
    "space" INTEGER NOT NULL,
    "max_cap_by_sqm" INTEGER DEFAULT 
CASE
    WHEN ((wh_type)::text = ANY (ARRAY[('BONDED'::character varying)::text, ('PLB'::character varying)::text])) THEN space
    WHEN ((wh_type)::text = 'CFS'::text) THEN (((space)::numeric * 0.71))::integer
    ELSE (((space)::numeric * 0.85))::integer
END,
    "max_cap_by_volume" INTEGER DEFAULT 
CASE
    WHEN ((wh_type)::text = 'PLB'::text) THEN (((space)::numeric * 1.0) * 1.5)
    WHEN ((wh_type)::text = 'BONDED'::text) THEN (((space)::numeric * 1.0) * 1.2)
    WHEN ((wh_type)::text = 'CFS'::text) THEN (((space)::numeric * 0.71) * 1.2)
    ELSE (((space)::numeric * 0.85) * 1.2)
END,

    CONSTRAINT "warehouses_pkey" PRIMARY KEY ("wh_name")
);

-- CreateTable
CREATE TABLE "inbound" (
    "no" INTEGER NOT NULL,
    "wh_name" TEXT,
    "area" TEXT,
    "inbound_date" DATE,
    "gate_in" TIME(6),
    "inbound_doc_type" TEXT,
    "inbound_doc" TEXT,
    "receiving_doc" TEXT,
    "customer_name" TEXT,
    "shipper_name" TEXT,
    "bl_do" TEXT,
    "aju_no" TEXT,
    "truck_type" TEXT,
    "plat_no" TEXT,
    "container_no" TEXT,
    "seal_no" TEXT,
    "item_code" TEXT,
    "item_name" TEXT,
    "qty" INTEGER,
    "uom" TEXT,
    "nett_weight" DECIMAL(15,3),
    "gross_weight" DECIMAL(15,3),
    "volume" DECIMAL(15,3),
    "batch" TEXT,
    "npe_no" TEXT,
    "npe_date" DATE,
    "peb_no" TEXT,
    "peb_date" DATE,
    "remark" TEXT,
    "dock_no" TEXT,
    "doc_status" TEXT,
    "user_admin" TEXT,
    "start_tally" TIMESTAMP(6),
    "finish_tally" TIMESTAMP(6),
    "user_tally" TEXT,
    "start_putaway" TIMESTAMP(6),
    "finish_putaway" TIMESTAMP(6),
    "user_putaway" TEXT,
    "year" INTEGER DEFAULT EXTRACT(year FROM inbound_date),
    "month" TEXT DEFAULT get_month_name(inbound_date),
    "week_number" TEXT DEFAULT get_week_number(inbound_date),
    "week_in_month" TEXT DEFAULT get_week_in_month(inbound_date),
    "id" TEXT DEFAULT generate_in_id(plat_no, inbound_date),

    CONSTRAINT "inbound_pkey" PRIMARY KEY ("no")
);

-- CreateTable
CREATE TABLE "months" (
    "month" VARCHAR(3) NOT NULL,
    "month_full_name" VARCHAR(20),
    "month_sort" SMALLINT,

    CONSTRAINT "months_pkey" PRIMARY KEY ("month")
);

-- CreateTable
CREATE TABLE "occupancy_sqm" (
    "year" INTEGER NOT NULL,
    "month" VARCHAR(10) NOT NULL,
    "week" VARCHAR(5) NOT NULL,
    "wh_type" VARCHAR(50) NOT NULL,
    "status" VARCHAR(10) NOT NULL,
    "space" DECIMAL,
    "id" SERIAL NOT NULL,

    CONSTRAINT "occupancy_sqm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "occupancy_vol" (
    "year" INTEGER NOT NULL,
    "month" VARCHAR(10) NOT NULL,
    "week" VARCHAR(5) NOT NULL,
    "wh_type" VARCHAR(50) NOT NULL,
    "status" VARCHAR(10) NOT NULL,
    "space" DECIMAL,
    "id" SERIAL NOT NULL,

    CONSTRAINT "occupancy_vol_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "outbound" (
    "no" INTEGER NOT NULL,
    "wh_name" TEXT,
    "area" TEXT,
    "outbound_date" DATE,
    "outbound_time" TIME(6),
    "loading_date" DATE,
    "outbound_doc_type" TEXT,
    "outbound_doc" TEXT,
    "picking_doc" TEXT,
    "loading_doc" TEXT,
    "customer_name" TEXT,
    "shipper_name" TEXT,
    "item_code" TEXT,
    "item_name" TEXT,
    "doc_qty" INTEGER,
    "qty" INTEGER,
    "uom" TEXT,
    "nett_weight" DECIMAL(15,3),
    "gross_weight" DECIMAL(15,3),
    "volume" DECIMAL(15,3),
    "batch" TEXT,
    "bl_do" TEXT,
    "aju_no" TEXT,
    "truck_type" TEXT,
    "truck_no" TEXT,
    "container_no" TEXT,
    "seal_no" TEXT,
    "vessel_name" TEXT,
    "voyage_no" TEXT,
    "destination" TEXT,
    "recipient" TEXT,
    "address" TEXT,
    "shipping_notes" TEXT,
    "remark" TEXT,
    "doc_status" TEXT,
    "user_admin" TEXT,
    "start_picking" TIMESTAMP(6),
    "finish_picking" TIMESTAMP(6),
    "user_picking" TEXT,
    "start_loading" TIMESTAMP(6),
    "finish_loading" TIMESTAMP(6),
    "user_loading" TEXT,
    "year" INTEGER DEFAULT (EXTRACT(year FROM outbound_date))::integer,
    "month" TEXT DEFAULT get_month_name(outbound_date),
    "week_number" TEXT DEFAULT get_week_number(outbound_date),
    "week_in_month" TEXT DEFAULT get_week_in_month(outbound_date),
    "id" TEXT DEFAULT generate_out_id(truck_no, container_no, outbound_date),

    CONSTRAINT "outbound_pkey" PRIMARY KEY ("no")
);

-- CreateTable
CREATE TABLE "weeks" (
    "week" VARCHAR(2) NOT NULL,

    CONSTRAINT "weeks_pkey" PRIMARY KEY ("week")
);

-- CreateTable
CREATE TABLE "years" (
    "year" INTEGER NOT NULL,

    CONSTRAINT "years_pkey" PRIMARY KEY ("year")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "uq_wh_type" ON "warehouses"("wh_type");

-- CreateIndex
CREATE UNIQUE INDEX "months_month_full_name_key" ON "months"("month_full_name");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "inbound" ADD CONSTRAINT "fk_inbound_area" FOREIGN KEY ("area") REFERENCES "warehouses"("wh_name") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inbound" ADD CONSTRAINT "fk_inbound_month" FOREIGN KEY ("month") REFERENCES "months"("month_full_name") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "inbound" ADD CONSTRAINT "fk_inbound_week" FOREIGN KEY ("week_in_month") REFERENCES "weeks"("week") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "inbound" ADD CONSTRAINT "fk_inbound_year" FOREIGN KEY ("year") REFERENCES "years"("year") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "occupancy_sqm" ADD CONSTRAINT "fk_month" FOREIGN KEY ("month") REFERENCES "months"("month") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "occupancy_sqm" ADD CONSTRAINT "fk_week" FOREIGN KEY ("week") REFERENCES "weeks"("week") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "occupancy_sqm" ADD CONSTRAINT "fk_wh_type" FOREIGN KEY ("wh_type") REFERENCES "warehouses"("wh_type") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "occupancy_sqm" ADD CONSTRAINT "fk_year" FOREIGN KEY ("year") REFERENCES "years"("year") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "occupancy_vol" ADD CONSTRAINT "fk_month" FOREIGN KEY ("month") REFERENCES "months"("month") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "occupancy_vol" ADD CONSTRAINT "fk_week" FOREIGN KEY ("week") REFERENCES "weeks"("week") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "occupancy_vol" ADD CONSTRAINT "fk_wh_type" FOREIGN KEY ("wh_type") REFERENCES "warehouses"("wh_type") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "occupancy_vol" ADD CONSTRAINT "fk_year" FOREIGN KEY ("year") REFERENCES "years"("year") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "outbound" ADD CONSTRAINT "fk_outbound_area" FOREIGN KEY ("area") REFERENCES "warehouses"("wh_name") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "outbound" ADD CONSTRAINT "fk_outbound_month" FOREIGN KEY ("month") REFERENCES "months"("month_full_name") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "outbound" ADD CONSTRAINT "fk_outbound_week" FOREIGN KEY ("week_in_month") REFERENCES "weeks"("week") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "outbound" ADD CONSTRAINT "fk_outbound_year" FOREIGN KEY ("year") REFERENCES "years"("year") ON DELETE NO ACTION ON UPDATE NO ACTION;
