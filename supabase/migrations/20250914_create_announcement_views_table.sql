CREATE TABLE IF NOT EXISTS public.announcement_views (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    announcement_id uuid NOT NULL,
    user_id text NOT NULL,
    viewed_at timestamp with time zone DEFAULT now(),
    CONSTRAINT fk_announcement FOREIGN KEY (announcement_id) REFERENCES public.announcements(id) ON DELETE CASCADE,
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES public."User"(clerkId) ON DELETE CASCADE,
    UNIQUE (announcement_id, user_id) -- Ensure a user only logs one view per announcement
);
