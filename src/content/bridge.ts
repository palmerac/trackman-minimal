/**
 * Bridge content script (ISOLATED world).
 * Listens for postMessage from the MAIN world interceptor and forwards
 * session data to the service worker via chrome.runtime.sendMessage.
 */

import {
  RUNTIME_MESSAGE_TYPES,
  isAllowedReportOrigin,
  isTrackmanShotDataWindowMessage,
} from "../shared/runtime_messages";

window.addEventListener("message", (event: MessageEvent) => {
  if (event.source !== window) return;
  if (!isAllowedReportOrigin(event.origin)) return;
  if (!isTrackmanShotDataWindowMessage(event.data)) return;

  console.log("TrackPull bridge: forwarding shot data to service worker");

  chrome.runtime.sendMessage(
    { type: RUNTIME_MESSAGE_TYPES.SAVE_DATA, data: event.data.data },
    (response) => {
      if (chrome.runtime.lastError) {
        console.error("TrackPull bridge: sendMessage failed:", chrome.runtime.lastError.message);
      } else {
        console.log("TrackPull bridge: data saved", response);
      }
    }
  );
});

console.log("TrackPull: bridge content script loaded");
