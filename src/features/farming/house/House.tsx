import React, { useContext } from "react";
import { Modal } from "react-bootstrap";

import { GRID_WIDTH_PX } from "features/game/lib/constants";
import {
  getLevel,
  getRequiredXpToLevelUp,
  upgradeAvailable,
  SKILL_TREE,
} from "features/game/types/skills";

import house from "assets/buildings/house.png";
import smoke from "assets/buildings/smoke.gif";
import player from "assets/icons/player.png";
import questionMark from "assets/icons/expression_confused.png";
import close from "assets/icons/close.png";
import alert from "assets/icons/expression_alerted.png";

import plant from "assets/icons/plant.png";
import pickaxe from "assets/tools/stone_pickaxe.png";

import { Action } from "components/ui/Action";
import { InnerPanel, OuterPanel, Panel } from "components/ui/Panel";
import { Label } from "components/ui/Label";
import { ITEM_DETAILS } from "features/game/types/images";
import { GameState, InventoryItemName } from "features/game/types/game";
import { skillUpgradeToast } from "features/game/toast/lib/skillUpgradeToast";
import { ToastContext } from "features/game/toast/ToastQueueProvider";

import { SkillUpgrade } from "./components/SkillUpgrade";
import { SkillTree } from "./components/SkillTree";
import { homeDoorAudio } from "lib/utils/sfx";
import { Button } from "components/ui/Button";
import { Inventory } from "components/InventoryItems";
import { DynamicNFT } from "features/bumpkins/components/DynamicNFT";
import { Equipped as BumpkinParts } from "features/game/types/bumpkin";

export const Badges: React.FC<{ inventory: Inventory }> = ({ inventory }) => {
  const BADGES: InventoryItemName[] = Object.keys(SKILL_TREE).map(
    (badge) => badge as InventoryItemName
  );

  const badges = BADGES.map((badge) => {
    if (inventory[badge]) {
      return (
        <img
          key={badge}
          src={ITEM_DETAILS[badge].image}
          alt={badge}
          className="h-6 mr-2 mb-2 md:mb-0"
        />
      );
    }

    return null;
  }).filter(Boolean);

  if (badges.length === 0) {
    return null;
  }

  return <div className="flex flex-wrap">{badges}</div>;
};
interface Props {
  state: GameState;
  playerCanLevelUp?: boolean;
  isFarming?: boolean;
}

export const House: React.FC<Props> = ({
  state,
  isFarming,
  playerCanLevelUp,
}) => {
  const { setToast } = useContext(ToastContext);

  const [isOpen, setIsOpen] = React.useState(false);
  const [isSkillTreeOpen, setIsSkillTreeOpen] = React.useState(false);
  const [isUpgradeAvailable, setIsUpgradeAvailable] = React.useState(false);

  React.useEffect(() => {
    const upgrades = upgradeAvailable(state);

    setIsUpgradeAvailable(upgrades);

    if (isFarming && upgrades && state.farmAddress)
      skillUpgradeToast(state, setToast);
  }, [setToast, state, isFarming]);

  const openSkillTree = () => {
    setIsSkillTreeOpen(true);
  };

  const open = () => {
    setIsSkillTreeOpen(false);
    setIsOpen(true);
    //Checks if homeDoorAudio is playing, if false, plays the sound
    if (!homeDoorAudio.playing()) {
      homeDoorAudio.play();
    }
  };

  const { gathering, farming } = state.skills;

  const toolLevel = getLevel(gathering);
  const farmingLevel = getLevel(farming);
  const totalLevel = toolLevel + farmingLevel;

  const gatheringRequiredXp = getRequiredXpToLevelUp(toolLevel);
  const farmingRequiredXp = getRequiredXpToLevelUp(farmingLevel);

  const Content = () => {
    if (isFarming && playerCanLevelUp) {
      return <span className="loading">Levelling up</span>;
    }

    if (isSkillTreeOpen) {
      return <SkillTree inventory={state.inventory} back={open} />;
    }

    if (isFarming && isUpgradeAvailable) {
      return <SkillUpgrade />;
    }

    return (
      <>
        <div className="flex flex-col md:flex-row pt-8 md:pt-2">
          <InnerPanel className="w-full md:w-1/3 p-2 flex flex-col items-center mb-2 md:mb-0">
            {state.bumpkin ? (
              <DynamicNFT
                className="mb-2"
                showBackground
                bumpkinParts={state.bumpkin?.equipped as BumpkinParts}
              />
            ) : (
              <>
                <img src={questionMark} className="w-1/4 md:w-1/2 mb-2" />
                <span className="text-xxs">Farmer NFT</span>
                <span className="text-sm text-shadow">Name: ?</span>
              </>
            )}

            <span className="text-sm">{`Level: ${totalLevel}`}</span>
          </InnerPanel>
          <div className="px-2 overflow-hidden">
            <div className="flex items-center -mb-.5 md:-mb-2">
              <span className="text-sm">Farming</span>
              <img src={plant} className="w-4 h-4 ml-2" />
            </div>
            <span className="text-xxs">
              {farmingRequiredXp
                ? `${farming.toNumber()} XP/${farmingRequiredXp} XP`
                : `${farming.toNumber()} XP`}
            </span>
            <div className="flex items-center mt-1 flex-wrap">
              {new Array(10).fill(null).map((_, index) => {
                if (index < farmingLevel) {
                  return (
                    <Label
                      key={index}
                      className="w-5 h-7 mr-1 flex flex-col items-center"
                    />
                  );
                }

                return (
                  <OuterPanel
                    key={index}
                    className="w-5 h-7 mr-1 flex flex-col items-center"
                  />
                );
              })}
              <span>{farmingLevel}</span>
            </div>
            <div className="flex items-center mt-2 -mb-.5 md:-mb-2">
              <span className="text-sm">Tools</span>
              <img src={pickaxe} className="w-4 h-4 ml-2" />
            </div>
            <span className="text-xxs">
              {gatheringRequiredXp
                ? `${gathering.toNumber()} XP/${gatheringRequiredXp} XP`
                : `${gathering.toNumber()} XP`}
            </span>
            <div className="flex items-center mt-1 flex-wrap mb-1 md:mb-0">
              {new Array(10).fill(null).map((_, index) => {
                if (index < toolLevel) {
                  return (
                    <Label
                      key={index}
                      className="w-5 h-7 mr-1 flex flex-col items-center"
                    />
                  );
                }

                return (
                  <OuterPanel
                    key={index}
                    className="w-5 h-7 mr-1 flex flex-col items-center"
                  />
                );
              })}
              <span>{toolLevel}</span>
            </div>
            <Button className="text-xs mt-3" onClick={openSkillTree}>
              View all skills
            </Button>
          </div>
        </div>

        <InnerPanel className="flex w-1/2 sm:w-1/3 mt-2">
          <img src={player} className="h-5 mr-2" />
          <span className="text-sm">Skills</span>
        </InnerPanel>
        <InnerPanel className="relative p-2 mt-1">
          <Badges inventory={state.inventory} />
        </InnerPanel>
      </>
    );
  };

  return (
    <>
      <div
        style={{
          width: `${GRID_WIDTH_PX * 3.2}px`,
          position: "absolute",
          right: `${GRID_WIDTH_PX * 39}px`,
          top: `${GRID_WIDTH_PX * 28.8}px`,
        }}
        className="relative cursor-pointer hover:img-highlight"
        onClick={open}
      >
        {isUpgradeAvailable && (
          <img
            className="animate-float"
            src={alert}
            style={{
              width: `${GRID_WIDTH_PX * 0.55}px`,
              position: "absolute",
              left: `${GRID_WIDTH_PX * 1.641}px`,
              bottom: `${GRID_WIDTH_PX * 4.571}px`,
            }}
          />
        )}
        <img src={house} alt="house" className="w-full" />
        <img
          src={smoke}
          style={{
            width: `${GRID_WIDTH_PX * 0.7}px`,
            position: "absolute",
            left: `${GRID_WIDTH_PX * 0.12}px`,
            top: `${GRID_WIDTH_PX * 0.77}px`,
          }}
        />
        <Action
          className="absolute bottom-10 left-5"
          text="Home"
          icon={player}
          onClick={open}
        />
      </div>
      <Modal centered show={isOpen} onHide={() => setIsOpen(false)}>
        <Panel className="relative">
          <img
            src={close}
            className="h-6 cursor-pointer top-3 right-4 absolute"
            onClick={() => setIsOpen(false)}
          />
          {Content()}
        </Panel>
      </Modal>
    </>
  );
};
