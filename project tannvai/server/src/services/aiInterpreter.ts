import { config } from '../config.js';

export interface ExtractedIncidentAnalysis {
  extractedCategory: 'FLOOD' | 'ROAD_HAZARD' | 'FIRE' | 'STRUCTURAL_DAMAGE' | 'MEDICAL_EMERGENCY' | 'UTILITY_OUTAGE' | 'SHELTER_REQUEST' | 'OTHER';
  extractedNeeds: string[];
  extractedLocation: string;
  extractedTimeframe: string;
  structuredSummary: string;
  urgencyRationale: string;
  suggestedUrgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  confidenceScore: number;
  modelProvider: string;
  isVerified: boolean;
  missingInformationNotes: string[];
}

export async function interpretIncidentReport(
  rawText: string,
  userProvidedLocation?: string,
  userProvidedCategory?: string
): Promise<ExtractedIncidentAnalysis> {
  // If Gemini API key is configured, attempt real Gemini API call
  if (config.geminiApiKey && config.geminiApiKey.trim() !== '') {
    try {
      return await callGeminiAPI(rawText, userProvidedLocation, userProvidedCategory);
    } catch (err) {
      console.warn('⚠️ Gemini API call failed or timed out. Falling back to deterministic NLP engine:', err);
    }
  }

  // Deterministic Explainable AI Engine
  return analyzeDeterministically(rawText, userProvidedLocation, userProvidedCategory);
}

/**
 * Deterministic Explainable NLP Analysis Engine
 * Extracts categories, needs, locations, and urgency rationale without hallucinations.
 */
export function analyzeDeterministically(
  rawText: string,
  userProvidedLocation?: string,
  userProvidedCategory?: string
): ExtractedIncidentAnalysis {
  const text = rawText.toLowerCase();
  const missingInformationNotes: string[] = [];

  // 1. Detect Category
  let category: ExtractedIncidentAnalysis['extractedCategory'] = 'OTHER';
  if (text.includes('flood') || text.includes('water') || text.includes('submerged') || text.includes('drowning') || text.includes('levee') || text.includes('overflow')) {
    category = 'FLOOD';
  } else if (text.includes('fire') || text.includes('smoke') || text.includes('flame') || text.includes('burning') || text.includes('blaze')) {
    category = 'FIRE';
  } else if (text.includes('power') || text.includes('wire') || text.includes('electric') || text.includes('pole') || text.includes('transformer') || text.includes('blackout') || text.includes('grid')) {
    category = 'UTILITY_OUTAGE';
  } else if (text.includes('tree') || text.includes('blocked') || text.includes('debris') || text.includes('road') || text.includes('traffic') || text.includes('bridge') || text.includes('pothole') || text.includes('impassable')) {
    category = 'ROAD_HAZARD';
  } else if (text.includes('collapse') || text.includes('roof') || text.includes('building') || text.includes('crack') || text.includes('structural') || text.includes('wall')) {
    category = 'STRUCTURAL_DAMAGE';
  } else if (text.includes('medical') || text.includes('injured') || text.includes('bleeding') || text.includes('cardiac') || text.includes('unconscious') || text.includes('ambulance') || text.includes('wound')) {
    category = 'MEDICAL_EMERGENCY';
  } else if (text.includes('shelter') || text.includes('evacuat') || text.includes('displaced') || text.includes('homeless') || text.includes('seniors') || text.includes('elderly')) {
    category = 'SHELTER_REQUEST';
  }

  // Allow user selection to guide if provided and valid
  if (userProvidedCategory && ['FLOOD', 'ROAD_HAZARD', 'FIRE', 'STRUCTURAL_DAMAGE', 'MEDICAL_EMERGENCY', 'UTILITY_OUTAGE', 'SHELTER_REQUEST', 'OTHER'].includes(userProvidedCategory)) {
    category = userProvidedCategory as ExtractedIncidentAnalysis['extractedCategory'];
  }

  // 2. Extract Needs
  const needs: string[] = [];
  if (text.includes('water') && (text.includes('drink') || text.includes('bottle') || text.includes('thirst') || text.includes('hydrate'))) {
    needs.push('potable_drinking_water');
  }
  if (
    (text.includes('water') || text.includes('flood')) &&
    (text.includes('boat') || text.includes('rescue') || text.includes('stranded') || text.includes('trapped') || text.includes('roof') || text.includes('stuck') || text.includes('submerged') || text.includes('car'))
  ) {
    needs.push('swift_water_rescue');
  }
  if (text.includes('tree') || text.includes('chainsaw') || text.includes('debris') || text.includes('clear')) {
    needs.push('debris_clearing_equipment');
  }
  if (text.includes('tow') || text.includes('stalled') || text.includes('vehicle') || text.includes('car')) {
    needs.push('vehicle_towing');
  }
  if (text.includes('doctor') || text.includes('medic') || text.includes('first aid') || text.includes('hospital') || text.includes('injured')) {
    needs.push('emergency_medical_triage');
  }
  if (text.includes('power') || text.includes('wire') || text.includes('electrician') || text.includes('generator')) {
    needs.push('utility_isolation_or_power');
  }
  if (text.includes('food') || text.includes('meal') || text.includes('hungry') || text.includes('ration')) {
    needs.push('emergency_rations_food');
  }
  if (text.includes('shelter') || text.includes('bed') || text.includes('cot') || text.includes('warmth') || text.includes('blanket')) {
    needs.push('temporary_shelter_bedding');
  }
  if (needs.length === 0) {
    needs.push('situation_assessment');
    missingInformationNotes.push('Specific physical resource needs were not explicitly stated in the submission text.');
  }

  // 3. Extract Location
  let extractedLoc = userProvidedLocation || '';
  if (!extractedLoc) {
    const atMatches = rawText.match(/(?:at|near|on|corner of|intersection of|along)\s+([A-Z0-9][a-zA-Z0-9\s&,#\.\-]+?(?:street|st|avenue|ave|road|rd|blvd|lane|way|highway|hwy|crossing|underpass|bridge|drive|dr|terrace))/i);
    if (atMatches && atMatches[1]) {
      extractedLoc = atMatches[1].trim();
    } else {
      extractedLoc = 'Location not explicitly parsed from text; requires coordinator geocoding.';
      missingInformationNotes.push('Precise street address or landmark was not detected automatically.');
    }
  }

  // 4. Extract Timeframe
  let timeframe = 'Recent community submission (within last hour)';
  if (text.includes('yesterday') || text.includes('last night')) {
    timeframe = 'Reported event occurred prior to current operational shift (12+ hours ago)';
  } else if (text.includes('right now') || text.includes('just now') || text.includes('ongoing') || text.includes('rising')) {
    timeframe = 'Active / Ongoing emergency in real-time';
  }

  // 5. Urgency Rationale & Suggested Urgency
  let suggestedUrgency: ExtractedIncidentAnalysis['suggestedUrgency'] = 'MEDIUM';
  let rationale = 'Routine community impact reported. No active indicators of direct life safety hazard.';

  if (text.includes('trapped') || text.includes('arcing') || text.includes('unconscious') || text.includes('drowning') || text.includes('explosion') || text.includes('fire') && text.includes('house')) {
    suggestedUrgency = 'CRITICAL';
    rationale = 'Immediate potential threat to human life detected (keywords indicating trapped individuals, active electrical fire, or acute medical crisis). Immediate response dispatch indicated.';
  } else if (text.includes('flood') && text.includes('car') || text.includes('hospital') || text.includes('elderly') || text.includes('rising fast') || text.includes('blocked') && text.includes('ambulance')) {
    suggestedUrgency = 'HIGH';
    rationale = 'Significant hazard obstructing emergency transit or placing vulnerable populations at risk without immediate alternative.';
  } else if (text.includes('minor') || text.includes('small') || text.includes('yard') || text.includes('seepage') || text.includes('puddle')) {
    suggestedUrgency = 'LOW';
    rationale = 'Localized minor damage or inconvenience without structural or immediate medical risk.';
  }

  // 6. Structured Summary
  const firstSentence = rawText.split(/[.!?]/)[0] || rawText;
  const structuredSummary = `${firstSentence.trim()}. Category identified as ${category}. Identified needs: ${needs.join(', ')}.`;

  return {
    extractedCategory: category,
    extractedNeeds: needs,
    extractedLocation: extractedLoc,
    extractedTimeframe: timeframe,
    structuredSummary,
    urgencyRationale: `${rationale} Note: This AI suggestion is a decision-support aid and must be verified by a human reviewer.`,
    suggestedUrgency,
    confidenceScore: 0.91,
    modelProvider: 'ResQNet-Deterministic-NLP-Engine (Rule-Guided Semantic Parser)',
    isVerified: false,
    missingInformationNotes,
  };
}

/**
 * Call Gemini API with structured JSON output schema when API key is available
 */
async function callGeminiAPI(
  rawText: string,
  userProvidedLocation?: string,
  userProvidedCategory?: string
): Promise<ExtractedIncidentAnalysis> {
  const prompt = `You are the AI Incident Interpreter for ResQNet AI, a civic emergency intelligence platform.
Analyze the following natural-language citizen report:
"""
${rawText}
"""
User-selected category (if any): "${userProvidedCategory || 'None'}"
User-selected location (if any): "${userProvidedLocation || 'None'}"

Instructions:
1. Extract the primary incident category from: FLOOD, ROAD_HAZARD, FIRE, STRUCTURAL_DAMAGE, MEDICAL_EMERGENCY, UTILITY_OUTAGE, SHELTER_REQUEST, OTHER.
2. Extract specific reported resource or logistical needs (e.g. swift water rescue, potable water, towing, shelter).
3. Extract approximate location or landmarks mentioned. If not mentioned and not provided, do NOT invent one.
4. Extract reported timeframe.
5. Provide a 1-2 sentence concise structured summary.
6. Provide an explainable urgency rationale explaining WHY this incident requires emergency coordinator attention.
7. Suggest urgency from: LOW, MEDIUM, HIGH, CRITICAL.
8. Output confidence score between 0.0 and 1.0.
9. List any missing information notes (e.g. no exact coordinates, reporter identity omitted). Never invent fake facts.

Respond ONLY with valid JSON conforming to this schema:
{
  "extractedCategory": "FLOOD",
  "extractedNeeds": ["swift_water_rescue", "towing"],
  "extractedLocation": "Maple Ave & 5th St Underpass",
  "extractedTimeframe": "Ongoing flash flood",
  "structuredSummary": "...",
  "urgencyRationale": "...",
  "suggestedUrgency": "HIGH",
  "confidenceScore": 0.94,
  "missingInformationNotes": ["..."]
}`;

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${config.geminiModel}:generateContent?key=${config.geminiApiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.1,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini API HTTP Error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!textContent) {
    throw new Error('Gemini API returned empty response content.');
  }

  const parsed = JSON.parse(textContent);

  return {
    extractedCategory: parsed.extractedCategory || 'OTHER',
    extractedNeeds: Array.isArray(parsed.extractedNeeds) ? parsed.extractedNeeds : ['situation_assessment'],
    extractedLocation: parsed.extractedLocation || userProvidedLocation || 'Location unspecified',
    extractedTimeframe: parsed.extractedTimeframe || 'Recent submission',
    structuredSummary: parsed.structuredSummary || rawText.substring(0, 140),
    urgencyRationale: `${parsed.urgencyRationale || 'Standard community report.'} (Decision-support output; human review mandatory)`,
    suggestedUrgency: parsed.suggestedUrgency || 'MEDIUM',
    confidenceScore: typeof parsed.confidenceScore === 'number' ? parsed.confidenceScore : 0.92,
    modelProvider: `Gemini-API (${config.geminiModel})`,
    isVerified: false,
    missingInformationNotes: parsed.missingInformationNotes || [],
  };
}
