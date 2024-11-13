import React, { act } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { setupServer } from "msw/node";
import SignUp from "./";
import { handlers } from "./handlers";
import { debug } from "jest-preview";
import { useNavigate } from "react-router-dom";

// Setting up the mock server
const server = setupServer();
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

const getters = {
  getUserNameInput: () => screen.getByLabelText(/user name/i),
  getEmailInput: () => screen.getByLabelText(/email address/i),
  getPasswordInput: () => screen.getByLabelText(/password/i),
  queryPasswordInput: () => screen.queryByLabelText(/password/i),
  getSubmitButton: () => screen.getByRole("button", { name: /sign up/i }),
};

describe("SignUp Component", () => {
  describe("Validation", () => {
    it("should display validation errors for invalid email", async () => {
      render(<SignUp />);

      await act(async () => {
        fireEvent.change(getters.getUserNameInput(), {
          target: { value: "mut" },
        });
        fireEvent.change(getters.getEmailInput(), {
          target: { value: "mmm.com" },
        });
        fireEvent.change(getters.getPasswordInput(), {
          target: { value: "1234" },
        });
        fireEvent.click(getters.getSubmitButton());
      });
      debug();
      expect(screen.getByText(/Enter a valid email/i)).toBeInTheDocument();
    });

    it("should display validation errors for short password", async () => {
      render(<SignUp />);
      await act(async () => {
        fireEvent.change(getters.getPasswordInput(), {
          target: { value: "12dd34" },
        });
        fireEvent.focusOut(getters.getPasswordInput());
      });
      debug();
      expect(
        screen.getByText(/Password should be of minimum 8 characters length/i)
      ).toBeInTheDocument();
    });

    it("should display success message on successful sign-up", async () => {
      server.use(...handlers(200))
      render(<SignUp />);

      await act(async () => {
        fireEvent.change(getters.getUserNameInput(), {
          target: { value: "muthana" },
        });
        fireEvent.change(getters.getEmailInput(), {
          target: { value: "muthana@gmail.com" },
        });
        fireEvent.change(getters.getPasswordInput(), {
          target: { value: "Gf9$Y9FJu$Tacv5" },
        });
        fireEvent.click(getters.getSubmitButton());
      });
      debug();
      expect(screen.getByText(/Sign Up Successfully!/i)).toBeInTheDocument();
    });

    it("should display error message on sign-up failure", async () => {
      server.use(...handlers(400))
      render(<SignUp />);
      await act(async () => {
        fireEvent.change(getters.getUserNameInput(), {
          target: { value: "muthana" },
        });
        fireEvent.change(getters.getEmailInput(), {
          target: { value: "muthana@gmail.com" },
        });
        fireEvent.change(getters.getPasswordInput(), {
          target: { value: "Gf9$Y9FJu$Tacv5" },
        });
        fireEvent.click(getters.getSubmitButton());
      });
      debug();
      expect(screen.getByText(/Error Signing Up!/i)).toBeInTheDocument();
    });

    it("should display validation error for empty email", async () => {
      render(<SignUp />);

      await act(async () => {
        fireEvent.change(getters.getEmailInput(), {
          target: { value: "muthana.com" },
        });
        fireEvent.change(getters.getEmailInput(), { target: { value: "" } });
        fireEvent.focusOut(getters.getEmailInput());
      });
      debug();
      expect(screen.getByText(/Email is required/i)).toBeInTheDocument();
    });

    it("should display validation error for empty Password", async () => {
      render(<SignUp />);

      await act(async () => {
        fireEvent.change(getters.getPasswordInput(), {
          target: { value: "muthana.com" },
        });
        fireEvent.change(getters.getPasswordInput(), { target: { value: "" } });
        fireEvent.focusOut(getters.getPasswordInput());
      });
      debug();
      expect(screen.getByText(/Password is required/i)).toBeInTheDocument();
    });
  });

  describe("Form Interaction", () => {
    it("should enable Sign Up button when form is valid", async () => {
      render(<SignUp />);
      await act(async () => {
        fireEvent.change(getters.getUserNameInput(), {
          target: { value: "muthana" },
        });
        fireEvent.change(getters.getEmailInput(), {
          target: { value: "muthana@gmail.com" },
        });
        fireEvent.change(getters.getPasswordInput(), {
          target: { value: "Gf9$Y9FJu$Tacv5" },
        });
      });
      debug();
      expect(screen.getByRole("button", { name: /sign up/i })).toBeEnabled();
    });

    it("should disable Sign Up button when form is invalid", async () => {
      render(<SignUp />);

      expect(getters.getSubmitButton()).toBeDisabled();

      await act(async () => {
        fireEvent.change(getters.getEmailInput(), {
          target: { value: "invalidEmail.com" },
        });
      });
      expect(getters.getSubmitButton()).toBeDisabled();
      debug();
      await act(async () => {
        fireEvent.change(getters.getPasswordInput(), {
          target: { value: "password" },
        });
      });
      expect(getters.getSubmitButton()).toBeDisabled();
      debug();
    });

    it("should update form fields on user input", async () => {
      render(<SignUp />);
      const userNameInput = getters.getUserNameInput() as HTMLInputElement;

      fireEvent.change(userNameInput, { target: { value: "muthana" } });
      debug();

      expect(userNameInput.value).toBe("muthana");
    });

    it("should redirect user to home page after successful signup", async () => {
      server.use(...handlers(200))
      render(<SignUp />);

      await act(async () => {
        fireEvent.change(getters.getUserNameInput(), {
          target: { value: "muthana" },
        });
        fireEvent.change(getters.getEmailInput(), {
          target: { value: "muthana@gmail.com" },
        });
        fireEvent.change(getters.getPasswordInput(), {
          target: { value: "Gf9$Y9FJu$Tacv5" },
        });
        fireEvent.click(getters.getSubmitButton());
      });
      debug();

      expect(
        screen.getByRole("button", { name: /start now/i })
      ).toBeInTheDocument();
      expect(getters.queryPasswordInput()).not.toBeInTheDocument()
    });
  });
});
