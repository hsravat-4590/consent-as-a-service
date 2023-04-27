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

// pages/index.js
import { useUser } from "@auth0/nextjs-auth0/client";
import { useEffect, useState } from "react";
import LandingPage from "../components/LandingPage";
import { HealthStatus } from "@consent-as-a-service/domain";
import Typography from "@mui/material/Typography";
import { Box, Chip } from "@mui/material";
import { Wifi, WifiOff } from "@mui/icons-material";
import UserConsentsGrid from "../components/UserConsentsGrid";

export default function Index() {
  const { user, error, isLoading } = useUser();
  const [serverHealth, setServerHealth] = useState({
    serverStatus: "DOWN",
    authenticated: false,
  } as HealthStatus);
  useEffect(() => {
    fetch("/api/service/health/server-health")
      .then((res) => res.json())
      .then((data: HealthStatus) => {
        setServerHealth(data);
      });
  }, []);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>{error.message}</div>;
  if (serverHealth.serverStatus === "DOWN") {
    return <ConnectionChip healthStatus={serverHealth} />;
  }
  if (user) {
    return (
      <>
        <Box
          sx={{
            m: 2.5,
          }}
        >
          <Typography variant="h2">Welcome {user.name}!</Typography>
          <ConnectionChip healthStatus={serverHealth} />
          <Box sx={{ my: 2 }}>
            <UserConsentsGrid />
          </Box>
        </Box>
      </>
    );
  } else {
    return <LandingPage />;
  }
}

function ConnectionChip({ healthStatus }: { healthStatus: HealthStatus }) {
  if (healthStatus.serverStatus === "UP") {
    return <Chip icon={<Wifi />} label="Connected to Server" />;
  } else {
    return <Chip icon={<WifiOff />} label="Can't connect to server" />;
  }
}
