import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { differenceInDays, isAfter, isBefore, parseISO, startOfToday } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getProjectTimelineStatus(project: any) {
  if (project.archived) return { status: 'archived' as const };
  if (!project.startDate || !project.endDate) return { status: 'unknown' as const };
  
  const today = startOfToday();
  const start = parseISO(project.startDate);
  const end = parseISO(project.endDate);

  if (isBefore(end, today)) {
    return { status: 'completed' as const, daysAgo: differenceInDays(today, end) };
  } else if ((isBefore(start, today) || start.getTime() === today.getTime()) && (isAfter(end, today) || end.getTime() === today.getTime()) || project.status === '進行中') {
    return { status: 'ongoing' as const, daysLeft: differenceInDays(end, today) };
  } else if (isAfter(start, today)) {
    return { status: 'upcoming' as const, daysUntil: differenceInDays(start, today) };
  }
  return { status: 'unknown' as const };
}