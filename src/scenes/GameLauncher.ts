import Phaser from 'phaser';
import { GameMode } from '../core/types';
import { MergeScene } from './MergeScene';
import { ColorSortScene } from './ColorSortScene';
import { SlideScene } from './SlideScene';
import { BlockFitScene } from './BlockFitScene';

export class GameLauncher {
  public static onStateChangeCallback: ((state: any) => void) | null = null;
  public static currentDifficulty: any = null;
  private static currentGame: Phaser.Game | null = null;
  private static currentScene: Phaser.Scene | null = null;
  private static resizeListener: (() => void) | null = null;

  public static launch(
    mode: GameMode,
    parent: HTMLElement,
    options: {
      onStateChange?: (state: any) => void;
      difficulty?: any;
    } = {}
  ): void {
    this.destroy();
    this.onStateChangeCallback = options.onStateChange || null;
    this.currentDifficulty = options.difficulty || null;

    const parentRect = parent.getBoundingClientRect();
    const width = Math.max(320, Math.floor(parentRect.width || window.innerWidth));
    const height = Math.max(420, Math.floor(parentRect.height || (window.innerHeight - 110)));

    let sceneClass: typeof Phaser.Scene;
    let sceneKey: string;
    let sceneInitData: any = { onStateChange: options.onStateChange };

    switch (mode) {
      case 'merge':
        sceneClass = MergeScene;
        sceneKey = 'MergeScene';
        sceneInitData.mode = options.difficulty || 'classic';
        break;
      case 'colorsort':
        sceneClass = ColorSortScene;
        sceneKey = 'ColorSortScene';
        sceneInitData.level = options.difficulty || 1;
        break;
      case 'slide':
        sceneClass = SlideScene;
        sceneKey = 'SlideScene';
        sceneInitData.size = options.difficulty || 4;
        break;
      case 'blockfit':
        sceneClass = BlockFitScene;
        sceneKey = 'BlockFitScene';
        break;
    }

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: parent,
      width: width,
      height: height,
      transparent: true,
      backgroundColor: 'transparent',
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: width,
        height: height
      },
      physics: {
        default: 'arcade',
        arcade: { gravity: { x: 0, y: 0 } }
      },
      scene: [sceneClass]
    };

    this.currentGame = new Phaser.Game(config);

    this.currentGame.events.once('ready', () => {
      this.currentScene = this.currentGame?.scene.getScene(sceneKey) || null;
      if (this.currentScene && typeof (this.currentScene as any).init === 'function') {
        // init data already passed via Scene manager or launch
      }
    });

    // Handle window resize dynamically
    this.resizeListener = () => {
      if (this.currentGame && parent) {
        const r = parent.getBoundingClientRect();
        const nw = Math.max(320, Math.floor(r.width));
        const nh = Math.max(420, Math.floor(r.height));
        this.currentGame.scale.resize(nw, nh);
      }
    };
    window.addEventListener('resize', this.resizeListener);
  }

  public static getCurrentScene<T = any>(): T | null {
    return (this.currentScene as unknown as T) || null;
  }

  public static undo(): void {
    if (this.currentScene && typeof (this.currentScene as any).undoMove === 'function') {
      (this.currentScene as any).undoMove();
    }
  }

  public static restart(): void {
    if (this.currentScene && typeof (this.currentScene as any).restartGame === 'function') {
      (this.currentScene as any).restartGame();
    }
  }

  public static hint(): any {
    if (this.currentScene && typeof (this.currentScene as any).showHint === 'function') {
      return (this.currentScene as any).showHint();
    }
    return null;
  }

  public static destroy(): void {
    if (this.resizeListener) {
      window.removeEventListener('resize', this.resizeListener);
      this.resizeListener = null;
    }
    if (this.currentScene && typeof (this.currentScene as any).shutdown === 'function') {
      (this.currentScene as any).shutdown();
    }
    if (this.currentGame) {
      this.currentGame.destroy(true);
      this.currentGame = null;
      this.currentScene = null;
    }
  }
}
