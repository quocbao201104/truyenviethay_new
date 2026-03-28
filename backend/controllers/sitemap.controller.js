const sitemapService = require("../services/sitemap.service");

function sendXml(res, xmlContent) {
  res.set("Content-Type", "application/xml; charset=utf-8");
  res.set("Cache-Control", "public, max-age=300, s-maxage=900");
  res.status(200).send(xmlContent);
}

const getSitemapIndex = async (req, res) => {
  try {
    const siteUrl = sitemapService.resolveSiteUrl();
    const entries = await sitemapService.getSitemapIndexEntries(siteUrl);
    return sendXml(res, sitemapService.renderSitemapIndex(entries));
  } catch (error) {
    console.error("sitemap index error:", error);
    return res.status(500).json({ message: "Khong the tao sitemap index." });
  }
};

const getStaticSitemap = async (req, res) => {
  try {
    const siteUrl = sitemapService.resolveSiteUrl();
    const entries = await sitemapService.getStaticEntries(siteUrl);
    return sendXml(res, sitemapService.renderUrlSet(entries));
  } catch (error) {
    console.error("static sitemap error:", error);
    return res.status(500).json({ message: "Khong the tao sitemap static." });
  }
};

const getStorySitemap = async (req, res) => {
  try {
    const siteUrl = sitemapService.resolveSiteUrl();
    const entries = await sitemapService.getStoryEntries(siteUrl);
    return sendXml(res, sitemapService.renderUrlSet(entries));
  } catch (error) {
    console.error("story sitemap error:", error);
    return res.status(500).json({ message: "Khong the tao sitemap stories." });
  }
};

const getCategorySitemap = async (req, res) => {
  try {
    const siteUrl = sitemapService.resolveSiteUrl();
    const entries = await sitemapService.getCategoryEntries(siteUrl);
    return sendXml(res, sitemapService.renderUrlSet(entries));
  } catch (error) {
    console.error("category sitemap error:", error);
    return res.status(500).json({ message: "Khong the tao sitemap categories." });
  }
};

const getChapterSitemap = async (req, res) => {
  try {
    const page = Number.parseInt(req.params.page, 10);
    if (!Number.isFinite(page) || page < 1) {
      return res.status(400).json({ message: "Trang sitemap chapter khong hop le." });
    }

    const totalPages = await sitemapService.getChapterPageCount();

    if (totalPages === 0 || page > totalPages) {
      // FIX: Trả về sitemap trống (200 OK) thay vì 404 để Google Search Console không báo lỗi "Could not fetch"
      return sendXml(res, sitemapService.renderUrlSet([]));
    }

    const siteUrl = sitemapService.resolveSiteUrl();
    const entries = await sitemapService.getChapterEntries(page, siteUrl);
    return sendXml(res, sitemapService.renderUrlSet(entries));
  } catch (error) {
    console.error("chapter sitemap error:", error);
    return res.status(500).json({ message: "Khong the tao sitemap chapters." });
  }
};

const getAudioSitemap = async (req, res) => {
  try {
    if (!sitemapService.shouldIncludeAudioSitemap()) {
      return res.status(404).json({ message: "Audio sitemap is disabled." });
    }

    const siteUrl = sitemapService.resolveSiteUrl();
    const entries = await sitemapService.getAudioEntries(siteUrl);
    return sendXml(res, sitemapService.renderUrlSet(entries));
  } catch (error) {
    console.error("audio sitemap error:", error);
    return res.status(500).json({ message: "Khong the tao sitemap audio." });
  }
};

module.exports = {
  getSitemapIndex,
  getStaticSitemap,
  getStorySitemap,
  getCategorySitemap,
  getChapterSitemap,
  getAudioSitemap,
};
