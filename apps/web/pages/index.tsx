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
import { Box, Chip, Grid } from "@mui/material";
import { WifiOffRounded, WifiRounded } from "@mui/icons-material";
import UserConsentsGrid from "../components/UserConsentsGrid";
import NewConsentsGrid from "../components/NewConsentsGrid";

export default function Index() {
  const { user, error, isLoading } = useUser();
  const [serverHealth, setServerHealth] = useState({
    serverStatus: "DOWN",
    authenticated: false,
  } as HealthStatus);

  function getServerHealth() {
    fetch("/api/service/health/server-health")
      .then((res) => res.json())
      .then((data: HealthStatus) => {
        setServerHealth(data);
      });
  }

  useEffect(getServerHealth, []);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>{error.message}</div>;
  if (serverHealth.serverStatus === "DOWN") {
    return (
      <ConnectionChip healthStatus={serverHealth} retry={getServerHealth} />
    );
  } else if (user) {
    return (
      <>
        <Box
          sx={{
            m: 2.5,
          }}
        >
          <Typography variant="h2">Welcome {user.name}!</Typography>
          <ConnectionChip healthStatus={serverHealth} />
          <Grid
            container
            width="100%"
            sx={{ my: 2, flexDirection: { xs: "column", md: "row" } }}
          >
            <Grid item xs={12} sm={6}>
              <UserConsentsGrid />
            </Grid>
            <Grid item xs={12} sm={6}>
              <NewConsentsGrid />
            </Grid>
          </Grid>
        </Box>
      </>
    );
  } else {
    return <LandingPage />;
  }
}

function ConnectionChip({
  healthStatus,
  retry,
}: {
  healthStatus: HealthStatus;
  retry?: () => void;
}) {
  if (healthStatus.serverStatus === "UP") {
    return <Chip icon={<WifiRounded />} label="Connected to Server" />;
  } else {
    return (
      <Chip
        icon={<WifiOffRounded />}
        label="Can't connect to server. Tap to retry"
        onClick={retry}
      />
    );
  }
}
