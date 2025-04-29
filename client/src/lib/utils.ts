import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatRelative, format } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string | number): string {
  if (!date) return "";
  
  const dateObj = typeof date === "string" || typeof date === "number" 
    ? new Date(date) 
    : date;
  
  return format(dateObj, "EEEE, MMMM d, yyyy · h:mm a");
}

export function formatRelativeTime(date: Date | string | number): string {
  if (!date) return "";
  
  const dateObj = typeof date === "string" || typeof date === "number" 
    ? new Date(date) 
    : date;
  
  return formatRelative(dateObj, new Date());
}

export function generateCalendarEvent(session: any): string {
  if (!session) return "";
  
  const startTime = new Date(session.startTime);
  const endTime = new Date(session.endTime);
  
  const event = {
    begin: startTime.toISOString(),
    end: endTime.toISOString(),
    title: session.title,
    description: session.description,
    location: session.location,
  };
  
  // Create .ics file content
  const icsContent = `
BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART:${event.begin.replace(/[-:]/g, "").replace(/\.\d{3}/, "")}
DTEND:${event.end.replace(/[-:]/g, "").replace(/\.\d{3}/, "")}
SUMMARY:${event.title}
DESCRIPTION:${event.description}
LOCATION:${event.location}
END:VEVENT
END:VCALENDAR
`.trim();
  
  return icsContent;
}

export function downloadICSFile(content: string, filename: string): void {
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const link = document.createElement("a");
  
  link.href = window.URL.createObjectURL(blob);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
