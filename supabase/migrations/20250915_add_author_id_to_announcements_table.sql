ALTER TABLE public.announcements
ADD COLUMN author_id TEXT REFERENCES public."User"(clerkId) ON DELETE SET NULL;