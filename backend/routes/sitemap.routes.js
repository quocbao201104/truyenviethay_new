const express = require("express");
const router = express.Router();
const sitemapController = require("../controllers/sitemap.controller");

router.get("/sitemap.xml", sitemapController.getSitemapIndex);
router.get("/sitemaps/static.xml", sitemapController.getStaticSitemap);
router.get("/sitemaps/stories.xml", sitemapController.getStorySitemap);
router.get("/sitemaps/categories.xml", sitemapController.getCategorySitemap);
router.get("/sitemaps/chapters-:page.xml", sitemapController.getChapterSitemap);
router.get("/sitemaps/audio.xml", sitemapController.getAudioSitemap);

module.exports = router;
