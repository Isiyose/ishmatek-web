import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { Firestore } from "@google-cloud/firestore";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Support JSON payload parsing
  app.use(express.json());

  // Handle invalid GOOGLE_APPLICATION_CREDENTIALS path to prevent Node.js from crashing with ENOENT
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    const credsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    if (!fs.existsSync(credsPath)) {
      console.log("\x1b[33m%s\x1b[0m", `[FIREBASE-WARN] GOOGLE_APPLICATION_CREDENTIALS points to an invalid or missing path: "${credsPath}".`);
      console.log("\x1b[33m%s\x1b[0m", `Bypassing it to run the server in offline / local-only context to prevent a Node.js process crash.`);
      delete process.env.GOOGLE_APPLICATION_CREDENTIALS;
    }
  }

  // Load Firebase app config dynamically from workspace
  const configPath = path.join(process.cwd(), "firebase-applet-config.json");
  let firebaseConfig: any = null;
  if (fs.existsSync(configPath)) {
    try {
      firebaseConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    } catch (err) {
      console.error("Failed to parse firebase-applet-config.json", err);
    }
  }

  // Lazy server database retriever
  let db: Firestore | null = null;
  function getDb() {
    if (!db && firebaseConfig && firebaseConfig.projectId) {
      try {
        db = new Firestore({
          projectId: firebaseConfig.projectId,
          databaseId: firebaseConfig.firestoreDatabaseId || "(default)",
        });
        console.log("[FIREBASE] Server Admin SDK initialized with database:", firebaseConfig.firestoreDatabaseId || "(default)");
      } catch (err) {
        console.warn("[FIREBASE] Server Admin SDK initialization deferred:", err);
      }
    }
    return db;
  }

  // Safe wrapper for server-side database writes
  async function safeDbWrite(collectionName: string, docId: string, data: any) {
    const firestoreDb = getDb();
    if (!firestoreDb) return;
    try {
      await firestoreDb.collection(collectionName).doc(docId).set(data);
    } catch (err: any) {
      const isCredsError = err.message && (
        err.message.includes('default credentials') || 
        err.message.includes('Could not load the default credentials') ||
        err.message.includes('PERMISSION_DENIED') ||
        err.message.includes('permission_denied')
      );
      if (!isCredsError) {
        console.error(`[FIREBASE-SYNC] Sync failed for ${collectionName}/${docId}:`, err);
      }
    }
  }

  // In-memory collections initialized with real-world system patterns
  let devices = [
    { id: 'SN-AS-001', name: 'Ambient Sync Alpha', type: 'air', lat: -1.9441, lng: 30.2012, status: 'ok' },
    { id: 'SN-EW-202', name: 'EnergyWatch Pro', type: 'energy', lat: -1.9445, lng: 30.2018, status: 'ok' },
    { id: 'SN-AG-043', name: 'AquaGauge Gen 2', type: 'water', lat: -1.9448, lng: 30.2020, status: 'warn' },
    { id: 'SN-AS-009', name: 'Lab Beacon', type: 'air', lat: -1.9440, lng: 30.2025, status: 'ok' },
    { id: 'SN-EW-210', name: 'HVAC Monitor', type: 'energy', lat: -1.9450, lng: 30.2030, status: 'crit' },
  ];

  let users = [
    { id: 'U-001', name: 'Jean Luc', role: 'Super Admin', lat: -1.9441, lng: 30.0619, status: 'online' },
    { id: 'U-002', name: 'Alice Smith', role: 'Operator', lat: 51.5074, lng: -0.1278, status: 'online' },
    { id: 'U-003', name: 'Bob Johnson', role: 'Technician', lat: -1.2921, lng: 36.8219, status: 'offline' },
  ];

  let metrics = {
    water: { value: 52.4, history: [52.4], min: 20, max: 80, unit: 'L/min' },
    temp:  { value: 23.7, history: [23.7], min: 15, max: 35, unit: '°C' },
    air:   { value: 712,  history: [712],  min: 400, max: 1200, unit: 'ppm' },
    power: { value: 318,  history: [318],  min: 100, max: 450, unit: 'kW' },
  };

  let logs = [
    { timestamp: new Date().toISOString(), source: 'System', message: 'Nexus Core microservices online. REST controllers bound to port 3000.', type: 'info' }
  ];

  // Bootstrap function to pre-populate empty Firestore databases on startup
  const bootstrapFirestore = async () => {
    const firestoreDb = getDb();
    if (!firestoreDb) return;
    try {
      console.log("[FIREBASE] Running database pre-check...");
      const checkEmpty = await firestoreDb.collection('devices').limit(1).get();
      if (checkEmpty.empty) {
        console.log("[FIREBASE] Empty database detected. Bootstrapping baseline configurations...");
        for (const dev of devices) {
          await firestoreDb.collection('devices').doc(dev.id).set(dev);
        }
        for (const usr of users) {
          await firestoreDb.collection('users').doc(usr.id).set(usr);
        }
        await firestoreDb.collection('metrics').doc('all').set({
          water: { value: 52.4, history: [52.4], min: 20, max: 80, unit: 'L/min' },
          temp:  { value: 23.7, history: [23.7], min: 15, max: 35, unit: '°C' },
          air:   { value: 712,  history: [712],  min: 400, max: 1200, unit: 'ppm' },
          power: { value: 318,  history: [318],  min: 100, max: 450, unit: 'kW' }
        });
        await firestoreDb.collection('logs').doc('SYSTEM-BOOT').set({
          timestamp: new Date().toISOString(),
          source: 'System Bootstrapper',
          message: 'Initial Zero-Trust environment initialized dynamically from server on port 3000.',
          type: 'info'
        });
        console.log("[FIREBASE] Bootstrap sequence finished successfully.");
      } else {
        console.log("[FIREBASE] Active records verified. Skipping seeding step.");
      }
    } catch (err: any) {
      if (err.message && (err.message.includes('Could not load the default credentials') || err.message.includes('permission_denied') || err.message.includes('PERMISSION_DENIED') || err.message.includes('default credentials'))) {
        console.log("\x1b[33m%s\x1b[0m", "[FIREBASE-SYNC] Running in offline / local-only context. Firestore sync is bypassed (no service account or default credentials found). This is expected when running locally outside Cloud Run! To sync with cloud, configure your GOOGLE_APPLICATION_CREDENTIALS.");
      } else {
        console.warn("[FIREBASE] Bootstrap check encountered an unexpected warning:", err);
      }
    }
  };

  // Trigger seed check shortly after start
  setTimeout(bootstrapFirestore, 1500);

  // API router / health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'healthy',
      version: '3.2.0-LTS',
      uptime: process.uptime(),
      time: new Date().toISOString()
    });
  });

  // GET /api/devices
  app.get('/api/devices', (req, res) => {
    res.json(devices);
  });

  // POST /api/devices (Sync/Update/Create devices)
  app.post('/api/devices', async (req, res) => {
    const { id, name, type, lat, lng, status } = req.body;
    if (!id) {
       return res.status(400).json({ error: 'Device Unique Identifier ID ("id") is required.' });
    }
    const idx = devices.findIndex(d => d.id === id);
    const updatedDevice = {
       id,
       name: name || (idx >= 0 ? devices[idx].name : 'External Sensor Node'),
       type: type || (idx >= 0 ? devices[idx].type : 'air'),
       lat: typeof lat === 'number' ? lat : (idx >= 0 ? devices[idx].lat : -1.9445),
       lng: typeof lng === 'number' ? lng : (idx >= 0 ? devices[idx].lng : 30.2025),
       status: status || (idx >= 0 ? devices[idx].status : 'ok')
    };

    if (idx >= 0) {
      devices[idx] = updatedDevice;
    } else {
      devices.push(updatedDevice);
    }
    
    const label = {
      timestamp: new Date().toISOString(),
      source: 'REST API',
      message: `Device payload synchronized for [${id}] -> Status: ${updatedDevice.status}.`,
      type: updatedDevice.status === 'crit' ? 'error' : updatedDevice.status === 'warn' ? 'warn' : 'info'
    };
    logs.push(label);

    // Sync to Firestore if initialized
    await safeDbWrite('devices', updatedDevice.id, updatedDevice);
    const lId = `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    await safeDbWrite('logs', lId, label);

    res.json({ success: true, message: 'Device status updated.', device: updatedDevice });
  });

  // GET /api/users
  app.get('/api/users', (req, res) => {
    res.json(users);
  });

  // POST /api/users (Add or track user location)
  app.post('/api/users', async (req, res) => {
    const { id, name, role, lat, lng, status } = req.body;
    if (!id) {
       return res.status(400).json({ error: 'Operator Unique ID ("id") is required.' });
    }
    const idx = users.findIndex(u => u.id === id);
    const updatedUser = {
       id,
       name: name || (idx >= 0 ? users[idx].name : 'Remote Operator'),
       role: role || (idx >= 0 ? users[idx].role : 'Operator'),
       lat: typeof lat === 'number' ? lat : (idx >= 0 ? users[idx].lat : -1.9441),
       lng: typeof lng === 'number' ? lng : (idx >= 0 ? users[idx].lng : 30.0619),
       status: status || (idx >= 0 ? users[idx].status : 'online')
    };

    if (idx >= 0) {
      users[idx] = updatedUser;
    } else {
      users.push(updatedUser);
    }

    const label = {
      timestamp: new Date().toISOString(),
      source: 'REST API',
      message: `Geographic tracking update received for operator ${updatedUser.name} (${id}).`,
      type: 'info'
    };
    logs.push(label);

    // Sync user session to Firestore if initialized
    await safeDbWrite('users', updatedUser.id, updatedUser);
    const lId = `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    await safeDbWrite('logs', lId, label);

    res.json({ success: true, message: 'Operator credentials and location synced.', user: updatedUser });
  });

  // GET /api/metrics
  app.get('/api/metrics', (req, res) => {
     res.json(metrics);
  });

  // POST /api/metrics (Update telemetry values)
  app.post('/api/metrics', async (req, res) => {
     const { temp, water, air, power } = req.body;
     let updated = [];
     
     if (typeof temp === 'number') {
        metrics.temp.value = temp;
        metrics.temp.history.push(temp);
        metrics.temp.history = metrics.temp.history.slice(-50);
        updated.push('temp');
     }
     if (typeof water === 'number') {
        metrics.water.value = water;
        metrics.water.history.push(water);
        metrics.water.history = metrics.water.history.slice(-50);
        updated.push('water');
     }
     if (typeof air === 'number') {
        metrics.air.value = air;
        metrics.air.history.push(air);
        metrics.air.history = metrics.air.history.slice(-50);
        updated.push('air');
     }
     if (typeof power === 'number') {
        metrics.power.value = power;
        metrics.power.history.push(power);
        metrics.power.history = metrics.power.history.slice(-50);
        updated.push('power');
     }

     if (updated.length > 0) {
       const label = {
         timestamp: new Date().toISOString(),
         source: 'REST API',
         message: `Grid operational telemetry adjusted: ${updated.join(', ')}`,
         type: 'info'
       };
       logs.push(label);

              // Sync telemetry parameters group configuration to Firestore if initialized
       await safeDbWrite('metrics', 'all', {
         water: { value: metrics.water.value, history: metrics.water.history, min: metrics.water.min, max: metrics.water.max, unit: metrics.water.unit },
         temp:  { value: metrics.temp.value, history: metrics.temp.history, min: metrics.temp.min, max: metrics.temp.max, unit: metrics.temp.unit },
         air:   { value: metrics.air.value, history: metrics.air.history, min: metrics.air.min, max: metrics.air.max, unit: metrics.air.unit },
         power: { value: metrics.power.value, history: metrics.power.history, min: metrics.power.min, max: metrics.power.max, unit: metrics.power.unit }
       });
       const lId = `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
       await safeDbWrite('logs', lId, label);

       return res.json({ success: true, message: 'Server storage synced.', current: metrics });
     }
     
     res.status(400).json({ error: 'Submit telemetry parameter: temp, water, air, or power with numeric values.' });
  });

  // GET /api/logs
  app.get('/api/logs', (req, res) => {
    res.json(logs.slice(-50).reverse());
  });

  // POST /api/logs
  app.post('/api/logs', async (req, res) => {
    const { source, message, type } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message content payload is required.' });
    }
    const newLog = {
      timestamp: new Date().toISOString(),
      source: source || 'External Node',
      message: message,
      type: type || 'info'
    };
    logs.push(newLog);

    // Sync logs to Firestore database
    const logId = `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    await safeDbWrite('logs', logId, newLog);

    res.json({ success: true, log: newLog });
  });

  // Integrate Vite dynamically in development mode
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[NOMINAL] Nexus Server started context on port ${PORT}`);
  });
}

startServer().catch(err => {
  console.error("Critical server bootstrap error:", err);
});
