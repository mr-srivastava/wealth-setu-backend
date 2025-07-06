CREATE TABLE "entities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"type_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "entity_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entity_id" uuid NOT NULL,
	"month" date NOT NULL,
	"amount" numeric(15, 2) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "entity_types" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "entity_types_name_unique" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "entities" ADD CONSTRAINT "entities_type_id_entity_types_id_fk" FOREIGN KEY ("type_id") REFERENCES "public"."entity_types"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entity_transactions" ADD CONSTRAINT "entity_transactions_entity_id_entities_id_fk" FOREIGN KEY ("entity_id") REFERENCES "public"."entities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "entities_type_id_idx" ON "entities" USING btree ("type_id");--> statement-breakpoint
CREATE INDEX "entity_transactions_entity_id_idx" ON "entity_transactions" USING btree ("entity_id");--> statement-breakpoint
CREATE INDEX "entity_transactions_month_idx" ON "entity_transactions" USING btree ("month");