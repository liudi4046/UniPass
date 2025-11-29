import Link from "next/link";
import { ArrowRight, CheckCircle, Shield } from "lucide-react";

const features = [
  {
    title: "一次验证，全球通行",
    description: "基于电子护照的 ZK 承诺写入链上匿名池，无需重复 KYC。"
  },
  {
    title: "隐私先行",
    description: "护照原始数据永不上链，不会产生跨 DApp 的轨迹关联。"
  },
  {
    title: "一行代码接入",
    description: "DApp 可通过 UniPass Registry 即刻验证真人身份与 Nullifier。"
  }
];

export default function MarketingPage() {
  return (
    <main className="px-5 py-16 md:px-12 lg:px-20">
      <section className="mx-auto max-w-6xl space-y-10 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-1 text-sm text-white/70">
          <Shield className="h-4 w-4 text-brand" />
          基于护照 NFC + Semaphore 的全球匿名身份层
        </span>

        <h1 className="text-4xl font-semibold leading-tight text-white md:text-6xl">
          只需<span className="text-brand mx-2">一次扫描</span>
          就能在 Web3 世界畅行无阻
        </h1>

        <p className="mx-auto max-w-3xl text-lg text-white/70">
          UniPass 将电子护照这一最普及的身份凭证，与零知识证明架构深度结合。
          <br className="hidden md:block" />
          用户一次验证即可获得永久匿名身份，DApp & DAO 一键接入真人防女巫。
        </p>

        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 rounded-xl bg-brand px-6 py-3 text-lg font-semibold text-brand-foreground shadow-lg shadow-brand/30 transition hover:-translate-y-0.5"
          >
            立即体验注册
            <ArrowRight className="h-4 w-4" />
          </Link>

          <a
            href="https://zkpassport.example.com"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-6 py-3 text-white/80 hover:border-white/40"
          >
            集成文档
          </a>
        </div>
      </section>

      <section className="mx-auto mt-16 max-w-6xl grid gap-6 md:grid-cols-3">
        {features.map((feature) => (
          <div key={feature.title} className="glass p-6 shadow-card flex flex-col gap-3 text-left">
            <CheckCircle className="h-6 w-6 text-brand" />
            <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
            <p className="text-white/70">{feature.description}</p>
          </div>
        ))}
      </section>
    </main>
  );
}

