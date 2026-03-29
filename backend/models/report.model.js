const db = require("../config/db");

const mapPagination = (page = 1, limit = 20) => {
  const safePage = Math.max(1, Number.parseInt(page, 10) || 1);
  const safeLimit = Math.min(100, Math.max(1, Number.parseInt(limit, 10) || 20));
  return {
    page: safePage,
    limit: safeLimit,
    offset: (safePage - 1) * safeLimit,
  };
};

const buildListWhere = ({ status, targetType, issueType }) => {
  const clauses = [];
  const params = [];

  if (status) {
    clauses.push("r.status = ?");
    params.push(status);
  }

  if (targetType) {
    clauses.push("r.target_type = ?");
    params.push(targetType);
  }

  if (issueType) {
    clauses.push("r.issue_type = ?");
    params.push(issueType);
  }

  return { whereSql: clauses.length ? `WHERE ${clauses.join(" AND ")}` : "", params };
};

const REPORT_SELECT = `
  SELECT
    r.id,
    r.reporter_id,
    r.target_id,
    r.target_type,
    r.issue_type,
    r.description,
    r.status,
    r.admin_note,
    r.resolved_by,
    r.resolved_at,
    r.created_at,
    r.updated_at,
    COALESCE(NULLIF(u.full_name, ''), u.username) AS reporter_name,
    c.truyen_id AS chapter_story_id,
    c.tieu_de AS chapter_title,
    c.so_chuong AS chapter_number,
    cm.truyen_id AS comment_story_id,
    cm.content AS comment_content,
    tn.id AS novel_story_id,
    tn.ten_truyen AS novel_story_title,
    tn.user_id AS novel_author_id,
    ta.id AS audio_story_id,
    ta.ten_truyen AS audio_story_title,
    t_chapter.ten_truyen AS chapter_story_title,
    t_chapter.user_id AS chapter_author_id,
    t_comment.ten_truyen AS comment_story_title
  FROM reports r
  INNER JOIN users_new u ON u.id = r.reporter_id
  LEFT JOIN chuong c
    ON r.target_type = 'chapter'
   AND c.id = r.target_id
  LEFT JOIN truyen_new t_chapter
    ON t_chapter.id = c.truyen_id
  LEFT JOIN comments cm
    ON r.target_type = 'comment'
   AND cm.id = r.target_id
  LEFT JOIN truyen_new t_comment
    ON t_comment.id = cm.truyen_id
  LEFT JOIN truyen_new tn
    ON r.target_type = 'novel'
   AND tn.id = r.target_id
  LEFT JOIN truyen_new ta
    ON r.target_type = 'audio'
   AND ta.id = r.target_id
`;

const normalizeReportRow = (row) => {
  if (!row) return null;

  let target;

  if (row.target_type === "chapter") {
    target = {
        id: row.target_id,
        type: "chapter",
        story_id: row.chapter_story_id,
        story_title: row.chapter_story_title,
        author_id: row.chapter_author_id,
        chapter_title: row.chapter_title,
        chapter_number: row.chapter_number,
      };
  } else if (row.target_type === "comment") {
    target = {
        id: row.target_id,
        type: "comment",
        story_id: row.comment_story_id,
        story_title: row.comment_story_title,
        comment_excerpt: row.comment_content ? String(row.comment_content).slice(0, 180) : null,
      };
  } else if (row.target_type === "novel") {
    target = {
      id: row.target_id,
      type: "novel",
      story_id: row.novel_story_id,
      story_title: row.novel_story_title,
      author_id: row.novel_author_id,
    };
  } else {
    target = {
      id: row.target_id,
      type: "audio",
      story_id: row.audio_story_id,
      story_title: row.audio_story_title,
    };
  }

  return {
    id: row.id,
    reporter_id: row.reporter_id,
    reporter_name: row.reporter_name,
    target_id: row.target_id,
    target_type: row.target_type,
    issue_type: row.issue_type,
    description: row.description,
    status: row.status,
    admin_note: row.admin_note,
    resolved_by: row.resolved_by,
    resolved_at: row.resolved_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
    target,
  };
};

const ReportModel = {
  async createReport({ reporterId, targetId, targetType, issueType, description = null }) {
    const [result] = await db.query(
      `INSERT INTO reports (reporter_id, target_id, target_type, issue_type, description)
       VALUES (?, ?, ?, ?, ?)`,
      [reporterId, targetId, targetType, issueType, description]
    );

    return result.insertId;
  },

  async findRecentDuplicate({ reporterId, targetId, targetType, cooldownMinutes = 10 }) {
    const [rows] = await db.query(
      `SELECT id, created_at
       FROM reports
       WHERE reporter_id = ?
         AND target_id = ?
         AND target_type = ?
         AND created_at >= DATE_SUB(UTC_TIMESTAMP(), INTERVAL ? MINUTE)
       ORDER BY id DESC
       LIMIT 1`,
      [reporterId, targetId, targetType, cooldownMinutes]
    );

    return rows[0] || null;
  },

  async resolveChapterTarget(chapterId) {
    const [rows] = await db.query(
      `SELECT
         c.id AS chapter_id,
         c.truyen_id AS story_id,
         c.tieu_de AS chapter_title,
         c.so_chuong AS chapter_number,
         t.ten_truyen AS story_title,
         t.user_id AS author_id
       FROM chuong c
       INNER JOIN truyen_new t ON t.id = c.truyen_id
       WHERE c.id = ?
         AND (t.is_deleted = 0 OR t.is_deleted IS NULL)
       LIMIT 1`,
      [chapterId]
    );

    return rows[0] || null;
  },

  async resolveCommentTarget(commentId) {
    const [rows] = await db.query(
      `SELECT
         c.id AS comment_id,
         c.truyen_id AS story_id,
         c.user_id AS comment_user_id,
         c.content,
         t.ten_truyen AS story_title
       FROM comments c
       INNER JOIN truyen_new t ON t.id = c.truyen_id
       WHERE c.id = ?
         AND (t.is_deleted = 0 OR t.is_deleted IS NULL)
       LIMIT 1`,
      [commentId]
    );

    return rows[0] || null;
  },

  async resolveNovelTarget(novelId) {
    const [rows] = await db.query(
      `SELECT
         t.id AS story_id,
         t.ten_truyen AS story_title,
         t.user_id AS author_id
       FROM truyen_new t
       WHERE t.id = ?
         AND (t.is_deleted = 0 OR t.is_deleted IS NULL)
       LIMIT 1`,
      [novelId]
    );

    return rows[0] || null;
  },

  async resolveAudioTarget(storyId) {
    const [rows] = await db.query(
      `SELECT
         t.id AS story_id,
         t.ten_truyen AS story_title,
         t.user_id AS author_id,
         t.has_audio
       FROM truyen_new t
       WHERE t.id = ?
         AND (t.is_deleted = 0 OR t.is_deleted IS NULL)
         AND t.has_audio = 1
       LIMIT 1`,
      [storyId]
    );

    return rows[0] || null;
  },

  async getReportById(reportId) {
    const [rows] = await db.query(
      `${REPORT_SELECT}
       WHERE r.id = ?
       LIMIT 1`,
      [reportId]
    );

    return normalizeReportRow(rows[0] || null);
  },

  async getReporterReports({ reporterId, page = 1, limit = 20 }) {
    const pagination = mapPagination(page, limit);
    const [[countRows], [rows]] = await Promise.all([
      db.query(
        `SELECT COUNT(*) AS total
         FROM reports
         WHERE reporter_id = ?`,
        [reporterId]
      ),
      db.query(
        `${REPORT_SELECT}
         WHERE r.reporter_id = ?
         ORDER BY r.id DESC
         LIMIT ? OFFSET ?`,
        [reporterId, pagination.limit, pagination.offset]
      ),
    ]);

    return {
      data: rows.map(normalizeReportRow),
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: countRows[0]?.total || 0,
        total_pages: Math.ceil((countRows[0]?.total || 0) / pagination.limit) || 1,
      },
    };
  },

  async getAdminReports({ page = 1, limit = 20, status = null, targetType = null, issueType = null }) {
    const pagination = mapPagination(page, limit);
    const allowedAdminTypes = ["comment", "novel", "audio"];
    const safeTargetType =
      targetType && !allowedAdminTypes.includes(targetType) ? "__no_match__" : targetType;
    const { whereSql, params } = buildListWhere({ status, targetType: safeTargetType, issueType });
    const adminWhereSql = whereSql
      ? `${whereSql} AND r.target_type IN ('comment', 'novel', 'audio')`
      : "WHERE r.target_type IN ('comment', 'novel', 'audio')";
    const [[countRows], [rows]] = await Promise.all([
      db.query(
        `SELECT COUNT(*) AS total
         FROM reports r
         ${adminWhereSql}`,
        params
      ),
      db.query(
        `${REPORT_SELECT}
         ${adminWhereSql}
         ORDER BY r.id DESC
         LIMIT ? OFFSET ?`,
        [...params, pagination.limit, pagination.offset]
      ),
    ]);

    return {
      data: rows.map(normalizeReportRow),
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: countRows[0]?.total || 0,
        total_pages: Math.ceil((countRows[0]?.total || 0) / pagination.limit) || 1,
      },
    };
  },

  async getAuthorReports({ authorId, page = 1, limit = 20, status = null }) {
    const pagination = mapPagination(page, limit);
    const params = [authorId];
    let statusSql = "";

    if (status) {
      statusSql = " AND r.status = ?";
      params.push(status);
    }

    const [[countRows], [rows]] = await Promise.all([
      db.query(
        `SELECT COUNT(*) AS total
         FROM reports r
         LEFT JOIN chuong c
           ON r.target_type = 'chapter'
          AND c.id = r.target_id
         LEFT JOIN truyen_new t_chapter_owner ON t_chapter_owner.id = c.truyen_id
         LEFT JOIN truyen_new t_novel_owner
           ON r.target_type = 'novel'
          AND t_novel_owner.id = r.target_id
         WHERE (
             (r.target_type = 'chapter' AND t_chapter_owner.user_id = ?)
             OR
             (r.target_type = 'novel' AND t_novel_owner.user_id = ?)
           )${statusSql}`,
        [authorId, authorId, ...params.slice(1)]
      ),
      db.query(
        `${REPORT_SELECT}
         WHERE (
             (r.target_type = 'chapter' AND t_chapter.user_id = ?)
             OR
             (r.target_type = 'novel' AND tn.user_id = ?)
           )${statusSql}
         ORDER BY r.id DESC
         LIMIT ? OFFSET ?`,
        [authorId, authorId, ...params.slice(1), pagination.limit, pagination.offset]
      ),
    ]);

    return {
      data: rows.map(normalizeReportRow),
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: countRows[0]?.total || 0,
        total_pages: Math.ceil((countRows[0]?.total || 0) / pagination.limit) || 1,
      },
    };
  },

  async getAuthorReportById({ reportId, authorId }) {
    const [rows] = await db.query(
      `${REPORT_SELECT}
       WHERE r.id = ?
         AND (
           (r.target_type = 'chapter' AND t_chapter.user_id = ?)
           OR
           (r.target_type = 'novel' AND tn.user_id = ?)
         )
       LIMIT 1`,
      [reportId, authorId, authorId]
    );

    return normalizeReportRow(rows[0] || null);
  },

  async updateReport({ reportId, status, adminNote = null, resolvedBy = null, resolvedAt = null }) {
    await db.query(
      `UPDATE reports
       SET status = ?,
           admin_note = ?,
           resolved_by = ?,
           resolved_at = ?,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [status, adminNote, resolvedBy, resolvedAt, reportId]
    );

    return this.getReportById(reportId);
  },
};

module.exports = ReportModel;
