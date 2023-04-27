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

import Image from "next/image";
import { Inter } from "next/font/google";
import styles from "../styles/Landing.module.css";
import { Card } from "@mui/material";
import Typography from "@mui/material/Typography";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export default function LandingPage() {
  return (
    <>
      <main className={styles.main}>
        <div className={styles.center}>
          <Image
            className={styles.logo}
            src="/shield.svg"
            alt="Next.js Logo"
            width={180}
            height={180}
            priority
          />
          <Typography variant="h1">Consent as a Service</Typography>
        </div>

        <div className={styles.grid}>
          <Card
            sx={{
              p: 3,
              m: 2,
            }}
          >
            <Link href={"https://consent-as-a-service-docs.vercel.app/"}>
              <h2 className={inter.className}>Documentation</h2>
              <p className={inter.className}>
                Find in-depth information about CAAS features and&nbsp;API.
              </p>
            </Link>
          </Card>

          <Card
            sx={{
              p: 3,
              m: 2,
            }}
          >
            <h2 className={inter.className}>Research Paper</h2>
            <p className={inter.className}>
              Take a Look at the Research Paper and Technical Report for this
              Project.
            </p>
            <h5 className={inter.className}>Coming Soon</h5>
          </Card>

          <Card
            sx={{
              p: 3,
              m: 2,
            }}
          >
            <h2 className={inter.className}>Example</h2>
            <p className={inter.className}>
              View an example project using CAAS
            </p>
            <h5>Coming Soon</h5>
          </Card>
        </div>
      </main>
    </>
  );
}
