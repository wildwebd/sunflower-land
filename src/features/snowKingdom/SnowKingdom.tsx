import { GRID_WIDTH_PX } from "features/game/lib/constants";
import { Section, useScrollIntoView } from "lib/utils/hooks/useScrollIntoView";
import React, { useEffect, useRef } from "react";
import ScrollContainer from "react-indiana-drag-scroll";

import ocean from "assets/decorations/ocean.png";
import background from "assets/land/snow_kingdom.png";
import { GameProvider } from "features/game/GameProvider";
import { ToastProvider } from "features/game/toast/ToastQueueProvider";
import { IslandTravelWrapper } from "./IslandTravelWrapper";

export const SnowKingdom: React.FC = () => {
  const container = useRef(null);

  const [scrollIntoView] = useScrollIntoView();

  useEffect(() => {
    // Start with island centered
    scrollIntoView(Section.SnowKingdomBackground, "auto");
  }, [scrollIntoView]);

  // Load data
  return (
    <GameProvider>
      <ToastProvider>
        <ScrollContainer
          className="bg-blue-300 overflow-scroll relative w-full h-full"
          innerRef={container}
        >
          <div className="relative h-snowKingdomGameboard w-snowKingdomGameboard">
            <div
              className="absolute inset-0 bg-repeat w-full h-full"
              style={{
                backgroundImage: `url(${ocean})`,
                backgroundSize: "100px",
                imageRendering: "pixelated",
              }}
            />
            <div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
              style={{
                width: `${40 * GRID_WIDTH_PX}px`,
                height: `${40 * GRID_WIDTH_PX}px`,
              }}
            >
              <img
                src={background}
                className="absolute inset-0 w-full h-full"
                id={Section.SnowKingdomBackground}
              />
              <IslandTravelWrapper />
            </div>
          </div>
        </ScrollContainer>
      </ToastProvider>
    </GameProvider>
  );
};
