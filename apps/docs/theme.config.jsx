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

// eslint-disable-next-line import/no-anonymous-default-export
export default {
  project: {
    link: "https://github.com/hsravat-4590/consent-as-a-service",
  },
  docsRepositoryBase: "https://github.com/hsravat-4590/consent-as-a-service/",
  head: (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin />
      <link
        href="https://fonts.googleapis.com/css2?family=Quicksand:wght@700&family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;1,100;1,300;1,400&display=swap"
        rel="stylesheet"
      />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@48,400,1,0"
      />
    </>
  ),
  logo: (
    <>
      <span className="material-symbols-outlined">shield</span>
      <span
        style={{
          mr: 2,
          display: { xs: "none", md: "flex" },
          fontFamily: "Quicksand",
          fontWeight: 700,
          letterSpacing: ".2rem",
          color: "inherit",
          textDecoration: "none",
        }}
      >
        CAAS Docs
      </span>
    </>
  ),
  footer: {
    text: (
      <span>
        MIT {new Date().getFullYear()} ©{" Hanzalah Ravat"}.
      </span>
    ),
  },
  // ...
};
