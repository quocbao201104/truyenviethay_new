require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const mysql = require("mysql2/promise");

const assertPreflight = async (conn) => {
  const [[nullRow]] = await conn.query(
    "SELECT COUNT(*) AS null_key_rows FROM user_audio_progress WHERE user_id IS NULL OR truyen_id IS NULL",
  );
  const [dupRows] = await conn.query(
    "SELECT user_id, truyen_id, COUNT(*) AS duplicate_count FROM user_audio_progress WHERE user_id IS NOT NULL AND truyen_id IS NOT NULL GROUP BY user_id, truyen_id HAVING COUNT(*) > 1 LIMIT 20",
  );

  if (Number(nullRow.null_key_rows) > 0 || dupRows.length > 0) {
    throw new Error("Preflight failed: duplicate or NULL user_audio_progress keys exist");
  }
};

const hasEquivalentUniqueProgressIndex = async (conn) => {
  const [[row]] = await conn.query(`
    SELECT COUNT(*) AS matches
    FROM (
      SELECT index_name
      FROM information_schema.statistics
      WHERE table_schema = DATABASE()
        AND table_name = 'user_audio_progress'
      GROUP BY index_name, non_unique
      HAVING GROUP_CONCAT(column_name ORDER BY seq_in_index SEPARATOR ',') = 'user_id,truyen_id'
         AND MIN(non_unique) = 0
    ) matching_indexes
  `);

  return Number(row.matches) > 0;
};

const hasEquivalentAudioPartsIndex = async (conn) => {
  const [[row]] = await conn.query(`
    SELECT COUNT(*) AS matches
    FROM (
      SELECT index_name
      FROM information_schema.statistics
      WHERE table_schema = DATABASE()
        AND table_name = 'audio_parts'
      GROUP BY index_name
      HAVING GROUP_CONCAT(column_name ORDER BY seq_in_index SEPARATOR ',') = 'truyen_id,video_id,part_number,id'
    ) matching_indexes
  `);

  return Number(row.matches) > 0;
};

const hasTrigger = async (conn, triggerName) => {
  const [[row]] = await conn.query(
    "SELECT COUNT(*) AS matches FROM information_schema.triggers WHERE trigger_schema = DATABASE() AND event_object_table = 'user_audio_progress' AND trigger_name = ?",
    [triggerName],
  );

  return Number(row.matches) > 0;
};

const progressKeysAreSchemaGuarded = async (conn) => {
  const [rows] = await conn.query(`
    SELECT column_name, is_nullable
    FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = 'user_audio_progress'
      AND column_name IN ('user_id', 'truyen_id')
  `);

  return (
    rows.length === 2 &&
    rows.every((row) => String(row.is_nullable ?? row.IS_NULLABLE).toUpperCase() === "NO")
  );
};

const run = async () => {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    await assertPreflight(conn);

    if (!(await hasEquivalentUniqueProgressIndex(conn))) {
      await conn.query(
        "ALTER TABLE user_audio_progress ADD UNIQUE INDEX uk_user_audio_progress_user_truyen (user_id, truyen_id)",
      );
    }

    if (!(await hasEquivalentAudioPartsIndex(conn))) {
      await conn.query(
        "CREATE INDEX idx_audio_parts_truyen_video_part ON audio_parts (truyen_id, video_id, part_number, id)",
      );
    }

    const schemaGuardsProgressKeys = await progressKeysAreSchemaGuarded(conn);

    if (!schemaGuardsProgressKeys && !(await hasTrigger(conn, "bi_user_audio_progress_require_keys"))) {
      await conn.query(`
        CREATE TRIGGER bi_user_audio_progress_require_keys
        BEFORE INSERT ON user_audio_progress
        FOR EACH ROW
        BEGIN
          IF NEW.user_id IS NULL OR NEW.truyen_id IS NULL THEN
            SIGNAL SQLSTATE '45000'
              SET MESSAGE_TEXT = 'user_audio_progress requires non-null user_id and truyen_id';
          END IF;
        END
      `);
    }

    if (!schemaGuardsProgressKeys && !(await hasTrigger(conn, "bu_user_audio_progress_require_keys"))) {
      await conn.query(`
        CREATE TRIGGER bu_user_audio_progress_require_keys
        BEFORE UPDATE ON user_audio_progress
        FOR EACH ROW
        BEGIN
          IF NEW.user_id IS NULL OR NEW.truyen_id IS NULL THEN
            SIGNAL SQLSTATE '45000'
              SET MESSAGE_TEXT = 'user_audio_progress requires non-null user_id and truyen_id';
          END IF;
        END
      `);
    }

    console.log(
      JSON.stringify(
        {
          migration: "30_audio_backend_performance_and_integrity",
          status: "applied",
          uniqueIndexPresent: true,
          audioPartsIndexPresent: true,
          progressKeyProtection: schemaGuardsProgressKeys ? "schema_not_null" : "triggers",
          insertTriggerPresent: schemaGuardsProgressKeys
            ? await hasTrigger(conn, "bi_user_audio_progress_require_keys")
            : true,
          updateTriggerPresent: schemaGuardsProgressKeys
            ? await hasTrigger(conn, "bu_user_audio_progress_require_keys")
            : true,
        },
        null,
        2,
      ),
    );
  } finally {
    await conn.end();
  }
};

run().catch((error) => {
  console.error(error.stack || error);
  process.exit(1);
});
