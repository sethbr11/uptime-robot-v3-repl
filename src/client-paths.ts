import type { UptimeRobotService } from 'uptime-robot-v3';

export type ResourceEntry = {
  /** Section title in help table */
  category: string;
  /** e.g. service.monitors or service.psps.announcements */
  access: string;
  /** Class name hint for TypeDoc URLs (filename-style) */
  typedocFileClass: string;
};

/**
 * Ordered resources matching the public SDK. Method names are discovered at runtime via introspection.
 * typedocFileClass must match TypeDoc’s emitted HTML for that class (see hosted docs if links 404).
 */
export const RESOURCE_ENTRIES: ResourceEntry[] = [
  { category: 'Tools', access: 'service.tools', typedocFileClass: 'tools.UptimeRobotTools' },
  { category: 'Monitors', access: 'service.monitors', typedocFileClass: 'parts_monitors.Monitors' },
  { category: 'Monitors · bulk', access: 'service.monitors.bulk', typedocFileClass: 'parts_monitorsBulk.MonitorsBulk' },
  { category: 'PSPs', access: 'service.psps', typedocFileClass: 'parts_psps.PSPs' },
  {
    category: 'PSP Announcements',
    access: 'service.psps.announcements',
    typedocFileClass: 'parts_pspAnnouncements.PSPAnnouncements',
  },
  {
    category: 'Maintenance Windows',
    access: 'service.maintenanceWindows',
    typedocFileClass: 'parts_maintenanceWindows.MaintenanceWindows',
  },
  { category: 'Users', access: 'service.users', typedocFileClass: 'parts_users.Users' },
  {
    category: 'Integrations',
    access: 'service.integrations',
    typedocFileClass: 'parts_integrations.Integrations',
  },
  { category: 'Incidents', access: 'service.incidents', typedocFileClass: 'parts_incidents.Incidents' },
  {
    category: 'Monitor Groups',
    access: 'service.monitorGroups',
    typedocFileClass: 'parts_monitorGroups.MonitorGroups',
  },
  { category: 'Tags', access: 'service.tags', typedocFileClass: 'parts_tags.Tags' },
];

/**
 * Follows dotted `access` (e.g. `service.monitors.bulk`) on the live SDK root and returns that object, or undefined if absent.
 */
function resolveTarget(service: UptimeRobotService, access: string): unknown {
  const parts = access.replace(/^service\./, '').split('.');
  let cur: unknown = service;
  for (const p of parts) {
    if (cur == null || typeof cur !== 'object') return undefined;
    cur = (cur as Record<string, unknown>)[p];
  }
  return cur;
}

/**
 * Filters method names surfaced in REPL help (excludes ctor, validators, SDK helpers).
 * @returns Whether `methodName` should appear in the method index / search
 */
export function shouldListInReplHelp(methodName: string): boolean {
  if (methodName === 'constructor') return false;
  if (methodName.startsWith('validate')) return false;
  if (methodName === 'createFormData') return false;
  return true;
}

/**
 * Collects enumerable function names on `obj`'s prototype (excluding constructor), filtered through {@link shouldListInReplHelp}.
 * @returns Sorted unique method names, or empty if `obj` is not object-like or has no methods
 */
export function listInstanceMethods(obj: unknown): string[] {
  if (obj == null || typeof obj !== 'object') return [];
  const proto = Object.getPrototypeOf(obj);
  if (!proto || proto === Object.prototype) return [];
  return Object.getOwnPropertyNames(proto)
    .filter((name) => shouldListInReplHelp(name))
    .filter((name) => {
      const d = Object.getOwnPropertyDescriptor(proto, name);
      return d && typeof d.value === 'function';
    })
    .sort((a, b) => a.localeCompare(b));
}

/**
 * Resolves a resource subtree on `service` for the given catalogue entry (`entry.access`).
 */
export function getResourceTarget(service: UptimeRobotService, entry: ResourceEntry): unknown {
  return resolveTarget(service, entry.access);
}

/**
 * Builds the TypeDoc class page URL for a resource (`entry.typedocFileClass` fragment under `base`).
 * @param base Trailing-slash TypeDoc root (`UPTIMEROBOT_DOCS_BASE`).
 */
export function classDocsUrl(entry: ResourceEntry, base: string): string {
  return `${base}classes/${entry.typedocFileClass}.html`;
}
