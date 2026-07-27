CREATE POLICY "Anyone can view app releases" ON storage.objects FOR SELECT USING (bucket_id = 'app-releases');
CREATE POLICY "Anon can upload app releases" ON storage.objects FOR INSERT TO anon WITH CHECK (bucket_id = 'app-releases');
CREATE POLICY "Anon can update app releases" ON storage.objects FOR UPDATE TO anon USING (bucket_id = 'app-releases');
CREATE POLICY "Anon can delete app releases" ON storage.objects FOR DELETE TO anon USING (bucket_id = 'app-releases');