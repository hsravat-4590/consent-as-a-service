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

import { useEffect, useState } from "react";
import { UserReadFulfilledNetworkModel } from "@consent-as-a-service/domain";
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  CircularProgress,
  ListItem,
} from "@mui/material";
import Typography from "@mui/material/Typography";
import { FixedSizeList, ListChildComponentProps } from "react-window";
import Avatar from "@mui/material/Avatar";

/**
 * Uses Lazy loading to slowly load in all fulfilled consents into a responsive grid view
 * @constructor
 */
export default function UserConsentsGrid() {
  const [fulfilledConsents, setFulfilledConsents] = useState<
    UserReadFulfilledNetworkModel[] | null
  >(null);
  const [isLoading, setLoading] = useState(false);
  useEffect(() => {
    if (fulfilledConsents) {
      return;
    }
    setLoading(true);
    fetch("/api/consent/get-all")
      .then((res) => res.json())
      .then((data) => {
        setFulfilledConsents(data);
        setLoading(false);
      });
  }, []);

  return (
    <>
      <Card sx={{ p: 2 }}>
        <Typography variant="h3">Your Consents</Typography>
        <GetLoadingOrContent
          isLoading={isLoading}
          content={fulfilledConsents as UserReadFulfilledNetworkModel[]}
        />
      </Card>
    </>
  );
}

function GetLoadingOrContent({
  isLoading,
  content,
}: {
  isLoading: boolean;
  content: UserReadFulfilledNetworkModel[];
}) {
  if (isLoading) {
    return (
      <Box display="flex" sx={{ flexDirection: "column" }}>
        <Box margin="auto">
          <CircularProgress />
        </Box>
        <Typography variant="body1" margin="auto">
          Loading... Please Wait
        </Typography>
      </Box>
    );
  } else if (!content || content.length === 0) {
    return (
      <Box display="flex" sx={{ flexDirection: "column" }}>
        <Typography variant="body1" margin="auto">
          No Consents Found
        </Typography>
      </Box>
    );
  } else {
    return (
      <FixedSizeList
        height={400}
        width="100%"
        itemSize={100}
        itemData={content}
        itemCount={content.length}
        overscanCount={5}
      >
        {renderRow}
      </FixedSizeList>
    );
  }
}

function ConsentPreviewCard(detail: { detail: UserReadFulfilledNetworkModel }) {
  return (
    <>
      <Card sx={{ width: "100%", bgcolor: "secondary.light" }} component="div">
        <CardActionArea>
          <Box display="flex" sx={{ flexDirection: "row" }}>
            {detail.detail.org.logo && (
              <Avatar
                sx={{ width: "auto", height: 100, m: 2 }}
                src={detail.detail.org.logo}
              />
            )}
            <Box display="flex" sx={{ flexDirection: "column" }}>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  {detail.detail.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {detail.detail.description}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  {detail.detail.org.displayName}
                </Typography>
              </CardContent>
            </Box>
          </Box>
        </CardActionArea>
      </Card>
    </>
  );
}

function renderRow(props: ListChildComponentProps) {
  const { data, index } = props;

  return (
    <ListItem key={index}>
      <ConsentPreviewCard detail={data[index]} />
    </ListItem>
  );
}
