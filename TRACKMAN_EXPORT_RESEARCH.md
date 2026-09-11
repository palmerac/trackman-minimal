# Trackman Export Research

## Summary

TrackPull already captures useful launch-monitor data, but the live Trackman
portal exposes additional session types and shot fields that can expand the
CSV export considerably.

Research was performed against the signed-in Trackman Player Portal and its
currently deployed client GraphQL schema. No custom requests were sent and no
Trackman account data was changed.

## What the portal currently exposes

The Player Portal activity list contains Virtual Range, Shot Analysis, Course
Play, Combine, and other activity types. The Portal UI itself only displays
summary information for several practice activities and directs users to the
Trackman Golf app for details.

However, the GraphQL schema exposes both `strokes` and
`aggregatedMeasurement` for:

- `SessionActivity`
- `VirtualRangeSessionActivity`
- `ShotAnalysisSessionActivity`
- `CombineTestActivity`

This makes Virtual Range and Shot Analysis the best next import targets.

## Existing fields missing from the portal import

The extension's CSV catalog already supports these fields, but the main portal
import query does not request them:

- `side`
- `curve`
- `lowPointDistance`
- `impactHeight`
- `impactOffset`
- `tempo`

The base portal query is in `src/shared/import_types.ts` as
`STROKE_MEASUREMENT_FIELDS`. Because a successful base query stops the fallback
search, these fields can be absent even though the CSV writer supports them.

## Normalized measurements

The portal schema exposes both `measurement` and `normalizedMeasurement` for a
stroke. TrackPull currently requests only `measurement`.

This is a meaningful gap:

- Normalized values are usually the preferred source for player-facing launch
  monitor analysis.
- The parser recognizes `NormalizedMeasurement` but not the portal GraphQL
  field name `normalizedMeasurement`.

The importer should request both values, prefer normalized values when present,
and support the lower-camel-case GraphQL field name.

## Candidate extended launch-monitor fields

These fields are exposed by the live schema and are suitable for an optional
"Extended launch-monitor metrics" CSV profile after validation against real
sessions.

### Swing and club delivery

- `dynamicLie`
- `dPlaneTilt`
- `swingPlane`
- `swingRadius`
- `strokeLength`
- `backswingTime`
- `forwardswingTime`

### Strike and ball flight

- `lowPointHeight`
- `lowPointSide`
- `landingHeight`
- `lastData`
- `entrySpeedDistance`
- `speedDrop`
- `ballSpeedDifference`
- `spinRateDifference`
- `spinAxisActual`

### Actual versus modeled outcomes

- `carryActual`
- `totalActual`
- `carrySideActual`
- `totalSideActual`
- `curveActual`
- `landingAngleActual`

### Per-shot context

- `targetDistance`
- shot `time`
- shot `tags`
- detected club category
- club metadata: name, loft, lie

## Course and putting fields

The schema also exposes fields that should be exported in a separate
course/putting profile rather than mixed into normal range-shot CSVs:

- `bounces`
- `break`
- `effectiveStimp`
- `flatStimp`
- `rollDeceleration`
- `rollPercentage`
- `rollSpeed`
- `skidDistance`
- `slopePercentageRise`
- `slopePercentageSide`
- `elevation`
- distance-to-pin fields

## Recommended implementation order

1. Add the six already-supported fields missing from the portal query.
2. Request and parse `normalizedMeasurement`, preferring it over raw values.
3. Add Virtual Range and Shot Analysis to the portal activity discovery query.
4. Add an opt-in extended-metrics CSV profile with documented names and units.
5. Validate each new field against known exported sessions before making it a
   default CSV column.

## Relevant code

- `src/shared/import_types.ts` — portal activity and stroke queries
- `src/shared/portal_parser.ts` — GraphQL response parsing
- `src/shared/metric_catalog.ts` — CSV names, field aliases, and units
- `src/content/interceptor.ts` — report-page capture filter
- `src/shared/csv_writer.ts` — CSV column generation
