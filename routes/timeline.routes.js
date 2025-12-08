// routes/timeline.routes.js
const express = require('express');
// Router is a mini application that handles HTTP requests
const router = express.Router();
const TimelineEvent = require('../models/Timeline');
const { authenticate, isAdmin } = require('../middleware/auth');

// Get all timeline events with filtering and sorting
router.get('/', async (req, res) => {
    try {
        const {era, category, significance} = req.query; // extract query parameters (stuff after ? in URL)

        const filter = {};
        if (era) filter.era = era;
        if (category) filter.category = category;
        if (significance) filter.significance = significance;

        const events = await TimelineEvent.find(filter).sort('order');
        res.json(events);

    }
    catch (error) {
        res.status(500).json({error: error.message});
    }
});    

// get events by specific era
router.get('/era/:era', async (req, res) => {
    try {
        const events = await TimelineEvent.find({ era: req.params.era }).sort('order');
        res.json(events);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }   
});    

// get major events only 
router.get('/major', async (req, res) => {
    try {
        // major events defined as 'Major' and 'Critical' significance
        // $in means "is in this array"
        const events = await TimelineEvent.find({ significance: { $in: ['Major', 'Critical'] } }).sort('order');
        res.json(events);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// get next available order number
router.get('/util/next-order', async (req, res) => {
    try {
        const maxOrderEvent = await TimelineEvent.findOne().sort('-order');
        const nextOrder = maxOrderEvent ? maxOrderEvent.order + 1 : 1;
        res.json({ 
          nextOrder, 
          totalEvents: await TimelineEvent.countDocuments({})
         });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// get event by ID
router.get('/:id', async (req, res) => {
    try { 
        const event = await TimelineEvent.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }
        res.json(event);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// get stats at specific point in timeline
router.get('/stats/:order', async (req, res) => {
    try {
        // findOne finds the first document that matches the criteria
        // $lte means "less than or equal to"   
        // order = field in database
        // req.params.order = value from URL
        const event = await TimelineEvent.findOne({
            order: { $lte: parseInt(req.params.order)},  // order <= requested order
            stats: { $exists: true }  // stats field exists
        }).sort('-order'); // sort descending to get the latest event with stats


        if (!event || !event.stats) {
            return res.status(404).json({ error: 'No stats available at this point' });
        }

        // if we try to get an order that happnened way later like 1000 but the latest event is 500 give an error

        if (event.order < parseInt(req.params.order)) {
            return res.status(404).json({ error: 'No stats available at this point' });
        }

        res.json(event.stats);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Helper function to shift orders
async function shiftOrdersUp(startingOrder) {
  try {
    // Get all events with order >= startingOrder, sorted by order descending
    const eventsToShift = await TimelineEvent.find({ 
      order: { $gte: startingOrder } 
    }).sort('-order'); // Descending order to avoid conflicts

    // Shift each event's order up by 1
    for (const event of eventsToShift) {
      event.order += 1;
      await event.save();
    }

    return eventsToShift.length; // Return count of shifted events
  }
  
  catch (error) {
    throw new Error(`Failed to shift orders: ${error.message}`);
  }
}

// Create timeline event (Admin only) - WITH AUTO-SHIFTING
router.post('/', authenticate, isAdmin, async (req, res) => {
  try {
    const { order } =  req.body;

    // Check if an event with this order already exists
    const existingEvent = await TimelineEvent.findOne({ order });

    let shiftedCount = 0;

    if (existingEvent) {
      // Shift all events at this order and above
      shiftedCount = await shiftOrdersUp(order);
      console.log(`Shifted ${shiftedCount} events to accommodate new order ${order}`);
    }

    // Create the new event with the requested order
    const event = new TimelineEvent(req.body);
    await event.save();

    res.status(201).json({
      message: existingEvent 
        ? `Event created at order ${order}. ${shiftedCount} events were shifted up.`
        : `Event created at order ${order}.`,
      event,
      shifted: existingEvent ? shiftedCount : 0
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update timeline event (Admin only) - WITH AUTO-SHIFTING (no sessions)
router.put('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const eventId = req.params.id;

    // Parse explicit numeric order if present
    let newOrder = req.body.order;
    newOrder = (newOrder != null) ? Number(newOrder) : undefined;

    // Find current event
    const currentEvent = await TimelineEvent.findById(eventId);
    if (!currentEvent) return res.status(404).json({ error: 'Event not found' });

    const oldOrder = Number(currentEvent.order);

    // If no order change requested, just update the event fields (no shifting)
    if (newOrder === undefined || newOrder === oldOrder) {
      const updated = await TimelineEvent.findByIdAndUpdate(
        eventId,
        req.body,
        { new: true, runValidators: true }
      );
      return res.json({ message: 'Event updated.', event: updated });
    }

    // Count events to clamp the target order
    const total = await TimelineEvent.countDocuments({});
    // clamp newOrder into [1, total];
    newOrder = Math.max(1, Math.min(total, Math.floor(newOrder)));

    // Shift minimal range to make room for newOrder
    if (newOrder < oldOrder) {
      // moving earlier: increment orders in [newOrder .. oldOrder-1] by +1
      await TimelineEvent.updateMany(
        {
          order: { $gte: newOrder, $lt: oldOrder },
          _id: { $ne: eventId }
        },
        { $inc: { order: 1 } }
      );
    } else if (newOrder > oldOrder) {
      // moving later: decrement orders in [oldOrder+1 .. newOrder] by -1
      await TimelineEvent.updateMany(
        {
          order: { $gt: oldOrder, $lte: newOrder },
          _id: { $ne: eventId }
        },
        { $inc: { order: -1 } }
      );
    }

    // Put the moved event at the newOrder
    await TimelineEvent.updateOne(
      { _id: eventId },
      { $set: { order: newOrder } },
      { runValidators: true }
    );

    // FINAL: re-sequence everything deterministically to ensure no gaps/dupes.
    // Stable order by (order asc, _id asc)
    const events = await TimelineEvent.find({}).sort({ order: 1, _id: 1 }).lean();

    let needsRewrite = false;
    for (let i = 0; i < events.length; i++) {
      if (events[i].order !== i + 1) { needsRewrite = true; break; }
    }

    if (needsRewrite) {
      const bulkOps = events.map((ev, idx) => ({
        updateOne: {
          filter: { _id: ev._id },
          update: { $set: { order: idx + 1 } }
        }
      }));
      if (bulkOps.length) await TimelineEvent.bulkWrite(bulkOps);
    }

    // Ensure we use the DB-canonical order when updating remaining fields
    const finalEvent = await TimelineEvent.findById(eventId);
    req.body.order = finalEvent.order;

    const updatedEvent = await TimelineEvent.findByIdAndUpdate(
      eventId,
      req.body,
      { new: true, runValidators: true }
    );

    return res.json({
      message: `Event updated. Order moved from ${oldOrder} to ${req.body.order}.`,
      event: updatedEvent
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});



// Delete timeline event (Admin only) - WITH ORDER COMPACTING
router.delete('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const event = await TimelineEvent.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const deletedOrder = event.order;

    // Delete the event
    await event.deleteOne();

    // Shift down all events that were after the deleted one
    await TimelineEvent.updateMany(
      { order: { $gt: deletedOrder } },
      { $inc: { order: -1 } }
    );

    res.json({ 
      message: `Event deleted successfully. Events after order ${deletedOrder} were shifted down.`,
      deletedOrder,
      shiftedDown: true
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// reorder all events (Admin only)
router.post('/reorder', authenticate, isAdmin, async (req, res) => {
    try {

        // get all events sorted by current order
        const events = await TimelineEvent.find().sort('order'); 

      const updates = [];
      // reassign orders sequentially starting from 1
      for (let i = 0; i < events.length; i++) {
          const newOrder = i + 1;
          if (events[i].order !== newOrder) {
              events[i].order = newOrder;
              updates.push(events[i].save());
          }
      }
      // wait for all saves to complete before responding
      await Promise.all(updates);

      res.json({ message: 'Events reordered successfully.', 
        eventsReordered: updates.length, 
        totalEvents: events.length
       });

        
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});



module.exports = router;