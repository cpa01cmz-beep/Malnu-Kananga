-- Supabase Database Migration for MA Malnu Kananga

-- Create student_profiles table
CREATE TABLE IF NOT EXISTS student_profiles (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    nis TEXT UNIQUE,
    class TEXT,
    email TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create teacher_profiles table
CREATE TABLE IF NOT EXISTS teacher_profiles (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    nip TEXT UNIQUE,
    subject TEXT,
    email TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create parent_profiles table
CREATE TABLE IF NOT EXISTS parent_profiles (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    student_id BIGINT REFERENCES student_profiles(id) ON DELETE CASCADE,
    relationship TEXT, -- e.g., 'father', 'mother', 'guardian'
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create announcements table
CREATE TABLE IF NOT EXISTS announcements (
    id BIGSERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    author TEXT NOT NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    published BOOLEAN DEFAULT FALSE
);

-- Create assignments table
CREATE TABLE IF NOT EXISTS assignments (
    id BIGSERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    subject TEXT NOT NULL,
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    class TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create policies for RLS
-- Students can only view and update their own profile
CREATE POLICY "Students can view own profile" ON student_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Students can update own profile" ON student_profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- Teachers can only view and update their own profile
CREATE POLICY "Teachers can view own profile" ON teacher_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Teachers can update own profile" ON teacher_profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- Parents can only view and update their own profile
CREATE POLICY "Parents can view own profile" ON parent_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Parents can update own profile" ON parent_profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- Everyone can view published announcements
CREATE POLICY "Anyone can view published announcements" ON announcements
    FOR SELECT USING (published = true);

-- Teachers can create announcements
CREATE POLICY "Teachers can create announcements" ON announcements
    FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Teachers can update their own announcements
CREATE POLICY "Teachers can update own announcements" ON announcements
    FOR UPDATE USING (auth.uid() = created_by);

-- Teachers can view all assignments
CREATE POLICY "Teachers can view all assignments" ON assignments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM teacher_profiles tp WHERE tp.user_id = auth.uid()
        )
    );

-- Students can view assignments for their class
CREATE POLICY "Students can view assignments for their class" ON assignments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM student_profiles sp WHERE sp.user_id = auth.uid() AND sp.class = assignments.class
        )
    );

-- Teachers can create assignments
CREATE POLICY "Teachers can create assignments" ON assignments
    FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Teachers can update their own assignments
CREATE POLICY "Teachers can update own assignments" ON assignments
    FOR UPDATE USING (auth.uid() = created_by);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
    RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER set_timestamp_student_profiles
    BEFORE UPDATE ON student_profiles
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_teacher_profiles
    BEFORE UPDATE ON teacher_profiles
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_parent_profiles
    BEFORE UPDATE ON parent_profiles
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_announcements
    BEFORE UPDATE ON announcements
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_assignments
    BEFORE UPDATE ON assignments
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_student_profiles_user_id ON student_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_student_profiles_nis ON student_profiles(nis);
CREATE INDEX IF NOT EXISTS idx_student_profiles_class ON student_profiles(class);

CREATE INDEX IF NOT EXISTS idx_teacher_profiles_user_id ON teacher_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_teacher_profiles_nip ON teacher_profiles(nip);

CREATE INDEX IF NOT EXISTS idx_parent_profiles_user_id ON parent_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_parent_profiles_student_id ON parent_profiles(student_id);

CREATE INDEX IF NOT EXISTS idx_announcements_created_at ON announcements(created_at);
CREATE INDEX IF NOT EXISTS idx_announcements_published ON announcements(published);

CREATE INDEX IF NOT EXISTS idx_assignments_class ON assignments(class);
CREATE INDEX IF NOT EXISTS idx_assignments_due_date ON assignments(due_date);
CREATE INDEX IF NOT EXISTS idx_assignments_created_by ON assignments(created_by);

-- Enable Row Level Security (RLS) after all tables are created
ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE parent_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;