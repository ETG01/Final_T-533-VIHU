import { describe, expect, it } from "vitest";
import {
  calculateDraw,
  calculateWinner,
  getPlayerNameFromSign,
  getRandomPepTalk,
  getWhosTurnItIs,
} from "../gameUtils";
import { pepTalks } from "../constants";

describe("Tests", () => {
  describe("calculateWinner", () => {
    it("returns X for a row match", () => {
      const squares: string[] = ["X", "X", "X", "", "", "", "", "", ""];
      expect(calculateWinner(squares)).toBe("X");
    });

    it("returns O for a column match", () => {
      const squares: string[] = ["O", "", "", "O", "", "", "O", "", ""];
      expect(calculateWinner(squares)).toBe("O");
    });

    it("returns X for a diagonal match", () => {
      const squares: string[] = ["X", "", "", "", "X", "", "", "", "X"];
      expect(calculateWinner(squares)).toBe("X");
    });

    it("returns null for no winner", () => {
      const squares: string[] = ["X", "O", "X", "O", "X", "X", "O", "X", "O"];
      expect(calculateWinner(squares)).toBeNull();
    });
  });

  describe("getPlayerNameFromSign", () => {
    it("returns player 1 name for X", () => {
      const game = {
        id: "1",
        moves: [],
        player1_name: "John",
        player2_name: "Jane",
      };
      expect(getPlayerNameFromSign("X", game)).toBe("❌ John ");
    });

    it("returns player 2 name for O", () => {
      const game = {
        id: "1",
        moves: [],
        player1_name: "John",
        player2_name: "Jane",
      };
      expect(getPlayerNameFromSign("O", game)).toBe("⭕ Jane ");
    });
  });

  describe("getWhosTurnItIs", () => {
    it("returns X for empty board", () => {
      const moves: string[] = [];
      expect(getWhosTurnItIs(moves)).toBe("X");
    });

    it("returns O when X has more moves", () => {
      const moves: string[] = ["X", "X", "O"];
      expect(getWhosTurnItIs(moves)).toBe("O");
    });

    it("returns X when O has more moves", () => {
      const moves: string[] = ["O", "O", "X", "O"];
      expect(getWhosTurnItIs(moves)).toBe("X");
    });
  });

  describe("getRandomPepTalk", () => {
    it("returns a random pep talk", () => {
      const pepTalk = getRandomPepTalk();
      expect(pepTalks).toContain(pepTalk);
    });
  });

  describe("calculateDraw", () => {
    it("returns false if there is a winner", () => {
      const squares: string[] = ["X", "X", "X", "", "", "", "", "", ""];
      expect(calculateDraw(squares)).toBe(false);
    });

    it("returns true if board is full with no winner", () => {
      const squares: string[] = ["X", "O", "X", "X", "O", "O", "O", "X", "X"];
      expect(calculateDraw(squares)).toBe(true);
    });

    it("returns false if board not full", () => {
      const squares: string[] = ["X", "O", "X", "", "", "", "O", "", ""];
      expect(calculateDraw(squares)).toBe(false);
    });
  });
});
