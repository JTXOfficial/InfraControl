/**
 * Event Model
 * Represents an event in the system
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the Event schema
const EventSchema = new Schema({
  type: {
    type: String,
    required: true,
    index: true
  },
  source: {
    type: String,
    required: true,
    index: true
  },
  severity: {
    type: String,
    enum: ['info', 'warning', 'error', 'critical'],
    default: 'info',
    index: true
  },
  message: {
    type: String,
    required: true
  },
  details: {
    type: Schema.Types.Mixed,
    default: {}
  },
  resourceType: {
    type: String,
    index: true
  },
  resourceId: {
    type: String,
    index: true
  },
  userId: {
    type: Number,
    index: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  metadata: {
    type: Schema.Types.Mixed,
    default: {}
  },
  tags: {
    type: [String],
    default: [],
    index: true
  }
}, {
  timestamps: true
});

// Create compound indexes for common queries
EventSchema.index({ resourceType: 1, resourceId: 1, timestamp: -1 });
EventSchema.index({ userId: 1, timestamp: -1 });
EventSchema.index({ type: 1, severity: 1, timestamp: -1 });

// Define static methods for the Event model
EventSchema.statics = {
  /**
   * Create a new event
   * @param {Object} eventData - Event data
   * @returns {Promise<Object>} Created event
   */
  createEvent: async function(eventData) {
    try {
      const event = new this(eventData);
      return await event.save();
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  },

  /**
   * Find events with filtering
   * @param {Object} filters - Filter criteria
   * @param {Object} options - Query options (pagination, sorting)
   * @returns {Promise<Array>} List of events
   */
  findEvents: async function(filters = {}, options = {}) {
    const query = this.find();
    
    // Apply filters
    if (filters.type) {
      query.where('type').equals(filters.type);
    }
    
    if (filters.source) {
      query.where('source').equals(filters.source);
    }
    
    if (filters.severity) {
      query.where('severity').equals(filters.severity);
    }
    
    if (filters.resourceType) {
      query.where('resourceType').equals(filters.resourceType);
    }
    
    if (filters.resourceId) {
      query.where('resourceId').equals(filters.resourceId);
    }
    
    if (filters.userId) {
      query.where('userId').equals(filters.userId);
    }
    
    if (filters.tags && filters.tags.length > 0) {
      query.where('tags').in(filters.tags);
    }
    
    if (filters.startDate && filters.endDate) {
      query.where('timestamp').gte(new Date(filters.startDate)).lte(new Date(filters.endDate));
    } else if (filters.startDate) {
      query.where('timestamp').gte(new Date(filters.startDate));
    } else if (filters.endDate) {
      query.where('timestamp').lte(new Date(filters.endDate));
    }
    
    if (filters.search) {
      query.or([
        { message: { $regex: filters.search, $options: 'i' } },
        { 'details.message': { $regex: filters.search, $options: 'i' } }
      ]);
    }
    
    // Apply pagination
    if (options.limit) {
      query.limit(parseInt(options.limit));
    }
    
    if (options.skip) {
      query.skip(parseInt(options.skip));
    }
    
    // Apply sorting
    const sortField = options.sortField || 'timestamp';
    const sortOrder = options.sortOrder === 'asc' ? 1 : -1;
    query.sort({ [sortField]: sortOrder });
    
    try {
      return await query.exec();
    } catch (error) {
      console.error('Error finding events:', error);
      throw error;
    }
  },

  /**
   * Find event by ID
   * @param {string} id - Event ID
   * @returns {Promise<Object>} Event details
   */
  findEventById: async function(id) {
    try {
      return await this.findById(id);
    } catch (error) {
      console.error(`Error finding event with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Find events for a specific resource
   * @param {string} resourceType - Resource type
   * @param {string} resourceId - Resource ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} List of events
   */
  findResourceEvents: async function(resourceType, resourceId, options = {}) {
    const query = this.find({
      resourceType,
      resourceId
    });
    
    // Apply pagination
    if (options.limit) {
      query.limit(parseInt(options.limit));
    }
    
    if (options.skip) {
      query.skip(parseInt(options.skip));
    }
    
    // Apply sorting
    const sortField = options.sortField || 'timestamp';
    const sortOrder = options.sortOrder === 'asc' ? 1 : -1;
    query.sort({ [sortField]: sortOrder });
    
    try {
      return await query.exec();
    } catch (error) {
      console.error(`Error finding events for ${resourceType} ${resourceId}:`, error);
      throw error;
    }
  },

  /**
   * Get event statistics
   * @param {Object} params - Statistics parameters
   * @returns {Promise<Object>} Event statistics
   */
  getEventStats: async function(params = {}) {
    const matchStage = {};
    
    if (params.startDate && params.endDate) {
      matchStage.timestamp = {
        $gte: new Date(params.startDate),
        $lte: new Date(params.endDate)
      };
    } else if (params.startDate) {
      matchStage.timestamp = { $gte: new Date(params.startDate) };
    } else if (params.endDate) {
      matchStage.timestamp = { $lte: new Date(params.endDate) };
    }
    
    if (params.resourceType) {
      matchStage.resourceType = params.resourceType;
    }
    
    if (params.userId) {
      matchStage.userId = params.userId;
    }
    
    try {
      const stats = {
        total: await this.countDocuments(matchStage),
        byType: {},
        bySeverity: {},
        byResource: {},
        byTimeRange: {}
      };
      
      // Count by type
      const typeStats = await this.aggregate([
        { $match: matchStage },
        { $group: { _id: '$type', count: { $sum: 1 } } }
      ]);
      
      typeStats.forEach(item => {
        stats.byType[item._id] = item.count;
      });
      
      // Count by severity
      const severityStats = await this.aggregate([
        { $match: matchStage },
        { $group: { _id: '$severity', count: { $sum: 1 } } }
      ]);
      
      severityStats.forEach(item => {
        stats.bySeverity[item._id] = item.count;
      });
      
      // Count by resource type
      const resourceStats = await this.aggregate([
        { $match: matchStage },
        { $group: { _id: '$resourceType', count: { $sum: 1 } } }
      ]);
      
      resourceStats.forEach(item => {
        if (item._id) {
          stats.byResource[item._id] = item.count;
        }
      });
      
      // Count by time range (daily)
      if (params.startDate && params.endDate) {
        const timeRangeStats = await this.aggregate([
          { $match: matchStage },
          {
            $group: {
              _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
              count: { $sum: 1 }
            }
          },
          { $sort: { _id: 1 } }
        ]);
        
        timeRangeStats.forEach(item => {
          stats.byTimeRange[item._id] = item.count;
        });
      }
      
      return stats;
    } catch (error) {
      console.error('Error getting event statistics:', error);
      throw error;
    }
  }
};

// Create the model
const Event = mongoose.model('Event', EventSchema);

module.exports = Event; 