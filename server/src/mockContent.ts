import { Task } from './store.js';

export function randomHex(len: number): string {
  const chars = '0123456789abcdef';
  let out = '';
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export function generatePlan(task: Task, version: number, feedback?: string): string {
  const fbBlock = feedback
    ? `\n> 已根据上一轮反馈调整：${feedback}\n`
    : '';
  return `# 实现方案 v${version}
${fbBlock}
## 需求理解

${task.title}

> ${task.content}

围绕该需求，需要在 ${task.appId} 应用中调整登录/错误提示相关逻辑，并补充对应的单元测试。

## 涉及文件或模块

- \`src/pages/Login.tsx\` — 登录页 UI，处理错误展示
- \`src/utils/error.ts\` — 错误码映射工具
- \`src/api/auth.ts\` — 登录接口调用与错误归一化
- \`src/__tests__/Login.test.tsx\` — 单元测试

## 技术实现步骤

1. 在 \`src/utils/error.ts\` 中扩展 \`mapAuthError\`，区分密码错误、账号不存在、网络异常三类。
2. 在 \`src/api/auth.ts\` 中捕获 axios 异常并调用 \`mapAuthError\`，返回结构化错误。
3. 在 \`src/pages/Login.tsx\` 中根据结构化错误展示对应 toast 与表单级提示。
4. 在 \`src/__tests__/Login.test.tsx\` 中补充三种错误场景的快照测试。

## 风险点

- 现有错误码不全，需与后端约定 \`AUTH_USER_NOT_FOUND\` 等编码。
- toast 组件在低端机上有渲染抖动，本次只复用既有 \`Toast.show\`。

## 测试建议

- 用错误密码登录，期望提示 "密码错误"。
- 用不存在的账号登录，期望提示 "账号不存在"。
- 断网下点击登录，期望提示 "网络异常，请稍后重试"。
`;
}

export function generatePatch(task: Task): string {
  const reqId = task.requirementId;
  return `diff --git a/src/utils/error.ts b/src/utils/error.ts
index 1111111..2222222 100644
--- a/src/utils/error.ts
+++ b/src/utils/error.ts
@@ -1,8 +1,18 @@
-export function mapAuthError(code: string): string {
-  if (code === 'INVALID') return '账号或密码错误';
-  return '登录失败';
-}
+export type AuthErrorKind =
+  | 'INVALID_PASSWORD'
+  | 'USER_NOT_FOUND'
+  | 'NETWORK'
+  | 'UNKNOWN';
+
+const MESSAGES: Record<AuthErrorKind, string> = {
+  INVALID_PASSWORD: '密码错误，请重新输入',
+  USER_NOT_FOUND: '账号不存在，请先注册',
+  NETWORK: '网络异常，请稍后重试',
+  UNKNOWN: '登录失败，请联系管理员',
+};
+
+export function mapAuthError(kind: AuthErrorKind): string {
+  return MESSAGES[kind] ?? MESSAGES.UNKNOWN;
+}
diff --git a/src/api/auth.ts b/src/api/auth.ts
index 3333333..4444444 100644
--- a/src/api/auth.ts
+++ b/src/api/auth.ts
@@ -1,10 +1,22 @@
 import axios from 'axios';
+import { AuthErrorKind } from '../utils/error';
+
+export interface LoginResult {
+  ok: boolean;
+  errorKind?: AuthErrorKind;
+}

-export async function login(user: string, pass: string) {
-  const res = await axios.post('/api/login', { user, pass });
-  return res.data;
+export async function login(user: string, pass: string): Promise<LoginResult> {
+  try {
+    const res = await axios.post('/api/login', { user, pass });
+    return { ok: true, ...res.data };
+  } catch (err: any) {
+    if (!err.response) return { ok: false, errorKind: 'NETWORK' };
+    const code = err.response.data?.code;
+    if (code === 'INVALID_PASSWORD') return { ok: false, errorKind: 'INVALID_PASSWORD' };
+    if (code === 'USER_NOT_FOUND') return { ok: false, errorKind: 'USER_NOT_FOUND' };
+    return { ok: false, errorKind: 'UNKNOWN' };
+  }
 }
diff --git a/src/pages/Login.tsx b/src/pages/Login.tsx
index 5555555..6666666 100644
--- a/src/pages/Login.tsx
+++ b/src/pages/Login.tsx
@@ -10,8 +10,12 @@ export function LoginPage() {
   async function onSubmit() {
-    const r = await login(user, pass);
-    if (!r.ok) Toast.show('登录失败');
+    const r = await login(user, pass);
+    if (!r.ok) {
+      const msg = mapAuthError(r.errorKind ?? 'UNKNOWN');
+      Toast.show(msg);
+      return;
+    }
     navigate('/home');
   }
   return (
--
AIWX auto-coding for ${reqId}
`;
}

export function generateChangeSummary(task: Task): string {
  return `修改登录失败提示逻辑，新增结构化错误码 (INVALID_PASSWORD / USER_NOT_FOUND / NETWORK)，并在登录页根据错误类型展示精确文案。涉及 3 个文件，约 +28 / -6 行。`;
}

export function generateTestSuggestion(task: Task): string {
  return `1) 验证错误密码场景：使用正确账号 + 错误密码，期望 toast 显示 "密码错误，请重新输入"。
2) 验证账号不存在场景：使用一个未注册账号登录，期望 toast 显示 "账号不存在，请先注册"。
3) 验证网络异常场景：在 DevTools Network 面板设置 offline，点击登录，期望 toast 显示 "网络异常，请稍后重试"。
4) 回归测试：正常账号密码登录应跳转 /home。`;
}
