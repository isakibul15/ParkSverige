CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE cities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  country_code CHAR(2) NOT NULL,
  timezone TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  home_city_id UUID REFERENCES cities(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  license_plate TEXT NOT NULL,
  country_code CHAR(2) NOT NULL,
  vehicle_type TEXT NOT NULL,
  nickname TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX vehicles_user_plate_uidx
  ON vehicles (user_id, license_plate);

CREATE TABLE parking_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_zone_key TEXT NOT NULL UNIQUE,
  city_id UUID NOT NULL REFERENCES cities(id),
  name TEXT NOT NULL,
  zone_type TEXT NOT NULL,
  pricing_model TEXT,
  permit_type TEXT,
  availability_score NUMERIC(5, 2),
  availability_level TEXT NOT NULL,
  centroid GEOGRAPHY(POINT, 4326) NOT NULL,
  boundary GEOMETRY(MULTIPOLYGON, 4326),
  source_updated_at TIMESTAMPTZ,
  served_updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX parking_zones_city_idx
  ON parking_zones (city_id);

CREATE INDEX parking_zones_centroid_gix
  ON parking_zones
  USING GIST (centroid);

CREATE INDEX parking_zones_boundary_gix
  ON parking_zones
  USING GIST (boundary);

CREATE TABLE parking_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parking_zone_id UUID NOT NULL REFERENCES parking_zones(id) ON DELETE CASCADE,
  day_of_week SMALLINT NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  max_duration_minutes INTEGER,
  fee_required BOOLEAN NOT NULL DEFAULT FALSE,
  permit_required BOOLEAN NOT NULL DEFAULT FALSE,
  parking_allowed BOOLEAN NOT NULL DEFAULT TRUE,
  street_cleaning BOOLEAN NOT NULL DEFAULT FALSE,
  price_label TEXT,
  restriction_label TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX parking_rules_zone_idx
  ON parking_rules (parking_zone_id, day_of_week);

CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  parking_zone_id UUID REFERENCES parking_zones(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  favorite_type TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE search_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  query_text TEXT NOT NULL,
  result_type TEXT NOT NULL,
  result_reference TEXT,
  searched_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_code TEXT NOT NULL,
  provider TEXT NOT NULL,
  provider_subscription_id TEXT,
  status TEXT NOT NULL,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE notification_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
  parking_zone_id UUID REFERENCES parking_zones(id) ON DELETE CASCADE,
  trigger_type TEXT NOT NULL,
  lead_minutes INTEGER,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

