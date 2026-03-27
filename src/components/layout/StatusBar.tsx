import { useEffect, useState } from "react";
import GEVLogo from "@/assets/gev.svg?react";
import { EarthLock } from "lucide-react";

const StatusBar = () => {
  const [currentTime, setTime] = useState<string>("");

  useEffect(() => {
    const formatter = new Intl.DateTimeFormat(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
      timeZoneName: "short",
    });

    const updateTime = () => {
      const now = new Date();

      // Format the date and time
      const formattedTime = formatter.format(now);

      setTime(formattedTime);
    };

    updateTime(); // initial
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-(--space32) bg-(--color-header) flex items-start justify-between px-2">
      {/* left container */}
      <div className="grow h-full flex justify-start items-center gap-4">
        <div className="flex items-center gap-1">
          <div className="text-(--color-text-high) align-middle">
            &copy; GE Vernova DvM 1.7x
          </div>
        </div>
        <div className="flex items-center justify-start gap-1">
          <div className="font-mono text-(--color-text-high)">Server: </div>
          <span className="flex items-center gap-1 text-(--color-status-connected) font-mono">
            Connected
            <EarthLock size={16} />
          </span>
        </div>
      </div>


      {/* right container */}
      <div className="grow h-full flex justify-end items-center gap-2">
        <div className="text-right font-mono text-(--color-text-high) w-48">
          {currentTime}
        </div>
      </div>
    </div>
  );
};


export default StatusBar;
