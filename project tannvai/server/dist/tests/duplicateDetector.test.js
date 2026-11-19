"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const duplicateDetector_js_1 = require("../services/duplicateDetector.js");
(0, vitest_1.describe)('Duplicate Detector Service', () => {
    (0, vitest_1.it)('correctly calculates Haversine distance between coordinates', () => {
        // Distance between two points in San Francisco (~68 meters apart)
        const lat1 = 37.7749;
        const lon1 = -122.4194;
        const lat2 = 37.7753;
        const lon2 = -122.4188;
        const distance = (0, duplicateDetector_js_1.calculateHaversineDistance)(lat1, lon1, lat2, lon2);
        (0, vitest_1.expect)(distance).toBeGreaterThan(50);
        (0, vitest_1.expect)(distance).toBeLessThan(90);
    });
    (0, vitest_1.it)('filters stop words and extracts meaningful lowercase tokens', () => {
        const text = 'The flash flood is rising under the bridge at Maple Ave!';
        const tokens = (0, duplicateDetector_js_1.tokenizeText)(text);
        (0, vitest_1.expect)(tokens.has('flash')).toBe(true);
        (0, vitest_1.expect)(tokens.has('flood')).toBe(true);
        (0, vitest_1.expect)(tokens.has('bridge')).toBe(true);
        (0, vitest_1.expect)(tokens.has('maple')).toBe(true);
        // Stop words should be removed
        (0, vitest_1.expect)(tokens.has('the')).toBe(false);
        (0, vitest_1.expect)(tokens.has('is')).toBe(false);
        (0, vitest_1.expect)(tokens.has('at')).toBe(false);
    });
    (0, vitest_1.it)('computes Jaccard similarity and overlapping tokens', () => {
        const text1 = 'Severe water flooding under railroad underpass on Maple';
        const text2 = 'Deep flood water under railroad bridge Maple Avenue';
        const result = (0, duplicateDetector_js_1.calculateTextSimilarity)(text1, text2);
        (0, vitest_1.expect)(result.jaccard).toBeGreaterThan(0.3);
        (0, vitest_1.expect)(result.overlappingTokens).toContain('water');
        (0, vitest_1.expect)(result.overlappingTokens).toContain('railroad');
        (0, vitest_1.expect)(result.overlappingTokens).toContain('maple');
    });
    (0, vitest_1.it)('detects a high-probability duplicate with explainable rationale for co-located flood reports', () => {
        const now = new Date();
        const report1 = {
            id: 'rep-1',
            title: 'Flash flood at Maple underpass',
            rawDescription: 'Severe water rising under railroad overpass. Two cars trapped with people on roof.',
            category: 'FLOOD',
            latitude: 37.7749,
            longitude: -122.4194,
            createdAt: new Date(now.getTime() - 25 * 60 * 1000), // 25 min ago
        };
        const report2 = {
            id: 'rep-2',
            title: 'Deep water at train bridge 5th & Maple',
            rawDescription: 'Avoid Maple! Railroad bridge is completely flooded. Two trapped cars, motorists on roof waiting for rescue.',
            category: 'FLOOD',
            latitude: 37.7753,
            longitude: -122.4189,
            createdAt: now,
        };
        const match = (0, duplicateDetector_js_1.evaluateDuplicateMatch)(report2, report1);
        (0, vitest_1.expect)(match.isMatch).toBe(true);
        (0, vitest_1.expect)(match.similarityScore).toBeGreaterThanOrEqual(0.65);
        (0, vitest_1.expect)(match.distanceMeters).toBeLessThan(100);
        (0, vitest_1.expect)(match.matchRationale).toMatch(/flood/i);
        (0, vitest_1.expect)(match.matchRationale).toContain('Requires authorized reviewer confirmation');
    });
    (0, vitest_1.it)('rejects duplicate match for disparate locations and categories', () => {
        const now = new Date();
        const report1 = {
            id: 'rep-1',
            title: 'Downed power line on Oak Ridge',
            rawDescription: 'Sparking high-voltage line across southbound lane',
            category: 'UTILITY_OUTAGE',
            latitude: 37.7833,
            longitude: -122.4167,
            createdAt: now,
        };
        const report2 = {
            id: 'rep-2',
            title: 'Minor basement water on Elm St',
            rawDescription: 'Small sump pump leak in residential basement',
            category: 'FLOOD',
            latitude: 37.7610,
            longitude: -122.4350, // ~3 km away
            createdAt: new Date(now.getTime() - 12 * 60 * 60 * 1000), // 12 hours ago
        };
        const match = (0, duplicateDetector_js_1.evaluateDuplicateMatch)(report2, report1);
        (0, vitest_1.expect)(match.isMatch).toBe(false);
        (0, vitest_1.expect)(match.similarityScore).toBeLessThan(0.4);
    });
});
