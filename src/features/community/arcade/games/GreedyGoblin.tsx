/**
 * ---------- GREEDY GOBLIN ----------
 * Credits to Boden, Vergel for the art
 * Credits to Jc Eii for the audio
 *
 * Objectives:
 * Collect SFL and avoid skulls. Game over when SFL touches the ground or you caught a skull
 *
 * Made using html canvas and static assets. Had to source newly sized ones for boundary detection
 * as modifying image sizes via js is buggy (or i havent found ways yet)
 */

import React, { useEffect, useRef, useState } from "react";

import { Button } from "components/ui/Button";
import gameBackground from "assets/community/arcade/greedy_goblin/images/greedy_goblin_background.png";
import gameOver from "assets/community/arcade/greedy_goblin/images/game_over.png";
import goblin from "assets/community/arcade/greedy_goblin/images/goblin_catch.png";
import token from "assets/community/arcade/greedy_goblin/images/coin.png";
import skull from "assets/community/arcade/greedy_goblin/images/skull.png";
import leftArrow from "assets/icons/arrow_left.png";
import rightArrow from "assets/icons/arrow_right.png";

import { greedyGoblinAudio } from "src/lib/utils/sfx";
import { randomInt } from "lib/utils/random";

type MoveDirection = "left" | "right";
type ActionKeys =
  | "a"
  | "d"
  | "arrowleft"
  | "arrowright"
  | "uiArrowLeft"
  | "uiArrowRight";

type IntervalType = ReturnType<typeof setInterval>;

type DropItem = {
  catchable: boolean;
  image: HTMLImageElement;
};

type CollisionArgs = {
  x: number;
  y: number;
  imgWidth: number;
  imgHeight: number;
  catchable: boolean;
  interval: IntervalType;
};

const CANVAS_WIDTH = 300;
const CANVAS_HEIGHT = 300;

const goblinImage = new Image();
goblinImage.src = goblin;

const gameOverImage = new Image();
gameOverImage.src = gameOver;

const Token: DropItem = {
  catchable: true,
  image: new Image(),
};

const Skull: DropItem = {
  catchable: false,
  image: new Image(),
};

Token.image.src = token;
Skull.image.src = skull;

declare global {
  export interface CanvasRenderingContext2D {
    drawGoblinImage(): void;
  }
}

export const GreedyGoblin: React.FC = () => {
  const [renderPoints, setRenderPoints] = useState(0); // display
  const [isPlaying, setIsPlaying] = useState(false);

  const intervalIds = useRef<IntervalType[]>([]);
  const gameInterval = useRef(2000);
  const dropInterval = useRef(100);
  const isGameOver = useRef(false);
  const points = useRef(0);
  const goblinPosX = useRef(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const goblinMoveTimeout = useRef<NodeJS.Timeout>();
  const activeKeys = useRef<ActionKeys[]>([]);

  /**
   * Start moving the goblin forever until it is stopped
   */
  const startMovingGoblin = (direction: MoveDirection) => {
    const loopMovingGoblin = (direction: MoveDirection) => {
      moveGoblin(direction);
      goblinMoveTimeout.current = setTimeout(loopMovingGoblin, 50, direction);
    };

    if (!goblinMoveTimeout.current) {
      loopMovingGoblin(direction);
    }
  };

  /**
   * Stop moving the goblin
   */
  const stopMovingGoblin = () => {
    if (goblinMoveTimeout.current) {
      clearTimeout(goblinMoveTimeout.current);
      goblinMoveTimeout.current = undefined;
    }
  };

  /**
   * Check the list of active keys to determine goblin movement direction
   * Add to list of active keys when key is down
   * @param keys keyboard event
   */
  const checkActiveKeys = (keys: ActionKeys[]) => {
    const holdKeysLeft = keys.filter(
      (k) => k === "arrowleft" || k === "a" || k === "uiArrowLeft"
    ).length;
    const holdKeysRight = keys.filter(
      (k) => k === "arrowright" || k === "d" || k === "uiArrowRight"
    ).length;
    if (holdKeysLeft === holdKeysRight) {
      stopMovingGoblin();
    } else if (holdKeysLeft < holdKeysRight) {
      startMovingGoblin("right");
    } else if (holdKeysLeft > holdKeysRight) {
      startMovingGoblin("left");
    }
  };

  /**
   * Add to list of active keys and check active keys
   * @param key action key
   */
  const addAndCheckActiveKeys = (key: ActionKeys) => {
    activeKeys.current = [...activeKeys.current.filter((k) => k !== key), key];
    checkActiveKeys(activeKeys.current);
  };

  /**
   * Remove from list of active keys and check active keys
   * @param key action key
   */
  const removeAndCheckActiveKeys = (key: ActionKeys) => {
    activeKeys.current = activeKeys.current.filter((k) => k !== key);
    checkActiveKeys(activeKeys.current);
  };

  /**
   * Listener for keyboard keydown event
   * Add to list of active keys when key is down
   * @param event keyboard event
   */
  const keydownKeboardListener = (event: KeyboardEvent) => {
    const key = event.key.toLowerCase();

    if (
      key === "arrowleft" ||
      key === "a" ||
      key === "arrowright" ||
      key === "d"
    ) {
      addAndCheckActiveKeys(key);
    }
  };

  /**
   * Listener for keyboard keyup event
   * Remove from list of active keys when key is up
   * @param event keyboard event
   */
  const keyupKeboardListener = (event: KeyboardEvent) => {
    const key = event.key.toLowerCase();

    // remove from list of active keys
    if (
      key === "arrowleft" ||
      key === "a" ||
      key === "arrowright" ||
      key === "d"
    ) {
      removeAndCheckActiveKeys(key);
    }
  };

  /**
   * Draw goblin image in canvas
   * @param this canvas rendering context
   */
  CanvasRenderingContext2D.prototype.drawGoblinImage = function (
    this: CanvasRenderingContext2D
  ) {
    this.drawImage(
      goblinImage,
      goblinPosX.current,
      CANVAS_HEIGHT - goblinImage.height
    );
  };

  /**
   * Spawn goblin near center
   * Cleanup on dismount
   */
  useEffect(() => {
    goblinPosX.current = CANVAS_WIDTH / 2;

    canvasRef.current?.getContext("2d")?.drawGoblinImage();

    window.addEventListener("keydown", keydownKeboardListener);
    window.addEventListener("keyup", keyupKeboardListener);

    greedyGoblinAudio.greedyGoblinIntroAudio.play();

    return () => {
      intervalIds.current.forEach((id) => clearInterval(id));
      window.removeEventListener("keydown", keydownKeboardListener);
      window.removeEventListener("keyup", keyupKeboardListener);

      Object.values(greedyGoblinAudio).forEach((audio) => audio.stop());
    };
  }, []);

  /**
   * Reset values
   * Redraw goblin in current position
   * Start game logic
   */
  const startGame = () => {
    isGameOver.current = false;
    points.current = 0;
    setRenderPoints(0);
    setIsPlaying(true);

    greedyGoblinAudio.greedyGoblinIntroAudio.stop();
    greedyGoblinAudio.greedyGoblinPlayingAudio.play();

    const context = canvasRef.current?.getContext("2d");

    context?.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    context?.drawGoblinImage();
    dropItem(Token);

    const interval = setInterval(gameLogic, gameInterval.current);
    intervalIds.current.push(interval);
  };

  /**
   * Clear current goblin
   * Get new bounded X position
   * Redraw goblin
   * @param direction movement direction
   */
  const moveGoblin = (direction: MoveDirection) => {
    const context = canvasRef.current?.getContext("2d");
    context?.clearRect(
      goblinPosX.current,
      CANVAS_HEIGHT - goblinImage.height,
      goblinImage.width,
      goblinImage.height
    );

    goblinPosX.current =
      direction === "right"
        ? Math.min(CANVAS_WIDTH - goblinImage.width, goblinPosX.current + 10)
        : Math.max(0, goblinPosX.current - 10);

    context?.drawGoblinImage();
  };

  /**
   * Perform item drop
   * Update interval rate
   * @todo: finalize logic
   */
  const gameLogic = () => {
    if (points.current > 4 && dropInterval.current === 100) {
      dropInterval.current = 75;
    }

    if (points.current % 3 === 0 && points.current > 0) {
      const items = [Skull, Token].sort(() => 0.5 - Math.random());
      const item1 = items[0];
      const item2 = items[1];
      const randXItem1 = randomInt(5, CANVAS_WIDTH - item1.image.width - 40);
      const randXItem2 = randomInt(
        randXItem1 + item1.image.width + 20,
        CANVAS_WIDTH - item2.image.width - 5
      );
      dropItem(item1, randXItem1);
      dropItem(item2, randXItem2);
    } else {
      dropItem(Token);
    }
  };

  /**
   * At dropInterval, increase y then check for collision
   * @param _.catchable should collide with goblin
   * @param _.image image element
   * @param x x position of thep drop
   */
  const dropItem = ({ catchable, image }: DropItem, x?: number) => {
    const context = canvasRef.current?.getContext("2d");
    if (!x) {
      x = randomInt(5, CANVAS_WIDTH - image.width - 5);
    }
    let y = 0;
    const interval = setInterval(() => {
      context?.clearRect(x!, y, image.width, image.height);
      y += 5; // small y for smoother transition
      context?.drawImage(image, x!, y);
      checkCollision({
        x: x!,
        y,
        imgWidth: image.width,
        imgHeight: image.height,
        catchable,
        interval,
      });
    }, dropInterval.current);

    intervalIds.current.push(interval);
  };

  /**
   * Check if drop items collide with goblin image or touches the ground
   * Perform actions based on catchable and collide flags
   * @note goblinPosX used might be the old value
   * @param _.x item's x coordinate
   * @param _.y item's y coordinate
   * @param _.imgWidth image width
   * @param _.imgHeight image Height
   * @param _.catchable should collide with goblin or not
   * @param _.interval timer to clear if necessary
   */
  const checkCollision = ({
    x,
    y,
    imgWidth,
    imgHeight,
    catchable,
    interval,
  }: CollisionArgs) => {
    const context = canvasRef.current?.getContext("2d");
    const collideGround = y + imgHeight / 2 >= CANVAS_HEIGHT;
    const imgCenterX = x + imgWidth / 2;
    const collideGoblin =
      imgCenterX >= goblinPosX.current &&
      imgCenterX < goblinPosX.current + goblinImage.width &&
      // slighty larger hitbox
      y + 8 >= CANVAS_HEIGHT - goblinImage.height;

    // game over check
    if ((catchable && collideGround) || (!catchable && collideGoblin)) {
      isGameOver.current = true;

      greedyGoblinAudio.greedyGoblinGameOverAudio.play();
      greedyGoblinAudio.greedyGoblinPlayingAudio.stop();

      // clear whole space and draw game over image
      context?.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      context?.drawImage(gameOverImage, 30, CANVAS_HEIGHT / 4);
      context?.drawGoblinImage();

      intervalIds.current.forEach((id) => clearInterval(id));
      intervalIds.current = [];
      setIsPlaying(false);
    }

    // point check
    else if (catchable && collideGoblin) {
      setRenderPoints((prev) => prev + 1);
      points.current += 1;

      greedyGoblinAudio.greedyGoblinPickAudio.play();

      context?.clearRect(x, y, imgWidth, imgHeight);
      clearInterval(interval);

      // redraw goblin after collision
      context?.drawGoblinImage();
    }

    // allow touch ground
    else if (!catchable && collideGround) {
      context?.clearRect(x, y, imgWidth, imgHeight);
      clearInterval(interval);
    }
  };

  return (
    <div>
      <div className="flex flex-col items-center">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          style={{
            borderStyle: "solid",
            borderWidth: "5px",
            borderRadius: "20px",
            maxWidth: CANVAS_WIDTH,
            maxHeight: CANVAS_HEIGHT,
            backgroundImage: `url(${gameBackground})`,
            backgroundSize: "contain",
          }}
        ></canvas>
        <span className="flex items-center my-2">
          <img src={token} className="w-6 mr-2" />
          {renderPoints}
        </span>
      </div>
      <div className="flex mb-2 flex justify-around">
        <div
          className="h-16 w-16 cursor-pointer"
          onMouseDown={() => addAndCheckActiveKeys("uiArrowLeft")}
          onTouchStart={() => addAndCheckActiveKeys("uiArrowLeft")}
          onMouseUp={() => removeAndCheckActiveKeys("uiArrowLeft")}
          onMouseLeave={() => removeAndCheckActiveKeys("uiArrowLeft")}
          onTouchEnd={() => removeAndCheckActiveKeys("uiArrowLeft")}
        >
          <img
            className="h-full w-full pointer-events-none p-3"
            src={leftArrow}
            alt="left-arrow"
          />
        </div>
        <div
          className="h-16 w-16 cursor-pointer"
          onMouseDown={() => addAndCheckActiveKeys("uiArrowRight")}
          onTouchStart={() => addAndCheckActiveKeys("uiArrowRight")}
          onMouseUp={() => removeAndCheckActiveKeys("uiArrowRight")}
          onMouseLeave={() => removeAndCheckActiveKeys("uiArrowRight")}
          onTouchEnd={() => removeAndCheckActiveKeys("uiArrowRight")}
        >
          <img
            className="h-full w-full pointer-events-none p-3"
            src={rightArrow}
            alt="right-arrow"
          />
        </div>
      </div>
      <Button className="text-sm" disabled={isPlaying} onClick={startGame}>
        Start
      </Button>
    </div>
  );
};
