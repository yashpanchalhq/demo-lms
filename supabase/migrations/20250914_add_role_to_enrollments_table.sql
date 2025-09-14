ALTER TABLE public.enrollments
ADD COLUMN role text NOT NULL DEFAULT 'teacher';
