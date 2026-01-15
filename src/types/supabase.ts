export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    role: 'admin' | 'inspector' | 'viewer'
                    full_name: string | null
                    avatar_url: string | null
                    updated_at: string | null
                }
                Insert: {
                    id: string
                    role?: 'admin' | 'inspector' | 'viewer'
                    full_name?: string | null
                    avatar_url?: string | null
                    updated_at?: string | null
                }
                Update: {
                    id?: string
                    role?: 'admin' | 'inspector' | 'viewer'
                    full_name?: string | null
                    avatar_url?: string | null
                    updated_at?: string | null
                }
            }
            routes: {
                Row: {
                    id: string
                    name: string
                    description: string | null
                    is_active: boolean
                    created_at: string
                    created_by: string | null
                    checklist_schema: Json | null
                }
                Insert: {
                    id?: string
                    name: string
                    description?: string | null
                    is_active?: boolean
                    created_at?: string
                    created_by?: string | null
                    checklist_schema?: Json | null
                }
                Update: {
                    id?: string
                    name?: string
                    description?: string | null
                    is_active?: boolean
                    created_at?: string
                    created_by?: string | null
                    checklist_schema?: Json | null
                }
            }
            checkpoints: {
                Row: {
                    id: string
                    route_id: string
                    name: string
                    sequence_order: number
                    latitude: number
                    longitude: number
                    radius_meters: number
                    qr_code_value: string
                }
                Insert: {
                    id?: string
                    route_id: string
                    name: string
                    sequence_order: number
                    latitude: number
                    longitude: number
                    radius_meters?: number
                    qr_code_value: string
                }
                Update: {
                    id?: string
                    route_id?: string
                    name?: string
                    sequence_order?: number
                    latitude?: number
                    longitude?: number
                    radius_meters?: number
                    qr_code_value?: string
                }
            }
            inspections: {
                Row: {
                    id: string
                    checkpoint_id: string
                    inspector_id: string
                    status: 'completed' | 'flagged' | 'skipped'
                    recorded_at: string
                    gps_lat: number | null
                    gps_lng: number | null
                    data: Json | null
                }
                Insert: {
                    id?: string
                    checkpoint_id: string
                    inspector_id: string
                    status?: 'completed' | 'flagged' | 'skipped'
                    recorded_at?: string
                    gps_lat?: number | null
                    gps_lng?: number | null
                    data?: Json | null
                }
                Update: {
                    id?: string
                    checkpoint_id?: string
                    inspector_id?: string
                    status?: 'completed' | 'flagged' | 'skipped'
                    recorded_at?: string
                    gps_lat?: number | null
                    gps_lng?: number | null
                    data?: Json | null
                }
            }
        }
    }
}
