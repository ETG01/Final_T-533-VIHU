import React from "react";
import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  beforeAll,
  afterAll,
  vi,
} from "vitest";
import "@testing-library/jest-dom";
import { fireEvent, render, waitFor, screen } from "@testing-library/react";

import Home from "../pages/index";
const moment = require('moment');

import { http } from "msw";
import { setupServer } from "msw/node";
import GamePage from "@/pages/game/[id]";
import GameList from "@/pages/game/list";
import { GameRow } from "@/components/GameRow";

const mockGameData = {
  id: "123",
  player1_name: "John",
  player2_name: "Jane",
  moves: Array(9).fill(""),
  createdAt: new Date(),
};

const update_mockGameData = {
  id: "123",
  player1_name: "John",
  player2_name: "Jane",
  moves: ["X", "", "", "", "", "", "", "", ""],
  createdAt: new Date(),
};

const mockGameListData = [
  {
    id: "123",
    player1_name: "John",
    player2_name: "Jane",
    moves: Array(9).fill(""),
    createdAt: new Date(),
  },
  {
    id: "456",
    player1_name: "Alice",
    player2_name: "Bob",
    moves: Array(9).fill(""),
    createdAt: new Date(),
  },
];

const server = setupServer(
  http.post("/api/new", () => {
    return new Response(JSON.stringify({ id: "123" }), {
      // Assume this endpoint creates a game and returns its ID
      headers: {
        "Content-Type": "application/json",
      },
    });
  }),
  http.get("/api/game/123", () => {
    return new Response(JSON.stringify(mockGameData), {
      headers: {
        "Content-Type": "application/json",
      },
    });
  }),
  http.put("/api/game/123", () => {
    return new Response(JSON.stringify(update_mockGameData), {
      headers: {
        "Content-Type": "application/json",
      },
    });
  }),
  http.get("/api/list", () => {
    return new Response(JSON.stringify(mockGameListData), {
      headers: {
        "Content-Type": "application/json",
      },
    });
  })
);

const mockPush = vi.fn();

vi.mock("next/router", () => ({
  useRouter: () => ({
    query: {
      id: "123",
    },
    push: mockPush,
  }),
}));

beforeAll(() => server.listen());
afterEach(() => {
  server.resetHandlers();
  vi.resetAllMocks();
});
afterAll(() => server.close());

describe("Home Component Tests", () => {
  it("renders title", async () => {
    const { getByText } = render(<Home />);
    expect(getByText("Tic Tac Toe #️⃣")).toBeInTheDocument();
  });

  it("fills in inputs and starts game", async () => {
    const { getByPlaceholderText, getByText } = render(<Home />);

    const playerNameInput = getByPlaceholderText("❌ Your Name");
    const opponentNameInput = getByPlaceholderText("⭕ Opponent Name");
    const startButton = getByText("Start Game");

    fireEvent.change(playerNameInput, { target: { value: "John" } });
    fireEvent.change(opponentNameInput, { target: { value: "Jane" } });
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalled();
    });
  });

  it("submits the form and navigates to the game page with the game ID", async () => {
    const { getByPlaceholderText, getByText } = render(<Home />);
    fireEvent.change(getByPlaceholderText("❌ Your Name"), {
      target: { value: "John" },
    });
    fireEvent.change(getByPlaceholderText("⭕ Opponent Name"), {
      target: { value: "Jane" },
    });
    fireEvent.click(getByText("Start Game"));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/game/123");
    });
  });

  it("disables the 'Start Game' button when isCreating is true", async () => {
    const { getByText } = render(<Home />);
    fireEvent.click(getByText("Start Game")); // This assumes that the button is clicked without filling the form

    // Since we're not awaiting the form submission here, we immediately check the button state
    expect(getByText("Start Game")).toBeDisabled();
  });

  it("does submit the form if one or both player names are empty", async () => {
    const { getByText } = render(<Home />);
    fireEvent.click(getByText("Start Game"));

    await waitFor(() => expect(getByText("Start Game")).not.toBeDisabled()); // Button should be re-enabled
  });
});

describe("Game List Page Tests", () => {
  it("displays list of games fetched from API", async () => {
    render(<GameList />);
    const gameLinks = await screen.findAllByRole("link");
    expect(gameLinks).toHaveLength(2);

    expect(gameLinks[0]).toHaveTextContent("❌ John ⭕ Jane");
    expect(gameLinks[1]).toHaveTextContent("❌ Alice ⭕ Bob");

    const winner = render(<GameRow game={mockGameListData[0]} />);
  });

  it("Check if it redders Winner", async () => {
    const mockGameListData = [
      {
        id: "123",
        player1_name: "John",
        player2_name: "Jane",
        moves: ["X", "O", "O", "O", "X", "O", "O", "O", "X"],
        createdAt: new Date(),
      },
    ];

    server.use(
      http.get("/api/list", () => {
        return new Response(JSON.stringify(mockGameListData), {
          headers: {
            "Content-Type": "application/json",
          },
        });
      })
    );

    render(<GameList />);
    const gameLinks = await screen.findAllByRole("link");
    expect(gameLinks).toHaveLength(1);
    expect(gameLinks[0]).toHaveTextContent("❌ John 🎉");
  });

  it("Check if it redders Draw", async () => {
    const mockGameListData = [
      {
        id: "123",
        player1_name: "John",
        player2_name: "Jane",
        moves: ["X", "O", "O",
        "O", "X", "X", 
        "X", "O", "O"],
        createdAt: new Date(),
      },
    ];

    server.use(
      http.get("/api/list", () => {
        return new Response(JSON.stringify(mockGameListData), {
          headers: {
            "Content-Type": "application/json",
          },
        });
      })
    );

    render(<GameList />);
    const gameLinks = await screen.findAllByRole("link");
    expect(gameLinks).toHaveLength(1);
    expect(gameLinks[0]).toHaveTextContent("❌ John ⭕ Jane");
  });
});

describe("GamePage Page Tests", () => {
  it("renders GamePage component", async () => {
    render(<GamePage />);
    await waitFor(() => {
      expect(screen.getByText("Loading..🔃")).toBeInTheDocument();
    });
  });

  it("fetches game data and renders it", async () => {
    render(<GamePage />);
    await waitFor(() => {
      expect(screen.getByText("❌ John")).toBeInTheDocument();
    });
  });

  it("makes a move and updates the game", async () => {
    render(<GamePage />);
    await waitFor(() => {
      expect(screen.getByText("❌ John")).toBeInTheDocument();
    });

    const cells = screen.getAllByTestId("cell-0");
    fireEvent.click(cells[0]);

    await waitFor(() => {
      expect(screen.getByText("⭕ Jane")).toBeInTheDocument();

      const cells = screen.getAllByTestId("cell-0");
      expect(cells[0]).toHaveTextContent("❌");
    });
  });

  it("Check if it redders Draw", async () => {
    const mockGameDataWithDraw = {
      id: "123",
      player1_name: "John",
      player2_name: "Jane",
      moves: ["X", "O", "X", "X", "O", "O", "O", "X", "X"], // Adjusted moves to represent a draw scenario correctly
      createdAt: new Date(),
    };

    server.use(
      http.get("/api/game/123", () => {
        return new Response(JSON.stringify(mockGameDataWithDraw), {
          headers: {
            "Content-Type": "application/json",
          },
        });
      })
    );

    render(<GamePage />);

    await waitFor(() => {
      expect(screen.getByText(/It's a draw!/i)).toBeInTheDocument();
    });

  });


});
