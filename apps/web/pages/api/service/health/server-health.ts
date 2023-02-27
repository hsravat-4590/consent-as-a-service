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

import { getAccessToken, withApiAuthRequired } from "@auth0/nextjs-auth0";
import ServerConfig from "../server.config";
import { HealthStatus } from "@consent-as-a-service/domain";

export default withApiAuthRequired(async function getServerHealthWithAuth(
  req,
  res
) {
  const { accessToken } = await getAccessToken(req, res);
  console.log(`Token is ${accessToken}`);
  const response = await fetch(
    `${ServerConfig.baseUrl}:${ServerConfig.port}/health/authenticated`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  const result: HealthStatus = await response.json();
  console.log(JSON.stringify(result));
  res.status(response.status).json(result);
});
