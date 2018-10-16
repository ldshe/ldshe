export default {
    autosaveDebounce: process.env.LDSHE_AUTOSAVE_DEBOUNCE*1000 || 2000,
    heartbeat: process.env.LDSHE_MUTEX_HEARTBEAT*1000 || 60000,
    takeoverTimeout: process.env.LDSHE_TAKEOVER_TIMEOUT*1000 || 30000,
    editTimeout: process.env.LDSHE_MUTEX_IDLE_TIMEOUT*1000 || 1800000,
    editRemainTime: process.env.LDSHE_MUTEX_IDLE_REMAIN_TIME*1000 || 300000,
    readOnlyTimeout: process.env.LDSHE_READONLY_TIMEOUT*1000 || 1800000,
    maxFileSize: process.env.LDSHE_MAX_FILES_SIZE || 52428800,
}
