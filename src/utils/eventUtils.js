/**
 * Utility functions for event-related operations
 */

/**
 * Check if there are any ongoing or upcoming events
 * @param {Array} events - Array of events
 * @returns {boolean} - True if there are ongoing or upcoming events
 */
export const hasOngoingOrUpcomingEvents = (events) => {
  if (!Array.isArray(events) || events.length === 0) {
    return false;
  }

  const now = new Date();
  
  return events.some(event => {
    if (!event.date && !event.startTime) {
      return false;
    }
    
    const eventDate = new Date(event.date || event.startTime);
    
    // Check if event is today or in the future
    return eventDate >= now;
  });
};

/**
 * Get the count of ongoing or upcoming events
 * @param {Array} events - Array of events
 * @returns {number} - Count of ongoing or upcoming events
 */
export const getOngoingOrUpcomingEventsCount = (events) => {
  if (!Array.isArray(events) || events.length === 0) {
    return 0;
  }

  const now = new Date();
  
  return events.filter(event => {
    if (!event.date && !event.startTime) {
      return false;
    }
    
    const eventDate = new Date(event.date || event.startTime);
    
    // Check if event is today or in the future
    return eventDate >= now;
  }).length;
};

/**
 * Check if there are events happening today
 * @param {Array} events - Array of events
 * @returns {boolean} - True if there are events today
 */
export const hasEventsToday = (events) => {
  if (!Array.isArray(events) || events.length === 0) {
    return false;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  return events.some(event => {
    if (!event.date && !event.startTime) {
      return false;
    }
    
    const eventDate = new Date(event.date || event.startTime);
    eventDate.setHours(0, 0, 0, 0);
    
    return eventDate >= today && eventDate < tomorrow;
  });
};

/**
 * Get events happening today
 * @param {Array} events - Array of events
 * @returns {Array} - Array of events happening today
 */
export const getEventsToday = (events) => {
  if (!Array.isArray(events) || events.length === 0) {
    return [];
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  return events.filter(event => {
    if (!event.date && !event.startTime) {
      return false;
    }
    
    const eventDate = new Date(event.date || event.startTime);
    eventDate.setHours(0, 0, 0, 0);
    
    return eventDate >= today && eventDate < tomorrow;
  });
};
