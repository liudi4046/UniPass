import Link from "next/link";
import { RegistrationFlow } from "@/components/registration/RegistrationFlow";
import { ArrowLeft } from "lucide-react";

export default function RegisterPage() {
  return (
    <main className="px-5 py-12 md:px-12">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white">
          <ArrowLeft className="h-4 w-4" />
          返回主页
        </Link>

        <div>
          <p className="text-sm tracking-[0.3em] text-brand">UNIPASS REGISTRATION</p>
          <h1 className="mt-2 text-4xl font-semibold text-white">一次护照扫描，终身匿名身份</h1>
          <p className="mt-3 text-white/70">
            按照下列步骤完成注册，即可在所有接入 UniPass 的 DApp 中免重复认证。实际生产流程可直接对接手机中的 ZKPassport SDK。
          </p>
        </div>

        <RegistrationFlow />
      </div>
    </main>
  );
}

