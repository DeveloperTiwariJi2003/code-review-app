const express = require('express');
const router = express.Router();
const Room = require('../models/Room');
const { v4: uuidv4 } = require('uuid');


router.post('/create',async(req,res)=>{
    try {
        const id = uuidv4().slice(0,8);
        const newroom = new Room({roomId : id});
        await newroom.save();
        res.json({id});
    } catch (err) {
        console.log(err);
        res.status(500).json({ err: "Failed to create room" });
    }
})
router.get('/:roomId',async(req,res)=>{
    try {
        const {roomId} = req.params;
        const room = await Room.findOne({roomId});
        if(!room){
            return res.status(400).json({error:"Room not found"});
        }
        res.json({ message: "Room exists", room });
    } catch (err) {
        res.status(500).json({ err: "Room not found" });
    }
})
module.exports = router;