-- SAMPLE PRICES ONLY. Replace with your real selling prices in /admin before launch.
insert into public.plans (network, name, size, validity, price) values
  ('MTN', 'MTN 500MB (SAMPLE)', '500MB', '30 days', 150),
  ('MTN', 'MTN 1GB (SAMPLE)', '1GB', '30 days', 280),
  ('MTN', 'MTN 2GB (SAMPLE)', '2GB', '30 days', 560),
  ('MTN', 'MTN 5GB (SAMPLE)', '5GB', '30 days', 1400),
  ('MTN', 'MTN 10GB (SAMPLE)', '10GB', '30 days', 2800),
  ('Airtel', 'Airtel 500MB (SAMPLE)', '500MB', '30 days', 140),
  ('Airtel', 'Airtel 1GB (SAMPLE)', '1GB', '30 days', 270),
  ('Airtel', 'Airtel 2GB (SAMPLE)', '2GB', '30 days', 540),
  ('Airtel', 'Airtel 5GB (SAMPLE)', '5GB', '30 days', 1350),
  ('Airtel', 'Airtel 10GB (SAMPLE)', '10GB', '30 days', 2700),
  ('Glo', 'Glo 1GB (SAMPLE)', '1GB', '30 days', 250),
  ('Glo', 'Glo 2GB (SAMPLE)', '2GB', '30 days', 500),
  ('Glo', 'Glo 5GB (SAMPLE)', '5GB', '30 days', 1250),
  ('Glo', 'Glo 10GB (SAMPLE)', '10GB', '30 days', 2500),
  ('9mobile', '9mobile 500MB (SAMPLE)', '500MB', '30 days', 130),
  ('9mobile', '9mobile 1GB (SAMPLE)', '1GB', '30 days', 240),
  ('9mobile', '9mobile 2GB (SAMPLE)', '2GB', '30 days', 480),
  ('9mobile', '9mobile 5GB (SAMPLE)', '5GB', '30 days', 1200),
  ('MTN', 'MTN 1.5GB Weekly (SAMPLE)', '1.5GB', '7 days', 300),
  ('Airtel', 'Airtel 1.5GB Weekly (SAMPLE)', '1.5GB', '7 days', 290);

insert into public.announcements (message, active)
values ('Instant data delivery 24/7', true);
