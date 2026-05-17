import { Router } from 'express';
import { getBlogPostBySlug, getBlogPosts, getFeaturedBlogPosts } from './blog.controller';

const router = Router();

router.get('/', getBlogPosts);
router.get('/featured/list', getFeaturedBlogPosts);
router.get('/:slug', getBlogPostBySlug);

export default router;
