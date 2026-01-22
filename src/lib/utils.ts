import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Capitalize the first letter of a string
export function capitalizeFirstLetter(string: string): string {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

// Format date to display in a readable format
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// Format time to display in 12-hour format
export function formatTime(timeString: string): string {
  // Handle time in HH:MM format
  const [hours, minutes] = timeString.split(':').map(Number);
  
  // Convert to 12-hour format
  const period = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours % 12 || 12;
  
  return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
}

// Calculate distance between two coordinates in miles
export function calculateDistance(
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number {
  const R = 3958.8; // Earth's radius in miles
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(1));
}

// Convert degrees to radians
function toRad(degrees: number): number {
  return degrees * Math.PI / 180;
}

// Weekend status for recurring events
export interface WeekendStatus {
  isThisWeekend: boolean;
  status: 'happening-this-weekend' | 'next-weekend' | 'none';
  message: string;
  emoji: string;
}

export function getWeekendStatus(dayOfWeek: string): WeekendStatus {
  const dayMapping = {
    'sunday': 0, 'monday': 1, 'tuesday': 2, 'wednesday': 3, 
    'thursday': 4, 'friday': 5, 'saturday': 6
  };
  
  const normalizedDay = dayOfWeek.toLowerCase();
  const eventDay = dayMapping[normalizedDay as keyof typeof dayMapping];
  
  // If invalid day, return none
  if (eventDay === undefined) {
    return {
      isThisWeekend: false,
      status: 'none',
      message: '',
      emoji: ''
    };
  }
  
  // Get current UK time (Europe/London timezone)
  const now = new Date();
  const ukTime = new Date(now.toLocaleString("en-US", {timeZone: "Europe/London"}));
  const today = ukTime.getDay(); // 0 = Sunday, 6 = Saturday
  const currentHour = ukTime.getHours();
  
  // Saturday (6) and Sunday (0) are weekend days
  const isWeekendEvent = eventDay === 0 || eventDay === 6;
  
  if (!isWeekendEvent) {
    return {
      isThisWeekend: false,
      status: 'none',
      message: '',
      emoji: ''
    };
  }
  
  // Check if it's happening this weekend
  if (eventDay === 6) { // Saturday event
    if (today < 6) {
      return {
        isThisWeekend: true,
        status: 'happening-this-weekend',
        message: 'Happening this Saturday',
        emoji: '✅'
      };
    } else if (today === 6) {
      if (currentHour < 16) {
        return {
          isThisWeekend: true,
          status: 'happening-this-weekend',
          message: 'Happening today',
          emoji: '🔥'
        };
      } else {
        return {
          isThisWeekend: false,
          status: 'next-weekend',
          message: 'Next Saturday',
          emoji: '🕓'
        };
      }
    } else {
      return {
        isThisWeekend: false,
        status: 'next-weekend',
        message: 'Next Saturday',
        emoji: '🕓'
      };
    }
  } else { // Sunday event (eventDay === 0)
    if (today === 0) {
      if (currentHour < 16) {
        return {
          isThisWeekend: true,
          status: 'happening-this-weekend',
          message: 'Happening today',
          emoji: '🔥'
        };
      } else {
        return {
          isThisWeekend: false,
          status: 'next-weekend',
          message: 'Next Sunday',
          emoji: '🕓'
        };
      }
    } else if (today < 7) {
      if (today === 6) {
        return {
          isThisWeekend: true,
          status: 'happening-this-weekend',
          message: 'Happening tomorrow',
          emoji: '⭐'
        };
      } else {
        return {
          isThisWeekend: true,
          status: 'happening-this-weekend',
          message: 'Happening this Sunday',
          emoji: '✅'
        };
      }
    }
  }
  
  return {
    isThisWeekend: false,
    status: 'none',
    message: '',
    emoji: ''
  };
}

// Calendar event interface
export interface CalendarEvent {
  title: string;
  description: string;
  location: string;
  startDate: Date;
  endDate: Date;
  url?: string;
}

// Get the next occurrence of a specific day of the week
export function getNextOccurrence(dayOfWeek: string): Date {
  const dayMapping = {
    'sunday': 0, 'monday': 1, 'tuesday': 2, 'wednesday': 3, 
    'thursday': 4, 'friday': 5, 'saturday': 6
  };
  
  const normalizedDay = dayOfWeek.toLowerCase();
  const targetDay = dayMapping[normalizedDay as keyof typeof dayMapping];
  
  if (targetDay === undefined) {
    throw new Error(`Invalid day of week: ${dayOfWeek}`);
  }
  
  const now = new Date();
  const ukTime = new Date(now.toLocaleString("en-US", {timeZone: "Europe/London"}));
  const today = ukTime.getDay();
  
  let daysUntil = targetDay - today;
  
  if (daysUntil <= 0) {
    daysUntil += 7;
  }
  
  const nextOccurrence = new Date(ukTime);
  nextOccurrence.setDate(ukTime.getDate() + daysUntil);
  nextOccurrence.setHours(0, 0, 0, 0);
  
  return nextOccurrence;
}

// Format date for calendar systems (YYYYMMDD format)
export function formatDateForCalendar(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

// Format datetime for calendar systems (YYYYMMDDTHHMMSS format)
export function formatDateTimeForCalendar(date: Date): string {
  const dateStr = formatDateForCalendar(date);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${dateStr}T${hours}${minutes}${seconds}`;
}

// Parse time string (HH:MM) and set it on a date
export function setTimeOnDate(date: Date, timeString: string): Date {
  const [hours, minutes] = timeString.split(':').map(Number);
  const newDate = new Date(date);
  newDate.setHours(hours, minutes, 0, 0);
  return newDate;
}

// Generate Google Calendar URL
export function generateGoogleCalendarUrl(event: CalendarEvent): string {
  const baseUrl = 'https://calendar.google.com/calendar/render';
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${formatDateTimeForCalendar(event.startDate)}/${formatDateTimeForCalendar(event.endDate)}`,
    details: event.description,
    location: event.location,
    ctz: 'Europe/London'
  });
  
  if (event.url) {
    params.set('website', event.url);
  }
  
  return `${baseUrl}?${params.toString()}`;
}

// Generate .ics file content for Apple Calendar and Outlook
export function generateIcsContent(event: CalendarEvent): string {
  const now = new Date();
  const timestamp = formatDateTimeForCalendar(now) + 'Z';
  const uid = `carboot-${Date.now()}@carbootsale.com`;
  
  const escapeText = (text: string) => {
    return text
      .replace(/\\/g, '\\\\')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '');
  };
  
  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//CarBootSale.com//Car Boot Sale Event//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${timestamp}`,
    `DTSTART:${formatDateTimeForCalendar(event.startDate)}`,
    `DTEND:${formatDateTimeForCalendar(event.endDate)}`,
    `SUMMARY:${escapeText(event.title)}`,
    `DESCRIPTION:${escapeText(event.description)}`,
    `LOCATION:${escapeText(event.location)}`,
    'STATUS:CONFIRMED',
    'TRANSP:OPAQUE',
    event.url ? `URL:${event.url}` : '',
    'END:VEVENT',
    'END:VCALENDAR'
  ].filter(line => line !== '').join('\r\n');
  
  return icsContent;
}

// Generate data URL for .ics file download
export function generateIcsDataUrl(event: CalendarEvent): string {
  const icsContent = generateIcsContent(event);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  return URL.createObjectURL(blob);
}

// Create calendar event from car boot sale data
export function createCalendarEvent(
  sale: {
    name: string;
    location: string;
    address?: string;
    daysOfWeek: string[];
    startTime: string;
    endTime: string;
    carPrice: number;
    vanPrice: number;
    organiserEmail: string;
    organiserPhone: string;
    otherInfo?: string;
    what3words?: string;
  },
  siteUrl?: string
): CalendarEvent {
  const eventDate = getNextOccurrence(sale.daysOfWeek && sale.daysOfWeek.length > 0 ? sale.daysOfWeek[0] : 'saturday');
  const startDate = setTimeOnDate(eventDate, sale.startTime);
  const endDate = setTimeOnDate(eventDate, sale.endTime);
  
  const location = sale.address 
    ? `${sale.address}, ${sale.location}, UK`
    : `${sale.location}, UK`;
  
  let description = `Join us at ${sale.name} car boot sale!\n\n`;
  description += `📍 Location: ${location}\n`;
  description += `⏰ Time: ${sale.startTime} - ${sale.endTime}\n`;
  description += `🚗 Car Entry: £${sale.carPrice.toFixed(2)}\n`;
  description += `🚚 Van Entry: £${sale.vanPrice.toFixed(2)}\n\n`;
  
  if (sale.otherInfo) {
    description += `About this event:\n${sale.otherInfo}\n\n`;
  }
  
  description += `Contact Information:\n`;
  description += `📧 Email: ${sale.organiserEmail}\n`;
  description += `📞 Phone: ${sale.organiserPhone}\n`;
  
  if (sale.what3words) {
    description += `\n🎯 What3Words: ${sale.what3words}\n`;
  }
  
  if (siteUrl) {
    description += `\n🌐 More details: ${siteUrl}`;
  }
  
  return {
    title: sale.name,
    description,
    location,
    startDate,
    endDate,
    url: siteUrl
  };
}
