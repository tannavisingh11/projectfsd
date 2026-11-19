"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateHaversineDistance = calculateHaversineDistance;
exports.tokenizeText = tokenizeText;
exports.calculateTextSimilarity = calculateTextSimilarity;
exports.evaluateDuplicateMatch = evaluateDuplicateMatch;
/**
 * Calculates geodesic distance between two points in meters using Haversine formula
 */
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Earth radius in meters
    const toRad = (deg) => (deg * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10;
}
/**
 * Stop words set for textual tokenization
 */
const STOP_WORDS = new Set([
    'the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'in', 'near', 'to', 'for', 'of',
    'with', 'it', 'was', 'are', 'been', 'there', 'they', 'we', 'i', 'our', 'my', 'that', 'this',
    'by', 'from', 'up', 'down', 'about', 'as', 'into', 'over', 'after',
]);
/**
 * Tokenize string into a set of lowercased meaningful terms
 */
function tokenizeText(text) {
    const tokens = text
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter((w) => w.length > 2 && !STOP_WORDS.has(w));
    return new Set(tokens);
}
/**
 * Compute Jaccard token similarity between two texts
 */
function calculateTextSimilarity(text1, text2) {
    const tokens1 = tokenizeText(text1);
    const tokens2 = tokenizeText(text2);
    if (tokens1.size === 0 || tokens2.size === 0) {
        return { jaccard: 0, overlappingTokens: [] };
    }
    const intersection = new Set();
    for (const token of tokens1) {
        if (tokens2.has(token)) {
            intersection.add(token);
        }
    }
    const unionSize = new Set([...tokens1, ...tokens2]).size;
    const jaccard = unionSize > 0 ? intersection.size / unionSize : 0;
    return {
        jaccard: Math.round(jaccard * 100) / 100,
        overlappingTokens: Array.from(intersection),
    };
}
/**
 * Compare two incident reports and evaluate duplicate probability with explainable rationale
 */
function evaluateDuplicateMatch(newReport, existingReport) {
    // 1. Spatial Proximity
    const distanceMeters = calculateHaversineDistance(newReport.latitude, newReport.longitude, existingReport.latitude, existingReport.longitude);
    let spatialScore = 0.0;
    if (distanceMeters <= 100)
        spatialScore = 1.0;
    else if (distanceMeters <= 400)
        spatialScore = 0.85;
    else if (distanceMeters <= 1200)
        spatialScore = 0.6;
    else if (distanceMeters <= 2500)
        spatialScore = 0.3;
    else
        spatialScore = 0.05;
    // 2. Temporal Proximity
    const timeDiffMs = Math.abs(newReport.createdAt.getTime() - existingReport.createdAt.getTime());
    const timeDiffMinutes = Math.round(timeDiffMs / (60 * 1000));
    let temporalScore = 0.0;
    if (timeDiffMinutes <= 45)
        temporalScore = 1.0;
    else if (timeDiffMinutes <= 180)
        temporalScore = 0.8;
    else if (timeDiffMinutes <= 720)
        temporalScore = 0.5;
    else if (timeDiffMinutes <= 1440)
        temporalScore = 0.3;
    else
        temporalScore = 0.05;
    // 3. Category Congruence
    const categoryMatch = newReport.category === existingReport.category;
    const categoryScore = categoryMatch ? 1.0 : 0.2;
    // 4. Textual & Keyword Similarity
    const combinedText1 = `${newReport.title} ${newReport.rawDescription}`;
    const combinedText2 = `${existingReport.title} ${existingReport.rawDescription}`;
    const { jaccard, overlappingTokens } = calculateTextSimilarity(combinedText1, combinedText2);
    // Boost textual score if key emergency nouns overlap
    const criticalNouns = ['flood', 'water', 'underpass', 'bridge', 'trapped', 'stalled', 'car', 'vehicle', 'tree', 'road', 'wire', 'fire', 'lines', 'pole', 'hospital'];
    const sharedCritical = overlappingTokens.filter((t) => criticalNouns.includes(t));
    const keywordBoost = Math.min(0.35, sharedCritical.length * 0.1);
    const textScore = Math.min(1.0, jaccard * 1.5 + keywordBoost);
    // 5. Composite Weighted Score
    // Spatial (35%) + Text (35%) + Category (15%) + Temporal (15%)
    const compositeScore = Math.round((spatialScore * 0.35 + textScore * 0.35 + categoryScore * 0.15 + temporalScore * 0.15) * 100) / 100;
    // Match threshold: >= 0.65 composite score, or <= 150m with matching category and textScore >= 0.40
    const isMatch = compositeScore >= 0.65 || (distanceMeters <= 150 && categoryMatch && textScore >= 0.4);
    // Generate transparent human-readable match rationale
    const distLabel = distanceMeters < 1000 ? `${Math.round(distanceMeters)}m` : `${(distanceMeters / 1000).toFixed(1)}km`;
    const timeLabel = timeDiffMinutes < 60 ? `${timeDiffMinutes} min` : `${(timeDiffMinutes / 60).toFixed(1)} hrs`;
    const tokensHighlight = sharedCritical.length > 0
        ? `critical terms: [${sharedCritical.slice(0, 5).join(', ')}]`
        : `shared keywords: [${overlappingTokens.slice(0, 4).join(', ') || 'general contextual descriptors'}]`;
    const matchRationale = `Detected within ${distLabel} and ${timeLabel} of existing report. ` +
        `Category status: ${categoryMatch ? `Identical [${newReport.category}]` : `Related [${newReport.category} vs ${existingReport.category}]`}. ` +
        `Semantic analysis identified ${tokensHighlight}. ` +
        `Overall similarity score: ${Math.round(compositeScore * 100)}%. Requires authorized reviewer confirmation.`;
    return {
        isMatch,
        similarityScore: compositeScore,
        distanceMeters,
        timeDiffMinutes,
        matchRationale,
    };
}
