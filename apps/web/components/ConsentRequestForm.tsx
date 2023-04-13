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

import { DataSchema } from "@consent-as-a-service/domain";
import Container from "@mui/material/Container";
import { Alert, Card, Snackbar, SnackbarOrigin } from "@mui/material";
import Box from "@mui/material/Box";
import { JsonForms } from "@jsonforms/react";
import {
  materialCells,
  materialRenderers,
} from "@jsonforms/material-renderers";
import { useState } from "react";
import Button from "@mui/material/Button";

interface State extends SnackbarOrigin {
  open: boolean;
}
const ConsentRequestForm = (
  schema: DataSchema,
  onSubmit: (submitData: any) => Promise<void> | void
) => {
  const [data, setData] = useState(schema.data);
  const [errors, setErrors] = useState<boolean>();
  const [state, setState] = useState<State>({
    open: false,
    vertical: "top",
    horizontal: "center",
  });
  const { vertical, horizontal, open } = state;
  const handleClose = (
    event: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }

    setState((prevState) => {
      prevState.open = false;
      return prevState;
    });
  };
  return (
    <Card
      variant="outlined"
      sx={{
        color: "background.default",
      }}
    >
      <Container>
        <JsonForms
          schema={schema.schema.schema}
          uischema={schema.uiSchema}
          data={data}
          renderers={materialRenderers}
          cells={materialCells}
          onChange={({ data, errors }) => {
            setData(data);
            setErrors(!!errors);
          }}
          validationMode={"ValidateAndShow"}
        />
        <Box textAlign="center">
          <Button
            variant="contained"
            disableElevation
            size="large"
            sx={{
              m: 2.5,
            }}
            onClick={() => {
              if (!errors) {
                onSubmit(data);
              } else {
                setState((prevState) => {
                  prevState.open = true;
                  return prevState;
                });
              }
            }}
          >
            Submit
          </Button>
          <Snackbar
            anchorOrigin={{ vertical, horizontal }}
            open={open}
            onClose={handleClose}
            key={vertical + horizontal}
          >
            <Alert
              onClose={handleClose}
              severity="error"
              sx={{ width: "100%" }}
            >
              Form Incomplete. Complete required fields before submitting
            </Alert>
          </Snackbar>
        </Box>
      </Container>
    </Card>
  );
};

export default ConsentRequestForm;
