-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Rooms Table
CREATE TABLE rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_number TEXT UNIQUE NOT NULL,
  floor INTEGER NOT NULL,
  type TEXT NOT NULL, -- Small, Medium, Large
  status TEXT DEFAULT 'available', -- available, occupied, maintenance
  price_per_month DECIMAL NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Residents Table
CREATE TABLE residents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  ktp_number TEXT,
  phone_number TEXT,
  email TEXT,
  profession TEXT,
  emergency_contact TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tenancies (Linking residents to rooms)
CREATE TABLE tenancies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  resident_id UUID REFERENCES residents(id) ON DELETE CASCADE,
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  expected_end_date DATE,
  actual_end_date DATE,
  duration_months INTEGER DEFAULT 1,
  status TEXT DEFAULT 'active', -- active, completed, cancelled
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Invoices
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenancy_id UUID REFERENCES tenancies(id) ON DELETE CASCADE,
  resident_id UUID REFERENCES residents(id) ON DELETE CASCADE,
  month_year TEXT NOT NULL, -- e.g., "Januari 2025"
  amount DECIMAL NOT NULL,
  status TEXT DEFAULT 'unpaid', -- unpaid, paid
  due_date DATE NOT NULL,
  description TEXT,
  period_start DATE,
  period_end DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transactions (Income/Expenses)
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL, -- income, expense
  category TEXT NOT NULL, -- Sewa Kamar, Laundry, Listrik, Air, Gaji, etc.
  amount DECIMAL NOT NULL,
  transaction_date DATE DEFAULT CURRENT_DATE,
  description TEXT,
  payment_method TEXT, -- Cash, Transfer
  proof_image TEXT, -- Base64 or URL
  invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Laundry
CREATE TABLE laundry (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  resident_id UUID REFERENCES residents(id) ON DELETE CASCADE,
  weight_kg DECIMAL NOT NULL,
  price DECIMAL NOT NULL,
  status TEXT DEFAULT 'process', -- process, done, picked_up
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Employees
CREATE TABLE employees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  position TEXT NOT NULL,
  salary DECIMAL NOT NULL,
  join_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admin Users for Authentication
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL, -- In a real app, use hashed passwords
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default admin user
-- Username: admin
-- Password: adminzayura (You can change this)
INSERT INTO users (username, password, name) 
VALUES ('admin', 'adminzayura', 'Admin Zayura');
