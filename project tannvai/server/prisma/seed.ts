import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding ResQNet AI Emergency Intelligence Network database...');

  // Clean existing tables in proper order
  await prisma.auditLog.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.helpRequest.deleteMany();
  await prisma.resource.deleteMany();
  await prisma.duplicateSuggestion.deleteMany();
  await prisma.incidentAnalysis.deleteMany();
  await prisma.incidentReport.deleteMany();
  await prisma.user.deleteMany();

  // 1. Seed Users
  const adminUser = await prisma.user.create({
    data: {
      name: 'Director Sarah Chen',
      email: 'admin@resqnet.org',
      role: 'ADMIN',
      phone: '+1 (555) 019-2834',
    },
  });

  const reviewerUser = await prisma.user.create({
    data: {
      name: 'Marcus Vance, EMT-P',
      email: 'reviewer@resqnet.org',
      role: 'REVIEWER',
      phone: '+1 (555) 019-8821',
    },
  });

  const coordinatorUser = await prisma.user.create({
    data: {
      name: 'Elena Rostova',
      email: 'coordinator@resqnet.org',
      role: 'COORDINATOR',
      phone: '+1 (555) 019-4412',
    },
  });

  const citizenUser = await prisma.user.create({
    data: {
      name: 'David Miller',
      email: 'david.m@community.org',
      role: 'CITIZEN',
      phone: '+1 (555) 019-5567',
    },
  });

  // 2. Seed Resources
  const r1 = await prisma.resource.create({
    data: {
      name: 'Swift Water Rescue Squad Alpha',
      type: 'VEHICLE',
      capacity: 6,
      availableCount: 4,
      status: 'AVAILABLE',
      location: 'Fire Station #4, Bay North',
      contactPerson: 'Capt. T. Morales',
    },
  });

  const r2 = await prisma.resource.create({
    data: {
      name: 'Heavy Debris Clearing Task Force #3',
      type: 'EQUIPMENT',
      capacity: 4,
      availableCount: 2,
      status: 'AVAILABLE',
      location: 'Public Works Depot Central',
      contactPerson: 'J. Higgins',
    },
  });

  const r3 = await prisma.resource.create({
    data: {
      name: 'Mobile Medical & Triage Unit 1',
      type: 'VEHICLE',
      capacity: 12,
      availableCount: 1,
      status: 'AVAILABLE',
      location: 'Memorial Hospital Staging Area',
      contactPerson: 'Dr. A. Gupta',
    },
  });

  const r4 = await prisma.resource.create({
    data: {
      name: 'High-Capacity Potable Water Tanker 02',
      type: 'SUPPLY',
      capacity: 5000,
      availableCount: 4500,
      status: 'AVAILABLE',
      location: 'Municipal Water Reserve Station',
      contactPerson: 'O. Lindqvist',
    },
  });

  const r5 = await prisma.resource.create({
    data: {
      name: 'Riverdale Community Shelter Alpha',
      type: 'SHELTER',
      capacity: 150,
      availableCount: 92,
      status: 'AVAILABLE',
      location: 'Riverdale High Gymnasium',
      contactPerson: 'Shelter Mgr. C. Adams',
    },
  });

  // 3. Seed Incidents
  // Incident 1: Maple Ave Underpass Flash Flood (Primary Demo Report)
  const inc1 = await prisma.incidentReport.create({
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
      reporterId: citizenUser.id,
      createdAt: new Date(Date.now() - 45 * 60 * 1000), // 45 mins ago
    },
  });

  await prisma.incidentAnalysis.create({
    data: {
      reportId: inc1.id,
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

  // Incident 2: Second citizen report of the same flood (Candidate Duplicate)
  const inc2 = await prisma.incidentReport.create({
    data: {
      title: 'Dangerous deep water under train bridge 5th & Maple',
      rawDescription: 'Do not come down Maple near 5th! The underpass is completely flooded under the train bridge. Saw two cars trapped in the deep water, looks like people are waiting for help on top of a sedan.',
      category: 'FLOOD',
      status: 'UNVERIFIED',
      urgency: 'HIGH',
      locationName: '5th St & Maple Ave Railroad Crossing',
      latitude: 37.7753,
      longitude: -122.4188,
      reporterName: 'Anonymous Community Member',
      reporterConsent: true,
      createdAt: new Date(Date.now() - 25 * 60 * 1000), // 25 mins ago
    },
  });

  await prisma.incidentAnalysis.create({
    data: {
      reportId: inc2.id,
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

  // Create Duplicate Suggestion between inc1 and inc2
  await prisma.duplicateSuggestion.create({
    data: {
      primaryReportId: inc1.id,
      matchedReportId: inc2.id,
      similarityScore: 0.89,
      distanceMeters: 68.4,
      matchRationale: 'Co-located within 70 meters, timestamps within 20 minutes, identical category (FLOOD), and matching semantic entities: "railroad underpass", "Maple & 5th", "two trapped cars", "people on roof".',
      status: 'PENDING',
    },
  });

  // Incident 3: Live Power Lines Snapped
  const inc3 = await prisma.incidentReport.create({
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
      verifiedById: reviewerUser.id,
      verifiedAt: new Date(Date.now() - 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 90 * 60 * 1000),
    },
  });

  await prisma.incidentAnalysis.create({
    data: {
      reportId: inc3.id,
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

  // Incident 4: Fallen Tree on Hospital Route
  const inc4 = await prisma.incidentReport.create({
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
      verifiedById: reviewerUser.id,
      verifiedAt: new Date(Date.now() - 110 * 60 * 1000),
      createdAt: new Date(Date.now() - 130 * 60 * 1000),
    },
  });

  await prisma.incidentAnalysis.create({
    data: {
      reportId: inc4.id,
      extractedCategory: 'ROAD_HAZARD',
      extractedNeeds: JSON.stringify(['heavy_chainsaw_crews', 'front_loader_debris_clearing', 'traffic_control']),
      extractedLocation: 'Harbor Blvd & 12th Way (Memorial Hospital Corridor)',
      extractedTimeframe: 'Impassable since ~2 hours ago',
      structuredSummary: 'Large tree blocking key hospital transit corridor; causes ambulance transport delays of 15+ minutes.',
      urgencyRationale: 'High operational priority due to direct impact on emergency medical vehicle transit.',
      confidenceScore: 0.93,
      modelProvider: 'ResQNet-AI-Engine (Gemini-1.5)',
      isVerified: true,
    },
  });

  // Incident 5: Senior Care Drinking Water Outage
  const inc5 = await prisma.incidentReport.create({
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
      verifiedById: reviewerUser.id,
      verifiedAt: new Date(Date.now() - 150 * 60 * 1000),
      createdAt: new Date(Date.now() - 180 * 60 * 1000),
    },
  });

  await prisma.incidentAnalysis.create({
    data: {
      reportId: inc5.id,
      extractedCategory: 'SHELTER_REQUEST',
      extractedNeeds: JSON.stringify(['potable_drinking_water', 'sanitation_supplies', 'vulnerable_population_support']),
      extractedLocation: 'Pinecrest Senior Living, 840 Evergreen Terrace',
      extractedTimeframe: 'Critical ongoing shortage',
      structuredSummary: 'Elderly care residential home with complete water cutoff; 48 vulnerable individuals require urgent potable water supply.',
      urgencyRationale: 'High vulnerability demographic facing hydration and hygiene failure.',
      confidenceScore: 0.95,
      modelProvider: 'ResQNet-AI-Engine (Gemini-1.5)',
      isVerified: true,
    },
  });

  // Incident 6: Resolved basement pump report
  const inc6 = await prisma.incidentReport.create({
    data: {
      title: 'Residential Sump Pump Seepage - Elm Street',
      rawDescription: 'Minor rain runoff pooling against foundation of single family residence. Sump pump running, sandbags placed by homeowner.',
      category: 'FLOOD',
      status: 'RESOLVED',
      urgency: 'LOW',
      locationName: '142 Elm St, Riverdale West',
      latitude: 37.7890,
      longitude: -122.4050,
      reporterConsent: true,
      verifiedById: reviewerUser.id,
      verifiedAt: new Date(Date.now() - 240 * 60 * 1000),
      createdAt: new Date(Date.now() - 300 * 60 * 1000),
    },
  });

  await prisma.incidentAnalysis.create({
    data: {
      reportId: inc6.id,
      extractedCategory: 'FLOOD',
      extractedNeeds: JSON.stringify(['sandbags_monitoring']),
      extractedLocation: '142 Elm St, Riverdale West',
      extractedTimeframe: 'Resolved',
      structuredSummary: 'Minor non-structural basement moisture controlled by resident; no emergency response dispatched.',
      urgencyRationale: 'Low urgency; homeowner confirmed stable status.',
      confidenceScore: 0.88,
      modelProvider: 'ResQNet-AI-Engine (Gemini-1.5)',
      isVerified: true,
    },
  });

  // 4. Seed Help Requests
  const hr1 = await prisma.helpRequest.create({
    data: {
      reportId: inc5.id,
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

  const hr2 = await prisma.helpRequest.create({
    data: {
      reportId: inc1.id,
      requestType: 'EVACUATION',
      description: 'Extraction and medical assessment of 2 drivers trapped atop submerged vehicles in underpass.',
      urgency: 'HIGH',
      status: 'UNDER_REVIEW',
      peopleCount: 2,
      specialNeeds: 'Cold water exposure risk, rising current.',
      requesterName: 'David Miller (Witness)',
    },
  });

  const hr3 = await prisma.helpRequest.create({
    data: {
      reportId: inc4.id,
      requestType: 'OTHER',
      description: 'Urgent roadway clearance for ambulance access route to Memorial Hospital.',
      urgency: 'HIGH',
      status: 'VERIFIED',
      peopleCount: 1,
      requesterName: 'Paramedic Dispatcher',
    },
  });

  // 5. Seed Assignment
  await prisma.assignment.create({
    data: {
      helpRequestId: hr1.id,
      resourceId: r4.id,
      assignedById: coordinatorUser.id,
      status: 'EN_ROUTE',
      notes: 'Water Tanker 02 dispatched to Pinecrest Senior Living service dock. ETA 12 minutes.',
      assignedAt: new Date(Date.now() - 30 * 60 * 1000),
    },
  });

  // 6. Seed Audit Logs
  await prisma.auditLog.createMany({
    data: [
      {
        entityType: 'INCIDENT',
        entityId: inc1.id,
        action: 'CREATED',
        performedByName: 'David Miller',
        performedByRole: 'CITIZEN',
        newState: JSON.stringify({ status: 'UNVERIFIED', title: inc1.title }),
        notes: 'Citizen submitted report via web portal.',
        createdAt: new Date(Date.now() - 45 * 60 * 1000),
      },
      {
        entityType: 'ANALYSIS',
        entityId: inc1.id,
        action: 'CREATED',
        performedByName: 'ResQNet-AI-Interpreter',
        performedByRole: 'SYSTEM',
        newState: JSON.stringify({ extractedCategory: 'FLOOD', urgency: 'HIGH', confidence: 0.94 }),
        notes: 'AI natural language extraction completed; marked unverified pending reviewer triage.',
        createdAt: new Date(Date.now() - 44 * 60 * 1000),
      },
      {
        entityType: 'DUPLICATE',
        entityId: inc2.id,
        action: 'CREATED',
        performedByName: 'ResQNet-Duplicate-Engine',
        performedByRole: 'SYSTEM',
        newState: JSON.stringify({ matchedWith: inc1.id, similarity: 0.89 }),
        notes: 'Automated geospatial & textual similarity match identified candidate duplicate.',
        createdAt: new Date(Date.now() - 24 * 60 * 1000),
      },
      {
        entityType: 'INCIDENT',
        entityId: inc3.id,
        action: 'VERIFIED',
        performedById: reviewerUser.id,
        performedByName: 'Marcus Vance, EMT-P',
        performedByRole: 'REVIEWER',
        previousState: JSON.stringify({ status: 'UNVERIFIED' }),
        newState: JSON.stringify({ status: 'VERIFIED' }),
        notes: 'Confirmed live wire hazard with County Fire Dispatch.',
        createdAt: new Date(Date.now() - 60 * 60 * 1000),
      },
      {
        entityType: 'ASSIGNMENT',
        entityId: hr1.id,
        action: 'RESOURCE_ASSIGNED',
        performedById: coordinatorUser.id,
        performedByName: 'Elena Rostova',
        performedByRole: 'COORDINATOR',
        newState: JSON.stringify({ assignedResource: r4.name, status: 'EN_ROUTE' }),
        notes: 'Dispatched Potable Water Tanker 02 to Pinecrest Senior Living.',
        createdAt: new Date(Date.now() - 30 * 60 * 1000),
      },
    ],
  });

  console.log('✅ Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
