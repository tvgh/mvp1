import assert from 'node:assert/strict';
import {
  IMPORT_SOURCES,
  importItemToTaskPayload,
  securityVulnerabilityToImportItem,
} from './importSources';

const vulnerability = securityVulnerabilityToImportItem({
  id: 'vuln-001',
  vulnId: 'CVE-2026-1001',
  severity: 'critical',
  title: 'OpenSSL 缓冲区溢出漏洞',
  description: '受影响版本允许远程攻击者触发内存破坏。',
  packageName: 'openssl',
  fixedVersion: '3.0.13',
});

assert.equal(IMPORT_SOURCES.security_scan.label, '安全扫描');
assert.equal(vulnerability.severityLabel, '严重');
assert.equal(vulnerability.displayId, 'CVE-2026-1001');

const payload = importItemToTaskPayload('project-001', 'security_scan', vulnerability);

assert.equal(payload.requirementId, 'CVE-2026-1001');
assert.equal(payload.title, '[严重] OpenSSL 缓冲区溢出漏洞');
assert.match(payload.content, /漏洞等级：严重/);
assert.match(payload.content, /修复版本：3.0.13/);
assert.equal(payload.status, 'pending_start');
