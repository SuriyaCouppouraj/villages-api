require('dotenv').config();
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { PrismaNeon } = require('@prisma/adapter-neon');
const { Pool, neonConfig } = require('@neondatabase/serverless');
const ws = require('ws');

function getPrisma() {
  neonConfig.webSocketConstructor = ws;
  const pool = new Pool({
    connectionString: "postgresql://neondb_owner:npg_hPUFyABHf76W@ep-shy-brook-aoy51pmk-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
  });
  const adapter = new PrismaNeon(pool);
  return new PrismaClient({ adapter });
}

// Get all states
router.get('/states', async (req, res) => {
  try {
    const prisma = getPrisma();
    const states = await prisma.state.findMany({
      select: { id: true, name: true, code: true }
    });
    res.json({ success: true, count: states.length, data: states });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error!', error: error.message });
  }
});

// Get districts by state
router.get('/states/:stateId/districts', async (req, res) => {
  try {
    const prisma = getPrisma();
    const { stateId } = req.params;
    const districts = await prisma.district.findMany({
      where: { stateId: parseInt(stateId) },
      select: { id: true, name: true, code: true }
    });
    res.json({ success: true, count: districts.length, data: districts });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error!', error: error.message });
  }
});

// Get subdistricts by district
router.get('/districts/:districtId/subdistricts', async (req, res) => {
  try {
    const prisma = getPrisma();
    const { districtId } = req.params;
    const subDistricts = await prisma.subDistrict.findMany({
      where: { districtId: parseInt(districtId) },
      select: { id: true, name: true, code: true }
    });
    res.json({ success: true, count: subDistricts.length, data: subDistricts });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error!', error: error.message });
  }
});

// Get villages by subdistrict
router.get('/subdistricts/:subDistrictId/villages', async (req, res) => {
  try {
    const prisma = getPrisma();
    const { subDistrictId } = req.params;
    const villages = await prisma.village.findMany({
      where: { subDistrictId: parseInt(subDistrictId) },
      select: { id: true, name: true, code: true }
    });
    res.json({ success: true, count: villages.length, data: villages });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error!', error: error.message });
  }
});

// Search villages by name
router.get('/villages/search', async (req, res) => {
  try {
    const prisma = getPrisma();
    const { name } = req.query;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Please provide a search term!' });
    }
    const villages = await prisma.village.findMany({
      where: { name: { contains: name, mode: 'insensitive' } },
      include: {
        subDistrict: {
          include: {
            district: { include: { state: true } }
          }
        }
      },
      take: 50
    });
    res.json({ success: true, count: villages.length, data: villages });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error!', error: error.message });
  }
});

module.exports = router;