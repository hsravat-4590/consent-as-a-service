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

export enum Auth0Roles {
  USER = 'rol_nC8LU4dTm4YxBVUg', //The end-user. This role allows one to view/accept and fulfill consents
  ADMIN = 'rol_ENSgDb7teIi3dvGJ', // Mostly for the API itself and any dashboards that may come in the future to manage the overall system
  CREATE_CONSENTS = 'rol_8Z8L1mJBgE6vo1Mn', //Users with this role can create ConsentRequests
  REQUEST_CONSENTS = 'rol_CjrrzjExOXBd3bq4', //Users with this role can use ConsentRequestModels to send ConsentRequests to users
  ORG_USER = 'rol_5ISOKtnzXeFWJo3i',
}
