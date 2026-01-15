-- Add checklist_schema to routes for simple V1 template management
alter table public.routes 
add column checklist_schema jsonb default '[]'::jsonb;
-- Schema structure example: [{ "id": "q1", "label": "Is safety guard in place?", "type": "yes_no", "required": true }]
