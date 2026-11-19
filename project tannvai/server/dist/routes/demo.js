"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.demoRouter = void 0;
const express_1 = require("express");
const db_js_1 = require("../services/db.js");
exports.demoRouter = (0, express_1.Router)();
/**
 * POST /api/demo/reset
 * Resets the database to initial clean state with pristine seed data
 */
exports.demoRouter.post('/reset', async (_req, res) => {
    try {
        // 1. Wipe all current entries
        await db_js_1.prisma.auditLog.deleteMany();
        await db_js_1.prisma.assignment.deleteMany();
        await db_js_1.prisma.helpRequest.deleteMany();
        await db_js_1.prisma.resource.deleteMany();
        await db_js_1.prisma.duplicateSuggestion.deleteMany();
        await db_js_1.prisma.incidentAnalysis.deleteMany();
        await db_js_1.prisma.incidentReport.deleteMany();
        await db_js_1.prisma.user.deleteMany();
        // 2. Re-create base users
        const admin = await db_js_1.prisma.user.create({
            data: { name: 'Director Sarah Chen', email: 'admin@resqnet.org', role: 'ADMIN', phone: '+1 (555) 019-2834' },
        });
        const reviewer = await db_js_1.prisma.user.create({
            data: { name: 'Marcus Vance, EMT-P', email: 'reviewer@resqnet.org', role: 'REVIEWER', phone: '+1 (555) 019-8821' },
        });
        const coordinator = await db_js_1.prisma.user.create({
            data: { name: 'Elena Rostova', email: 'coordinator@resqnet.org', role: 'COORDINATOR', phone: '+1 (555) 019-4412' },
        });
        const citizen = await db_js_1.prisma.user.create({
            data: { name: 'David Miller', email: 'david.m@community.org', role: 'CITIZEN', phone: '+1 (555) 019-5567' },
        });
        // 3. Re-create resources
        const r1 = await db_js_1.prisma.resource.create({
            data: { name: 'Swift Water Rescue Squad Alpha', type: 'VEHICLE', capacity: 6, availableCount: 4, status: 'AVAILABLE', location: 'Fire Station #4, Bay North' },
        });
        const r2 = await db_js_1.prisma.resource.create({
            data: { name: 'Heavy Debris Clearing Task Force #3', type: 'EQUIPMENT', capacity: 4, availableCount: 2, status: 'AVAILABLE', location: 'Public Works Depot Central' },
        });
        const r3 = await db_js_1.prisma.resource.create({
            data: { name: 'Mobile Medical & Triage Unit 1', type: 'VEHICLE', capacity: 12, availableCount: 1, status: 'AVAILABLE', location: 'Memorial Hospital Staging Area' },
        });
        const r4 = await db_js_1.prisma.resource.create({
            data: { name: 'High-Capacity Potable Water Tanker 02', type: 'SUPPLY', capacity: 5000, availableCount: 4500, status: 'AVAILABLE', location: 'Municipal Water Reserve Station' },
        });
        const r5 = await db_js_1.prisma.resource.create({
            data: { name: 'Riverdale Community Shelter Alpha', type: 'SHELTER', capacity: 150, availableCount: 92, status: 'AVAILABLE', location: 'Riverdale High Gymnasium' },
        });
        // 4. Initial Baseline Reports
        const incPower = await db_js_1.prisma.incidentReport.create({
            data: {
                title: 'Downed Live Electrical Lines on Oak Ridge Rd',
                rawDescription: 'Severe wind gust brought down an electrical transformer pole. Live wires are arcing violently across Oak Ridge Rd between Crestview and Pine. Small brush fire starting near curb.',
                category: 'UTILITY_OUTAGE',
                status: 'VERIFIED',
                urgency: 'CRITICAL',
                locationName: 'Oak Ridge Rd & Crestview Lane',
                latitude: 37.7833,
                longitude: -122.4167,
                reporterName: 'Oak Ridge Resident Assn',
                reporterConsent: true,
                verifiedById: reviewer.id,
                verifiedAt: new Date(Date.now() - 60 * 60 * 1000),
                createdAt: new Date(Date.now() - 90 * 60 * 1000),
            },
        });
        await db_js_1.prisma.incidentAnalysis.create({
            data: {
                reportId: incPower.id,
                extractedCategory: 'UTILITY_OUTAGE',
                extractedNeeds: JSON.stringify(['power_utility_isolation', 'fire_suppression', 'traffic_barricades']),
                extractedLocation: 'Oak Ridge Rd & Crestview Lane',
                extractedTimeframe: 'Active ongoing hazard',
                structuredSummary: 'Downed electrical transformer lines arcing across roadway with incipient brush fire. Grid disconnection and immediate isolation required.',
                urgencyRationale: 'Critical hazard: electrocution risk and fire spreading potential in residential neighborhood.',
                confidenceScore: 0.96,
                modelProvider: 'ResQNet-AI-Engine (Gemini-1.5)',
                isVerified: true,
            },
        });
        const incTree = await db_js_1.prisma.incidentReport.create({
            data: {
                title: 'Uprooted Oak Blocking Harbor Blvd Emergency Corridor',
                rawDescription: 'A 60-foot oak tree crashed across Harbor Blvd near 12th Way, completely blocking both inbound lanes toward Memorial General. Ambulances are forced onto congested back-alley detours.',
                category: 'ROAD_HAZARD',
                status: 'VERIFIED',
                urgency: 'HIGH',
                locationName: 'Harbor Blvd & 12th Way',
                latitude: 37.7680,
                longitude: -122.4300,
                reporterName: 'Paramedic Field Dispatcher',
                reporterConsent: true,
                verifiedById: reviewer.id,
                verifiedAt: new Date(Date.now() - 110 * 60 * 1000),
                createdAt: new Date(Date.now() - 130 * 60 * 1000),
            },
        });
        await db_js_1.prisma.incidentAnalysis.create({
            data: {
                reportId: incTree.id,
                extractedCategory: 'ROAD_HAZARD',
                extractedNeeds: JSON.stringify(['heavy_chainsaw_crews', 'front_loader_debris_clearing']),
                extractedLocation: 'Harbor Blvd & 12th Way',
                extractedTimeframe: 'Impassable since ~2 hours ago',
                structuredSummary: 'Large tree blocking key hospital transit corridor; causes ambulance transport delays of 15+ minutes.',
                urgencyRationale: 'High operational priority due to direct impact on emergency medical vehicle transit.',
                confidenceScore: 0.93,
                modelProvider: 'ResQNet-AI-Engine (Gemini-1.5)',
                isVerified: true,
            },
        });
        const incWater = await db_js_1.prisma.incidentReport.create({
            data: {
                title: 'Water Main Break at Pinecrest Senior Care Living',
                rawDescription: 'Water supply severed to Pinecrest Senior Facility following main line pressure drop. 48 elderly residents have no clean drinking water or functional sanitation. Staff request emergency bottled water.',
                category: 'SHELTER_REQUEST',
                status: 'VERIFIED',
                urgency: 'HIGH',
                locationName: 'Pinecrest Senior Living, 840 Evergreen Terrace',
                latitude: 37.7610,
                longitude: -122.4220,
                reporterName: 'Nurse Supervisor Karen Diaz',
                reporterContact: '+1 (555) 019-7733',
                reporterConsent: true,
                verifiedById: reviewer.id,
                verifiedAt: new Date(Date.now() - 150 * 60 * 1000),
                createdAt: new Date(Date.now() - 180 * 60 * 1000),
            },
        });
        await db_js_1.prisma.incidentAnalysis.create({
            data: {
                reportId: incWater.id,
                extractedCategory: 'SHELTER_REQUEST',
                extractedNeeds: JSON.stringify(['potable_drinking_water', 'sanitation_supplies']),
                extractedLocation: 'Pinecrest Senior Living, 840 Evergreen Terrace',
                extractedTimeframe: 'Critical ongoing shortage',
                structuredSummary: 'Elderly care residential home with complete water cutoff; 48 vulnerable individuals require urgent potable water supply.',
                urgencyRationale: 'High vulnerability demographic facing hydration and hygiene failure.',
                confidenceScore: 0.95,
                modelProvider: 'ResQNet-AI-Engine (Gemini-1.5)',
                isVerified: true,
            },
        });
        const hrWater = await db_js_1.prisma.helpRequest.create({
            data: {
                reportId: incWater.id,
                requestType: 'WATER',
                description: 'Emergency supply of 200+ gallons potable drinking water and 50 hygiene packages for 48 elderly residents.',
                urgency: 'HIGH',
                status: 'ASSIGNED',
                peopleCount: 48,
                specialNeeds: 'Non-ambulatory seniors, wheelchair access required at rear service entrance.',
                requesterName: 'Karen Diaz (Staff Nurse)',
                requesterContact: '+1 (555) 019-7733',
            },
        });
        await db_js_1.prisma.assignment.create({
            data: {
                helpRequestId: hrWater.id,
                resourceId: r4.id,
                assignedById: coordinator.id,
                status: 'EN_ROUTE',
                notes: 'Water Tanker 02 dispatched to Pinecrest Senior Living service dock. ETA 12 minutes.',
                assignedAt: new Date(Date.now() - 30 * 60 * 1000),
            },
        });
        // Baseline audit log
        await db_js_1.prisma.auditLog.create({
            data: {
                entityType: 'SYSTEM',
                entityId: 'SYSTEM-INIT',
                action: 'CREATED',
                performedByName: 'Demo Controller',
                performedByRole: 'ADMIN',
                notes: 'Demo environment reset to pristine baseline state.',
            },
        });
        res.json({
            success: true,
            message: 'Demo state successfully reset to clean baseline.',
        });
    }
    catch (err) {
        console.error('Error resetting demo:', err);
        res.status(500).json({ error: 'Failed to reset demo state', details: err.message });
    }
});
/**
 * POST /api/demo/load-scenario
 * Automatically sets up the entire 8-step hackathon presentation scenario in under 2 seconds!
 */
exports.demoRouter.post('/load-scenario', async (_req, res) => {
    try {
        // 1. Reset first
        await db_js_1.prisma.auditLog.deleteMany();
        await db_js_1.prisma.assignment.deleteMany();
        await db_js_1.prisma.helpRequest.deleteMany();
        await db_js_1.prisma.resource.deleteMany();
        await db_js_1.prisma.duplicateSuggestion.deleteMany();
        await db_js_1.prisma.incidentAnalysis.deleteMany();
        await db_js_1.prisma.incidentReport.deleteMany();
        await db_js_1.prisma.user.deleteMany();
        // 2. Users
        const admin = await db_js_1.prisma.user.create({
            data: { name: 'Director Sarah Chen', email: 'admin@resqnet.org', role: 'ADMIN', phone: '+1 (555) 019-2834' },
        });
        const reviewer = await db_js_1.prisma.user.create({
            data: { name: 'Marcus Vance, EMT-P', email: 'reviewer@resqnet.org', role: 'REVIEWER', phone: '+1 (555) 019-8821' },
        });
        const coordinator = await db_js_1.prisma.user.create({
            data: { name: 'Elena Rostova', email: 'coordinator@resqnet.org', role: 'COORDINATOR', phone: '+1 (555) 019-4412' },
        });
        const citizen = await db_js_1.prisma.user.create({
            data: { name: 'David Miller', email: 'david.m@community.org', role: 'CITIZEN', phone: '+1 (555) 019-5567' },
        });
        // 3. Resources
        const rescueSquad = await db_js_1.prisma.resource.create({
            data: { name: 'Swift Water Rescue Squad Alpha', type: 'VEHICLE', capacity: 6, availableCount: 3, status: 'AVAILABLE', location: 'Fire Station #4, Bay North', contactPerson: 'Capt. T. Morales' },
        });
        const debrisCrew = await db_js_1.prisma.resource.create({
            data: { name: 'Heavy Debris Clearing Task Force #3', type: 'EQUIPMENT', capacity: 4, availableCount: 2, status: 'AVAILABLE', location: 'Public Works Depot Central' },
        });
        const mobileClinic = await db_js_1.prisma.resource.create({
            data: { name: 'Mobile Medical & Triage Unit 1', type: 'VEHICLE', capacity: 12, availableCount: 1, status: 'AVAILABLE', location: 'Memorial Hospital Staging Area' },
        });
        const waterTanker = await db_js_1.prisma.resource.create({
            data: { name: 'High-Capacity Potable Water Tanker 02', type: 'SUPPLY', capacity: 5000, availableCount: 4500, status: 'AVAILABLE', location: 'Municipal Water Reserve Station' },
        });
        // Step 1: Report 1 Submitted
        const report1 = await db_js_1.prisma.incidentReport.create({
            data: {
                title: 'Flash Flooding at Maple Ave & 5th St Underpass',
                rawDescription: 'Severe water accumulation under the railroad underpass at Maple Ave and 5th St. Water is rising fast, estimated 3-4 feet deep. Two passenger vehicles are stranded with water up to window level; drivers are waving from roof.',
                category: 'FLOOD',
                status: 'UNDER_REVIEW',
                urgency: 'HIGH',
                locationName: 'Maple Ave & 5th St Underpass, Riverdale District',
                latitude: 37.7749,
                longitude: -122.4194,
                reporterName: 'David Miller',
                reporterContact: '+1 (555) 019-5567',
                reporterConsent: true,
                reporterId: citizen.id,
                createdAt: new Date(Date.now() - 40 * 60 * 1000),
            },
        });
        // Step 2: AI extracts Category, Location, Needs, Urgency Rationale
        await db_js_1.prisma.incidentAnalysis.create({
            data: {
                reportId: report1.id,
                extractedCategory: 'FLOOD',
                extractedNeeds: JSON.stringify(['swift_water_rescue', 'traffic_diversion', 'vehicle_towing', 'medical_check']),
                extractedLocation: 'Maple Ave & 5th St Underpass, Riverdale District (Approx. 37.7749, -122.4194)',
                extractedTimeframe: 'Immediate ongoing flash flood (within last 30 minutes)',
                structuredSummary: 'Deep flash flood under rail overpass with 2 submerged vehicles and trapped motorists atop vehicles. Immediate aquatic rescue and road closure needed.',
                urgencyRationale: 'High threat to life due to rising floodwaters and trapped motorists in active current. Rapid response advised.',
                confidenceScore: 0.94,
                modelProvider: 'ResQNet-AI-Engine (Gemini-1.5)',
                isVerified: false,
            },
        });
        // Step 3: Second similar report arrives
        const report2 = await db_js_1.prisma.incidentReport.create({
            data: {
                title: 'Dangerous deep water under train bridge 5th & Maple',
                rawDescription: 'Do not come down Maple near 5th! The underpass is completely flooded under the train bridge. Saw two cars trapped in the deep water, looks like people are waiting for help on top of a sedan.',
                category: 'FLOOD',
                status: 'UNVERIFIED',
                urgency: 'HIGH',
                locationName: '5th St & Maple Ave Railroad Crossing',
                latitude: 37.7753,
                longitude: -122.4188,
                reporterName: 'Anonymous Driver',
                reporterConsent: true,
                createdAt: new Date(Date.now() - 20 * 60 * 1000),
            },
        });
        await db_js_1.prisma.incidentAnalysis.create({
            data: {
                reportId: report2.id,
                extractedCategory: 'FLOOD',
                extractedNeeds: JSON.stringify(['swift_water_rescue', 'road_blockage']),
                extractedLocation: '5th St & Maple Ave Railroad Crossing (Approx. 37.7753, -122.4188)',
                extractedTimeframe: 'Current ongoing event',
                structuredSummary: 'Corroborates severe underpass flooding at 5th & Maple rail overpass with trapped vehicles and motorists seeking higher ground.',
                urgencyRationale: 'Matches ongoing life safety hazard with multiple eyewitness corroborations.',
                confidenceScore: 0.91,
                modelProvider: 'ResQNet-AI-Engine (Gemini-1.5)',
                isVerified: false,
            },
        });
        // Step 4: Duplicate engine detects match & explains why
        const duplicateSuggestion = await db_js_1.prisma.duplicateSuggestion.create({
            data: {
                primaryReportId: report1.id,
                matchedReportId: report2.id,
                similarityScore: 0.89,
                distanceMeters: 68.4,
                matchRationale: 'Co-located within 68 meters, submitted 20 minutes apart. Identical category [FLOOD]. Overlapping critical terms: [underpass, train bridge, maple, 5th, trapped cars, roof]. High probability of same physical event.',
                status: 'PENDING',
            },
        });
        // Help Request for motorists
        const helpReq = await db_js_1.prisma.helpRequest.create({
            data: {
                reportId: report1.id,
                requestType: 'EVACUATION',
                description: 'Urgent extraction of 2 motorists stranded atop vehicles submerged in 3-4 feet rising water at Maple Ave Underpass.',
                urgency: 'HIGH',
                status: 'ASSIGNED',
                peopleCount: 2,
                specialNeeds: 'Hypothermia risk, swift current.',
                requesterName: 'David Miller',
                requesterContact: '+1 (555) 019-5567',
            },
        });
        // Step 5 & 6: Assignment made by coordinator
        const assignment = await db_js_1.prisma.assignment.create({
            data: {
                helpRequestId: helpReq.id,
                resourceId: rescueSquad.id,
                assignedById: coordinator.id,
                status: 'EN_ROUTE',
                notes: 'Swift Water Rescue Squad Alpha deployed with Zodiac inflatable boat. ETA 6 minutes.',
                assignedAt: new Date(Date.now() - 10 * 60 * 1000),
            },
        });
        await db_js_1.prisma.resource.update({
            where: { id: rescueSquad.id },
            data: { status: 'DEPLOYED' },
        });
        // Step 7: Audit log records full trail
        await db_js_1.prisma.auditLog.createMany({
            data: [
                {
                    entityType: 'INCIDENT',
                    entityId: report1.id,
                    action: 'CREATED',
                    performedByName: 'David Miller',
                    performedByRole: 'CITIZEN',
                    newState: JSON.stringify({ title: report1.title, category: 'FLOOD', urgency: 'HIGH' }),
                    notes: 'Citizen submitted report of rising floodwaters and stranded motorists.',
                    createdAt: new Date(Date.now() - 40 * 60 * 1000),
                },
                {
                    entityType: 'ANALYSIS',
                    entityId: report1.id,
                    action: 'CREATED',
                    performedByName: 'ResQNet-AI-Interpreter',
                    performedByRole: 'SYSTEM',
                    newState: JSON.stringify({ confidenceScore: 0.94, extractedNeeds: ['swift_water_rescue'] }),
                    notes: 'AI natural language extraction complete. Marked unverified.',
                    createdAt: new Date(Date.now() - 39 * 60 * 1000),
                },
                {
                    entityType: 'INCIDENT',
                    entityId: report2.id,
                    action: 'CREATED',
                    performedByName: 'Anonymous Driver',
                    performedByRole: 'CITIZEN',
                    newState: JSON.stringify({ title: report2.title }),
                    notes: 'Second report submitted from adjacent street corner.',
                    createdAt: new Date(Date.now() - 20 * 60 * 1000),
                },
                {
                    entityType: 'DUPLICATE',
                    entityId: duplicateSuggestion.id,
                    action: 'CREATED',
                    performedByName: 'ResQNet-Duplicate-Engine',
                    performedByRole: 'SYSTEM',
                    newState: JSON.stringify({ similarity: 0.89, distance: '68m' }),
                    notes: 'Duplicate suggestion generated with explainable rationale.',
                    createdAt: new Date(Date.now() - 19 * 60 * 1000),
                },
                {
                    entityType: 'ASSIGNMENT',
                    entityId: assignment.id,
                    action: 'RESOURCE_ASSIGNED',
                    performedById: coordinator.id,
                    performedByName: 'Elena Rostova',
                    performedByRole: 'COORDINATOR',
                    newState: JSON.stringify({ resource: rescueSquad.name, status: 'EN_ROUTE' }),
                    notes: 'Dispatched Swift Water Rescue Squad Alpha to Maple Ave Underpass.',
                    createdAt: new Date(Date.now() - 10 * 60 * 1000),
                },
            ],
        });
        res.json({
            success: true,
            message: 'Full hackathon presentation scenario loaded successfully! Ready for walkthrough.',
            scenario: {
                step1_reportId: report1.id,
                step2_reportId: report2.id,
                step3_duplicateId: duplicateSuggestion.id,
                step4_helpRequestId: helpReq.id,
                step5_assignmentId: assignment.id,
            },
        });
    }
    catch (err) {
        console.error('Error loading demo scenario:', err);
        res.status(500).json({ error: 'Failed to load demo scenario', details: err.message });
    }
});
