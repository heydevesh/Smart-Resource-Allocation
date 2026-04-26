const admin = require('firebase-admin');

admin.initializeApp({
  projectId: "sahaay-18eb3"
});

const db = admin.firestore();

async function seed() {
  console.log("Starting seeding...");

  // Seed Volunteers
  const v1Ref = db.collection('volunteers').doc('v1');
  await v1Ref.set({
    name: 'Aisha Khan',
    phone: '+919876543210',
    skills: ['First Aid', 'Logistics', 'Hindi', 'Marathi'],
    languages: ['English', 'Hindi', 'Marathi'],
    lat: 19.0400,
    lng: 72.8550,
    available: true,
    availabilitySchedule: {},
    rating: 4.8,
    tasksCompleted: 45,
    totalHours: 120,
    badges: ['super_helper'],
    active: true
  });

  const v2Ref = db.collection('volunteers').doc('v2');
  await v2Ref.set({
    name: 'Rahul Sharma',
    phone: '+919876543211',
    skills: ['Driving', 'Heavy Lifting'],
    languages: ['English', 'Hindi'],
    lat: 19.0600,
    lng: 72.9000,
    available: false,
    availabilitySchedule: {},
    rating: 4.5,
    tasksCompleted: 20,
    totalHours: 50,
    badges: [],
    active: true
  });

  // Seed Needs
  const n1Ref = db.collection('needs').doc('n1');
  await n1Ref.set({
    title: 'Medical Supplies at Dharavi',
    category: 'medical',
    urgency: 'high',
    lat: 19.0380,
    lng: 72.8538,
    locationName: 'Dharavi Slum',
    reportedAt: admin.firestore.FieldValue.serverTimestamp(),
    reportedBy: 'coordinator1',
    status: 'open',
    assignedVolunteers: [],
    description: 'Require basic first aid and burn relief ointments.'
  });

  const n2Ref = db.collection('needs').doc('n2');
  await n2Ref.set({
    title: 'Food Packets at Kurla',
    category: 'food',
    urgency: 'medium',
    lat: 19.0728,
    lng: 72.8797,
    locationName: 'Kurla West',
    reportedAt: admin.firestore.FieldValue.serverTimestamp(),
    reportedBy: 'coordinator2',
    status: 'open',
    assignedVolunteers: [],
    description: 'Need 50 food packets for stranded workers.'
  });

  // Seed Tasks
  const t1Ref = db.collection('tasks').doc('t1');
  await t1Ref.set({
    title: 'Deliver Medical Supplies to Dharavi',
    needId: 'n1',
    category: 'medical',
    priority: 'high',
    volunteerIds: ['v1'],
    status: 'active',
    progress: 30,
    dueAt: admin.firestore.FieldValue.serverTimestamp(),
    createdBy: 'admin',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    recurring: false,
    attachmentUrls: [],
    description: 'Pick up medical supplies from hub and deliver to Dharavi sector 3.',
    locationLat: 19.0380,
    locationLng: 72.8538,
    locationName: 'Dharavi Slum'
  });

  const t2Ref = db.collection('tasks').doc('t2');
  await t2Ref.set({
    title: 'Distribute Food Packets at Kurla',
    needId: 'n2',
    category: 'food',
    priority: 'medium',
    volunteerIds: [],
    status: 'pending',
    progress: 0,
    dueAt: admin.firestore.FieldValue.serverTimestamp(),
    createdBy: 'admin',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    recurring: false,
    attachmentUrls: [],
    description: 'Distribute food packets to workers in Kurla West.',
    locationLat: 19.0728,
    locationLng: 72.8797,
    locationName: 'Kurla West'
  });

  console.log("Seeding complete!");
}

seed().catch(console.error);
