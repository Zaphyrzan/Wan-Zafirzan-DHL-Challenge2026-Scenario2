-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT auth.uid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'editor',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create incidents table
CREATE TABLE IF NOT EXISTS incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'draft',
  priority VARCHAR(50) DEFAULT 'medium',
  tags TEXT[] DEFAULT '{}',
  created_by UUID NOT NULL,
  reviewed_by UUID,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reviewed_at TIMESTAMP,
  published_at TIMESTAMP,
  content_hash VARCHAR(64),
  FOREIGN KEY (created_by) REFERENCES user_profiles(id),
  FOREIGN KEY (reviewed_by) REFERENCES user_profiles(id)
);

-- Create incident_files table
CREATE TABLE IF NOT EXISTS incident_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id UUID NOT NULL,
  file_path VARCHAR(255) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(50),
  file_size INTEGER,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (incident_id) REFERENCES incidents(id) ON DELETE CASCADE
);

-- Create incident_versions table
CREATE TABLE IF NOT EXISTS incident_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id UUID NOT NULL,
  old_data JSONB,
  new_data JSONB,
  changed_by UUID NOT NULL,
  status_before VARCHAR(50),
  status_after VARCHAR(50),
  change_reason TEXT,
  changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (incident_id) REFERENCES incidents(id) ON DELETE CASCADE,
  FOREIGN KEY (changed_by) REFERENCES user_profiles(id)
);

-- Create incident_audit_log table
CREATE TABLE IF NOT EXISTS incident_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id UUID NOT NULL,
  action VARCHAR(50) NOT NULL,
  actor_id UUID NOT NULL,
  details JSONB,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (incident_id) REFERENCES incidents(id) ON DELETE CASCADE,
  FOREIGN KEY (actor_id) REFERENCES user_profiles(id)
);

-- Enable RLS (Row Level Security)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE incident_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE incident_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE incident_audit_log ENABLE ROW LEVEL SECURITY;

-- Create storage bucket for incident files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('incident-files', 'incident-files', false)
ON CONFLICT DO NOTHING;
