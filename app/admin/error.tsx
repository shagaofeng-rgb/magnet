"use client";
export default function Error({ reset }: { reset: () => void }) { return <main className="admin-loading"><h1>后台暂时不可用</h1><p>详细错误已写入安全日志。请检查站点配置或稍后重试。</p><button onClick={reset}>重试</button></main>; }
