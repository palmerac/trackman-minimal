import type { SessionData, SessionSnapshot } from "../models/types";
import type { ArchiveExportFailure, ArchiveExportItem, ArchiveExportJob } from "./archive_export";

const DB_NAME = "trackpull-archive-export";
const DB_VERSION = 1;
const JOB_STORE = "jobs";
const ITEM_STORE = "items";
const SESSION_STORE = "sessions";
const FAILURE_STORE = "failures";
const JOB_INDEX = "jobId";
const ACTIVITY_INDEX = "activityId";
const STATUS_INDEX = "status";

export interface StoredArchiveExportItem extends ArchiveExportItem {
  key: string;
  jobId: string;
  sortIndex: number;
}

export interface StoredArchiveExportSession {
  key: string;
  jobId: string;
  activityId: string;
  reportId: string;
  capturedAt: number;
  snapshot: SessionSnapshot;
}

export interface StoredArchiveExportFailure extends ArchiveExportFailure {
  key: string;
  jobId: string;
  capturedAt: number;
}

export interface ArchiveExportSnapshot {
  job: ArchiveExportJob | null;
  items: StoredArchiveExportItem[];
  sessions: SessionSnapshot[];
  failures: StoredArchiveExportFailure[];
}

function createSnapshot(session: SessionData | SessionSnapshot): SessionSnapshot {
  const { raw_api_data: _rawApiData, ...snapshot } = session as SessionData;
  return snapshot;
}

function openArchiveExportDb(): Promise<IDBDatabase> {
  const { promise, resolve, reject } = Promise.withResolvers<IDBDatabase>();
  const request = indexedDB.open(DB_NAME, DB_VERSION);

  request.onupgradeneeded = () => {
    const db = request.result;

    if (!db.objectStoreNames.contains(JOB_STORE)) {
      db.createObjectStore(JOB_STORE, { keyPath: "id" });
    }

    if (!db.objectStoreNames.contains(ITEM_STORE)) {
      const store = db.createObjectStore(ITEM_STORE, { keyPath: "key" });
      store.createIndex(JOB_INDEX, JOB_INDEX, { unique: false });
      store.createIndex(ACTIVITY_INDEX, ACTIVITY_INDEX, { unique: false });
      store.createIndex(STATUS_INDEX, STATUS_INDEX, { unique: false });
    }

    if (!db.objectStoreNames.contains(SESSION_STORE)) {
      const store = db.createObjectStore(SESSION_STORE, { keyPath: "key" });
      store.createIndex(JOB_INDEX, JOB_INDEX, { unique: false });
      store.createIndex(ACTIVITY_INDEX, ACTIVITY_INDEX, { unique: false });
    }

    if (!db.objectStoreNames.contains(FAILURE_STORE)) {
      const store = db.createObjectStore(FAILURE_STORE, { keyPath: "key" });
      store.createIndex(JOB_INDEX, JOB_INDEX, { unique: false });
      store.createIndex(ACTIVITY_INDEX, ACTIVITY_INDEX, { unique: false });
    }
  };

  request.onsuccess = () => resolve(request.result);
  request.onerror = () => reject(request.error ?? new Error("Could not open archive export store"));
  request.onblocked = () => reject(new Error("Archive export store is blocked by another tab"));
  return promise;
}

function requestToPromise<T>(request: IDBRequest<T>, message: string): Promise<T> {
  const { promise, resolve, reject } = Promise.withResolvers<T>();
  request.onsuccess = () => resolve(request.result);
  request.onerror = () => reject(request.error ?? new Error(message));
  return promise;
}

function transactionDone(tx: IDBTransaction, message: string): Promise<void> {
  const { promise, resolve, reject } = Promise.withResolvers<void>();
  tx.oncomplete = () => resolve();
  tx.onerror = () => reject(tx.error ?? new Error(message));
  tx.onabort = () => reject(tx.error ?? new Error(message));
  return promise;
}

function itemKey(jobId: string, activityId: string): string {
  return `${jobId}:item:${activityId}`;
}

function sessionKey(jobId: string, reportId: string): string {
  return `${jobId}:session:${reportId}`;
}

function failureKey(jobId: string, failure: ArchiveExportFailure, capturedAt: number): string {
  return `${jobId}:failure:${failure.activityId}:${capturedAt}:${failure.kind}:${failure.message}`;
}

function sortStoredItems(items: StoredArchiveExportItem[]): StoredArchiveExportItem[] {
  return items.sort((a, b) => a.sortIndex - b.sortIndex || a.activityId.localeCompare(b.activityId));
}

function sortStoredSessions(sessions: StoredArchiveExportSession[]): StoredArchiveExportSession[] {
  return sessions.sort((a, b) => a.capturedAt - b.capturedAt || a.reportId.localeCompare(b.reportId));
}

function sortStoredFailures(failures: StoredArchiveExportFailure[]): StoredArchiveExportFailure[] {
  return failures.sort((a, b) => a.capturedAt - b.capturedAt || a.activityId.localeCompare(b.activityId));
}

export async function putArchiveExportJob(job: ArchiveExportJob): Promise<void> {
  const db = await openArchiveExportDb();
  try {
    const tx = db.transaction([JOB_STORE, ITEM_STORE], "readwrite");
    tx.objectStore(JOB_STORE).put(job);
    const itemStore = tx.objectStore(ITEM_STORE);
    const existingItemKeys = await requestToPromise(
      itemStore.index(JOB_INDEX).getAllKeys(job.id),
      "Could not load archive export item keys"
    );
    for (const key of existingItemKeys) {
      itemStore.delete(key);
    }

    job.items.forEach((item, sortIndex) => {
      const record: StoredArchiveExportItem = {
        ...item,
        key: itemKey(job.id, item.activityId),
        jobId: job.id,
        sortIndex,
      };
      itemStore.put(record);
    });

    await transactionDone(tx, "Could not save archive export job");
  } finally {
    db.close();
  }
}

export async function getArchiveExportJob(jobId: string): Promise<ArchiveExportJob | null> {
  const db = await openArchiveExportDb();
  try {
    const tx = db.transaction(JOB_STORE, "readonly");
    const job = await requestToPromise(tx.objectStore(JOB_STORE).get(jobId), "Could not load archive export job");
    return (job as ArchiveExportJob | undefined) ?? null;
  } finally {
    db.close();
  }
}

export async function putArchiveExportItem(
  jobId: string,
  item: ArchiveExportItem,
  sortIndex = 0
): Promise<void> {
  const db = await openArchiveExportDb();
  try {
    const tx = db.transaction(ITEM_STORE, "readwrite");
    const record: StoredArchiveExportItem = {
      ...item,
      key: itemKey(jobId, item.activityId),
      jobId,
      sortIndex,
    };
    tx.objectStore(ITEM_STORE).put(record);
    await transactionDone(tx, "Could not save archive export item");
  } finally {
    db.close();
  }
}

export async function getArchiveExportItems(jobId: string): Promise<StoredArchiveExportItem[]> {
  const db = await openArchiveExportDb();
  try {
    const tx = db.transaction(ITEM_STORE, "readonly");
    const records = await requestToPromise(
      tx.objectStore(ITEM_STORE).index(JOB_INDEX).getAll(jobId),
      "Could not load archive export items"
    );
    return sortStoredItems(records as StoredArchiveExportItem[]);
  } finally {
    db.close();
  }
}

export async function putArchiveExportSession(
  jobId: string,
  activityId: string,
  session: SessionData | SessionSnapshot,
  now = Date.now()
): Promise<void> {
  const snapshot = createSnapshot(session);
  const db = await openArchiveExportDb();
  try {
    const tx = db.transaction(SESSION_STORE, "readwrite");
    const record: StoredArchiveExportSession = {
      key: sessionKey(jobId, snapshot.report_id),
      jobId,
      activityId,
      reportId: snapshot.report_id,
      capturedAt: now,
      snapshot,
    };
    tx.objectStore(SESSION_STORE).put(record);
    await transactionDone(tx, "Could not save archive export session");
  } finally {
    db.close();
  }
}

export async function getArchiveExportSessions(jobId: string): Promise<SessionSnapshot[]> {
  const db = await openArchiveExportDb();
  try {
    const tx = db.transaction(SESSION_STORE, "readonly");
    const records = await requestToPromise(
      tx.objectStore(SESSION_STORE).index(JOB_INDEX).getAll(jobId),
      "Could not load archive export sessions"
    );
    return sortStoredSessions(records as StoredArchiveExportSession[]).map((record) => record.snapshot);
  } finally {
    db.close();
  }
}

export async function putArchiveExportFailure(
  jobId: string,
  failure: ArchiveExportFailure,
  now = Date.now()
): Promise<void> {
  const capturedAt = failure.capturedAt ?? now;
  const db = await openArchiveExportDb();
  try {
    const tx = db.transaction(FAILURE_STORE, "readwrite");
    const record: StoredArchiveExportFailure = {
      ...failure,
      key: failureKey(jobId, failure, capturedAt),
      jobId,
      capturedAt,
    };
    tx.objectStore(FAILURE_STORE).put(record);
    await transactionDone(tx, "Could not save archive export failure");
  } finally {
    db.close();
  }
}

export async function getArchiveExportFailures(jobId: string): Promise<StoredArchiveExportFailure[]> {
  const db = await openArchiveExportDb();
  try {
    const tx = db.transaction(FAILURE_STORE, "readonly");
    const records = await requestToPromise(
      tx.objectStore(FAILURE_STORE).index(JOB_INDEX).getAll(jobId),
      "Could not load archive export failures"
    );
    return sortStoredFailures(records as StoredArchiveExportFailure[]);
  } finally {
    db.close();
  }
}

export async function getArchiveExportSnapshot(jobId: string): Promise<ArchiveExportSnapshot> {
  const [job, items, sessions, failures] = await Promise.all([
    getArchiveExportJob(jobId),
    getArchiveExportItems(jobId),
    getArchiveExportSessions(jobId),
    getArchiveExportFailures(jobId),
  ]);

  return { job, items, sessions, failures };
}

async function deleteByJobId(db: IDBDatabase, storeName: string, jobId: string): Promise<void> {
  const tx = db.transaction(storeName, "readwrite");
  const store = tx.objectStore(storeName);
  const keys = await requestToPromise(
    store.index(JOB_INDEX).getAllKeys(jobId),
    `Could not load archive export ${storeName} keys`
  );
  for (const key of keys) {
    store.delete(key);
  }
  await transactionDone(tx, `Could not clear archive export ${storeName}`);
}

export async function clearArchiveExportJob(jobId: string): Promise<void> {
  const db = await openArchiveExportDb();
  try {
    const tx = db.transaction(JOB_STORE, "readwrite");
    tx.objectStore(JOB_STORE).delete(jobId);
    await transactionDone(tx, "Could not clear archive export job");

    await Promise.all([
      deleteByJobId(db, ITEM_STORE, jobId),
      deleteByJobId(db, SESSION_STORE, jobId),
      deleteByJobId(db, FAILURE_STORE, jobId),
    ]);
  } finally {
    db.close();
  }
}

export function clearAllArchiveExports(): Promise<void> {
  const { promise, resolve, reject } = Promise.withResolvers<void>();
  const request = indexedDB.deleteDatabase(DB_NAME);
  request.onsuccess = () => resolve();
  request.onerror = () => reject(request.error ?? new Error("Could not clear archive export store"));
  request.onblocked = () => reject(new Error("Could not clear archive export store while it is in use"));
  return promise;
}
