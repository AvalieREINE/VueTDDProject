import SignUpPage from "./SignUpPage.vue";
import { render, screen, waitFor } from "@testing-library/vue";
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";
import { setupServer } from "msw/node";
import { rest } from "msw";

describe("Sign Up Page", () => {
  describe("Layout", () => {
    it("has sign up header", () => {
      render(SignUpPage);
      const header = screen.queryByRole("heading", { name: "Sign Up" });
      expect(header).toBeInTheDocument();
    });
    it("has username input", () => {
      render(SignUpPage);
      const input = screen.queryByLabelText("Username");
      expect(input).toBeInTheDocument();
    });
    it("has email input", () => {
      render(SignUpPage);
      const input = screen.queryByLabelText("Email");
      expect(input).toBeInTheDocument();
    });
    it("has password input", () => {
      render(SignUpPage);
      const input = screen.queryByLabelText("Password");
      expect(input).toBeInTheDocument();
    });
    it("has password type for password input", () => {
      render(SignUpPage);
      const input = screen.queryByLabelText("Password");
      expect(input.type).toBe("password");
    });
    it("has password repeat input", () => {
      render(SignUpPage);
      const input = screen.queryByLabelText("Confirm Password");
      expect(input).toBeInTheDocument();
    });
    it("has password type for password repeat input", () => {
      render(SignUpPage);
      const input = screen.queryByLabelText("Confirm Password");
      expect(input.type).toBe("password");
    });
    it("has sign up button", () => {
      render(SignUpPage);
      const button = screen.queryByRole("button", { name: "Sign Up" });
      expect(button).toBeInTheDocument();
    });
    it("has button disabled initially", () => {
      render(SignUpPage);
      const button = screen.queryByRole("button", { name: "Sign Up" });
      expect(button).toBeDisabled();
    });
  });

  describe("Interactions", () => {
    let requestBody;
    let counter = 0;

    const server = setupServer(
      rest.post("/api/1.0/users", (req, res, ctx) => {
        requestBody = req.body;
        counter += 1;
        return res(ctx.status(200));
      })
    );
    beforeAll(() => server.listen());
    afterAll(() => server.close());
    beforeEach(() => {
      counter = 0;
      server.resetHandlers();
    });
    let button;
    const setup = async () => {
      render(SignUpPage);
      const username = screen.queryByLabelText("Username");
      const email = screen.queryByLabelText("Email");
      const password = screen.queryByLabelText("Password");
      const confirmPassword = screen.queryByLabelText("Confirm Password");
      button = screen.queryByRole("button", { name: "Sign Up" });
      await userEvent.type(username, "user1");
      await userEvent.type(email, "user1@test.com");
      await userEvent.type(password, "P");
      await userEvent.type(confirmPassword, "P");
    };
    it("enables the button when password inputs have the same value", async () => {
      await setup();

      expect(button).toBeEnabled();
    });
    it("sends sign up data to backend after clicking the button", async () => {
      await setup();

      await userEvent.click(button);
      await screen.findByText(
        "Please check your email to activate your account"
      );

      expect(requestBody).toEqual({
        username: "user1",
        email: "user1@test.com",
        password: "P",
      });
    });
    it("disables button when api call is ongoing", async () => {
      await setup();

      await userEvent.click(button);
      await userEvent.click(button);

      await screen.findByText(
        "Please check your email to activate your account"
      );
      expect(counter).toBe(1);
    });
    it("displays spinner while api request in progress", async () => {
      await setup();

      await userEvent.click(button);
      const spinner = screen.queryByRole("status");
      expect(spinner).toBeInTheDocument();
    });
    it("should not display spinner when there's no api request", async () => {
      await setup();
      const spinner = screen.queryByRole("status");
      expect(spinner).not.toBeInTheDocument();
    });
    it("displays account activation after successful sign up request", async () => {
      await setup();

      await userEvent.click(button);
      const text = await screen.findByText(
        "Please check your email to activate your account"
      );
      expect(text).toBeInTheDocument();
    });
    it("should not display activation message before signup request", async () => {
      await setup();
      const text = screen.queryByText(
        "Please check your email to activate your account"
      );
      expect(text).not.toBeInTheDocument();
    });
    it("does not display account activation after successful failing signup request", async () => {
      server.use(
        rest.post("/api/1.0/users", (req, res, ctx) => {
          return res(ctx.status(400));
        })
      );

      await setup();

      await userEvent.click(button);

      const text = screen.queryByText(
        "Please check your email to activate your account"
      );
      expect(text).not.toBeInTheDocument();
    });
    it("hides sign up form after successful sign up request", async () => {
      await setup();

      const form = screen.queryByTestId("form-sign-up");

      await userEvent.click(button);
      await waitFor(() => {
        expect(form).not.toBeInTheDocument();
      });
    });
    it("displays validation message for username", async () => {
      server.use(
        rest.post("/api/1.0/users", (req, res, ctx) => {
          return res(
            ctx.status(400),
            ctx.json({
              validationErrors: {
                username: "Username cannot be null",
              },
            })
          );
        })
      );

      await setup();

      await userEvent.click(button);

      const text = await screen.findByText("Username cannot be null");
      expect(text).toBeInTheDocument();
    });
    it("hides spinner after error response received", async () => {
      server.use(
        rest.post("/api/1.0/users", (req, res, ctx) => {
          return res(
            ctx.status(400),
            ctx.json({
              validationErrors: {
                username: "Username cannot be null",
              },
            })
          );
        })
      );

      await setup();

      await userEvent.click(button);
      await screen.findByText("Username cannot be null");
      const spinner = screen.queryByRole("status");
      expect(spinner).not.toBeInTheDocument();
    });
    it("enables the button after error response received", async () => {
      server.use(
        rest.post("/api/1.0/users", (req, res, ctx) => {
          return res(
            ctx.status(400),
            ctx.json({
              validationErrors: {
                username: "Username cannot be null",
              },
            })
          );
        })
      );

      await setup();

      await userEvent.click(button);
      await screen.findByText("Username cannot be null");
      expect(button).toBeEnabled();
    });
    it("displays validation message for email", async () => {
      server.use(
        rest.post("/api/1.0/users", (req, res, ctx) => {
          return res(
            ctx.status(400),
            ctx.json({
              validationErrors: {
                email: "Email cannot be null",
              },
            })
          );
        })
      );

      await setup();

      await userEvent.click(button);

      const text = await screen.findByText("Email cannot be null");
      expect(text).toBeInTheDocument();
    });
  });
});
