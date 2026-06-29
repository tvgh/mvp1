import type { GitlabIssue, SecuritySeverity, SecurityVulnerability, TaskStatus } from './api/types';

export type ImportSource = 'gitlab' | 'security_scan';

export interface ImportItem {
  id: string;
  displayId: string;
  requirementId: string;
  title: string;
  description: string;
  severity?: SecuritySeverity;
  severityLabel?: string;
  packageName?: string;
  fixedVersion?: string;
}

export const IMPORT_SOURCES: Record<ImportSource, { label: string; listTitle: string }> = {
  gitlab: {
    label: 'GitLab Issues',
    listTitle: 'GitLab Issues',
  },
  security_scan: {
    label: '安全扫描',
    listTitle: '安全漏洞',
  },
};

export const IMPORT_SOURCE_OPTIONS = Object.entries(IMPORT_SOURCES).map(([value, config]) => ({
  value: value as ImportSource,
  label: config.label,
}));

const SEVERITY_LABEL: Record<SecuritySeverity, string> = {
  critical: '严重',
  high: '高危',
  medium: '中危',
  low: '低危',
};

export function gitlabIssueToImportItem(issue: GitlabIssue): ImportItem {
  return {
    id: issue.id,
    displayId: `#${issue.iid}`,
    requirementId: `REQ-${issue.iid}`,
    title: issue.title,
    description: issue.description,
  };
}

export function securityVulnerabilityToImportItem(
  vulnerability: SecurityVulnerability,
): ImportItem {
  return {
    id: vulnerability.id,
    displayId: vulnerability.vulnId,
    requirementId: vulnerability.vulnId,
    title: vulnerability.title,
    description: vulnerability.description,
    severity: vulnerability.severity,
    severityLabel: SEVERITY_LABEL[vulnerability.severity],
    packageName: vulnerability.packageName,
    fixedVersion: vulnerability.fixedVersion,
  };
}

export function importItemToTaskPayload(
  projectId: string,
  source: ImportSource,
  item: ImportItem,
): {
  projectId: string;
  requirementId: string;
  title: string;
  content: string;
  appId: string;
  planMode: boolean;
  status: TaskStatus;
} {
  if (source === 'security_scan') {
    const packageLine = item.packageName ? `影响组件：${item.packageName}\n` : '';
    const fixedLine = item.fixedVersion ? `修复版本：${item.fixedVersion}\n` : '';
    return {
      projectId,
      requirementId: item.requirementId,
      title: `[${item.severityLabel ?? '安全'}] ${item.title}`,
      content: `漏洞等级：${item.severityLabel ?? '未知'}\n漏洞编号：${item.displayId}\n${packageLine}${fixedLine}\n${item.description}`,
      appId: '',
      planMode: true,
      status: 'pending_start',
    };
  }

  return {
    projectId,
    requirementId: item.requirementId,
    title: item.title,
    content: item.description,
    appId: '',
    planMode: true,
    status: 'pending_start',
  };
}
