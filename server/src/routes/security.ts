import { Router } from 'express';

export const securityRouter = Router();

securityRouter.get('/projects/:projectId/vulnerabilities', (_req, res) => {
  res.json({
    vulnerabilities: [
      {
        id: 'vuln-001',
        vulnId: 'CVE-2026-1001',
        severity: 'critical',
        title: 'OpenSSL 缓冲区溢出漏洞',
        description: '受影响版本允许远程攻击者触发内存破坏，需要优先升级依赖并补充回归验证。',
        packageName: 'openssl',
        fixedVersion: '3.0.13',
      },
      {
        id: 'vuln-002',
        vulnId: 'CVE-2026-1017',
        severity: 'high',
        title: 'Spring Security 鉴权绕过风险',
        description: '特定路径匹配规则可能绕过访问控制，应调整拦截器配置并增加鉴权测试。',
        packageName: 'spring-security-web',
        fixedVersion: '6.2.5',
      },
      {
        id: 'vuln-003',
        vulnId: 'SCA-2026-0442',
        severity: 'medium',
        title: 'lodash 原型污染风险',
        description: '间接依赖的旧版本 lodash 存在原型污染风险，建议锁定安全版本。',
        packageName: 'lodash',
        fixedVersion: '4.17.21',
      },
      {
        id: 'vuln-004',
        vulnId: 'CONF-2026-0021',
        severity: 'low',
        title: '容器镜像包含过期 CA 证书',
        description: '基础镜像中的 CA 证书包版本较旧，建议在镜像构建阶段更新系统证书。',
        packageName: 'ca-certificates',
        fixedVersion: '2026.01.10',
      },
    ],
  });
});
