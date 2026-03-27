import DvMSVG from "@/assets/dvm.svg?react";

const Header = () => {
  return (
    <div className="h-(--space48) bg-header text-text-xhigh-imutable py-(--space4) px-(--space16) flex items-center justify-between text-(length:--text-size-body2) box-border w-full">
      <div className="flex items-center gap-2">
        <DvMSVG width={32} height={32} />
        <div className="font-(family-name:--font-family-title) text-(length:--font-size-title)">
          DvM 1.7x &nbsp;
          <span className="text-neutral-300 italic">
            GADM
          </span>
        </div>
      </div>
    </div>
  );
};

export default Header;
