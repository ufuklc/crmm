-- Detaylı RLS politikaları (daha güvenli)
-- Bu dosyayı Supabase SQL Editor'da çalıştırın

-- 1. CUSTOMERS tablosu
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'customers' 
        AND policyname = 'Allow insert for authenticated users on customers'
    ) THEN
        CREATE POLICY "Allow insert for authenticated users on customers" ON customers
        FOR INSERT WITH CHECK (auth.role() = 'authenticated');
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'customers' 
        AND policyname = 'Allow select for authenticated users on customers'
    ) THEN
        CREATE POLICY "Allow select for authenticated users on customers" ON customers
        FOR SELECT USING (auth.role() = 'authenticated');
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'customers' 
        AND policyname = 'Allow update for authenticated users on customers'
    ) THEN
        CREATE POLICY "Allow update for authenticated users on customers" ON customers
        FOR UPDATE USING (auth.role() = 'authenticated');
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'customers' 
        AND policyname = 'Allow delete for authenticated users on customers'
    ) THEN
        CREATE POLICY "Allow delete for authenticated users on customers" ON customers
        FOR DELETE USING (auth.role() = 'authenticated');
    END IF;
END $$;

-- 2. PROPERTIES tablosu
CREATE POLICY "Allow insert for authenticated users on properties" ON properties
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow select for authenticated users on properties" ON properties
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow update for authenticated users on properties" ON properties
FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow delete for authenticated users on properties" ON properties
FOR DELETE USING (auth.role() = 'authenticated');

-- 3. CUSTOMER_REQUESTS tablosu
CREATE POLICY "Allow insert for authenticated users on customer_requests" ON customer_requests
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow select for authenticated users on customer_requests" ON customer_requests
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow update for authenticated users on customer_requests" ON customer_requests
FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow delete for authenticated users on customer_requests" ON customer_requests
FOR DELETE USING (auth.role() = 'authenticated');

-- 4. MEETING_NOTES tablosu
CREATE POLICY "Allow insert for authenticated users on meeting_notes" ON meeting_notes
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow select for authenticated users on meeting_notes" ON meeting_notes
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow update for authenticated users on meeting_notes" ON meeting_notes
FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow delete for authenticated users on meeting_notes" ON meeting_notes
FOR DELETE USING (auth.role() = 'authenticated');

-- 5. PORTFOLIO_OWNERS tablosu
CREATE POLICY "Allow insert for authenticated users on portfolio_owners" ON portfolio_owners
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow select for authenticated users on portfolio_owners" ON portfolio_owners
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow update for authenticated users on portfolio_owners" ON portfolio_owners
FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow delete for authenticated users on portfolio_owners" ON portfolio_owners
FOR DELETE USING (auth.role() = 'authenticated');
