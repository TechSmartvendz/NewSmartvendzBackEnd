require("dotenv").config();
const express = require('express');
const router = express.Router();
const axios = require('axios'); // For making requests to the external module
const auth = require("../middleware/authentication")

const SNAX_SMART_BASIC_AUTH = process.env.SNAX_SMART_BASIC_AUTH;
const EXTERNAL_API_BASE_URL = process.env.EXTERNAL_API_BASE_URL;  //'https://ssmart-api-rup2dfg24a-el.a.run.app

const headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Basic '+SNAX_SMART_BASIC_AUTH.trim() // Replace with your actual Base64 encoded credentials
};

// 1. `/api/devices` - No additional parameters required
router.get('/devices', auth, async (req, res) => {
    try {
        const response = await axios.get(`${EXTERNAL_API_BASE_URL}/api/devices`,{ headers });
        res.status(response.status).json(response.data);
    } catch (err) {
        res.status(err.response?.status || 500).json({ error: err.message });
    }
});

// 2. `/api/txns` - Requires `fromdate` and `todate`
router.get('/txns', auth, async (req, res) => {
    console.log('/api/txns')
    const { fromdate, todate } = req.query;

    if (!fromdate || !todate) {
        return res.status(400).json({ error: 'fromdate and todate are required' });
    }

    try {
        const response = await axios.get(`${EXTERNAL_API_BASE_URL}/api/txns`, {
            headers,
            params: { fromdate, todate },
        });
        res.status(response.status).json(response.data);
    } catch (err) {
        res.status(err.response?.status || 500).json({ error: err.message });
    }
});

// 4. `/api/txns/today` - No additional parameters required
// router.get('/txns/today', auth, async (req, res) => {
//     try {
//         console.log('/api/txns/today')
//         const response = await axios.get(`${EXTERNAL_API_BASE_URL}/api/txns/today`, {headers});
//         res.status(response.status).json(response.data);
//     } catch (err) {
//         res.status(err.response?.status || 500).json({ error: err.message });
//     }
// });

// 3. `/api/txns/<deviceName>` - Requires `fromdate` and `todate`
router.get('/txns/:deviceName', auth, async (req, res) => {
    console.log('/api/txns/:deviceName')
    const { fromdate, todate } = req.query;
    const { deviceName } = req.params;
    console.log(deviceName.toUpperCase)
    if(deviceName.toUpperCase() === "TODAY"){
        try {
            console.log('/api/txns/today')
            const response = await axios.get(`${EXTERNAL_API_BASE_URL}/api/txns/today`, {headers});
            res.status(response.status).json(response.data);
        } catch (err) {
            res.status(err.response?.status || 500).json({ error: err.message });
        }
    }else{

        if (!fromdate || !todate) {
            return res.status(400).json({ error: 'fromdate and todate are required' });
        }
    
        try {
            const response = await axios.get(`${EXTERNAL_API_BASE_URL}/api/txns/${deviceName}`, {
                headers,
                params: { fromdate, todate },
            });
            res.status(response.status).json(response.data);
        } catch (err) {
            res.status(err.response?.status || 500).json({ error: err.message });
        }

    }

   
});



module.exports = router;
