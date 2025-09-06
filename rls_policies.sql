-- Tüm tablolar için RLS politikaları
-- Bu dosyayı Supabase SQL Editor'da çalıştırın

-- 1. CUSTOMERS tablosu
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'customers' 
        AND policyname = 'Allow all operations for authenticated users on customers'
    ) THEN
        CREATE POLICY "Allow all operations for authenticated users on customers" ON customers
        FOR ALL USING (auth.role() = 'authenticated');
    END IF;
END $$;

-- 2. PROPERTIES tablosu  
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'properties' 
        AND policyname = 'Allow all operations for authenticated users on properties'
    ) THEN
        CREATE POLICY "Allow all operations for authenticated users on properties" ON properties
        FOR ALL USING (auth.role() = 'authenticated');
    END IF;
END $$;

-- 3. CUSTOMER_REQUESTS tablosu
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'customer_requests' 
        AND policyname = 'Allow all operations for authenticated users on customer_requests'
    ) THEN
        CREATE POLICY "Allow all operations for authenticated users on customer_requests" ON customer_requests
        FOR ALL USING (auth.role() = 'authenticated');
    END IF;
END $$;

-- 4. MEETING_NOTES tablosu
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'meeting_notes' 
        AND policyname = 'Allow all operations for authenticated users on meeting_notes'
    ) THEN
        CREATE POLICY "Allow all operations for authenticated users on meeting_notes" ON meeting_notes
        FOR ALL USING (auth.role() = 'authenticated');
    END IF;
END $$;

-- 5. PORTFOLIO_OWNERS tablosu
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'portfolio_owners' 
        AND policyname = 'Allow all operations for authenticated users on portfolio_owners'
    ) THEN
        CREATE POLICY "Allow all operations for authenticated users on portfolio_owners" ON portfolio_owners
        FOR ALL USING (auth.role() = 'authenticated');
    END IF;
END $$;

-- Eğer başka tablolar varsa, onları da ekleyin:
-- 6. NOTIFICATIONS tablosu (eğer varsa)
-- CREATE POLICY "Allow all operations for authenticated users on notifications" ON notifications
-- FOR ALL USING (auth.role() = 'authenticated');

-- 7. USERS tablosu (eğer varsa)
-- CREATE POLICY "Allow all operations for authenticated users on users" ON users
-- FOR ALL USING (auth.role() = 'authenticated');
