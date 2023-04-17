/*
 * Copyright (c) 2023 Hanzalah Ravat
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
import { createTheme } from "@mui/material/styles";

declare module "@mui/material/styles" {
  interface Theme {
    status: {
      danger: string;
    };
  }

  // allow configuration using `createTheme`
  interface ThemeOptions {
    status?: {
      danger?: string;
    };
  }
}

const headingFont = "'Quicksand', sans-serif";

export const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#006493",
      light: "#cae6ff",
      dark: "#001e30",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#50606e",
      light: "#d3e5f6",
      dark: "#0c1d29",
    },
    error: {
      main: "#ffdad6",
      light: "#ba1a1a",
      dark: "#410002",
    },
    background: {
      default: "#fcfcff",
      paper: "#eff3f9",
    },
  },
  shape: {
    borderRadius: 24,
  },
  spacing: 10,
  components: {
    MuiAppBar: {
      defaultProps: {
        color: "transparent",
      },
    },
    MuiCard: {
      defaultProps: {
        raised: false,
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
    },
  },
  typography: {
    h1: {
      fontSize: "5.1rem",
      font: headingFont,
    },
    h2: {
      fontSize: "4.7rem",
      font: headingFont,
    },
    h3: {
      font: headingFont,
      fontWeight: 700,
      fontSize: "3.6rem",
    },
    h5: {
      font: headingFont,
      fontWeight: 400,
    },
    h6: {
      font: headingFont,
    },
    subtitle1: {
      fontFamily: "Open Sans",
    },
    fontFamily: "Roboto",
  },
});

export const darkModeTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#8dcdff",
      light: "#004b70",
      dark: "#cae6ff",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#b7c9d9",
      light: "#384956",
      dark: "#d3e5f6",
    },
    error: {
      main: "#ffb4ab",
      light: "#93000a",
      dark: "#ffdad6",
    },
    background: {
      default: "#1a1c1e",
      paper: "#1a1c1e",
    },
  },
  shape: {
    borderRadius: 24,
  },
  spacing: 10,
  components: {
    MuiAppBar: {
      defaultProps: {
        color: "transparent",
      },
    },
    MuiCard: {
      defaultProps: {
        raised: false,
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
    },
  },
  typography: {
    h1: {
      fontSize: "5.1rem",
      font: headingFont,
    },
    h2: {
      fontSize: "4.7rem",
      font: headingFont,
    },
    h3: {
      font: headingFont,
      fontSize: "3.6rem",
    },
    h5: {
      font: headingFont,
      fontWeight: 400,
    },
    h6: {
      font: headingFont,
    },
    subtitle1: {
      fontFamily: "Open Sans",
    },
    fontFamily: "Roboto",
  },
});
