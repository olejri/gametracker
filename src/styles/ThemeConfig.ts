import { createGlobalStyle, type DefaultTheme } from "styled-components";

type Theme = DefaultTheme & {
  body: string;
  text: string;
  toggleBorder: string;
  background: string;
};

export const lightTheme: Theme = {
  body: "#FFF",
  text: "#363537",
  toggleBorder: "#FFF",
  background: "#363537"
};

export const darkTheme: Theme = {
  body: "#363537",
  text: "#FAFAFA",
  toggleBorder: "#6B8096",
  background: "#999"
};

export const GlobalStyles = createGlobalStyle<{ theme: DefaultTheme }>`
  body {
    background: ${({ theme }) => (theme as Theme).body};
    color: ${({ theme }) => (theme as Theme).text};
    font-family: Tahoma, Helvetica, Arial, Roboto, sans-serif;
    transition: all 0.50s linear;
  }

  select {
    background: ${({ theme }) => (theme as Theme).body};
    color: ${({ theme }) => (theme as Theme).text};
    font-family: Tahoma, Helvetica, Arial, Roboto, sans-serif;
    transition: all 0.50s linear;
  }

  select option {
    background: ${({ theme }) => (theme as Theme).body};
    color: ${({ theme }) => (theme as Theme).text};
    font-family: Tahoma, Helvetica, Arial, Roboto, sans-serif;
    transition: all 0.50s linear;
  }

  input {
    background: ${({ theme }) => (theme as Theme).body};
    color: ${({ theme }) => (theme as Theme).text};
    font-family: Tahoma, Helvetica, Arial, Roboto, sans-serif;
    transition: all 0.50s linear;
  }
`;
