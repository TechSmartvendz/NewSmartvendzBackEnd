require("dotenv").config();
const express = require('express');
const router = express.Router();
const axios = require('axios'); // For making requests to the external module
const auth = require("../middleware/authentication");
const moment = require('moment');
const Mapping = require('../model/devicesMachinesMappingSchema');
const machineslot = require("../model/m_machine_slot");
const machines = require("../model/m_machine");
const product = require("../model/m_product");
const SNAX_SMART_BASIC_AUTH = process.env.SNAX_SMART_BASIC_AUTH;
const EXTERNAL_API_BASE_URL = process.env.EXTERNAL_API_BASE_URL;  //'https://ssmart-api-rup2dfg24a-el.a.run.app

const headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Basic '+ SNAX_SMART_BASIC_AUTH // Replace with your actual Base64 encoded credentials
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
    let { fromdate, todate } = req.query;
    if (!fromdate || !todate) {
        return res.status(400).json({ error: 'FromDate and ToDate are required' });
    }

    try {
        fromdate=moment(fromdate).format('YYYYMMDD');
        todate=moment(todate).format('YYYYMMDD');
        const response = await axios.get(`${EXTERNAL_API_BASE_URL}/api/txns`, {
            headers,
            params: { fromdate, todate },
        });
    } catch (err) {
        res.status(err.response?.status || 500).json({ error: err.message });
    }
});

// 3. `/api/txns/<machinId>` & '/api/txns/today'- Optional `fromdate` and `todate`
router.get('/txns/:machineId', auth, async (req, res) => {
    let { fromdate, todate } = req.query;
    const { machineId } = req.params;
   
    if(machineId.toUpperCase() === "TODAY"){
        try {
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
            let deviceName  = await Mapping.findOne({ "machine_id" : machineId },{device_name:1, _id:0});
            if (!deviceName) return res.status(404).json({ error: 'Mapping not found for selected Machine.' });
            fromdate=moment(fromdate).format('YYYYMMDD');
            // console.log('fromdate > ',fromdate);
            todate=moment(todate).format('YYYYMMDD');
            // console.log('todate > ',todate);

            deviceName =deviceName.device_name;
           
            const response = await axios.get(`${EXTERNAL_API_BASE_URL}/api/txns/${deviceName}`, {
                headers,
                params: { fromdate, todate },
            });

            // console.log('response > ',response.data);


            // console.log('fromdate > ',req.query.fromdate);
            // console.log('todate > ',req.query.todate);


            const filteredTxns = filterTransactions(response.data, req.query.fromdate, req.query.todate);


            await Promise.all(filteredTxns.map(async (item) => {
                if (item.pgTxns) {
                    for (const txn of item.pgTxns) {
                        const productIds = await machineslot.find({ 
                            machineName: machineId, 
                            slot: txn[3].toString(), 
                            delete_status: false 
                        }).select("product").lean();
                        if (productIds && productIds.length >0)
                        {
                            const productData = await product.find({ 
                                _id: { $in: productIds.map(p => p.product) } 
                            });
                            txn[5] = productData[0].productname?productData[0].productname:""
                        }
                        else {
                            txn[5]=""
                        }
                        // console.log(`${txn[3]} ${txn[5]}`);
                    }
                }
            }));

            
            //res.status(response.status).json(response.data);
            res.json(filteredTxns);
        } catch (err) {
            console.log(err);
            res.status(err.response?.status || 500).json({ error: err.message });
        }

    }

   
});

const filterTransactions = (transactions, fromdate, todate) => {
    let fromDateTime = new Date(fromdate);
    let toDateTime = new Date(todate);

    // If only date is given, set start and end of the day
    if (!fromdate.includes("T")) fromDateTime.setHours(0, 0, 0, 0);
    if (!todate.includes("T")) toDateTime.setHours(23, 59, 59, 999);

    console.log(JSON.toString(transactions))

    return transactions.map(transaction => {
        if (transaction.pgTxns && Array.isArray(transaction.pgTxns)) {
            transaction.pgTxns = transaction.pgTxns.filter(txn => {
                let txnDate = parseTxnDate(txn[0]); // Convert txn date to Date object
                return txnDate >= fromDateTime && txnDate <= toDateTime;
            });
            transaction.pg = transaction.pgTxns.length;
        }

         // Filter refundTxns if exists
         if (transaction.refundTxns && Array.isArray(transaction.refundTxns)) {
            transaction.refundTxns = transaction.refundTxns.filter(txn => {
                let txnDate = parseTxnDate(txn[0]);
                return txnDate >= fromDateTime && txnDate <= toDateTime;
            });
            transaction.refund = transaction.refundTxns.length;
        }


        return transaction;
    });
};

// Convert "11/Mar/2025 11:54:49" to a Date object
const parseTxnDate = (dateStr) => {
    const months = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };
    let [day, mon, year, time] = dateStr.split(/[/ ]/);
    let [hours, minutes, seconds] = time.split(":").map(Number);
    return new Date(year, months[mon], day, hours, minutes, seconds);
};





module.exports = router;
