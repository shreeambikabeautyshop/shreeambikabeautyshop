-- Update blog posts with relevant cover images from Cloudinary
-- Run this in Supabase SQL Editor

UPDATE blog_posts SET cover_image = 'https://res.cloudinary.com/zjlchjal/image/upload/v1784047036/slider-1_orhz8e.png'
WHERE slug = 'how-to-choose-lipstick';

UPDATE blog_posts SET cover_image = 'https://res.cloudinary.com/zjlchjal/image/upload/v1784047036/slider-2_rtcjzp.png'
WHERE slug = 'how-to-select-foundation';

UPDATE blog_posts SET cover_image = 'https://res.cloudinary.com/zjlchjal/image/upload/v1784047036/slider-3_gqqquq.png'
WHERE slug = 'how-to-choose-hair-colour';

UPDATE blog_posts SET cover_image = 'https://res.cloudinary.com/zjlchjal/image/upload/v1784225462/beauty_myth_vs_truth_vrngh7.png'
WHERE slug = 'how-to-buy-skincare-products';

UPDATE blog_posts SET cover_image = 'https://res.cloudinary.com/zjlchjal/image/upload/v1784225477/why-every-women-choose_vht46h.png'
WHERE slug = 'how-to-spot-original-products';

UPDATE blog_posts SET cover_image = 'https://res.cloudinary.com/zjlchjal/image/upload/v1784221445/wedding_ro6df3.png'
WHERE slug = 'how-to-build-beauty-kit';

UPDATE blog_posts SET cover_image = 'https://res.cloudinary.com/zjlchjal/image/upload/v1784221435/daily_use_csbkl7.png'
WHERE slug = 'best-skincare-routine-mumbai';

UPDATE blog_posts SET cover_image = 'https://res.cloudinary.com/zjlchjal/image/upload/v1784471137/today-beauty-tips_tkzbog.png'
WHERE slug = 'hair-care-tips-indian-women';

UPDATE blog_posts SET cover_image = 'https://res.cloudinary.com/zjlchjal/image/upload/v1784221436/party_feyaq1.png'
WHERE slug = 'makeup-for-beginners';

UPDATE blog_posts SET cover_image = 'https://res.cloudinary.com/zjlchjal/image/upload/v1784221437/festival_vh2wqu.png'
WHERE slug = 'perfume-guide-how-to-choose';
