const db = require("../config/db");
const TheLoaiModel = require("./category.model");
const ACTIVE_STORY_CLAUSE = `(tn.is_deleted = 0 OR tn.is_deleted IS NULL)`;
const ACTIVE_STORY_CLAUSE_NO_ALIAS = `(is_deleted = 0 OR is_deleted IS NULL)`;
const { getOrSet, invalidate } = require("../utils/cache");

const STORY_LIST_CACHE_TTL = 600; // 10 phút

const normalizeStatusFilter = (value) => {
  if (value === undefined || value === null) return "";
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, "_")
    .trim();
};

const StoryModel = {
  create: async (storyData) => {
    const [result] = await db.query(
      `INSERT INTO truyen_new (
        ten_truyen, slug, tac_gia, mo_ta, trang_thai, link_nguon, age_rating,
        thoi_gian_tao, thoi_gian_cap_nhat, anh_bia, trang_thai_kiem_duyet, user_id,
        ghi_chu_admin
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        storyData.ten_truyen,
        storyData.slug,
        storyData.tac_gia,
        storyData.mo_ta,
        storyData.trang_thai,
        storyData.link_nguon,
        storyData.age_rating,
        storyData.thoi_gian_tao,
        storyData.thoi_gian_cap_nhat,
        storyData.anh_bia,
        storyData.trang_thai_kiem_duyet,
        storyData.user_id,
        storyData.ghi_chu_admin,
      ]
    );
    return result.insertId;
  },

  getAll: async ({
    page = 1,
    limit = 10,
    trang_thai_kiem_duyet = "",
    keyword = "",
    author_id = null,
    category_id = null,
    sort_by = "thoi_gian_cap_nhat",
    order = "DESC",
  }) => {
    const offset = (page - 1) * limit;
    let query = `
        SELECT tn.*, u.username AS ten_tac_gia
        FROM truyen_new tn
        LEFT JOIN users_new u ON tn.user_id = u.id
    `;
    let countQuery = `
        SELECT COUNT(*) AS total
        FROM truyen_new tn
        LEFT JOIN users_new u ON tn.user_id = u.id
    `;
    const params = [];
    const countParams = [];
    const whereClauses = [ACTIVE_STORY_CLAUSE];

    if (trang_thai_kiem_duyet) {
      whereClauses.push(`tn.trang_thai_kiem_duyet = ?`);
      params.push(trang_thai_kiem_duyet);
      countParams.push(trang_thai_kiem_duyet);
    }

    // OPTIMIZED SEARCH: Use FULLTEXT if keyword length >= 2
    if (keyword && keyword.trim() !== '') {
        const searchText = keyword.trim();
        if (searchText.length >= 2) {
             // Convert "foo bar" -> "+foo +bar" to require ALL terms (AND logic)
             const searchTerms = searchText.split(/\s+/).map(term => `+${term}`).join(' ');
             whereClauses.push(`MATCH(tn.ten_truyen, tn.tac_gia) AGAINST(? IN BOOLEAN MODE)`);
             params.push(searchTerms);
             countParams.push(searchTerms);
        } else {
             // Fallback to LIKE for very short queries
             whereClauses.push(`(tn.ten_truyen LIKE ? OR tn.tac_gia LIKE ?)`);
             params.push(`%${searchText}%`, `%${searchText}%`);
             countParams.push(`%${searchText}%`, `%${searchText}%`);
        }
    }

    if (author_id) {
      whereClauses.push(`tn.user_id = ?`);
      params.push(author_id);
      countParams.push(author_id);
    }

    if (category_id) {
      query = `
            SELECT tn.*, u.username AS ten_tac_gia
            FROM truyen_new tn
            LEFT JOIN users_new u ON tn.user_id = u.id
            INNER JOIN truyen_theloai tt ON tn.id = tt.truyen_id
        `;
      countQuery = `
            SELECT COUNT(DISTINCT tn.id) AS total
            FROM truyen_new tn
            LEFT JOIN users_new u ON tn.user_id = u.id
            INNER JOIN truyen_theloai tt ON tn.id = tt.truyen_id
        `;
      whereClauses.push(`tt.theloai_id = ?`);
      params.push(category_id);
      countParams.push(category_id);
    }

    if (whereClauses.length > 0) {
      query += ` WHERE ` + whereClauses.join(" AND ");
      countQuery += ` WHERE ` + whereClauses.join(" AND ");
    }

    const sortField = ["ten_truyen", "luot_xem", "thoi_gian_cap_nhat", "id"].includes(sort_by)
        ? `tn.${sort_by}`
        : "tn.thoi_gian_cap_nhat";
    const sortOrder = order && order.toUpperCase() === "ASC" ? "ASC" : "DESC";

    query += ` ORDER BY ${sortField} ${sortOrder} LIMIT ? OFFSET ?`;
    params.push(+limit, +offset);

    const [stories] = await db.query(query, params);
    const [countResult] = await db.query(countQuery, countParams);

    return {
      data: stories,
      pagination: {
        total: countResult[0].total,
        current_page: +page,
        total_pages: Math.ceil(countResult[0].total / limit) || 1,
        limit: +limit,
      },
    };
  },

  getById: async (id) => {
    const [rows] = await db.query(
      `SELECT tn.*, tn.so_luong_chuong
       FROM truyen_new tn
       WHERE tn.id = ?
         AND ${ACTIVE_STORY_CLAUSE}`,
      [id]
    );
    return rows[0]; 
  },

  getSampleChapter: async (storyId) => {
    const [rows] = await db.query(
      `SELECT noi_dung_chuong_mau 
       FROM chuong 
       WHERE truyen_id = ? AND is_chuong_mau = 1 
       LIMIT 1`,
      [storyId]
    );
    return rows[0]?.noi_dung_chuong_mau || null;
  },

  getBySlug: async (slug) => {
    const [rows] = await db.query(
      `SELECT tn.*, 
        tn.so_luong_chuong
       FROM truyen_new tn 
       WHERE tn.slug = ?
         AND ${ACTIVE_STORY_CLAUSE}`, 
      [slug]
    );
    return rows[0];
  },

  getAudioPartsByStoryId: async (storyId) => {
    const [rows] = await db.query(
      `SELECT
         ap.id,
         ap.video_id,
         ap.truyen_id,
         ap.part_number,
         ap.audio_url,
         ap.duration_seconds,
         ap.r2_key,
         ap.created_at,
         v.youtube_video_id,
         v.youtube_playlist_id,
         v.title AS video_title,
         v.raw_title AS video_raw_title,
         v.video_index,
         v.duration_seconds AS video_duration_seconds,
         v.process_status,
         v.thumbnail
       FROM audio_parts ap
       INNER JOIN videos v ON v.id = ap.video_id
       WHERE ap.truyen_id = ?
       ORDER BY
         COALESCE(v.video_index, 2147483647) ASC,
         ap.part_number ASC,
         ap.id ASC`,
      [storyId]
    );

    return rows;
  },

  getAudioProgressByUserAndStory: async (userId, storyId) => {
    const [rows] = await db.query(
      `SELECT
         uap.user_id,
         uap.truyen_id,
         uap.last_part_id,
         uap.updated_at,
         ap.part_number,
         ap.audio_url,
         ap.r2_key,
         ap.video_id,
         v.youtube_video_id,
         v.video_index
       FROM user_audio_progress uap
       LEFT JOIN audio_parts ap ON ap.id = uap.last_part_id
       LEFT JOIN videos v ON v.id = ap.video_id
       WHERE uap.user_id = ? AND uap.truyen_id = ?
       LIMIT 1`,
      [userId, storyId]
    );

    return rows[0] || null;
  },

  getAudioPartByIdAndStory: async (partId, storyId) => {
    const [rows] = await db.query(
      `SELECT id, truyen_id, video_id, part_number, audio_url
       FROM audio_parts
       WHERE id = ? AND truyen_id = ?
       LIMIT 1`,
      [partId, storyId]
    );

    return rows[0] || null;
  },

  getPartnerById: async (partnerId) => {
    const [rows] = await db.query(
      `SELECT id, name, youtube_url
       FROM partners
       WHERE id = ?
       LIMIT 1`,
      [partnerId]
    );

    return rows[0] || null;
  },

  saveAudioProgress: async (userId, storyId, lastPartId) => {
    const [updateResult] = await db.query(
      `UPDATE user_audio_progress
       SET last_part_id = ?, updated_at = NOW()
       WHERE user_id = ? AND truyen_id = ?`,
      [lastPartId, userId, storyId]
    );

    if (!updateResult.affectedRows) {
      await db.query(
        `INSERT INTO user_audio_progress (user_id, truyen_id, last_part_id, updated_at)
         VALUES (?, ?, ?, NOW())`,
        [userId, storyId, lastPartId]
      );
    }

    return await StoryModel.getAudioProgressByUserAndStory(userId, storyId);
  },

  getFollowers: async (storyId) => {
    const [followers] = await db.query(
      "SELECT user_id FROM theo_doi WHERE truyen_id = ?",
      [storyId]
    );
    return followers;
  },

  update: async (id, storyData) => {
    const [result] = await db.query(
      `UPDATE truyen_new SET 
        ten_truyen = ?, 
        tac_gia = ?, 
        mo_ta = ?, 
        trang_thai = ?, 
        anh_bia = ?, 
        link_nguon = ?,
        age_rating = ?,
        thoi_gian_cap_nhat = NOW()
      WHERE id = ?`,
      [
        storyData.ten_truyen,
        storyData.tac_gia,
        storyData.mo_ta,
        storyData.trang_thai,
        storyData.anh_bia,
        storyData.link_nguon,
        storyData.age_rating,
        id,
      ]
    );
    return result.affectedRows;
  },
  getPendingApproval: async () => {
    const [rows] = await db.query(
      `SELECT * FROM truyen_new
       WHERE trang_thai_kiem_duyet = 'cho_duyet'
         AND ${ACTIVE_STORY_CLAUSE_NO_ALIAS}`
    );
    return rows;
  },

  getByAuthor: async (userId) => {
    if (!userId || isNaN(userId)) {
      throw new Error("ID người dùng không hợp lệ");
    }
    const [rows] = await db.query(
      `SELECT * FROM truyen_new
       WHERE user_id = ?
         AND ${ACTIVE_STORY_CLAUSE_NO_ALIAS}`,
      [userId]
    );
    return rows;
  },
 delete: async (id) => {
    const [result] = await db.query(
      `UPDATE truyen_new
       SET is_deleted = 1,
           thoi_gian_cap_nhat = NOW()
       WHERE id = ?
         AND ${ACTIVE_STORY_CLAUSE_NO_ALIAS}`,
      [id]
    );
    return result.affectedRows;
},
  addGenresForStory: async (truyenId, theloaiIds) => {
    const values = theloaiIds.map((id) => [truyenId, id]);
    await db.query(
      `INSERT INTO truyen_theloai (truyen_id, theloai_id) VALUES ?`,
      [values]
    );
  },

  /**
   * Invalidate story list caches (hot, topMonthly, latest, new, topRated)
   * Gọi khi story update/approval/ create
   */
  invalidateStoryListCache: async () => {
    await invalidate("hotStories");
    await invalidate("topMonthly");
    await invalidate("topWeekly");
    await invalidate("topDaily");
    await invalidate("storyList");
    await invalidate("storyListAll");
    await invalidate("topRated");
  },

  getPublicStories: async (opts = {}) => {
    const {
      page = 1,
      limit = 20,
      sort_by = "thoi_gian_cap_nhat",
      order = "DESC",
      keyword = "",
      category_ids = null,
      author_id = null,
      trang_thai = "",
      min_views = null,
      max_views = null,
      min_chapters = null,
      max_chapters = null,
      min_days_ago = null,
      has_audio = null,
      require_text_chapters = null,
    } = opts;
    const safePage = Math.max(1, parseInt(page, 10) || 1);
    const safeLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const hasFilters = !!(
      keyword?.trim() ||
      category_ids ||
      author_id ||
      trang_thai ||
      min_views != null ||
      max_views != null ||
      min_chapters != null ||
      max_chapters != null ||
      min_days_ago != null ||
      has_audio != null ||
      require_text_chapters != null
    );
    const cacheable = safePage === 1;
    const cacheKey = cacheable
      ? [
          "storyList",
          `sort=${sort_by}`,
          `order=${order}`,
          `limit=${safeLimit}`,
          `keyword=${keyword || ""}`,
          `categories=${Array.isArray(category_ids) ? category_ids.join(",") : category_ids || ""}`,
          `author=${author_id || ""}`,
          `status=${trang_thai || ""}`,
          `minViews=${min_views ?? ""}`,
          `maxViews=${max_views ?? ""}`,
          `minChapters=${min_chapters ?? ""}`,
          `maxChapters=${max_chapters ?? ""}`,
          `minDays=${min_days_ago ?? ""}`,
          `hasAudio=${has_audio ?? ""}`,
          `requireTextChapters=${require_text_chapters ?? ""}`,
          `filtered=${hasFilters ? "1" : "0"}`,
        ].join(":")
      : null;

    if (cacheKey) {
      const cached = await getOrSet(cacheKey, STORY_LIST_CACHE_TTL, () =>
        StoryModel._getPublicStoriesCore(opts)
      );
      return cached;
    }
    return StoryModel._getPublicStoriesCore(opts);
  },

  _getPublicStoriesCore: async ({
    page = 1,
    limit = 20,
    sort_by = "thoi_gian_cap_nhat",
    order = "DESC",
    keyword = "",
    category_ids = null,
    author_id = null,
    trang_thai = "",
    min_views = null,
    max_views = null,
    min_chapters = null,
    max_chapters = null,
    min_days_ago = null,
    has_audio = null,
    require_text_chapters = null,
  }) => {
    const safePage = Math.max(1, parseInt(page, 10) || 1);
    const safeLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const offset = (safePage - 1) * safeLimit;
    const sortFieldMap = {
      ten_truyen: "tn.ten_truyen",
      luot_xem: "tn.luot_xem",
      thoi_gian_cap_nhat: "tn.thoi_gian_cap_nhat",
      hot_score: "tn.hot_score",
      thoi_gian_tao: "tn.thoi_gian_tao",
      luot_thich: "tn.luot_thich",
      rating: "tn.rating",
      avg_rating: "tn.rating",
    };
    const sortField = sortFieldMap[sort_by] || "tn.thoi_gian_cap_nhat";
    const sortOrder = order.toUpperCase() === "ASC" ? "ASC" : "DESC";
    // Secondary sort for fairness: if sorting by views, secondary sort by update time.
    const secondarySort = ["luot_xem", "hot_score", "luot_thich", "rating", "avg_rating"].includes(sort_by)
      ? ", tn.thoi_gian_cap_nhat DESC"
      : "";

    let selectQuery = `SELECT
                         tn.id,
                         tn.ten_truyen,
                         tn.tac_gia,
                         tn.slug,
                         tn.mo_ta,
                         tn.anh_bia,
                         tn.luot_xem,
                         tn.luot_thich,
                         tn.luot_theo_doi,
                         tn.rating,
                         tn.rating AS avg_rating,
                         tn.rating_count,
                         tn.hot_score,
                         tn.thoi_gian_cap_nhat,
                         tn.trang_thai,
                         tn.so_luong_chuong,
                         tn.so_luong_chuong AS so_chuong,
                         tn.chuong_moi,
                         tn.has_audio,
                         tn.audio_status,
                         tn.source_type,
                         tn.source_partner_id
                       FROM truyen_new tn`;
    
    // Base count query needs to handle WHERE clauses, but HAVING clauses make simple COUNT(*) difficult.
    // We will use a subquery approach for counting total if HAVING is involved, or build dynamically.
    // For simplicity with HAVING, we often do: SELECT COUNT(*) FROM (SELECT tn.id ... HAVING ...) as t
    
    let whereConditions = [
      `tn.trang_thai_kiem_duyet = 'duyet'`,
      ACTIVE_STORY_CLAUSE,
    ];
    let params = [];
    
    // Only add keyword filter if keyword is provided
    if (keyword && keyword.trim() !== '') {
        const searchText = keyword.trim();
        // Use FULLTEXT if possible
        if (searchText.length >= 2) {
            const searchTerms = searchText.split(/\s+/).map(term => `+${term}`).join(' ');
            whereConditions.push(`MATCH(tn.ten_truyen, tn.tac_gia) AGAINST(? IN BOOLEAN MODE)`);
            params.push(searchTerms);
        } else {
             whereConditions.push(`(tn.ten_truyen LIKE ? OR tn.tac_gia LIKE ?)`);
             params.push(`%${searchText}%`, `%${searchText}%`);
        }
    }
    // Filter by Genre (OR logic for multiple genres)
    if (category_ids) {
        // Handle array or string input
        let ids = [];
        if (Array.isArray(category_ids)) {
            ids = category_ids;
        } else if (typeof category_ids === 'string') {
            ids = category_ids.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
        }

        // Thay thế đoạn xử lý category_ids
if (ids.length > 0) {
    const placeholders = ids.map(() => '?').join(',');
    whereConditions.push(`EXISTS (
        SELECT 1 FROM truyen_theloai tt 
        WHERE tt.truyen_id = tn.id AND tt.theloai_id IN (${placeholders})
    )`);
    params.push(...ids);
}
    }

    // Filter by Status
    if (trang_thai) {
        const normalizedStatus = normalizeStatusFilter(trang_thai);
        const statusVariants = {
            dang_ra: ["dang_ra", "Dang ra", "Đang ra"],
            hoan_thanh: ["hoan_thanh", "Hoan thanh", "Hoàn thành"],
        };

        if (statusVariants[normalizedStatus]) {
            const placeholders = statusVariants[normalizedStatus].map(() => "?").join(",");
            whereConditions.push(`tn.trang_thai IN (${placeholders})`);
            params.push(...statusVariants[normalizedStatus]);
        } else {
            whereConditions.push(`tn.trang_thai = ?`);
            params.push(trang_thai);
        }
    }

    // Filter by Author (public)
    if (author_id) {
        const parsedAuthorId = parseInt(author_id, 10);
        if (!isNaN(parsedAuthorId)) {
            whereConditions.push(`tn.author_id = ?`);
            params.push(parsedAuthorId);
        }
    }

    // Filter by Views
    if (min_views !== null && min_views !== undefined && min_views !== "") {
        whereConditions.push(`tn.luot_xem >= ?`);
        params.push(parseInt(min_views));
    }
    if (max_views !== null && max_views !== undefined && max_views !== "") {
        whereConditions.push(`tn.luot_xem <= ?`);
        params.push(parseInt(max_views));
    }

    // Filter by Chapter Count (Optimized: Use WHERE instead of HAVING)
    if (min_chapters !== null && min_chapters !== undefined && min_chapters !== "") {
        whereConditions.push(`tn.so_luong_chuong >= ?`);
        params.push(parseInt(min_chapters));
    }
    if (max_chapters !== null && max_chapters !== undefined && max_chapters !== "") {
        whereConditions.push(`tn.so_luong_chuong <= ?`);
        params.push(parseInt(max_chapters));
    }
    if (min_days_ago !== null && min_days_ago !== undefined && min_days_ago !== "") {
        whereConditions.push(`tn.thoi_gian_tao >= DATE_SUB(NOW(), INTERVAL ? DAY)`);
        params.push(parseInt(min_days_ago));
    }
    if (has_audio !== null && has_audio !== undefined && has_audio !== "") {
        const normalizedHasAudio = String(has_audio).toLowerCase();
        if (["1", "true", "yes"].includes(normalizedHasAudio)) {
            whereConditions.push(`tn.has_audio = 1`);
        } else if (["0", "false", "no"].includes(normalizedHasAudio)) {
            whereConditions.push(`(tn.has_audio = 0 OR tn.has_audio IS NULL)`);
        }
    }
    if (require_text_chapters !== null && require_text_chapters !== undefined && require_text_chapters !== "") {
        const normalizedRequireTextChapters = String(require_text_chapters).toLowerCase();
        if (["1", "true", "yes"].includes(normalizedRequireTextChapters)) {
            whereConditions.push(`tn.so_luong_chuong > 0`);
        }
    }

    const whereClause = `WHERE ${whereConditions.join(" AND ")}`;

    // Main Data Query
    const query = `
       ${selectQuery}
       ${whereClause}
       ORDER BY ${sortField} ${sortOrder}${secondarySort}
       LIMIT ? OFFSET ?
    `;

    // Execute Data Query
    // We need to keep a separate params array for the data query because count query might differ (no offset/limit)
    const dataParams = [...params, safeLimit, offset];
    
    const [data] = await db.query(query, dataParams);
    if (data.length > 0) {
      const genresByStoryId = await TheLoaiModel.getByStoryIds(data.map((story) => story.id));
      for (const story of data) {
        story.genres = genresByStoryId.get(story.id) || [];
      }
    }

    const countQuery = `SELECT COUNT(*) as total FROM truyen_new tn ${whereClause}`;
    const countParams = [...params];
    const [countResult] = await db.query(countQuery, countParams);

    return {
      data,
      pagination: {
        total: countResult[0]?.total || 0,
        current_page: safePage,
        total_pages: Math.ceil((countResult[0]?.total || 0) / safeLimit) || 1,
        limit: safeLimit,
      },
    };
  },

  getTopMonthlyStories: async (limit = 10) => {
    const safeLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
    const cacheKey = `topMonthly:${safeLimit}`;

    const rows = await getOrSet(
      cacheKey,
      1200,
      async () => {
        const [r] = await db.query(
          `SELECT tn.*, tn.user_id, stats.luot_xem_thang
           FROM truyen_new tn
           JOIN (
             SELECT ds.novel_id, SUM(ds.views_count) AS luot_xem_thang
             FROM daily_stats ds
             WHERE ds.date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
             GROUP BY ds.novel_id
           ) stats ON tn.id = stats.novel_id
           WHERE tn.trang_thai_kiem_duyet = 'duyet'
             AND ${ACTIVE_STORY_CLAUSE}
           ORDER BY stats.luot_xem_thang DESC
           LIMIT ?`,
          [safeLimit]
        );
        return r;
      }
    );
    return {
      data: rows,
      pagination: {
        current_page: 1,
        total_pages: rows.length > 0 ? 1 : 0,
        total: rows.length,
        limit: safeLimit,
      },
    };
  },

  getTopWeeklyStories: async (limit = 10) => {
    const safeLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
    const cacheKey = `topWeekly:${safeLimit}`;

    const rows = await getOrSet(
      cacheKey,
      1200,
      async () => {
        const [r] = await db.query(
          `SELECT tn.*, tn.user_id, stats.luot_xem_tuan
           FROM truyen_new tn
           JOIN (
             SELECT ds.novel_id, SUM(ds.views_count) AS luot_xem_tuan
             FROM daily_stats ds
             WHERE ds.date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
             GROUP BY ds.novel_id
           ) stats ON tn.id = stats.novel_id
           WHERE tn.trang_thai_kiem_duyet = 'duyet'
             AND ${ACTIVE_STORY_CLAUSE}
           ORDER BY stats.luot_xem_tuan DESC
           LIMIT ?`,
          [safeLimit]
        );
        return r;
      }
    );
    return {
      data: rows,
      pagination: {
        current_page: 1,
        total_pages: rows.length > 0 ? 1 : 0,
        total: rows.length,
        limit: safeLimit,
      },
    };
  },

  getTopDailyStories: async (limit = 10) => {
    const safeLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
    const cacheKey = `topDaily:${safeLimit}`;

    const rows = await getOrSet(
      cacheKey,
      600,
      async () => {
        const [r] = await db.query(
          `SELECT tn.*, tn.user_id, stats.luot_xem_ngay
           FROM truyen_new tn
           JOIN (
             SELECT ds.novel_id, SUM(ds.views_count) AS luot_xem_ngay
             FROM daily_stats ds
             WHERE ds.date = CURDATE()
             GROUP BY ds.novel_id
           ) stats ON tn.id = stats.novel_id
           WHERE tn.trang_thai_kiem_duyet = 'duyet'
             AND ${ACTIVE_STORY_CLAUSE}
           ORDER BY stats.luot_xem_ngay DESC
           LIMIT ?`,
          [safeLimit]
        );
        return r;
      }
    );
    return {
      data: rows,
      pagination: {
        current_page: 1,
        total_pages: rows.length > 0 ? 1 : 0,
        total: rows.length,
        limit: safeLimit,
      },
    };
  },

  getHotStories: async (limit = 5) => {
    const safeLimit = Math.min(10, Math.max(1, parseInt(limit, 10) || 10));
    const cacheKey = `hotStories:${safeLimit}`;
    const rows = await getOrSet(
      cacheKey,
      600,
      async () => {
        const [r] = await db.query(
          `SELECT id, ten_truyen, slug, anh_bia, tac_gia, user_id, mo_ta,
                  luot_xem, luot_thich, luot_theo_doi, rating, rating_count, hot_score,
                  so_luong_chuong, so_luong_chuong AS so_chuong, chuong_moi
           FROM truyen_new
           WHERE trang_thai_kiem_duyet = 'duyet'
             AND ${ACTIVE_STORY_CLAUSE_NO_ALIAS}
             AND so_luong_chuong > 0
           ORDER BY hot_score DESC
           LIMIT ?`,
          [safeLimit]
        );
        return r;
      }
    );
    return {
      data: rows,
      pagination: {
        current_page: 1,
        total_pages: rows.length > 0 ? 1 : 0,
        total: rows.length,
        limit: safeLimit,
      },
    };
  },
};

module.exports = StoryModel;
