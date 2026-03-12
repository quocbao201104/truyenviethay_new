require("dotenv").config();
const app = require("./app");
const port = process.env.PORT || 3000;

require("./config/db");

if (process.env.NODE_ENV !== "test") {
  const { startViewSyncCron } = require("./jobs/viewSyncCronjob");
  startViewSyncCron();
  const { startDailyStatsCron } = require("./jobs/dailyStatsCronjob");
  startDailyStatsCron();
  const { startNotificationCleanupCron } = require("./jobs/notificationCleanupCronjob");
  startNotificationCleanupCron();
  const { startExpireRewardsCron } = require("./jobs/expireRewardsCronjob");
  startExpireRewardsCron();
  const { startExpireInventoryCron } = require("./jobs/expireInventoryCronjob");
  startExpireInventoryCron();
  const { startCleanupHistoryCron } = require("./jobs/cleanupHistoryOrphansCronjob");
  startCleanupHistoryCron();
  const { startReconcileAggregatesCron } = require("./jobs/reconcileAggregatesCronjob");
  startReconcileAggregatesCron();
  const { startNotificationWorker } = require("./services/notification.services");
  startNotificationWorker();
}

const http = require("http");
const server = http.createServer(app);
const { initSocket } = require("./config/socket");
initSocket(server);

server.listen(port, () => {
  if (process.env.NODE_ENV !== "test") {
    require("./utils/logger").info(`Server is running on http://localhost:${port}`);
  }
});
