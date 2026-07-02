"use strict";
(() => {
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __esm = (fn, res, err) => function __init() {
    if (err) throw err[0];
    try {
      return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
    } catch (e) {
      throw err = [e], e;
    }
  };
  var __commonJS = (cb, mod) => function __require() {
    try {
      return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
    } catch (e) {
      throw mod = 0, e;
    }
  };

  // src/shared/runtime_messages.ts
  var REPORT_PAGE_ORIGIN, WINDOW_MESSAGE_SOURCES, WINDOW_MESSAGE_TYPES;
  var init_runtime_messages = __esm({
    "src/shared/runtime_messages.ts"() {
      "use strict";
      REPORT_PAGE_ORIGIN = "https://web-dynamic-reports.trackmangolf.com";
      WINDOW_MESSAGE_SOURCES = {
        REPORT_INTERCEPTOR: "trackpull-interceptor"
      };
      WINDOW_MESSAGE_TYPES = {
        TRACKMAN_SHOT_DATA: "TRACKMAN_SHOT_DATA"
      };
    }
  });

  // src/shared/report_url.ts
  function classifyReportUrlType(sourceUrl) {
    const parsedUrl = typeof sourceUrl === "string" ? new URL(sourceUrl, REPORT_PAGE_ORIGIN) : sourceUrl;
    return parsedUrl.searchParams.has("a") ? "activity" : "report";
  }
  var init_report_url = __esm({
    "src/shared/report_url.ts"() {
      "use strict";
      init_runtime_messages();
    }
  });

  // src/shared/metric_catalog.ts
  function isKnownReportMetric(metric) {
    return metric in METRIC_DISPLAY_NAMES;
  }
  var METRIC_DISPLAY_NAMES;
  var init_metric_catalog = __esm({
    "src/shared/metric_catalog.ts"() {
      "use strict";
      METRIC_DISPLAY_NAMES = {
        ClubSpeed: "Club Speed",
        BallSpeed: "Ball Speed",
        SmashFactor: "Smash Factor",
        AttackAngle: "Attack Angle",
        ClubPath: "Club Path",
        FaceAngle: "Face Angle",
        FaceToPath: "Face To Path",
        SwingDirection: "Swing Direction",
        DynamicLoft: "Dynamic Loft",
        SpinRate: "Spin Rate",
        SpinAxis: "Spin Axis",
        SpinLoft: "Spin Loft",
        LaunchAngle: "Launch Angle",
        LaunchDirection: "Launch Direction",
        Carry: "Carry",
        Total: "Total",
        Side: "Side",
        SideTotal: "Side Total",
        CarrySide: "Carry Side",
        TotalSide: "Total Side",
        Height: "Height",
        MaxHeight: "Max Height",
        Curve: "Curve",
        LandingAngle: "Landing Angle",
        HangTime: "Hang Time",
        LowPointDistance: "Low Point",
        ImpactHeight: "Impact Height",
        ImpactOffset: "Impact Offset",
        Tempo: "Tempo"
      };
    }
  });

  // src/content/interceptor.ts
  var require_interceptor = __commonJS({
    "src/content/interceptor.ts"() {
      init_runtime_messages();
      init_report_url();
      init_metric_catalog();
      function containsStrokegroups(data) {
        if (!data || typeof data !== "object") return false;
        const obj = data;
        if ("StrokeGroups" in obj && Array.isArray(obj["StrokeGroups"]) && obj["StrokeGroups"].length > 0) {
          return true;
        }
        try {
          const text = JSON.stringify(obj).toLowerCase();
          const indicators = [
            "ballspeed",
            "clubspeed",
            "carry",
            "spinrate",
            "strokegroups",
            "strokes",
            "measurement"
          ];
          return indicators.filter((ind) => text.includes(ind)).length >= 3;
        } catch {
          return false;
        }
      }
      function tryParseJson(text) {
        try {
          return JSON.parse(text);
        } catch {
          return null;
        }
      }
      function parseSessionData(data, sourceUrl) {
        try {
          if (!("StrokeGroups" in data)) return null;
          const strokeGroups = data["StrokeGroups"];
          if (!Array.isArray(strokeGroups) || strokeGroups.length === 0) return null;
          let parsedUrl;
          try {
            parsedUrl = new URL(sourceUrl);
          } catch {
            parsedUrl = new URL("https://web-dynamic-reports.trackmangolf.com/");
          }
          let dateStr = "Unknown";
          const timeInfo = data["Time"];
          if (timeInfo && typeof timeInfo.Date !== "undefined") {
            dateStr = String(timeInfo.Date);
          } else if (typeof strokeGroups[0] === "object" && strokeGroups[0]) {
            if (typeof strokeGroups[0].Date !== "undefined") {
              dateStr = String(strokeGroups[0].Date);
            }
          }
          const reportId = parsedUrl.searchParams.get("r") || parsedUrl.searchParams.get("a") || parsedUrl.searchParams.get("ReportId") || "unknown";
          const session = {
            date: dateStr,
            report_id: reportId,
            url_type: classifyReportUrlType(parsedUrl),
            club_groups: [],
            metric_names: [],
            metadata_params: {}
          };
          for (const [key, value] of parsedUrl.searchParams) {
            session.metadata_params[key] = value;
          }
          const allMetricNames = /* @__PURE__ */ new Set();
          for (const group of strokeGroups) {
            if (!group || typeof group !== "object") continue;
            const clubName = String(group["Club"] || "Unknown");
            const shots = [];
            const strokes = group["Strokes"];
            if (Array.isArray(strokes)) {
              for (let i = 0; i < strokes.length; i++) {
                const stroke = strokes[i];
                if (!stroke || typeof stroke !== "object") continue;
                const normalized = stroke["NormalizedMeasurement"] || {};
                const raw = stroke["Measurement"] || {};
                const merged = { ...raw, ...normalized };
                const shotMetrics = {};
                for (const [key, value] of Object.entries(merged)) {
                  if (!isKnownReportMetric(key)) continue;
                  let numValue = null;
                  if (typeof value === "number") {
                    numValue = value;
                  } else if (typeof value === "string") {
                    const trimmed = value.trim();
                    numValue = isNaN(parseFloat(trimmed)) ? null : parseFloat(trimmed);
                  }
                  if (numValue !== null) {
                    allMetricNames.add(key);
                    shotMetrics[key] = `${numValue}`;
                  }
                }
                if (Object.keys(shotMetrics).length > 0) {
                  shots.push({ shot_number: i, metrics: shotMetrics });
                }
              }
            }
            if (shots.length > 0) {
              session.club_groups.push({
                club_name: clubName,
                shots,
                averages: {},
                consistency: {}
              });
            }
          }
          session.metric_names = Array.from(allMetricNames).sort();
          return session.club_groups.length > 0 ? session : null;
        } catch (error) {
          console.error("TrackPull: Parsing failed:", error);
          return null;
        }
      }
      function scrapeGroupTags() {
        const tags = [];
        const elements = document.querySelectorAll(".group-tag");
        for (const el of Array.from(elements)) {
          const text = el.innerText?.trim() || el.textContent?.trim() || "";
          tags.push(text);
        }
        return tags;
      }
      function applyGroupTags(session, tags) {
        for (let i = 0; i < session.club_groups.length && i < tags.length; i++) {
          const tag = tags[i];
          if (!tag) continue;
          for (const shot of session.club_groups[i].shots) {
            shot.tag = tag;
          }
        }
      }
      function postSession(session) {
        window.postMessage(
          {
            type: WINDOW_MESSAGE_TYPES.TRACKMAN_SHOT_DATA,
            source: WINDOW_MESSAGE_SOURCES.REPORT_INTERCEPTOR,
            data: session
          },
          window.location.origin
        );
        const totalShots = session.club_groups.reduce((n, g) => n + g.shots.length, 0);
        const taggedShots = session.club_groups.reduce(
          (n, g) => n + g.shots.filter((s) => s.tag).length,
          0
        );
        console.log("TrackPull: SessionData posted to bridge", {
          clubs: session.club_groups.length,
          metrics: session.metric_names.length,
          shots: totalShots,
          tagged: taggedShots
        });
      }
      function waitForTagsThenPost(session) {
        const MAX_WAIT = 8e3;
        const POLL_INTERVAL = 300;
        const expectedCount = session.club_groups.length;
        let elapsed = 0;
        function attempt() {
          const tags = scrapeGroupTags();
          if (tags.length >= expectedCount || elapsed >= MAX_WAIT) {
            if (tags.length > 0) {
              applyGroupTags(session, tags);
              console.log("TrackPull: Applied DOM group tags:", tags);
            } else {
              console.log("TrackPull: No .group-tag elements found in DOM, posting without tags");
            }
            postSession(session);
            return;
          }
          elapsed += POLL_INTERVAL;
          setTimeout(attempt, POLL_INTERVAL);
        }
        attempt();
      }
      function handleCapturedJson(body, url) {
        if (!containsStrokegroups(body)) return;
        console.log("TrackPull: Shot data detected in:", url);
        const data = body;
        const session = parseSessionData(data, url);
        if (session) {
          waitForTagsThenPost(session);
        }
      }
      (function() {
        const originalFetch = window.fetch;
        window.fetch = async function(...args) {
          const response = await originalFetch.apply(this, args);
          try {
            const clone = response.clone();
            clone.text().then((text) => {
              const body = tryParseJson(text);
              if (body !== null) handleCapturedJson(body, response.url);
            }).catch(() => {
            });
          } catch {
          }
          return response;
        };
        const XHRProto = XMLHttpRequest.prototype;
        const originalOpen = XHRProto.open;
        const originalSend = XHRProto.send;
        XHRProto.open = function(method, url, ...rest) {
          this.__trackman_url = String(url);
          return originalOpen.apply(this, [method, url, ...rest]);
        };
        XHRProto.send = function(...args) {
          this.addEventListener("load", function() {
            try {
              const text = this.responseText;
              if (!text) return;
              const body = tryParseJson(text);
              if (body !== null) {
                const url = this.__trackman_url || this.responseURL || "";
                handleCapturedJson(body, url);
              }
            } catch {
            }
          });
          return originalSend.apply(this, args);
        };
        console.log("TrackPull: fetch interceptor active");
        console.log("TrackPull: XHR interceptor active");
      })();
    }
  });
  require_interceptor();
})();
