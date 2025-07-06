CREATE INDEX "entities_name_idx" ON "entities" USING btree ("name");--> statement-breakpoint
CREATE INDEX "entities_created_at_idx" ON "entities" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "entity_transactions_created_at_idx" ON "entity_transactions" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "entity_transactions_entity_id_month_idx" ON "entity_transactions" USING btree ("entity_id","month");