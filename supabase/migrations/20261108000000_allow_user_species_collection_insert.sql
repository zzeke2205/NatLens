-- Allow authenticated users to add discovered species
-- to their own collection.

DROP POLICY IF EXISTS "Users can insert their own species collection"
ON public.user_species_collection;

CREATE POLICY "Users can insert their own species collection"
ON public.user_species_collection
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);