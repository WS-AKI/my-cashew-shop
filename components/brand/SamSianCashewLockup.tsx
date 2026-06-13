import Image from "next/image";
import { SITE_LAUNCHER_ICON_PNG } from "@/lib/brand-assets";

/** PWA／ホーム画面と同じ PNG マーク（角丸スクエア、blob の SVG は使わない） */
export function SamSianAppLauncherIconMark({
  className,
  imgSizes,
  priority = false,
}: {
  className: string;
  imgSizes: string;
  priority?: boolean;
}) {
  return (
    <span
      className={`relative inline-block shrink-0 overflow-hidden rounded-2xl shadow-sm ring-1 ring-stone-900/14 ${className}`}
    >
      <Image
        src={SITE_LAUNCHER_ICON_PNG}
        alt=""
        fill
        sizes={imgSizes}
        className="object-cover"
        priority={priority}
      />
    </span>
  );
}

/** ナビバー用ワードマーク（親に `group` が付く想定） */
export function SamSianCashewWordmarkHeader() {
  return (
    <div className="min-w-[132px]">
      <p className="text-[15px] font-extrabold leading-tight tracking-tight text-amber-900 transition-colors group-hover:text-amber-700">
        Sam Sian
        <span className="text-amber-500"> Cashew Nuts</span>
      </p>
      <p className="text-[10px] leading-none tracking-widest text-amber-600/70 uppercase">
        Uttaradit, Thailand
      </p>
    </div>
  );
}

/** ヒーロー写真上チップ用（ややコンパクト・コントラスト重視） */
export function SamSianCashewWordmarkHero() {
  return (
    <div className="min-w-0 max-w-[155px] text-left sm:max-w-[170px]">
      <p className="text-[12px] leading-tight font-extrabold text-amber-950 sm:text-[14px]">
        Sam Sian
        <span className="text-amber-600"> Cashew Nuts</span>
      </p>
      <p className="mt-0.5 text-[8.5px] font-semibold tracking-wider leading-none text-amber-900/75 uppercase sm:text-[9.5px]">
        Uttaradit, Thailand
      </p>
    </div>
  );
}
